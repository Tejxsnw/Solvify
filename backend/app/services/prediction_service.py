import os
import json
import joblib
import numpy as np
from typing import Tuple, Dict, Any, List
from app.schemas.financial import FinancialInput, FinancialRatios, PredictionResult, FactorContribution, RecommendationItem
from app.services.ratio_service import RatioService
from app.services.explanation_service import ExplanationService
from app.services.recommendation_service import RecommendationService
from app.ml.pipeline import extract_features_from_input_and_ratios

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "artifacts")

class PredictionService:
    _model = None
    _scaler = None
    _metadata = None

    @classmethod
    def load_artifacts(cls):
        model_path = os.path.join(ARTIFACTS_DIR, "model.joblib")
        scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.joblib")
        meta_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            # If not yet trained, trigger training
            from app.ml.train import train_and_save_model
            cls._metadata = train_and_save_model()
        else:
            if cls._metadata is None and os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    cls._metadata = json.load(f)

        if cls._model is None and os.path.exists(model_path):
            cls._model = joblib.load(model_path)
        if cls._scaler is None and os.path.exists(scaler_path):
            cls._scaler = joblib.load(scaler_path)

    @classmethod
    def calculate_health_score(cls, probability: float, ratios: FinancialRatios) -> float:
        """
        Computes comprehensive 0-100 corporate health score.
        100 = Perfect financial resilience, 0 = Imminent default.
        """
        # Baseline from risk probability (0 to 1 -> 100 to 0)
        prob_score = (1.0 - probability) * 60.0
        
        # Altman Z component (up to 20 pts)
        z_score = min(max(ratios.altman_z_score / 3.5, 0.0), 1.0) * 20.0
        
        # Liquidity + Solvency component (up to 20 pts)
        liq_score = min(max(ratios.current_ratio / 2.0, 0.0), 1.0) * 10.0
        solv_score = min(max((3.0 - min(ratios.debt_to_equity, 3.0)) / 3.0, 0.0), 1.0) * 10.0
        
        health_score = prob_score + z_score + liq_score + solv_score
        return round(float(np.clip(health_score, 0.0, 100.0)), 1)

    @classmethod
    def predict(cls, data: FinancialInput) -> PredictionResult:
        cls.load_artifacts()
        
        # 1. Authoritative Ratio Calculation
        ratios = RatioService.calculate_ratios(data)
        
        # 2. Extract ML Features
        X_raw = extract_features_from_input_and_ratios(data, ratios)
        X_scaled = cls._scaler.transform(X_raw)
        
        # 3. Model Inference (Calibrated Probability)
        # Class 1 is bankruptcy distress probability
        probability_raw = float(cls._model.predict_proba(X_scaled)[0, 1])
        probability = round(probability_raw, 4)
        
        # 4. Risk Band Mapping
        if probability < 0.30:
            risk_band = "LOW"
        elif probability < 0.65:
            risk_band = "MEDIUM"
        else:
            risk_band = "HIGH"
            
        # 5. Explanations & Factor Attributions
        feature_importances = cls._metadata.get("feature_importances", {}) if cls._metadata else {}
        top_factors = ExplanationService.generate_explanations(
            data=data,
            ratios=ratios,
            probability=probability,
            raw_feature_importances=feature_importances
        )
        
        # 6. Actionable Recommendations
        recommendations = RecommendationService.generate_recommendations(data=data, ratios=ratios)
        
        # 7. Health Score
        health_score = cls.calculate_health_score(probability, ratios)
        
        model_name = cls._metadata.get("model_name", "solvify-ensemble-v1") if cls._metadata else "solvify-ensemble-v1"
        model_version = cls._metadata.get("version", "1.0.0") if cls._metadata else "1.0.0"
        
        return PredictionResult(
            probability=probability,
            risk_band=risk_band,
            model_name=model_name,
            model_version=model_version,
            ratios=ratios,
            top_factors=top_factors,
            recommendations=recommendations,
            health_score=health_score
        )
