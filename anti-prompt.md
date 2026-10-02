# Solvify - Anti-Prompt / AI Coding Guardrails

You are building **Solvify**, an AI-powered financial health and bankruptcy-risk analysis platform.

These rules are mandatory.

## NEVER DO THESE THINGS

### 1. Never create dummy functionality
Do not create buttons that only show a toast such as "Coming soon", "Clicked", or "Feature available soon".

Do not create fake API calls.

Do not hardcode fake dashboard numbers and present them as real user results.

Do not create fake analysis history.

Do not create fake PDF download links.

Do not make navigation items that lead nowhere.

If a feature is not implemented, hide it rather than presenting a non-functional control.

### 2. Never fake ML predictions
Never return a hardcoded probability such as 68%, 72%, or 45% just to make the UI work.

If the model is unavailable, return a clear error state:
"Prediction service is currently unavailable."

Do not silently fall back to fabricated results.

### 3. Never invent financial data
Do not invent missing user values.

Do not silently convert invalid values into arbitrary numbers.

Show validation errors and ask for required information through the UI.

### 4. Never bypass the backend
Do not put authoritative business logic only in the frontend.

Risk calculation, validation, ownership checks, scenario calculation, report generation, and persistence must be enforced by the backend.

### 5. Never expose secrets
Never hardcode:
- API keys
- database passwords
- JWT secrets
- model credentials
- service credentials

Use environment variables.

### 6. Never weaken security for convenience
Do not disable authentication checks.

Do not allow users to access another user's company, analysis, scenario, conversation, or report.

Do not trust user-supplied ownership IDs.

### 7. Never overwrite original analyses during What-If
A scenario is a simulation.

Do not modify the original analysis unless the user explicitly chooses to save the scenario as a separate analysis.

### 8. Never hide model limitations
Do not describe a probability as certainty.

Do not say:
"The company will go bankrupt."

Prefer:
"The model estimates an elevated bankruptcy risk based on the supplied financial data."

### 9. Never claim causation from explainability
SHAP/feature importance indicates model contribution, not proof that a feature caused bankruptcy.

Use language such as:
"This feature contributed strongly to the model's prediction."

### 10. Never build an unusable UI
Every form must have:
- labels
- validation
- loading state
- error state
- success state where relevant

Every async action must prevent accidental duplicate submission.

### 11. Never ignore edge cases
Handle:
- empty values
- zero denominators
- negative values where invalid
- very large numbers
- malformed CSV
- duplicate rows
- missing columns
- model unavailable
- database unavailable
- report generation failure
- AI service failure
- network timeout

### 12. Never use inconsistent API contracts
Keep schemas typed and synchronized.

Do not make the frontend guess response shapes.

### 13. Never delete working functionality while adding features
Before changing an existing feature:
- understand its current behavior
- preserve working paths
- update tests
- verify affected pages

### 14. Never over-engineer prematurely
Prefer simple, maintainable architecture.

Do not add unnecessary microservices, queues, vector databases, or infrastructure unless a real requirement needs them.

### 15. Never skip testing
Before declaring a feature complete:
- test the happy path
- test invalid input
- test failure handling
- test authorization
- test persistence
- test the UI interaction

## DEVELOPMENT RULE

Build in vertical slices:

UI → API → service → database/model → response → UI state.

Do not build pages that depend on imaginary endpoints.

## FINAL VERIFICATION

Before saying "complete", verify:

[ ] All visible buttons work.
[ ] All navigation links work.
[ ] Forms validate correctly.
[ ] Prediction uses the actual model.
[ ] Probability is not hardcoded.
[ ] Risk explanation uses actual model output.
[ ] Recommendations use actual financial metrics.
[ ] What-If uses the real prediction pipeline.
[ ] Saved analyses persist correctly.
[ ] Users cannot access other users' data.
[ ] CSV upload validates real files.
[ ] PDF generation works.
[ ] Loading states work.
[ ] Error states work.
[ ] Mobile layout works.
[ ] No console errors remain.
[ ] No exposed secrets exist.
[ ] Tests pass.

If you cannot implement a requested feature correctly, do not simulate it. Report the missing dependency or implementation requirement clearly.
