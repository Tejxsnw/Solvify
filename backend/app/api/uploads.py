from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List, Dict, Any
from app.services.csv_service import CSVService
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/uploads", tags=["Uploads"])

@router.post("/financial-data")
async def upload_financial_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported."
        )
        
    content = await file.read()
    valid_records, errors = CSVService.parse_and_validate_csv(content)
    
    analyzed_results = []
    for rec in valid_records:
        pred = PredictionService.predict(rec)
        analyzed_results.append({
            "financial_data": rec.model_dump(),
            "prediction": pred.model_dump()
        })
        
    return {
        "filename": file.filename,
        "total_rows_processed": len(valid_records) + len(errors),
        "valid_count": len(valid_records),
        "error_count": len(errors),
        "errors": errors,
        "results": analyzed_results
    }
