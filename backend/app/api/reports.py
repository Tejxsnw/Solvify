import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.analysis import Analysis
from app.models.assistant_and_reports import Report
from app.services.report_service import ReportService
from datetime import datetime

router = APIRouter(tags=["Reports"])

@router.post("/analyses/{analysis_id}/report")
def generate_report(analysis_id: str, db: Session = Depends(get_db)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
        
    try:
        pdf_path = ReportService.generate_pdf_report(analysis)
        report_record = Report(
            analysis_id=analysis_id,
            file_path=pdf_path,
            report_type="PDF"
        )
        db.add(report_record)
        db.commit()
        db.refresh(report_record)
        
        file_size = os.path.getsize(pdf_path) / 1024.0
        return {
            "report_id": report_record.id,
            "analysis_id": analysis_id,
            "download_url": f"/api/v1/reports/{report_record.id}/download",
            "file_size_kb": round(file_size, 1),
            "created_at": report_record.created_at
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation error: {str(e)}"
        )

@router.get("/reports/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found")
        
    return FileResponse(
        report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path)
    )
