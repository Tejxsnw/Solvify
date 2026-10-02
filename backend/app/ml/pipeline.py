import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.schemas.financial import FinancialInput, FinancialRatios

FEATURE_NAMES = [
    "working_capital_to_assets",
    "retained_earnings_to_assets",
    "ebit_to_assets",
    "equity_to_liabilities",
    "sales_to_assets",
    "current_ratio",
    "quick_ratio",
    "debt_to_equity",
    "net_margin",
    "roa",
    "cash_flow_to_debt",
    "interest_coverage",
    "altman_z"
]

def extract_features_from_input_and_ratios(data: FinancialInput, ratios: FinancialRatios) -> np.ndarray:
    """
    Extracts ordered feature vector for ML model inference.
    """
    total_liabilities = max(data.total_liabilities, 1.0)
    equity_to_liabilities = data.equity / total_liabilities
    
    vector = [
        ratios.working_capital_to_assets,
        ratios.retained_earnings_to_assets,
        ratios.ebit_to_assets,
        equity_to_liabilities,
        ratios.asset_turnover,
        min(ratios.current_ratio, 20.0),
        min(ratios.quick_ratio, 20.0),
        min(max(ratios.debt_to_equity, -10.0), 30.0),
        ratios.net_margin_pct / 100.0,
        ratios.return_on_assets_pct / 100.0,
        min(max(ratios.operating_cash_flow_to_debt, -5.0), 10.0),
        min(max(ratios.interest_coverage, -10.0), 50.0),
        min(max(ratios.altman_z_score, -5.0), 15.0)
    ]
    return np.array(vector, dtype=float).reshape(1, -1)
