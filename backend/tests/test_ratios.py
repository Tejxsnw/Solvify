import pytest
from app.schemas.financial import FinancialInput
from app.services.ratio_service import RatioService

def test_ratio_service_healthy_company():
    data = FinancialInput(
        company_name="Apex Tech",
        financial_year="2025",
        revenue=10000000.0,
        operating_income=2500000.0,
        net_income=1800000.0,
        interest_expense=100000.0,
        total_assets=15000000.0,
        current_assets=5000000.0,
        cash=2500000.0,
        inventory=800000.0,
        accounts_receivable=1500000.0,
        total_liabilities=4000000.0,
        current_liabilities=2000000.0,
        debt=2000000.0,
        retained_earnings=3000000.0,
        equity=11000000.0,
        operating_cash_flow=2800000.0
    )
    r = RatioService.calculate_ratios(data)
    
    assert r.current_ratio == 2.5
    assert r.quick_ratio == 2.1
    assert r.debt_to_equity == round(2000000 / 11000000, 3)
    assert r.net_margin_pct == 18.0
    assert r.altman_z_score > 2.99
    assert r.altman_zone == "Safe"

def test_ratio_service_distressed_company():
    data = FinancialInput(
        company_name="Strained Corp",
        financial_year="2025",
        revenue=5000000.0,
        operating_income=-400000.0,
        net_income=-600000.0,
        interest_expense=300000.0,
        total_assets=6000000.0,
        current_assets=1200000.0,
        cash=100000.0,
        inventory=700000.0,
        accounts_receivable=300000.0,
        total_liabilities=5200000.0,
        current_liabilities=2500000.0,
        debt=3800000.0,
        retained_earnings=-800000.0,
        equity=800000.0,
        operating_cash_flow=-150000.0
    )
    r = RatioService.calculate_ratios(data)
    
    assert r.current_ratio < 1.0
    assert r.altman_z_score < 1.81
    assert r.altman_zone == "Distress"
    assert r.operating_cash_flow_to_debt < 0.0
