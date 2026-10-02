# Solvify - Agent Memory & Engineering Execution Plan (`agent.md`)

## 1. Executive Summary & Mission
**Solvify** is an enterprise-grade AI-powered financial distress and bankruptcy-risk analysis platform. It analyzes corporate financial statements, computes standard financial health ratios (Liquidity, Solvency/Leverage, Profitability, Working Capital, Cash Flow Coverage), runs an ML prediction pipeline (trained and calibrated classifier with SHAP / feature attribution), generates prioritized actionable recommendations, enables dynamic What-If simulations, and offers conversational context-aware AI advisory and server-side PDF report exports.

---

## 2. Core Prompt & Loop Engineering Directives (Anti-Prompt Enforcement)

### Strict Prohibitions (Zero-Tolerance Rules)
1. **No Dummy/Placeholder Functionality**: Every button, link, dropdown, filter, and modal MUST connect to real business logic and real backend endpoints. If a feature is not implemented, do not render a non-functional control.
2. **No Fake ML Predictions**: Never output hardcoded probabilities (e.g. 68%, 72%). Calculations must flow through the trained model pipeline with actual features and calibrated probabilities. If model fails, surface a real actionable error state.
3. **No Invented Financial Data**: Never silently fabricate missing numbers or zero denominators into arbitrary figures. Validate inputs strictly and report specific validation errors.
4. **Authoritative Backend**: Authoritative ratio calculation, risk bands, scenario modeling, authentication, ownership validation, and PDF generation must reside in the backend.
5. **No Mutation of Baselines during What-If**: Scenario simulations run in-memory and can only be persisted as separate scenario records or new analyses upon explicit user action.
6. **No False Certainty & No Claimed Causation**: Use language indicating statistical estimation ("The model estimates an elevated risk of financial distress...") and feature association ("This metric contributed strongly to the model's prediction") rather than absolute claims of future bankruptcy or causation.
7. **Complete UX States**: All async interactions must display loading spinners/skeletons, disable double-submissions, report specific errors, and show empty states with action triggers.

---

## 3. System Architecture & Tech Stack

```
                                    SOLVIFY ARCHITECTURE
+---------------------------------------------------------------------------------------------+
|                                    Frontend (React + Vite + TS)                             |
|  - Tailwind CSS + Lucide Icons + Recharts                                                   |
|  - Pages: Landing, Dashboard, Analyze (Manual/CSV/Demo), Health, Explainability,            |
|           What-If Simulator, Saved History, Compare, PDF Reports, AI Assistant              |
+----------------------------------------------+----------------------------------------------+
                                               | REST API (JSON /api/v1)
                                               v
+---------------------------------------------------------------------------------------------+
|                                    Backend (FastAPI + Pydantic v2)                          |
|  - /api/v1/auth          : JWT Auth (Register, Login, Me, Token Refresh)                    |
|  - /api/v1/analyses      : CRUD for company analyses, snapshots, history, comparison        |
|  - /api/v1/predictions   : Feature processing, ML inference, calibration, SHAP attribution |
|  - /api/v1/financial     : Ratio calculation (Liquidity, Solvency, Profitability, etc.)     |
|  - /api/v1/scenarios     : What-If simulation engine with delta analysis                    |
|  - /api/v1/uploads       : CSV validation, tabular parser, error highlighter                |
|  - /api/v1/reports       : High-resolution PDF generation with ReportLab / HTML-to-PDF      |
|  - /api/v1/assistant     : Context-grounded financial advisory with LLM/rule engine         |
+----------------------------------------------+----------------------------------------------+
                                               |
         +-------------------------------------+------------------------------------+
         |                                                                          |
         v                                                                          v
+--------------------------------+                        +---------------------------------+
|  PostgreSQL / SQLite Database  |                        |  ML & Financial Risk Engine     |
|  - Users, Companies            |                        |  - Trained Model (RandomForest /|
|  - Analyses & Scenarios        |                        |    Logistic / GradientBoost)    |
|  - Reports & Model Versions    |                        |  - Scaler & Preprocessor        |
|  - Assistant Chat History      |                        |  - SHAP / Feature Attributions  |
+--------------------------------+                        |  - Altman Z-Score Benchmark     |
                                                          +---------------------------------+
```

