from backend.apis.railway_api import railway_api_client
from typing import List, Dict, Any
import logging

logger = logging.getLogger("zenway.ntes_api")

class NTESAPI:
    @staticmethod
    def get_live_status(train_number: str) -> Dict[str, Any]:
        """Fetch status for a specific train."""
        # Simple mock status
        return {
            "train_number": train_number,
            "station": "NDLS",
            "delay_mins": 15,
            "status": "Running late by 15 mins",
            "last_updated": "Just now"
        }

    @staticmethod
    def get_station_trains(station_code: str) -> List[Dict[str, Any]]:
        """Fetch all incoming trains at a station."""
        try:
            return railway_api_client.get_mock_trains(station_code)
        except Exception as e:
            logger.warning(f"NTES get_mock_trains failed for {station_code}: {e}. Returning empty list.")
            return []
