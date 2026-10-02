from typing import Dict, Any, List
from app.schemas.financial import FinancialInput, PredictionResult
from app.schemas.scenario import ScenarioResponse, MetricDelta
from app.services.prediction_service import PredictionService
from datetime import datetime

class ScenarioService:
    @staticmethod
    def simulate_scenario(
        baseline_input: FinancialInput,
        changes: Dict[str, float],
        analysis_id: str,
        scenario_name: str = "What-If Simulation"
    ) -> ScenarioResponse:
        """
        Runs an in-memory simulation by copying baseline inputs, applying delta overrides,
        and evaluating the model without mutating stored baseline analyses.
        """
        # 1. Baseline Prediction
        baseline_result = PredictionService.predict(baseline_input)
        
        # 2. Construct Modified Input
        input_dict = baseline_input.model_dump()
        for field, new_value in changes.items():
            if field in input_dict and isinstance(new_value, (int, float)):
                input_dict[field] = float(new_value)
                
        # Validate modified input
        modified_financial_data = FinancialInput(**input_dict)
        
        # 3. Simulate New Prediction
        scenario_result = PredictionService.predict(modified_financial_data)
        
        # 4. Compute Metric Deltas
        deltas: List[MetricDelta] = []
        
        b_ratios = baseline_result.ratios
        s_ratios = scenario_result.ratios
        
        metrics_to_track = [
            ("current_ratio", "Current Ratio", b_ratios.current_ratio, s_ratios.current_ratio, True),
            ("debt_to_equity", "Debt to Equity", b_ratios.debt_to_equity, s_ratios.debt_to_equity, False),
            ("net_margin_pct", "Net Margin (%)", b_ratios.net_margin_pct, s_ratios.net_margin_pct, True),
            ("operating_cash_flow_to_debt", "Cash Flow to Debt", b_ratios.operating_cash_flow_to_debt, s_ratios.operating_cash_flow_to_debt, True),
            ("altman_z_score", "Altman Z-Score", b_ratios.altman_z_score, s_ratios.altman_z_score, True),
            ("health_score", "Overall Health Score", baseline_result.health_score, scenario_result.health_score, True)
        ]
        
        for name, label, b_val, s_val, higher_is_better in metrics_to_track:
            diff = s_val - b_val
            pct_change = (diff / abs(b_val) * 100.0) if b_val != 0 else 0.0
            improved = (diff > 0) if higher_is_better else (diff < 0)
            
            deltas.append(MetricDelta(
                metric_name=name,
                label=label,
                baseline_value=round(b_val, 2),
                scenario_value=round(s_val, 2),
                delta_value=round(diff, 2),
                delta_pct=round(pct_change, 1),
                improved=improved
            ))
            
        risk_delta = scenario_result.probability - baseline_result.probability
        improved_risk = risk_delta < 0  # Lower bankruptcy probability is better
        
        return ScenarioResponse(
            analysis_id=analysis_id,
            name=scenario_name,
            baseline_probability=baseline_result.probability,
            baseline_risk_band=baseline_result.risk_band,
            scenario_probability=scenario_result.probability,
            scenario_risk_band=scenario_result.risk_band,
            risk_delta=round(risk_delta, 4),
            improved=improved_risk,
            modified_inputs=changes,
            updated_ratios=scenario_result.ratios,
            metric_deltas=deltas,
            top_factors=scenario_result.top_factors,
            recommendations=scenario_result.recommendations,
            created_at=datetime.utcnow()
        )
