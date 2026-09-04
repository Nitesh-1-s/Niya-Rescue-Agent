import random
from database import SessionLocal, FailedEvent, init_db

def generate_synthetic_batch(num_events=50):
    db = SessionLocal()
    
    event_types = ["PAYMENT_FAILED", "CHECKOUT_ABANDONED"]
    error_codes_payment = ["INSUFFICIENT_FUNDS", "BANK_DOWNTIME", "RISK_FLAGGED", "NETWORK_TIMEOUT"]
    
    generated_events = []
    
    for i in range(num_events):
        ev_type = random.choices(event_types, weights=[0.7, 0.3])[0]
        
        amount = round(random.uniform(100.0, 50000.0), 2)
        customer_id = f"cust_{random.randint(1000, 9999)}"
        
        if ev_type == "PAYMENT_FAILED":
            error_code = random.choices(error_codes_payment, weights=[0.4, 0.4, 0.1, 0.1])[0]
        else:
            error_code = "USER_DROPPED_OFF"
            
        event = FailedEvent(
            event_type=ev_type,
            customer_id=customer_id,
            amount=amount,
            error_code=error_code,
            status="PENDING"
        )
        db.add(event)
        generated_events.append(event)
        
    db.commit()
    print(f"Generated {num_events} synthetic failed events.")
    db.close()

if __name__ == "__main__":
    init_db()
    generate_synthetic_batch(50)
