from fastapi import APIRouter, HTTPException, status
from app.schemas.financial import FinancialInput, PredictionResult, FinancialRatios
from app.services.prediction_service import PredictionService
from app.services.ratio_service import RatioService

router = APIRouter(tags=["Predictions & Financial Health"])

@router.post("/predictions", response_model=PredictionResult)
def predict_financial_risk(data: FinancialInput):
    """
    Evaluates corporate financial input and returns real ML calibrated bankruptcy risk,
    ratios, feature contributions, health score, and prioritized recommendations.
    """
    try:
        result = PredictionService.predict(data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction service failure: {str(e)}"
        )

@router.post("/financial-health/calculate", response_model=FinancialRatios)
def calculate_ratios_only(data: FinancialInput):
    """
    Calculates pure financial ratios without running ML inference.
    """
    return RatioService.calculate_ratios(data)
