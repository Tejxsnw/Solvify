from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, init_db
from app.api.api_router import api_router
from app.services.prediction_service import PredictionService

# Create database tables and perform schema compatibility checks
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Solvify AI-Powered Financial Health, Distress & Bankruptcy Risk Analysis API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Attach API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    # Preload or train ML artifacts
    try:
        PredictionService.load_artifacts()
    except Exception as e:
        print(f"Warning on startup model preloading: {e}")

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Solvify Financial Health API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
