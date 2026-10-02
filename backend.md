# Solvify - Backend Specification

## 1. Stack
- Python 3.x
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Alembic
- scikit-learn/XGBoost
- SHAP
- Pandas
- NumPy
- Pytest

## 2. Suggested Structure
backend/
  app/
    main.py
    config.py
    database.py
    models/
    schemas/
    api/
      auth.py
      analyses.py
      predictions.py
      scenarios.py
      companies.py
      reports.py
      assistant.py
    services/
      prediction_service.py
      ratio_service.py
      explanation_service.py
      recommendation_service.py
      scenario_service.py
      report_service.py
      csv_service.py
    ml/
      model_loader.py
      preprocessing.py
      predictor.py
      explainer.py
    security/
      auth.py
    utils/
  tests/
  alembic/
  requirements.txt

## 3. API Conventions
Base path: /api/v1

Return consistent JSON:
{
  "success": true,
  "data": {},
  "error": null
}

For errors:
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable message",
    "details": []
  }
}

## 4. Core Endpoints
### Health
GET /health

### Auth
POST /auth/register
POST /auth/login
GET /auth/me
POST /auth/logout

### Analysis
POST /analyses
GET /analyses
GET /analyses/{analysis_id}
DELETE /analyses/{analysis_id}

### Prediction
POST /predictions

### Ratios
POST /financial-health/calculate

### Scenario
POST /analyses/{analysis_id}/scenarios
GET /analyses/{analysis_id}/scenarios

### Upload
POST /uploads/financial-data

### Comparison
POST /comparisons

### Reports
POST /analyses/{analysis_id}/report
GET /reports/{report_id}

### AI Assistant
POST /assistant/chat

## 5. Prediction Request
Required model-supported features only. Example:
{
  "revenue": 1000000,
  "net_income": 50000,
  "total_assets": 1500000,
  "total_liabilities": 900000,
  "current_assets": 300000,
  "current_liabilities": 250000,
  "cash": 100000,
  "debt": 500000,
  "equity": 600000,
  "interest_expense": 30000,
  "operating_income": 90000
}

The exact schema must match the trained model's feature contract.

## 6. Prediction Response
{
  "probability": 0.684,
  "risk_band": "HIGH",
  "model_name": "solvify-bankruptcy-model",
  "model_version": "1.0.0",
  "top_factors": [],
  "financial_health": {},
  "recommendations": []
}

## 7. Prediction Service
Steps:
1. Validate request.
2. Normalize units.
3. Apply saved preprocessing.
4. Calculate derived features.
5. Run model.
6. Calibrate probability if supported.
7. Determine configured risk band.
8. Generate explanations.
9. Generate recommendations.
10. Return result.
11. Save result when requested.

## 8. Recommendation Engine
Recommendations must be generated from measurable weaknesses.

Example rules:
- Low current ratio → liquidity recommendation.
- High debt-to-equity → debt recommendation.
- Weak interest coverage → interest/debt-service recommendation.
- Negative operating cash flow → cash-flow recommendation.
- Low net margin → profitability recommendation.

Thresholds must be configuration/data-driven, not scattered through frontend code.

## 9. What-If Engine
Accept a baseline analysis and a set of modified inputs.
- Never mutate baseline inputs.
- Validate scenario values.
- Re-run the exact same preprocessing/model pipeline.
- Return baseline vs scenario probability and metric changes.
- Store scenario only when requested.

## 10. CSV Service
- Validate extension and MIME type.
- Enforce maximum file size.
- Validate headers.
- Validate numeric values.
- Return row-specific errors.
- Never execute formulas/macros.
- Preview before committing large imports.

## 11. Authentication
Use secure password hashing and short-lived access tokens/secure session strategy. Every protected resource must verify ownership.

## 12. Reports
The report service should use stored analysis results rather than rerunning a model unexpectedly. Include model version and analysis timestamp.

## 13. AI Assistant
The assistant receives structured analysis context. It must not invent missing financial data. It should explain results in plain language and distinguish model output from general financial guidance.

## 14. Testing
Test:
- Validation
- Ratio calculations
- Prediction contract
- Risk classification
- Recommendation rules
- What-if calculations
- CSV parsing
- Authentication/authorization
- Ownership isolation
- Report generation
- API error responses

Include integration tests for the complete analysis flow.

## 15. Observability
Log:
- request ID
- endpoint
- latency
- model version
- success/failure
Do not log passwords, tokens, or sensitive raw financial data unnecessarily.
