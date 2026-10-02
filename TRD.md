# Solvify - Technical Requirements Document (TRD)

## 1. Overview
Solvify is an AI-powered financial risk analysis platform that evaluates company financial data, estimates bankruptcy risk, explains the factors behind the prediction, analyzes financial health, provides targeted recommendations, and supports what-if simulations.

## 2. Goals
- Provide a working end-to-end bankruptcy-risk prediction workflow.
- Return a calibrated risk probability plus Low/Medium/High classification.
- Explain model predictions using feature importance/SHAP where supported.
- Calculate key financial ratios automatically.
- Generate personalized, data-driven recommendations.
- Support what-if scenario analysis.
- Support CSV upload, saved analyses, history, comparison, and PDF reports.
- Ensure every visible interactive control has real functionality.

## 3. Recommended Architecture
Frontend: React + Vite + TypeScript + Tailwind CSS
Backend: Python + FastAPI
Database: PostgreSQL
ML: scikit-learn and/or XGBoost
Explainability: SHAP
Charts: Recharts
Authentication: JWT with secure password hashing
Reports: server-side PDF generation
Testing: Pytest + frontend unit/integration tests
API testing: Postman/OpenAPI
Deployment: Docker-ready

## 4. Core Flow
1. User signs in or continues with an allowed demo workflow.
2. User enters financial data or uploads CSV.
3. Backend validates and normalizes input.
4. Backend calculates derived financial ratios.
5. ML service generates bankruptcy probability.
6. Risk engine maps probability to a configured risk band.
7. Explanation service identifies major contributing factors.
8. Recommendation engine generates prioritized actions.
9. User can run what-if scenarios.
10. Analysis can be saved and included in history.
11. User can generate a PDF report.

## 5. Functional Requirements
### FR-01 Financial Input
Accept company name, financial year, revenue, net income, operating income, retained earnings, total assets, current assets, total liabilities, current liabilities, long-term debt, equity, cash, interest expense, operating cash flow, inventory, accounts receivable, and accounts payable where supported by the selected model.

### FR-02 Validation
Reject impossible or malformed values. Handle missing values explicitly. Never silently replace missing data with arbitrary values.

### FR-03 Prediction
Return probability, risk band, model/version metadata, and timestamp.

### FR-04 Financial Health
Calculate and display liquidity, leverage, profitability, working-capital, cash-flow, and coverage metrics.

### FR-05 Explainability
Show the most influential features and whether they increased or decreased estimated risk. Never claim causation when the model only establishes association.

### FR-06 Recommendations
Generate recommendations from actual financial weaknesses. Each recommendation must contain a reason and the relevant metric.

### FR-07 What-If
Allow users to modify supported financial inputs and recompute the estimated probability without changing the stored original analysis.

### FR-08 CSV Upload
Validate headers, types, required columns, row-level errors, and duplicate/invalid records before prediction.

### FR-09 History
Users can view, open, and delete their own saved analyses.

### FR-10 Comparison
Compare selected saved analyses using common metrics without creating a misleading overall winner score.

### FR-11 Reports
Generate a PDF containing inputs, ratios, risk result, explanation, recommendations, and scenario results where applicable.

### FR-12 AI Assistant
The assistant must use the current analysis context and must not invent financial values.

## 6. Non-Functional Requirements
- Responsive desktop and mobile UI.
- API responses should be structured JSON.
- Backend validation is authoritative; frontend validation is supplementary.
- Secrets must be stored in environment variables.
- User data must be isolated by authenticated user.
- Prediction model/version must be recorded for reproducibility.
- Errors must be actionable and user-friendly.
- No hardcoded fake analytics, fake history, fake reports, or fake API responses in production paths.

## 7. ML Requirements
- Use a documented dataset and preprocessing pipeline.
- Avoid data leakage.
- Evaluate using precision, recall, F1, ROC-AUC, confusion matrix, and probability calibration where appropriate.
- Persist preprocessing artifacts with the model.
- Version model artifacts.
- Return a calibrated probability when calibration is implemented.
- Clearly distinguish model output from financial advice.

## 8. Security
- Passwords must be securely hashed.
- JWT/session handling must be secure.
- Validate and sanitize uploaded files.
- Restrict file size and file types.
- Protect authenticated endpoints.
- Do not expose model files, secrets, stack traces, or database credentials.
- Apply rate limiting to expensive prediction/AI endpoints where appropriate.

## 9. Acceptance Criteria
A feature is complete only when its UI, API, persistence, validation, error states, and tests work together. No visible button may be a placeholder.
