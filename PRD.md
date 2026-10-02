# Solvify - Product Requirements Document (PRD)

## 1. Product Vision
Solvify helps users understand a company's financial distress risk before making important decisions. It combines machine learning, financial-ratio analysis, explainability, recommendations, and scenario simulation in one workflow.

## 2. Primary User
Students, analysts, founders, finance teams, and users who want to explore company financial risk using structured financial data.

## 3. Core User Journey
Landing Page → Analyze Company → Enter/Upload Data → Run Analysis → Risk Dashboard → Understand Drivers → Get Recommendations → Run What-If → Save → Generate Report.

## 4. MVP
### Must Have
- Landing page
- Company analysis form
- Input validation
- Working ML prediction
- Probability and risk band
- Financial ratios
- Risk explanation
- Recommendations
- What-if simulation
- Demo dataset
- Analysis history
- PDF report
- Responsive design
- Error/loading/empty states

### Phase 2
- CSV/Excel ingestion
- Company comparison
- AI financial assistant
- Advanced historical trends
- User authentication
- Saved report management

## 5. Pages
### Home
Hero, product explanation, workflow, features, CTA.

### Analyze
Structured financial input form, CSV upload, demo data, validation.

### Dashboard
Risk probability, risk band, health scores, key ratios, trends, major factors.

### Explanation
Top contributing factors, supporting metrics, plain-language explanations.

### Recommendations
Prioritized actions tied to actual financial metrics.

### What-If Simulator
Editable assumptions, recalculated probability, before/after comparison, changed metrics.

### History
Saved analyses with search/filter/open/delete.

### Compare
Side-by-side financial metrics and risk results.

### Reports
Generate and access downloadable reports.

### AI Assistant
Context-aware questions about the current analysis.

## 6. UX Principles
- Clear before clever.
- One primary action per screen.
- Explain financial terminology in plain language.
- Never hide why a risk result was produced.
- Always show loading, success, empty, and error states.
- Avoid excessive animations.
- Make important numbers visually prominent.
- Use accessible labels and keyboard-friendly controls.

## 7. Risk Result
Show:
- Probability percentage
- Configurable risk band
- Financial health indicators
- Major contributing factors
- Key ratios
- Recommendations
- Model timestamp/version

Avoid presenting the probability as certainty.

## 8. What-If Experience
Users can change supported inputs, run a scenario, compare it with the original result, and reset to the original values.

The scenario must not overwrite the original saved analysis unless the user explicitly saves it as a new scenario.

## 9. Success Criteria
- A new user can complete an analysis without documentation.
- Every CTA has a real destination/action.
- Invalid inputs are clearly explained.
- Results are reproducible for the same model/version and input.
- Users can save and retrieve analyses.
- Reports contain the same core result shown in the dashboard.

## 10. Product Disclaimer
Solvify provides model-based analysis for informational and educational purposes. It does not guarantee that a company will or will not become bankrupt and is not a substitute for professional financial, accounting, or legal advice.
