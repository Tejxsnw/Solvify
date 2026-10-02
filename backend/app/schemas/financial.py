from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any, List

class FinancialInput(BaseModel):
    company_name: str = Field(..., min_length=1, description="Company name")
    financial_year: str = Field("2025", description="Fiscal year (e.g. 2025 or 2024)")
    industry: Optional[str] = Field("General", description="Industry classification")
    
    # Income Statement
    revenue: float = Field(..., ge=0, description="Annual Revenue")
    operating_income: float = Field(..., description="Operating Income / EBIT")
    net_income: float = Field(..., description="Net Income")
    interest_expense: float = Field(0.0, ge=0, description="Annual Interest Expense")
    
    # Balance Sheet - Assets
    total_assets: float = Field(..., gt=0, description="Total Assets (must be positive)")
    current_assets: float = Field(..., ge=0, description="Current Assets")
    cash: float = Field(..., ge=0, description="Cash & Cash Equivalents")
    inventory: Optional[float] = Field(0.0, ge=0, description="Inventory")
    accounts_receivable: Optional[float] = Field(0.0, ge=0, description="Accounts Receivable")
    
    # Balance Sheet - Liabilities & Equity
    total_liabilities: float = Field(..., ge=0, description="Total Liabilities")
    current_liabilities: float = Field(..., ge=0, description="Current Liabilities")
    debt: float = Field(..., ge=0, description="Total Debt (Short + Long term)")
    long_term_debt: Optional[float] = Field(0.0, ge=0, description="Long-Term Debt")
    retained_earnings: float = Field(0.0, description="Retained Earnings")
    equity: float = Field(..., description="Total Stockholders' Equity")
    
    # Cash Flow Statement
    operating_cash_flow: float = Field(..., description="Operating Cash Flow")

    @model_validator(mode="after")
    def validate_relationships(self):
        if self.current_assets > self.total_assets * 1.05:
            raise ValueError("Current assets cannot exceed total assets significantly.")
        if self.current_liabilities > self.total_liabilities * 1.05:
            raise ValueError("Current liabilities cannot exceed total liabilities significantly.")
        if self.cash > self.current_assets * 1.05:
            raise ValueError("Cash cannot exceed current assets.")
        return self


class FinancialRatios(BaseModel):
    # Liquidity
    current_ratio: float
    quick_ratio: float
    cash_ratio: float
    working_capital: float
    working_capital_to_assets: float

    # Solvency & Leverage
    debt_to_equity: float
    debt_to_assets: float
    financial_leverage: float
    equity_ratio: float

    # Profitability & Efficiency
    net_margin_pct: float
    operating_margin_pct: float
    return_on_assets_pct: float
    return_on_equity_pct: float
    asset_turnover: float
    retained_earnings_to_assets: float
    ebit_to_assets: float

    # Cash Flow & Coverage
    operating_cash_flow_to_debt: float
    interest_coverage: float

    # Composite Scores
    altman_z_score: float
    altman_zone: str  # Safe, Grey, Distress


class FactorContribution(BaseModel):
    feature_name: str
    feature_label: str
    feature_value: float
    importance: float
    impact: str  # "INCREASES_RISK" or "REDUCES_RISK"
    explanation: str


class RecommendationItem(BaseModel):
    id: str
    category: str  # Liquidity, Leverage, Profitability, Working Capital, Cash Flow
    priority: str  # High, Medium, Low
    title: str
    metric: str
    current_value: float
    target_value: float
    rationale: str
    action_plan: List[str]


class PredictionResult(BaseModel):
    probability: float
    risk_band: str  # LOW, MEDIUM, HIGH
    model_name: str
    model_version: str
    ratios: FinancialRatios
    top_factors: List[FactorContribution]
    recommendations: List[RecommendationItem]
    health_score: float  # 0 to 100 overall health
