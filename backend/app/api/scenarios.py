from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.analysis import Analysis
from app.models.scenario import Scenario
from app.schemas.scenario import ScenarioSimulateRequest, ScenarioResponse
from app.schemas.financial import FinancialInput
from app.services.scenario_service import ScenarioService

router = APIRouter(prefix="/analyses", tags=["Scenarios"])

@router.post("/{analysis_id}/scenarios", response_model=ScenarioResponse)
def simulate_scenario(
    analysis_id: str,
    payload: ScenarioSimulateRequest,
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Baseline analysis not found")
        
    baseline_input = FinancialInput(**analysis.input_snapshot)
    
    # Run in-memory What-If simulation without altering stored analysis
    response = ScenarioService.simulate_scenario(
        baseline_input=baseline_input,
        changes=payload.changes,
        analysis_id=analysis_id,
        scenario_name=payload.name
    )
    
    if payload.save_scenario:
        scenario_record = Scenario(
            analysis_id=analysis_id,
            name=payload.name,
            input_changes=payload.changes,
            risk_probability=response.scenario_probability,
            risk_band=response.scenario_risk_band,
            result_snapshot={
                "ratios": response.updated_ratios.model_dump(),
                "metric_deltas": [d.model_dump() for d in response.metric_deltas]
            }
        )
        db.add(scenario_record)
        db.commit()
        db.refresh(scenario_record)
        response.id = scenario_record.id
        
    return response

@router.get("/{analysis_id}/scenarios")
def list_saved_scenarios(analysis_id: str, db: Session = Depends(get_db)):
    scenarios = db.query(Scenario).filter(Scenario.analysis_id == analysis_id).all()
    return scenarios
