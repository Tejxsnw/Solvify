# Solvify — AI-Powered Financial Health & Bankruptcy Risk Analysis Platform

**Solvify** is an enterprise financial intelligence platform that evaluates corporate financial statements, computes authoritative financial health indicators (Liquidity, Solvency, Profitability, Cash Flow Coverage, Altman Z-Score), runs a calibrated machine learning prediction pipeline to estimate default and distress risk, provides plain-language explainability and factor attributions, recommends prioritized financial interventions, and supports real-time What-If scenario simulations.

---

## 🛠️ Technology Stack & Techniques

### Machine Learning & Risk Intelligence
- **Ensemble Classifier (`scikit-learn`)**: Calibrated `RandomForestClassifier` with isotonic/sigmoid calibration mapping input statements directly into calibrated default probabilities.
- **Explainability**: Factor attributions and directional contributions (protective vs vulnerability drivers).
- **Composite Benchmarking**: Altman Z-Score calculation with Safe (`>2.99`), Grey (`1.81-2.99`), and Distress (`<1.81`) zone classification.

### Backend Engine
- **Framework**: Python 3.14 + FastAPI + Pydantic v2
- **Database ORM**: SQLAlchemy with SQLite default (PostgreSQL ready)
- **Security & Auth**: JWT Tokens (HS256) + Passlib / Bcrypt password hashing
- **Server-Side PDF Synthesis**: ReportLab vector PDF generation
- **CSV Ingestion**: Pandas tabular parser with row-level constraint validation
- **Testing**: Pytest with automated unit and integration tests

### Frontend Application
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism and Refinitiv/Bloomberg-inspired financial dark mode tokens
- **Data Visualization**: Recharts (Radar charts, Bar charts, Risk Gauges)
- **Icons**: Lucide React

---

## 🚀 Quickstart Guide

### 1. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd d:\Projects\Solvify\backend

# Activate virtual environment
..\venv\Scripts\Activate.ps1

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API documentation is accessible at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup & Startup
```powershell
# Navigate to frontend directory
cd d:\Projects\Solvify\frontend

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Backend Automated Tests
```powershell
cd d:\Projects\Solvify\backend
..\venv\Scripts\pytest.exe -v
```

---

## 🔑 Environment Variables (.env)
Create `.env` inside `backend/`:
```env
PROJECT_NAME="Solvify Financial Health & Bankruptcy Risk Platform"
API_V1_STR="/api/v1"
SECRET_KEY="your-super-secret-key-change-in-prod"
DATABASE_URL="sqlite:///./solvify.db"
GEMINI_API_KEY="" # Optional: Google Gemini API key for AI assistant reasoning
```
