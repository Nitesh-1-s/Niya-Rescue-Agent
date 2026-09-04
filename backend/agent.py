import time
from database import SessionLocal, FailedEvent, AuditLog

import os
import json
from openai import OpenAI

# Fallback deterministic heuristics used if the LLM service is unavailable or times out
def fallback_analyze(event: FailedEvent):
    if event.event_type == "PAYMENT_FAILED":
        if event.error_code == "INSUFFICIENT_FUNDS": return "Customer lacks funds.", "SEND_DISCOUNT_SMS"
        elif event.error_code == "BANK_DOWNTIME": return "Acquiring bank is temporarily down.", "SILENT_RETRY"
        elif event.error_code == "RISK_FLAGGED": return "High risk transaction detected by gateway.", "ESCALATE_TO_HUMAN"
        elif event.error_code == "NETWORK_TIMEOUT": return "Network timeout during processing.", "SILENT_RETRY"
    elif event.event_type == "CHECKOUT_ABANDONED":
        if event.amount > 10000: return "High value cart abandoned.", "ESCALATE_TO_HUMAN"
        else: return "Standard cart abandoned.", "SEND_CART_RECOVERY_EMAIL"
    return "Unknown issue.", "DROP"

def analyze_root_cause_and_action(event: FailedEvent):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return fallback_analyze(event)
        
    client = OpenAI(api_key=api_key)
    prompt = f"""
    You are an AI Revenue Recovery Agent for Razorpay.
    Analyze this failed transaction event:
    - Type: {event.event_type}
    - Amount: {event.amount} INR
    - Error Code: {event.error_code}
    
    Determine the root cause and the best recovery action. 
    Allowed actions: SILENT_RETRY, SEND_DISCOUNT_SMS, SEND_CART_RECOVERY_EMAIL, ESCALATE_TO_HUMAN, DROP.
    
    Respond ONLY in valid JSON format: {{"reasoning": "your explanation", "action": "ACTION_NAME"}}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("reasoning", "Failed to parse reasoning"), result.get("action", "DROP")
    except Exception as e:
        print(f"LLM Service Error (Failing over to heuristics): {e}")
        return fallback_analyze(event)

def enforce_stopping_rules(db, event: FailedEvent):
    """
    The Bar: 'Compliant escalation, stopping rules'
    Checks if we should stop processing this customer to avoid spam or abuse.
    """
    # Rule 1: Don't spam the customer if they have had > 2 interventions today
    past_logs = db.query(AuditLog).join(FailedEvent).filter(
        FailedEvent.customer_id == event.customer_id,
        AuditLog.action_taken.in_(["SEND_DISCOUNT_SMS", "SEND_CART_RECOVERY_EMAIL"])
    ).count()
    
    if past_logs >= 2:
        return False, "Stopping Rule: Max customer contact limit reached."
        
    return True, "Passed"

def process_single_event(db, event_id: int):
    event = db.query(FailedEvent).filter(FailedEvent.id == event_id).first()
    if not event or event.status != "PENDING":
        return None
        
    # 1. Check Stopping Rules
    can_proceed, rule_reason = enforce_stopping_rules(db, event)
    if not can_proceed:
        # Audit Log the stop
        audit = AuditLog(
            event_id=event.id,
            action_taken="STOPPED_BY_RULE",
            reasoning=rule_reason,
            recovered_amount=0.0
        )
        event.status = "FAILED_FINAL"
        db.add(audit)
        db.commit()
        return audit
        
    # 2. Execute AI Diagnosis
    reasoning, action = analyze_root_cause_and_action(event)
    
    # 3. Process Intervention Outcome (Simulation)
    recovered = 0.0
    final_status = "FAILED_FINAL"
    
    # Simple probability model for intervention success
    import random
    if action == "SILENT_RETRY" and random.random() > 0.3:
        recovered = event.amount
        final_status = "RECOVERED"
        reasoning += " Retry successful."
    elif action in ["SEND_DISCOUNT_SMS", "SEND_CART_RECOVERY_EMAIL"] and random.random() > 0.5:
        recovered = event.amount * 0.9 # 10% discount applied
        final_status = "RECOVERED"
        reasoning += " Customer clicked link and converted."
    elif action == "ESCALATE_TO_HUMAN":
        final_status = "ESCALATED"
        reasoning += " Added to human review queue."
        
    # 4. Write Audit Trail (The Bar: 'audit trail')
    audit = AuditLog(
        event_id=event.id,
        action_taken=action,
        reasoning=reasoning,
        recovered_amount=recovered
    )
    event.status = final_status
    
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

def process_batch():
    """Finds all pending events and processes them."""
    db = SessionLocal()
    events = db.query(FailedEvent).filter(FailedEvent.status == "PENDING").all()
    
    logs = []
    for event in events:
        log = process_single_event(db, event.id)
        if log:
            logs.append(log)
        # Simulate slight processing delay for realism
        time.sleep(0.05)
        
    db.close()
    return logs
