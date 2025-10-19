"""
Anomaly Detection Service for F1 Race Engineer AI
Detects driving anomalies using statistical methods and machine learning
"""

import asyncio
import logging
import numpy as np
from typing import Dict, Any, Optional, List
from collections import defaultdict, deque
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class AnomalyDetector:
    def __init__(self):
        # Driver-specific baselines and history
        self.driver_baselines: Dict[str, Dict[str, Dict[str, float]]] = {}
        self.driver_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.anomaly_threshold = 2.5  # Z-score threshold
        self.min_samples_for_baseline = 10
        
    async def detect_anomaly(self, telemetry_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Detect anomalies in telemetry data"""
        try:
            driver_id = telemetry_data.get("driver_id")
            if not driver_id:
                return None
                
            # Extract features for analysis
            features = self._extract_features(telemetry_data)
            if not features:
                return None
                
            # Add to driver history
            self.driver_history[driver_id].append({
                "timestamp": telemetry_data.get("ts"),
                "features": features
            })
            
            # Check if we have enough data for baseline
            if len(self.driver_history[driver_id]) < self.min_samples_for_baseline:
                return None
                
            # Update baseline if needed
            await self._update_baseline(driver_id)
            
            # Detect anomalies
            anomalies = []
            baseline = self.driver_baselines.get(driver_id, {})
            
            for feature, value in features.items():
                if feature in baseline:
                    feature_baseline = baseline[feature]
                    z_score = self._calculate_z_score(value, feature_baseline)
                    
                    if abs(z_score) > self.anomaly_threshold:
                        anomalies.append({
                            "feature": feature,
                            "value": value,
                            "baseline": feature_baseline["mean"],
                            "z_score": z_score,
                            "score": abs(z_score)
                        })
            
            if anomalies:
                # Find the most significant anomaly
                top_anomaly = max(anomalies, key=lambda x: x["score"])
                
                return {
                    "is_anomaly": True,
                    "driver_id": driver_id,
                    "timestamp": telemetry_data.get("ts"),
                    "anomalies": anomalies,
                    "top_anomaly": top_anomaly,
                    "confidence": min(top_anomaly["score"] / 5.0, 1.0)  # Normalize to 0-1
                }
                
            return None
            
        except Exception as e:
            logger.error(f"Error detecting anomaly: {e}")
            return None
    
    def _extract_features(self, telemetry_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract relevant features for anomaly detection"""
        features = {}
        
        # Speed-based features
        if "speed_kph" in telemetry_data:
            features["speed_kph"] = float(telemetry_data["speed_kph"])
            
        # Throttle and brake features
        if "throttle_pct" in telemetry_data:
            features["throttle_pct"] = float(telemetry_data["throttle_pct"])
            
        if "brake_pct" in telemetry_data:
            features["brake_pct"] = float(telemetry_data["brake_pct"])
            
        # Gear feature
        if "gear" in telemetry_data:
            features["gear"] = float(telemetry_data["gear"])
            
        # Calculate derived features
        if "throttle_pct" in features and "brake_pct" in features:
            # Aggressive driving indicator
            features["aggression"] = features["throttle_pct"] + features["brake_pct"]
            
        if "speed_kph" in features and "throttle_pct" in features:
            # Efficiency indicator (speed per throttle)
            if features["throttle_pct"] > 0:
                features["efficiency"] = features["speed_kph"] / features["throttle_pct"]
            else:
                features["efficiency"] = 0
                
        return features
    
    async def _update_baseline(self, driver_id: str):
        """Update baseline statistics for a driver"""
        try:
            history = list(self.driver_history[driver_id])
            if len(history) < self.min_samples_for_baseline:
                return
                
            # Extract all features from history
            all_features = defaultdict(list)
            for entry in history:
                for feature, value in entry["features"].items():
                    all_features[feature].append(value)
            
            # Calculate baseline statistics
            baseline = {}
            for feature, values in all_features.items():
                if len(values) > 1:  # Need at least 2 values for std
                    baseline[feature] = {
                        "mean": np.mean(values),
                        "std": np.std(values),
                        "min": np.min(values),
                        "max": np.max(values),
                        "count": len(values)
                    }
                else:
                    baseline[feature] = {
                        "mean": values[0] if values else 0,
                        "std": 0,
                        "min": values[0] if values else 0,
                        "max": values[0] if values else 0,
                        "count": len(values)
                    }
            
            self.driver_baselines[driver_id] = baseline
            
        except Exception as e:
            logger.error(f"Error updating baseline for driver {driver_id}: {e}")
    
    def _calculate_z_score(self, value: float, baseline: Dict[str, float]) -> float:
        """Calculate Z-score for anomaly detection"""
        try:
            mean = baseline.get("mean", 0)
            std = baseline.get("std", 1)
            
            if std == 0:
                return 0
                
            return (value - mean) / std
            
        except Exception as e:
            logger.error(f"Error calculating Z-score: {e}")
            return 0
    
    async def get_driver_stats(self, driver_id: str) -> Dict[str, Any]:
        """Get current statistics for a driver"""
        try:
            baseline = self.driver_baselines.get(driver_id, {})
            history_count = len(self.driver_history[driver_id])
            
            return {
                "driver_id": driver_id,
                "baseline_features": list(baseline.keys()),
                "history_count": history_count,
                "baseline_stats": baseline
            }
            
        except Exception as e:
            logger.error(f"Error getting driver stats: {e}")
            return {}
    
    async def reset_driver_baseline(self, driver_id: str):
        """Reset baseline for a specific driver"""
        try:
            if driver_id in self.driver_baselines:
                del self.driver_baselines[driver_id]
            if driver_id in self.driver_history:
                self.driver_history[driver_id].clear()
            logger.info(f"Reset baseline for driver {driver_id}")
        except Exception as e:
            logger.error(f"Error resetting baseline for driver {driver_id}: {e}")
