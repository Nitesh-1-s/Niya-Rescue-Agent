from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List

from database import get_db, init_db, FailedEvent, AuditLog
import data_generator
import agent

app = FastAPI(title="RescueOps AI - Track 3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.post("/api/admin/reseed_qa_data")
def reseed_test_data(db: Session = Depends(get_db)):
    """Internal QA tool to clear and reseed the staging database."""
    db.query(AuditLog).delete()
    db.query(FailedEvent).delete()
    db.commit()
    data_generator.generate_synthetic_batch(15) 
    return {"status": "success"}

@app.post("/api/generate")
def generate_batch(num_events: int = 50):
    data_generator.generate_synthetic_batch(num_events)
    return {"status": "success", "message": f"Generated {num_events} events"}

@app.post("/api/process_batch")
def process_batch():
    logs = agent.process_batch()
    return {"status": "success", "processed_count": len(logs)}

@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    total_at_risk = db.query(func.sum(FailedEvent.amount)).scalar() or 0.0
    total_recovered = db.query(func.sum(AuditLog.recovered_amount)).scalar() or 0.0
    
    total_events = db.query(FailedEvent).count()
    recovered_events = db.query(FailedEvent).filter(FailedEvent.status == "RECOVERED").count()
    
    success_rate = (recovered_events / total_events * 100) if total_events > 0 else 0
    
    return {
        "total_at_risk": round(total_at_risk, 2),
        "total_recovered": round(total_recovered, 2),
        "success_rate": round(success_rate, 2),
        "total_events": total_events,
        "recovered_events": recovered_events
    }

@app.get("/api/logs")
def get_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AuditLog, FailedEvent).join(FailedEvent).order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    result = []
    for log, event in logs:
        result.append({
            "id": log.id,
            "event_id": event.id,
            "event_type": event.event_type,
            "amount": event.amount,
            "error_code": event.error_code,
            "action_taken": log.action_taken,
            "reasoning": log.reasoning,
            "recovered_amount": log.recovered_amount,
            "timestamp": log.created_at
        })
    return result
