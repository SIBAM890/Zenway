import os
import json
import time
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger("zenway.railway_api")

# In-memory store for demo start times
DEMO_STARTS: Dict[str, float] = {}

class RailwayAPI:
    def __init__(self):
        # Resolve paths relative to this file
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.root_dir = os.path.dirname(self.base_dir)

        self.stations_path = os.path.join(self.base_dir, "data", "stations.json")
        self.seed_trains_path = os.path.join(self.base_dir, "data", "howrah_seed_trains.json")

    def load_json(self, path: str) -> Any:
        try:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                logger.error(f"File not found: {path}")
                return None
        except Exception as e:
            logger.error(f"Error loading {path}: {e}")
            return None

    def get_stations(self) -> List[Dict[str, Any]]:
        return self.load_json(self.stations_path) or []

    def get_station_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        stations = self.get_stations()
        for station in stations:
            if station.get("code") == code.upper():
                return station
        return None

    def reset_demo(self, scenario: str):
        if scenario in DEMO_STARTS:
            del DEMO_STARTS[scenario]
            logger.info(f"Reset demo scenario: {scenario}")

    def get_elapsed_seconds(self, scenario: str, elapsed: Optional[int] = None) -> int:
        if elapsed is not None:
            return elapsed

        now = time.time()
        if scenario not in DEMO_STARTS:
            DEMO_STARTS[scenario] = now
        val = int(now - DEMO_STARTS[scenario])
        if val > 60:
            # Auto-loop demo
            DEMO_STARTS[scenario] = now
            val = 0
        return val

    def get_demo_trains(self, scenario: str, elapsed: int) -> List[Dict[str, Any]]:
        scenario_path = os.path.join(self.root_dir, "demo", f"{scenario}.json")
        data = self.load_json(scenario_path)
        if not data:
            return []

        timeline = data.get("timeline", [])
        # Find the best match state: largest elapsed_seconds <= current elapsed
        best_state = None
        for state in timeline:
            state_elapsed = state.get("elapsed_seconds", 0)
            if state_elapsed <= elapsed:
                if best_state is None or state_elapsed > best_state.get("elapsed_seconds", 0):
                    best_state = state

        if best_state:
            return best_state.get("trains", [])
        return []

    def get_demo_assessments(self, scenario: str, elapsed: int) -> List[Dict[str, Any]]:
        scenario_path = os.path.join(self.root_dir, "demo", f"{scenario}.json")
        data = self.load_json(scenario_path)
        if not data:
            return []

        timeline = data.get("timeline", [])
        best_state = None
        for state in timeline:
            state_elapsed = state.get("elapsed_seconds", 0)
            if state_elapsed <= elapsed:
                if best_state is None or state_elapsed > best_state.get("elapsed_seconds", 0):
                    best_state = state

        if best_state:
            return best_state.get("assessments", [])
        return []

    def get_mock_trains(self, station_code: str) -> List[Dict[str, Any]]:
        """Returns realistic fallback trains in live mock mode."""
        # For Howrah, we have seed trains. For other stations, we generate them dynamically based on current time
        if station_code.upper() == "HWH":
            trains = self.load_json(self.seed_trains_path)
            if trains:
                return trains

        # Fallback dynamic mock trains
        current_hour = time.localtime().tm_hour
        mock_trains = []
        for i in range(1, 6):
            sched_min = (i * 20) % 60
            sched_hour = (current_hour + (i * 20) // 60) % 24
            sched_time = f"{sched_hour:02d}:{sched_min:02d}"
            mock_trains.append({
                "id": f"T12{i:03d}",
                "number": f"12{i:03d}",
                "name": f"Mock Express {i}",
                "scheduled_arrival": sched_time,
                "current_delay_mins": 10 if i % 2 == 0 else 0,
                "avg_passengers": 800 + i * 100,
                "class_breakdown": { "2A": 50, "3A": 250, "SL": 500 }
            })
        return mock_trains

railway_api_client = RailwayAPI()
