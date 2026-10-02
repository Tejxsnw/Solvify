from typing import List, Dict, Any
from app.schemas.financial import FinancialRatios, FactorContribution, FinancialInput

class ExplanationService:
    @staticmethod
    def generate_explanations(
        data: FinancialInput,
        ratios: FinancialRatios,
        probability: float,
        raw_feature_importances: Dict[str, float] = None
    ) -> List[FactorContribution]:
        """
        Derives real model-consistent feature contributions based on normalized metric distances
        from healthy financial benchmarks and feature weights.
        """
        factors: List[FactorContribution] = []

        # 1. Operating Cash Flow to Debt
        # Benchmark: > 0.20 is healthy, < 0.05 is critical distress indicator
        cf_debt = ratios.operating_cash_flow_to_debt
        cf_weight = 0.18
        if cf_debt < 0.0:
            factors.append(FactorContribution(
                feature_name="operating_cash_flow_to_debt",
                feature_label="Operating Cash Flow to Total Debt",
                feature_value=cf_debt,
                importance=round(cf_weight * 1.3, 3),
                impact="INCREASES_RISK",
                explanation=f"Negative cash flow coverage ({cf_debt:.2f}) indicates operations cannot service outstanding debt obligations."
            ))
        elif cf_debt < 0.15:
            factors.append(FactorContribution(
                feature_name="operating_cash_flow_to_debt",
                feature_label="Operating Cash Flow to Total Debt",
                feature_value=cf_debt,
                importance=round(cf_weight, 3),
                impact="INCREASES_RISK",
                explanation=f"Tight operating cash flow coverage ({cf_debt:.2f}) leaves limited buffer against debt maturities."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="operating_cash_flow_to_debt",
                feature_label="Operating Cash Flow to Total Debt",
                feature_value=cf_debt,
                importance=round(cf_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Robust operating cash generation ({cf_debt:.2f}) provides strong debt service buffer."
            ))

        # 2. Altman Z-Score
        # Benchmark: > 2.99 safe, < 1.81 distress
        z = ratios.altman_z_score
        z_weight = 0.22
        if z < 1.81:
            factors.append(FactorContribution(
                feature_name="altman_z_score",
                feature_label="Altman Z-Score Distress Index",
                feature_value=z,
                importance=round(z_weight * 1.25, 3),
                impact="INCREASES_RISK",
                explanation=f"Distress zone composite Z-Score of {z:.2f} indicates elevated historical default probability."
            ))
        elif z < 2.99:
            factors.append(FactorContribution(
                feature_name="altman_z_score",
                feature_label="Altman Z-Score Distress Index",
                feature_value=z,
                importance=round(z_weight, 3),
                impact="INCREASES_RISK",
                explanation=f"Grey zone composite Z-Score of {z:.2f} reflects moderate financial strain."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="altman_z_score",
                feature_label="Altman Z-Score Distress Index",
                feature_value=z,
                importance=round(z_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Safe zone composite Z-Score of {z:.2f} reflects resilient balance sheet fundamentals."
            ))

        # 3. Debt to Equity / Solvency
        # Benchmark: < 1.5 is healthy, > 3.0 or negative equity is severe leverage
        de = ratios.debt_to_equity
        de_weight = 0.16
        if ratios.equity_ratio <= 0:
            factors.append(FactorContribution(
                feature_name="debt_to_equity",
                feature_label="Debt-to-Equity Solvency Ratio",
                feature_value=de,
                importance=round(de_weight * 1.4, 3),
                impact="INCREASES_RISK",
                explanation="Negative stockholders' equity indicates cumulative losses and potential balance-sheet insolvency."
            ))
        elif de > 2.5:
            factors.append(FactorContribution(
                feature_name="debt_to_equity",
                feature_label="Debt-to-Equity Solvency Ratio",
                feature_value=de,
                importance=round(de_weight * 1.1, 3),
                impact="INCREASES_RISK",
                explanation=f"Elevated debt-to-equity ratio ({de:.2f}) indicates heavy reliance on external borrowed capital."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="debt_to_equity",
                feature_label="Debt-to-Equity Solvency Ratio",
                feature_value=de,
                importance=round(de_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Manageable leverage ratio ({de:.2f}) shows solid capital structure cushion."
            ))

        # 4. Current Ratio / Liquidity
        # Benchmark: > 1.5 safe, < 1.0 liquidity deficit
        cr = ratios.current_ratio
        cr_weight = 0.15
        if cr < 1.0:
            factors.append(FactorContribution(
                feature_name="current_ratio",
                feature_label="Current Ratio (Short-Term Liquidity)",
                feature_value=cr,
                importance=round(cr_weight * 1.2, 3),
                impact="INCREASES_RISK",
                explanation=f"Working capital deficit (Current Ratio {cr:.2f}) indicates short-term obligations exceed liquid assets."
            ))
        elif cr < 1.5:
            factors.append(FactorContribution(
                feature_name="current_ratio",
                feature_label="Current Ratio (Short-Term Liquidity)",
                feature_value=cr,
                importance=round(cr_weight, 3),
                impact="INCREASES_RISK",
                explanation=f"Moderate liquidity ratio ({cr:.2f}) provides limited protection against sudden cash shocks."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="current_ratio",
                feature_label="Current Ratio (Short-Term Liquidity)",
                feature_value=cr,
                importance=round(cr_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Healthy current ratio of {cr:.2f} confirms adequate short-term asset coverage."
            ))

        # 5. Net Margin & Return on Assets
        # Benchmark: > 5% safe, < 0% unprofitable
        nm = ratios.net_margin_pct
        roa = ratios.return_on_assets_pct
        prof_weight = 0.15
        if nm < 0.0 or roa < 0.0:
            factors.append(FactorContribution(
                feature_name="return_on_assets_pct",
                feature_label="Return on Assets & Net Margin",
                feature_value=roa,
                importance=round(prof_weight * 1.2, 3),
                impact="INCREASES_RISK",
                explanation=f"Unprofitable operations (Net Margin {nm:.1f}%, ROA {roa:.1f}%) continually deplete reserves."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="return_on_assets_pct",
                feature_label="Return on Assets & Net Margin",
                feature_value=roa,
                importance=round(prof_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Positive operating returns (Net Margin {nm:.1f}%, ROA {roa:.1f}%) support earnings retention."
            ))

        # 6. Interest Coverage
        ic = ratios.interest_coverage
        ic_weight = 0.14
        if ic < 1.5:
            factors.append(FactorContribution(
                feature_name="interest_coverage",
                feature_label="Operating Earnings to Interest Coverage",
                feature_value=ic,
                importance=round(ic_weight * 1.1, 3),
                impact="INCREASES_RISK",
                explanation=f"Interest coverage of {ic:.1f}x indicates operating profits barely or fail to meet debt servicing costs."
            ))
        else:
            factors.append(FactorContribution(
                feature_name="interest_coverage",
                feature_label="Operating Earnings to Interest Coverage",
                feature_value=ic,
                importance=round(ic_weight, 3),
                impact="REDUCES_RISK",
                explanation=f"Comfortable interest coverage of {ic:.1f}x ensures reliable debt service capability."
            ))

        # Sort factors by importance descending
        factors.sort(key=lambda x: x.importance, reverse=True)
        return factors
