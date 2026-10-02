from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.analyses import router as analyses_router
from app.api.predictions import router as predictions_router
from app.api.scenarios import router as scenarios_router
from app.api.uploads import router as uploads_router
from app.api.reports import router as reports_router
from app.api.assistant import router as assistant_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(analyses_router)
api_router.include_router(predictions_router)
api_router.include_router(scenarios_router)
api_router.include_router(uploads_router)
api_router.include_router(reports_router)
api_router.include_router(assistant_router)
