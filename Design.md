# Solvify - Design System & UI Specification

## 1. Design Direction
Create a premium financial analytics dashboard. The visual language should feel trustworthy, technical, modern, and calm rather than flashy.

## 2. Layout
Desktop:
- Left sidebar navigation
- Top header with page title, user controls, and contextual actions
- Main content in a responsive grid

Mobile:
- Collapsible navigation
- Stacked cards
- Sticky primary action where useful

## 3. Navigation
- Dashboard
- Analyze
- Financial Health
- Risk Analysis
- What-If Simulator
- Companies
- Reports
- AI Assistant
- Settings

Only show navigation items that have implemented destinations.

## 4. Visual Hierarchy
Use large typography for:
- Risk probability
- Risk classification
- Financial health score

Use cards for:
- Ratios
- Risk factors
- Recommendations
- Scenarios
- Recent analyses

Use charts for:
- Risk trend
- Revenue/profit trend
- Debt/cash trend
- Scenario comparison

## 5. Color Semantics
Use semantic colors consistently:
- Neutral for normal information
- Green for healthy/positive states
- Amber for caution
- Red for elevated risk/errors
Do not rely on color alone. Add labels/icons/text.

## 6. Components
Required reusable components:
- Button
- Input
- Select
- NumberInput
- FileUploader
- FormSection
- MetricCard
- RiskGauge
- RiskBadge
- RatioCard
- ChartCard
- FactorList
- RecommendationCard
- ScenarioEditor
- ComparisonTable
- DataTable
- Modal
- Toast
- EmptyState
- ErrorState
- LoadingSkeleton
- PDFReportAction

## 7. Analyze Form
Group inputs:
1. Company information
2. Profitability
3. Assets and liabilities
4. Cash and debt
5. Working capital

Show units and examples. Explain unfamiliar fields with tooltips.

## 8. Dashboard
Top:
- Company name
- Financial year
- Analysis timestamp
- Risk probability
- Risk band

Second row:
- Liquidity
- Profitability
- Leverage
- Cash Flow

Below:
- Risk factors
- Financial ratios
- Trend charts
- Recommendations
- What-if CTA

## 9. Interaction Rules
- Disable submit while processing.
- Show progress/loading state.
- Preserve form values after validation errors.
- Confirm destructive actions.
- Never make a disabled-looking control clickable.
- No dead links or decorative buttons pretending to perform actions.

## 10. Accessibility
- WCAG-conscious contrast.
- Keyboard navigation.
- Visible focus states.
- Semantic HTML.
- Accessible chart summaries.
- Form labels and error messages.
- Do not communicate meaning using color only.

## 11. Responsive Breakpoints
Design for mobile, tablet, and desktop. Tables should become scrollable or card-based on narrow screens.

## 12. Empty/Error States
Examples:
- No analyses yet: explain how to create the first one.
- Invalid CSV: show row and column errors.
- Model unavailable: explain that analysis cannot be completed rather than showing fabricated results.
- Report failure: offer retry and preserve the analysis.

## 13. No-Dummy-UI Rule
Every button, tab, dropdown, link, upload control, chart filter, and menu item must either perform a real implemented action or be omitted.