---

## 4. End-to-End Implementation Steps

### Phase 1: Machine Learning & Risk Model Training
- Train and serialize a real bankruptcy risk classifier (using standard Altman / financial distress indicators such as Working Capital / Total Assets, Retained Earnings / Total Assets, EBIT / Total Assets, Equity / Total Liabilities, Sales / Total Assets, Current Ratio, Quick Ratio, Debt-to-Equity, Net Margin, Return on Assets, Operating Cash Flow to Debt).
- Include calibration, scaler persistence (`model.pkl`, `scaler.pkl`, `metadata.json`), feature importance, and SHAP explainer fallback.

### Phase 2: FastAPI Backend Engine
- Configuration & Database setup (SQLAlchemy ORM + SQLite/Postgres support + Alembic migrations ready).
- Pydantic v2 validation schemas.
- Comprehensive services:
  - `ratio_service.py`: Exact formulas for Current Ratio, Quick Ratio, Debt-to-Equity, Debt-to-Assets, Net Margin, ROA, ROE, Interest Coverage, Cash Flow to Debt, Altman Z-Score.
  - `prediction_service.py`: Normalization, feature calculation, model prediction, calibrated risk probability mapping (Low `< 0.30`, Medium `0.30 - 0.65`, High `> 0.65`).
  - `explanation_service.py`: Top risk drivers (positive and negative contributors with relative weights).
  - `recommendation_service.py`: Metric-tied recommendations with priority, action items, target ratios, and rationales.
  - `scenario_service.py`: Baseline vs simulation delta calculations without baseline mutations.
  - `csv_service.py`: Tabular ingestion, row-level validation, multi-company support.
  - `report_service.py`: Server-side PDF generation.
  - `assistant_service.py`: Contextual financial reasoning over company metrics.
  - `auth_service.py`: Secure bcrypt password hashing and JWT token issuance.

### Phase 3: Frontend Application (React + Vite + TypeScript)
- Premium dark/light corporate aesthetic inspired by Bloomberg/Refinitiv with modern Tailwind CSS styling.
- Responsive modular components:
  - `MetricCard`, `RiskGauge`, `RiskBadge`, `RatioCard`, `FactorList`, `RecommendationCard`, `ScenarioEditor`, `ComparisonTable`, `FileUploader`, `AiChatDrawer`, `PdfExportButton`.
- Full Navigation & Views:
  - **Landing Page**: Value proposition, feature highlights, live interactive sample teaser.
  - **Analyze View**: Dual mode (Manual Form with auto-fill Demo datasets + CSV Upload with instant validation table).
  - **Dashboard**: Risk probability gauge, health categories, key ratios, radar/bar charts, top factors, quick recommendations.
  - **Detailed Financial Health**: Deep dive into Liquidity, Leverage, Profitability, Operating efficiency, Altman Z-score breakdown.
  - **Explainability View**: SHAP feature importance waterfall & impact cards.
  - **Recommendations View**: Categorized by priority (Urgent, Medium, Long-term) with financial targets.
  - **What-If Simulator**: Interactive sliders for Revenue, Net Income, Debt, Operating Expenses, Current Assets/Liabilities with real-time recalculation and side-by-side diff.
  - **History & Comparison**: Saved analyses database, multi-select comparison table.
  - **AI Assistant**: Conversational panel aware of current company financial numbers.
  - **Settings & Profile**: Model information, API connectivity status.

### Phase 4: Verification & Automated Testing
- Pytest suite testing validation, ratios, ML predictions, what-if, CSV parser, and auth.
- End-to-end integration and API verification.

---

## 5. Verification Checklist
- [x] All visible buttons and links connect to real actions/routes.
- [x] Prediction uses serialized model and calibrated probabilities.
- [x] Explainability details real feature weights and impacts.
- [x] Recommendations are dynamically tied to identified metric weaknesses.
- [x] What-If recalculates without mutating stored baseline analyses.
- [x] CSV file upload performs real structural and data validation.
- [x] PDF reports generate valid downloadable documents.
- [x] Context-aware AI assistant parses the current company analysis.
