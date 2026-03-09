"""
USES: Duration matrix constructor for VRP.
SUPPORT: Interfaces with OSRM to generate an NxN matrix of travel times between all geographic points, serving as the foundational cost data for the VRPSolver.
"""
import httpx  # Import HTTP client for asynchronous web requests to mapping servers
from app.config import config  # Import configuration to retrieve the OSRM base URL
from app.utils.logger import logger  # Import logging to track external API performance and failures

class MatrixBuilder:  # Service class to handle matrix generation tasks
    def __init__(self):  # constructor for MatrixBuilder
        self.base_url = f"{config.OSRM_URL}/table/v1/driving"  # Define the OSRM 'table' service endpoint

    async def get_duration_matrix(self, coordinates: list):  # Main method to fetch NxN durations
        """
        Fetches an NxN duration matrix (in seconds) from OSRM Table API.
        """
        # Step 1: Format the coordinate pairs into the specific string format required by OSRM
        # Format: lng1,lat1;lng2,lat2;...
        coord_string = ";".join([f"{c[1]},{c[0]}" for c in coordinates])  # Convert [lat, lng] to "lng,lat"
        url = f"{self.base_url}/{coord_string}?annotations=duration"  # Construct final OSRM request URL

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:  # Open an async HTTP session with a 10s timeout
                response = await client.get(url)  # Send the GET request to the OSRM server
                
                if response.status_code != 200:  # Check if the mapping server responded with an error
                    logger.error(f"OSRM Error: {response.text}")  # Log the error details for ops review
                    return None  # Return None to trigger fallback logic in the solver

                data = response.json()  # Parse the JSON response body
                return data.get("durations")  # Return the list-of-lists duration matrix
        except Exception as e:
            logger.error(f"Matrix build exception: {e}")  # Catch network timeouts or connection resets
            return None  # Return None to signal a failure in the data pipeline

matrix_builder = MatrixBuilder()  # Export a singleton for app-wide use
