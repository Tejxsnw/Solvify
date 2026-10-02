import os
import json
from typing import Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, classification_report
from sklearn.model_selection import train_test_split

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def generate_synthetic_financial_dataset(n_samples: int = 4000, random_state: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generates realistic synthetic corporate financial distributions based on empirical bankruptcy datasets
    (Taiwanese Bankruptcy & Polish Companies Bankruptcy distributions and Altman Z-Score indicators).
    """
    np.random.seed(random_state)
    
    # 0 = Non-distressed (Safe), 1 = Distressed / Bankrupt
    # Class balance: approx 15% distressed
    n_distressed = int(n_samples * 0.18)
    n_healthy = n_samples - n_distressed
    
    # Healthy distributions
    # 1. wc_to_assets
    h_wc = np.random.normal(0.25, 0.12, n_healthy)
    # 2. re_to_assets
    h_re = np.random.normal(0.28, 0.15, n_healthy)
    # 3. ebit_to_assets
    h_ebit = np.random.normal(0.12, 0.05, n_healthy)
    # 4. equity_to_liabilities
    h_eq_liab = np.random.exponential(1.8, n_healthy) + 0.5
    # 5. sales_to_assets
    h_sales = np.random.normal(1.2, 0.4, n_healthy).clip(0.2, 5.0)
    # 6. current_ratio
    h_cr = np.random.normal(2.1, 0.6, n_healthy).clip(1.1, 8.0)
    # 7. quick_ratio
    h_qr = np.random.normal(1.6, 0.5, n_healthy).clip(0.8, 6.0)
    # 8. debt_to_equity
    h_de = np.random.normal(0.8, 0.4, n_healthy).clip(0.1, 2.0)
    # 9. net_margin
    h_nm = np.random.normal(0.08, 0.04, n_healthy)
    # 10. roa
    h_roa = np.random.normal(0.09, 0.04, n_healthy)
    # 11. cash_flow_to_debt
    h_cf = np.random.normal(0.35, 0.15, n_healthy).clip(0.1, 1.5)
    # 12. interest_coverage
    h_ic = np.random.normal(6.5, 3.0, n_healthy).clip(2.5, 25.0)
    # 13. altman_z
    h_z = 1.2*h_wc + 1.4*h_re + 3.3*h_ebit + 0.6*h_eq_liab + 0.999*h_sales
    
    X_healthy = np.column_stack([
        h_wc, h_re, h_ebit, h_eq_liab, h_sales, h_cr, h_qr, h_de, h_nm, h_roa, h_cf, h_ic, h_z
    ])
    y_healthy = np.zeros(n_healthy)

    # Distressed distributions
    d_wc = np.random.normal(-0.08, 0.15, n_distressed)
    d_re = np.random.normal(-0.15, 0.20, n_distressed)
    d_ebit = np.random.normal(-0.05, 0.08, n_distressed)
    d_eq_liab = np.random.exponential(0.3, n_distressed).clip(0.01, 0.7)
    d_sales = np.random.normal(0.75, 0.35, n_distressed).clip(0.05, 3.0)
    d_cr = np.random.normal(0.85, 0.25, n_distressed).clip(0.2, 1.25)
    d_qr = np.random.normal(0.55, 0.20, n_distressed).clip(0.1, 0.95)
    d_de = np.random.normal(3.8, 2.0, n_distressed).clip(1.8, 15.0)
    d_nm = np.random.normal(-0.10, 0.08, n_distressed)
    d_roa = np.random.normal(-0.06, 0.07, n_distressed)
    d_cf = np.random.normal(-0.05, 0.10, n_distressed).clip(-0.5, 0.08)
    d_ic = np.random.normal(0.4, 0.8, n_distressed).clip(-5.0, 1.4)
    d_z = 1.2*d_wc + 1.4*d_re + 3.3*d_ebit + 0.6*d_eq_liab + 0.999*d_sales
    
    X_distressed = np.column_stack([
        d_wc, d_re, d_ebit, d_eq_liab, d_sales, d_cr, d_qr, d_de, d_nm, d_roa, d_cf, d_ic, d_z
    ])
    y_distressed = np.ones(n_distressed)

    X = np.vstack([X_healthy, X_distressed])
    y = np.concatenate([y_healthy, y_distressed])
    
    # Shuffle
    indices = np.random.permutation(len(y))
    return X[indices], y[indices]

def train_and_save_model():
    print("Training calibrated Solvify bankruptcy risk model...")
    X, y = generate_synthetic_financial_dataset(n_samples=5000)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    scaler = RobustScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Base estimator: Random Forest with balanced class weights
    base_rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=7,
        min_samples_split=6,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42
    )
    
    # Calibrate probability predictions with isotonic calibration
    calibrated_model = CalibratedClassifierCV(estimator=base_rf, method="sigmoid", cv=5)
    calibrated_model.fit(X_train_scaled, y_train)
    
    # Fit underlying RF for feature importances
    base_rf.fit(X_train_scaled, y_train)
    
    # Evaluation
    y_pred_proba = calibrated_model.predict_proba(X_test_scaled)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)
    
    roc_auc = float(roc_auc_score(y_test, y_pred_proba))
    f1 = float(f1_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    
    feature_names = [
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
    
    importances = {name: float(imp) for name, imp in zip(feature_names, base_rf.feature_importances_)}
    
    metadata = {
        "model_name": "solvify-ensemble-v1",
        "version": "1.0.0",
        "framework": "scikit-learn",
        "algorithm": "CalibratedClassifierCV (RandomForest)",
        "features": feature_names,
        "feature_importances": importances,
        "metrics": {
            "roc_auc": round(roc_auc, 4),
            "f1_score": round(f1, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4)
        },
        "risk_thresholds": {
            "low_max": 0.30,
            "medium_max": 0.65
        }
    }
    
    model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
    scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.joblib")
    meta_path = os.path.join(ARTIFACTS_DIR, "metadata.json")
    
    joblib.dump(calibrated_model, model_path)
    joblib.dump(scaler, scaler_path)
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Model saved successfully to {model_path} with ROC-AUC: {roc_auc:.4f}, F1: {f1:.4f}")
    return metadata

if __name__ == "__main__":
    train_and_save_model()
