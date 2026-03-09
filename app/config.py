"""
USES: Centralized Environment Configuration management.
SUPPORT: Loads operational parameters from .env files and provides a structured interface for accessing API keys, paths, and server settings.
"""
import os  # Standard library for environment variable access and file path manipulation
from dotenv import load_dotenv  # Utility to parse .env files and load them into the OS environment

load_dotenv()  # Initialize the process by reading the local .env file

class Config:  # Object-oriented wrapper for application settings
    # 1. Project Identity
    PROJECT_NAME: str = "TNImpact - Enterprise AI Router"  # Public name used in logs and API docs
    
    # 2. Application Logic Parameters
    MODEL_PATH: str = os.getenv("MODEL_PATH", "ml_models/traffic_predictor.joblib")  # Path to the predictive ML model
    FUEL_PRICE: float = float(os.getenv("FUEL_PRICE", 95.0))  # Regional baseline fuel price in INR
    
    # 3. Third-Party Infrastructure URLs
    OSRM_URL: str = os.getenv("OSRM_URL", "https://router.project-osrm.org")  # Main mapping engine endpoint
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")  # Cache/Message Broker endpoint
    
    # 4. Observability & Telemetry Settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")  # Verbosity control (DEBUG, INFO, WARNING, ERROR)
    LOG_FILE: str = os.getenv("LOG_FILE", "app.log")  # Persistent log file location
    
    # 5. Security & Stability Policies
    RATE_LIMIT: str = "100 per minute"  # Default global throttling policy

config = Config()  # Export a singleton instance to be used by all backend components
