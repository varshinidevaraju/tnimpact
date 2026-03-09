"""
USES: Defines the logical endpoints for Traffic Prediction and ETA forecasting.
SUPPORT: Handles incoming prediction requests from the frontend and communicates with the TrafficPredictor ML engine.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ml.predictor import predictor
from app.utils.logger import logger

router = APIRouter()

class TrafficRequest(BaseModel):
    """Schema for a traffic multiplier prediction request."""
    distance_km: float = Field(..., description="Distance in kilometers")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of the week (0-6)")
    is_holiday: bool = Field(default=False)
    road_type: int = Field(default=0, description="0 for highway, 1 for city")
    historical_speed: float = Field(default=45.0)

class TrafficResponse(BaseModel):
    """Schema for the traffic prediction response."""
    traffic_multiplier: float
    status: str = "success"

@router.post("/predict", response_model=TrafficResponse)
async def predict_traffic(request: TrafficRequest):
    """
    Predict traffic multiplier based on time/context.
    """
    try:
        multiplier = predictor.predict_multiplier(
            hour=request.hour,
            day_of_week=request.day_of_week,
            is_holiday=request.is_holiday
        )
        return {
            "traffic_multiplier": multiplier,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Traffic Prediction API Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
