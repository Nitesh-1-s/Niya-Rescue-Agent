from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime, timezone

import os

# Use Supabase URL if provided, otherwise fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rescueops.db")
# If using Supabase (postgres://), SQLAlchemy needs it to be postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class FailedEvent(Base):
    __tablename__ = "failed_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, index=True) # e.g., 'PAYMENT_FAILED', 'CHECKOUT_ABANDONED'
    customer_id = Column(String, index=True)
    amount = Column(Float)
    currency = Column(String, default="INR")
    error_code = Column(String) # e.g., 'INSUFFICIENT_FUNDS', 'BANK_DOWNTIME', 'TIMEOUT'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="PENDING") # PENDING, RECOVERED, FAILED_FINAL

    # Relationship to audit logs
    audit_logs = relationship("AuditLog", back_populates="event")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("failed_events.id"))
    action_taken = Column(String) # e.g., 'SILENT_RETRY', 'SEND_DISCOUNT_SMS', 'ESCALATE_TO_HUMAN', 'DROP'
    reasoning = Column(String) # The explanation from the LLM/Agent
    recovered_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    event = relationship("FailedEvent", back_populates="audit_logs")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized.")
