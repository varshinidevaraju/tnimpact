"""
USES: Inference engine for Traffic Prediction.
SUPPORT: Loads the trained Random Forest model and predicts traffic multipliers (congestion factors) for specific time/location contexts.
"""
import joblib  # Library for loading serialized Python objects (the trained model)
import pandas as pd  # Library for structured data manipulation needed for model input
import os  # Standard library for path manipulation and file system checks
from app.config import config  # Import system-wide configuration for model file paths
from app.utils.logger import logger  # Import logging for surfacing model loading or inference errors
from ml.traffic_model import TrafficModelMetadata  # Metadata defining expected features and version

class TrafficPredictor:  # Main class for traffic inference operations
    def __init__(self):  # Constructor for the predictor
        self.model = None  # Initialize model placeholder as null
        self.model_path = config.MODEL_PATH  # Get path to the saved .joblib model from config
        self._load_model()  # Attempt to load the model into memory upon instantiation

    def _load_model(self):  # Private method to handle model loading
        try:
            if os.path.exists(self.model_path):  # Check if the model file exists on disk
                self.model = joblib.load(self.model_path)  # Load the Random Forest model using joblib
                logger.info(f"Traffic Model loaded successfully from {self.model_path}")  # Log success
            else:
                logger.warning(f"Model file not found at {self.model_path}. Using fallback values.")  # Log warning
        except Exception as e:
            logger.error(f"Failed to load traffic model: {e}")  # Log any deserialization or file access errors

    def predict_multiplier(self, hour: int, day_of_week: int, is_holiday: bool = False):  # Core inference method
        """
        Predicts traffic multiplier based on time features.
        """
        if self.model is None:  # If no model is loaded (e.g., first run or file missing)
            return 1.1  # Return a safe fallback multiplier (10% overhead)

        try:
            # Step 1: Prepare the specific feature vector expected by the trained Random Forest
            features = pd.DataFrame([{
                'hour': hour,  # Time of day (0-23)
                'day_of_week': day_of_week,  # Day of week (0-6)
                'is_holiday': int(is_holiday),  # Binary flag for holiday status (0 or 1)
                'region_id': 1  # Standardized region identifier for this deployment
            }])

            # Step 2: Ensure feature order matches the metadata definitions for consistency
            features = features[TrafficModelMetadata.FEATURES]

            # Step 3: Run the model inference
            prediction = self.model.predict(features)[0]  # Get the first (and only) prediction value
            
            # Step 4: Apply safety clipping to avoid extreme mathematical anomalies
            # Multiplier must be between 1.0 (free flow) and 3.0 (gridlock)
            return float(max(TrafficModelMetadata.CLIP_MIN, min(prediction, TrafficModelMetadata.CLIP_MAX)))
            
        except Exception as e:
            logger.error(f"Traffic prediction error: {e}")  # Log any inference runtime errors
            return 1.2  # Return a conservative fallback multiplier on error

predictor = TrafficPredictor()  # Export a singleton instance for global use in routing calculations
