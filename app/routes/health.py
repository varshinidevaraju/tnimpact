"""
USES: System monitoring and health checks. # Defines the primary use case for this module.
SUPPORT: Provides an endpoint for load balancers and monitoring tools to verify the operational availability of the routing engine. # Explains who benefits from this module and how.
"""
from fastapi import APIRouter  # Imports the APIRouter class from FastAPI to create a new router instance.

from ml.predictor import predictor  # Imports the 'predictor' object from the 'ml.predictor' module, likely for ML model status.
from routing.matrix_builder import matrix_builder  # Imports 'matrix_builder' from 'routing.matrix_builder', potentially for OSRM status.

router = APIRouter()  # Initializes a new FastAPI router instance to group related endpoints.

@router.get("/health")  # Decorator that registers the 'health_check' function as a GET endpoint at the "/health" path.
async def health_check():  # Defines an asynchronous function named 'health_check' to handle requests to the /health endpoint.
    """
    Standard heartbeat check for monitoring agents (e.g., Kubernetes probes). # Docstring explaining the purpose of the health check endpoint.
    """
    # Simple check for ML model and OSRM (via matrix builder test or just reaching OSRM) # Comment explaining the logic below.
    model_loaded = predictor.model is not None  # Checks if the ML model is loaded by verifying if 'predictor.model' is not None.
    osrm_status = True # Could add a real ping here # Placeholder for OSRM status; currently always True, with a note for future improvement.
    
    return {  # Returns a dictionary as a JSON response.
        "status": "ok" if model_loaded else "degraded",  # Overall status: "ok" if model is loaded, "degraded" otherwise.
        "model_loaded": model_loaded,  # Boolean indicating whether the ML model is loaded.
        "osrm_status": osrm_status  # Boolean indicating the OSRM service status.
    }
