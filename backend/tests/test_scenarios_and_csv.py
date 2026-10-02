import pytest
from app.schemas.financial import FinancialInput
from app.services.scenario_service import ScenarioService
from app.services.csv_service import CSVService

def test_scenario_simulation_delta():
    baseline = FinancialInput(
        company_name="Simulation Baseline Co",
        financial_year="2025",
        revenue=5000000.0,
        operating_income=-200000.0,
        net_income=-300000.0,
        interest_expense=250000.0,
        total_assets=6000000.0,
        current_assets=1500000.0,
        cash=200000.0,
        inventory=800000.0,
        accounts_receivable=500000.0,
        total_liabilities=4500000.0,
        current_liabilities=2200000.0,
        debt=3200000.0,
        retained_earnings=-500000.0,
        equity=1500000.0,
        operating_cash_flow=-50000.0
    )
    
    # Simulate debt reduction and profitability improvement
    changes = {
        "debt": 1800000.0,
        "operating_income": 600000.0,
        "net_income": 400000.0,
        "operating_cash_flow": 700000.0
    }
    
    res = ScenarioService.simulate_scenario(
        baseline_input=baseline,
        changes=changes,
        analysis_id="sim-test-123",
        scenario_name="Debt Paydown & Margin Boost"
    )
    
    # Baseline input was not mutated
    assert baseline.debt == 3200000.0
    assert res.scenario_probability < res.baseline_probability
    assert res.improved is True
    assert len(res.metric_deltas) > 0


def test_csv_upload_parsing():
    csv_content = b"""company_name,financial_year,industry,revenue,operating_income,net_income,interest_expense,total_assets,current_assets,cash,inventory,accounts_receivable,total_liabilities,current_liabilities,debt,long_term_debt,retained_earnings,equity,operating_cash_flow
Alpha Corp,2025,Tech,10000000,2000000,1500000,100000,12000000,4000000,2000000,500000,1500000,3000000,1500000,1500000,1000000,2000000,9000000,2200000
"""
    records, errors = CSVService.parse_and_validate_csv(csv_content)
    assert len(errors) == 0
    assert len(records) == 1
    assert records[0].company_name == "Alpha Corp"
    assert records[0].revenue == 10000000.0
