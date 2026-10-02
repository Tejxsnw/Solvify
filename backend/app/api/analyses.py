from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import AnalysisCreateRequest, AnalysisResponse, ComparisonResponse, ComparisonItem
from app.schemas.financial import FinancialInput
from app.services.prediction_service import PredictionService
from app.security.auth import get_current_user, get_current_active_user

router = APIRouter(prefix="/analyses", tags=["Analyses"])

@router.post("", response_model=AnalysisResponse)
def create_analysis(
    payload: AnalysisCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    prediction = PredictionService.predict(payload.financial_data)
    
    analysis = Analysis(
        user_id=current_user.id if current_user else None,
        company_name=payload.financial_data.company_name,
        financial_year=payload.financial_data.financial_year,
        status="COMPLETED",
        risk_probability=prediction.probability,
        risk_band=prediction.risk_band,
        model_name=prediction.model_name,
        model_version=prediction.model_version,
        input_snapshot=payload.financial_data.model_dump(),
        ratios=prediction.ratios.model_dump(),
        explanation=[f.model_dump() for f in prediction.top_factors],
        recommendations=[r.model_dump() for r in prediction.recommendations]
    )
    
    if payload.save_to_history:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
    else:
        analysis.id = "temp-" + analysis.id[:8]

    return AnalysisResponse(
        id=analysis.id,
        user_id=analysis.user_id,
        company_id=analysis.company_id,
        company_name=analysis.company_name,
        financial_year=analysis.financial_year,
        status=analysis.status,
        risk_probability=analysis.risk_probability,
        risk_band=analysis.risk_band,
        model_name=analysis.model_name,
        model_version=analysis.model_version,
        input_snapshot=analysis.input_snapshot,
        ratios=analysis.ratios,
        explanation=analysis.explanation,
        recommendations=analysis.recommendations,
        health_score=prediction.health_score,
        created_at=analysis.created_at
    )

@router.get("", response_model=List[AnalysisResponse])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100)
):
    query = db.query(Analysis)
    if current_user:
        query = query.filter(Analysis.user_id == current_user.id)
    analyses = query.order_by(Analysis.created_at.desc()).limit(limit).all()
    
    results = []
    for a in analyses:
        health = PredictionService.calculate_health_score(
            a.risk_probability,
            PredictionService.predict(FinancialInput(**a.input_snapshot)).ratios
        )
        results.append(AnalysisResponse(
            id=a.id,
            user_id=a.user_id,
            company_id=a.company_id,
            company_name=a.company_name,
            financial_year=a.financial_year,
            status=a.status,
            risk_probability=a.risk_probability,
            risk_band=a.risk_band,
            model_name=a.model_name,
            model_version=a.model_version,
            input_snapshot=a.input_snapshot,
            ratios=a.ratios,
            explanation=a.explanation,
            recommendations=a.recommendations,
            health_score=health,
            created_at=a.created_at
        ))
    return results

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        
    health = PredictionService.calculate_health_score(
        analysis.risk_probability,
        PredictionService.predict(FinancialInput(**analysis.input_snapshot)).ratios
    )
    return AnalysisResponse(
        id=analysis.id,
        user_id=analysis.user_id,
        company_id=analysis.company_id,
        company_name=analysis.company_name,
        financial_year=analysis.financial_year,
        status=analysis.status,
        risk_probability=analysis.risk_probability,
        risk_band=analysis.risk_band,
        model_name=analysis.model_name,
        model_version=analysis.model_version,
        input_snapshot=analysis.input_snapshot,
        ratios=analysis.ratios,
        explanation=analysis.explanation,
        recommendations=analysis.recommendations,
        health_score=health,
        created_at=analysis.created_at
    )

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    
    if current_user and analysis.user_id and analysis.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    db.delete(analysis)
    db.commit()
    return {"success": True, "message": "Analysis deleted successfully"}

@router.post("/compare", response_model=ComparisonResponse)
def compare_analyses(
    analysis_ids: List[str],
    db: Session = Depends(get_db)
):
    if len(analysis_ids) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select at least 2 analyses to compare")
        
    analyses = db.query(Analysis).filter(Analysis.id.in_(analysis_ids)).all()
    if not analyses:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Selected analyses not found")
        
    items = []
    for a in analyses:
        r = a.ratios
        items.append(ComparisonItem(
            analysis_id=a.id,
            company_name=a.company_name,
            financial_year=a.financial_year,
            risk_probability=a.risk_probability,
            risk_band=a.risk_band,
            health_score=PredictionService.calculate_health_score(
                a.risk_probability,
                PredictionService.predict(FinancialInput(**a.input_snapshot)).ratios
            ),
            altman_z_score=r.get("altman_z_score", 0),
            current_ratio=r.get("current_ratio", 0),
            quick_ratio=r.get("quick_ratio", 0),
            debt_to_equity=r.get("debt_to_equity", 0),
            net_margin_pct=r.get("net_margin_pct", 0),
            return_on_assets_pct=r.get("return_on_assets_pct", 0),
            operating_cash_flow_to_debt=r.get("operating_cash_flow_to_debt", 0)
        ))
        
    return ComparisonResponse(
        analyses=items,
        metrics_summary={
            "count": len(items),
            "lowest_risk": min(items, key=lambda x: x.risk_probability).company_name,
            "highest_health": max(items, key=lambda x: x.health_score).company_name
        }
    )
