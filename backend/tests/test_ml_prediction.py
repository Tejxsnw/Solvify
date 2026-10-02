import pytest
from app.schemas.financial import FinancialInput
from app.services.prediction_service import PredictionService

def test_ml_prediction_pipeline():
    # Healthy Input
    healthy_data = FinancialInput(
        company_name="Apex Tech",
        financial_year="2025",
        revenue=14500000.0,
        operating_income=3200000.0,
        net_income=2400000.0,
        interest_expense=180000.0,
        total_assets=18000000.0,
        current_assets=6500000.0,
        cash=3200000.0,
        inventory=1100000.0,
        accounts_receivable=1800000.0,
        total_liabilities=5500000.0,
        current_liabilities=2200000.0,
        debt=2800000.0,
        retained_earnings=4500000.0,
        equity=12500000.0,
        operating_cash_flow=3800000.0
    )
    res_healthy = PredictionService.predict(healthy_data)
    assert res_healthy.risk_band == "LOW"
    assert res_healthy.probability < 0.30
    assert len(res_healthy.top_factors) > 0
    assert res_healthy.health_score > 70.0

    # Distressed Input
    distressed_data = FinancialInput(
        company_name="Titan Industrial",
        financial_year="2025",
        revenue=8200000.0,
        operating_income=-450000.0,
        net_income=-820000.0,
        interest_expense=540000.0,
        total_assets=11000000.0,
        current_assets=2100000.0,
        cash=220000.0,
        inventory=1200000.0,
        accounts_receivable=600000.0,
        total_liabilities=9400000.0,
        current_liabilities=3800000.0,
        debt=6800000.0,
        retained_earnings=-1200000.0,
        equity=1600000.0,
        operating_cash_flow=-180000.0
    )
    res_distressed = PredictionService.predict(distressed_data)
    assert res_distressed.risk_band in ["MEDIUM", "HIGH"]
    assert res_distressed.probability > res_healthy.probability
    assert len(res_distressed.recommendations) > 0
