from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.schemas.financial import FinancialRatios, FactorContribution, RecommendationItem

class ScenarioSimulateRequest(BaseModel):
    name: str = "Simulation Scenario"
    changes: Dict[str, float]  # e.g., {"revenue": 1200000, "debt": 400000}
    save_scenario: bool = False

class MetricDelta(BaseModel):
    metric_name: str
    label: str
    baseline_value: float
    scenario_value: float
    delta_value: float
    delta_pct: float
    improved: bool

class ScenarioResponse(BaseModel):
    id: Optional[str] = None
    analysis_id: str
    name: str
    baseline_probability: float
    baseline_risk_band: str
    scenario_probability: float
    scenario_risk_band: str
    risk_delta: float
    improved: bool
    modified_inputs: Dict[str, float]
    updated_ratios: FinancialRatios
    metric_deltas: List[MetricDelta]
    top_factors: List[FactorContribution]
    recommendations: List[RecommendationItem]
    created_at: datetime
