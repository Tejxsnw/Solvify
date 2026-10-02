from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.financial import FinancialInput, FinancialRatios, FactorContribution, RecommendationItem

class AnalysisCreateRequest(BaseModel):
    financial_data: FinancialInput
    save_to_history: bool = True

class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    company_id: Optional[str] = None
    company_name: str
    financial_year: str
    status: str
    risk_probability: float
    risk_band: str
    model_name: str
    model_version: str
    input_snapshot: Dict[str, Any]
    ratios: Dict[str, Any]
    explanation: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    health_score: float
    created_at: datetime

class ComparisonItem(BaseModel):
    analysis_id: str
    company_name: str
    financial_year: str
    risk_probability: float
    risk_band: str
    health_score: float
    altman_z_score: float
    current_ratio: float
    quick_ratio: float
    debt_to_equity: float
    net_margin_pct: float
    return_on_assets_pct: float
    operating_cash_flow_to_debt: float

class ComparisonResponse(BaseModel):
    analyses: List[ComparisonItem]
    metrics_summary: Dict[str, Any]
