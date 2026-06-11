import datetime
from typing import List, Dict, Any, Optional
import logging
from backend.apis.railway_api import railway_api_client
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes
from backend.models.train import Train

logger = logging.getLogger("zenway.train_service")

class TrainService:
    def __init__(self):
        # Maps train_id -> last known delay
        self._last_delays: Dict[str, int] = {}

    async def get_incoming_trains(
        self,
        station_code: str,
        demo: bool = False,
        scenario: str = "critical",
        elapsed: Optional[int] = None
    ) -> List[Train]:
        """Fetches incoming trains and detects new/changed delays, emitting events accordingly."""
        if demo:
            elapsed_sec = railway_api_client.get_elapsed_seconds(scenario, elapsed)
            raw_trains = railway_api_client.get_demo_trains(scenario, elapsed_sec)
        else:
            raw_trains = railway_api_client.get_mock_trains(station_code)

        train_models = []
        for raw in raw_trains:
            try:
                train = Train(**raw)
                train_models.append(train)

                train_id = train.id
                current_delay = train.current_delay_mins
                last_delay = self._last_delays.get(train_id)

                if last_delay is None or last_delay != current_delay:
                    self._last_delays[train_id] = current_delay
                    # Trigger Event: TRAIN_DELAY_DETECTED
                    # In a real app we'd map this to a specific platform. Here we associate with P1 for demo simplicity.
                    await event_bus.emit(EventTypes.TRAIN_DELAY_DETECTED, {
                        "train_id": train_id,
                        "station_id": station_code.upper(),
                        "platform_id": "P1",
                        "delay_mins": current_delay,
                        "detected_at": datetime.datetime.now().isoformat()
                    })
            except Exception as e:
                logger.error(f"Error parsing train record {raw}: {e}")

        return train_models

train_service = TrainService()
