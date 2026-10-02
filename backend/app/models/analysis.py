import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True, index=True)
    company_name = Column(String(255), nullable=False)
    financial_year = Column(String(20), default="Current")
    status = Column(String(50), default="COMPLETED")
    
    risk_probability = Column(Float, nullable=False)
    risk_band = Column(String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH
    model_name = Column(String(100), default="solvify-ensemble-v1")
    model_version = Column(String(50), default="1.0.0")
    
    input_snapshot = Column(JSON, nullable=False)
    ratios = Column(JSON, nullable=False)
    explanation = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="analyses")
    company = relationship("Company", back_populates="analyses")
    scenarios = relationship("Scenario", back_populates="analysis", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")
