import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    input_changes = Column(JSON, nullable=False)
    risk_probability = Column(Float, nullable=False)
    risk_band = Column(String(20), nullable=False)
    result_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="scenarios")
