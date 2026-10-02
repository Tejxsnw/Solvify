export interface FinancialInput {
  company_name: string;
  financial_year: string;
  industry?: string;
  revenue: number;
  operating_income: number;
  net_income: number;
  interest_expense: number;
  total_assets: number;
  current_assets: number;
  cash: number;
  inventory?: number;
  accounts_receivable?: number;
  total_liabilities: number;
  current_liabilities: number;
  debt: number;
  long_term_debt?: number;
  retained_earnings: number;
  equity: number;
  operating_cash_flow: number;
}

export interface FinancialRatios {
  current_ratio: number;
  quick_ratio: number;
  cash_ratio: number;
  working_capital: number;
  working_capital_to_assets: number;
  debt_to_equity: number;
  debt_to_assets: number;
  financial_leverage: number;
  equity_ratio: number;
  net_margin_pct: number;
  operating_margin_pct: number;
  return_on_assets_pct: number;
  return_on_equity_pct: number;
  asset_turnover: number;
  retained_earnings_to_assets: number;
  ebit_to_assets: number;
  operating_cash_flow_to_debt: number;
  interest_coverage: number;
  altman_z_score: number;
  altman_zone: 'Safe' | 'Grey' | 'Distress';
}

export interface FactorContribution {
  feature_name: string;
  feature_label: string;
  feature_value: number;
  importance: number;
  impact: 'INCREASES_RISK' | 'REDUCES_RISK';
  explanation: string;
}

export interface RecommendationItem {
  id: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  metric: string;
  current_value: number;
  target_value: number;
  rationale: string;
  action_plan: string[];
}

export interface PredictionResult {
  probability: number;
  risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  model_name: string;
  model_version: string;
  ratios: FinancialRatios;
  top_factors: FactorContribution[];
  recommendations: RecommendationItem[];
  health_score: number;
}

export interface AnalysisRecord {
  id: string;
  user_id?: string;
  company_name: string;
  financial_year: string;
  status: string;
  risk_probability: number;
  risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  model_name: string;
  model_version: string;
  input_snapshot: FinancialInput;
  ratios: FinancialRatios;
  explanation: FactorContribution[];
  recommendations: RecommendationItem[];
  health_score: number;
  created_at: string;
}

export interface MetricDelta {
  metric_name: string;
  label: string;
  baseline_value: number;
  scenario_value: number;
  delta_value: number;
  delta_pct: number;
  improved: boolean;
}

export interface ScenarioResponse {
  id?: string;
  analysis_id: string;
  name: string;
  baseline_probability: number;
  baseline_risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  scenario_probability: number;
  scenario_risk_band: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_delta: number;
  improved: boolean;
  modified_inputs: Record<string, number>;
  updated_ratios: FinancialRatios;
  metric_deltas: MetricDelta[];
  top_factors: FactorContribution[];
  recommendations: RecommendationItem[];
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface DemoCompany extends FinancialInput {
  description: string;
}
