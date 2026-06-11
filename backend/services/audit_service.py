import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional
import logging
from backend.models.audit_log import AuditLogEntry
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes

logger = logging.getLogger("zenway.audit_service")

class AuditService:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.log_path = os.path.join(self.base_dir, "data", "audit_log.json")
        self._entries: List[AuditLogEntry] = []
        
        # Load existing log if any
        self._load_log()
        
        # Register to receive all events from event bus
        self._register_event_handlers()

    def _load_log(self):
        try:
            if os.path.exists(self.log_path):
                with open(self.log_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self._entries = [AuditLogEntry(**item) for item in data]
                    logger.info(f"Loaded {len(self._entries)} audit log entries from file.")
        except Exception as e:
            logger.error(f"Error loading audit log from file: {e}")
            self._entries = []

    def _save_log(self):
        try:
            # Ensure the directory exists
            os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
            with open(self.log_path, "w", encoding="utf-8") as f:
                json.dump([item.model_dump() for item in self._entries], f, indent=2)
        except Exception as e:
            logger.error(f"Error saving audit log to file: {e}")

    def log_event(self, event_type: str, station_id: str, platform_id: Optional[str], data: Dict[str, Any]):
        """Creates and appends a new AuditLogEntry."""
        entry = AuditLogEntry(
            id=f"LOG-{uuid.uuid4().hex[:6].upper()}",
            event_type=event_type,
            timestamp=datetime.datetime.now().isoformat(),
            station_id=station_id,
            platform_id=platform_id,
            data=data
        )
        self._entries.append(entry)
        self._save_log()
        logger.info(f"Logged audit event: {event_type} for station {station_id}")

    def get_history(self, station_code: Optional[str] = None, event_type: Optional[str] = None) -> List[AuditLogEntry]:
        """Returns the list of matching audit log entries."""
        filtered = self._entries
        if station_code:
            filtered = [e for e in filtered if e.station_id.upper() == station_code.upper()]
        if event_type:
            filtered = [e for e in filtered if e.event_type == event_type]
        # Return sorted by timestamp descending (most recent first)
        return sorted(filtered, key=lambda x: x.timestamp, reverse=True)

    def clear_history(self, station_code: Optional[str] = None):
        """Clears audit history logs."""
        if station_code:
            self._entries = [e for e in self._entries if e.station_id.upper() != station_code.upper()]
        else:
            self._entries = []
        self._save_log()
        logger.info("Cleared audit log history.")

    # Event bus subscriber callbacks
    def _register_event_handlers(self):
        event_types = [
            EventTypes.TRAIN_DELAY_DETECTED,
            EventTypes.SURGE_RISK_UPDATED,
            EventTypes.SURGE_RISK_CRITICAL,
            EventTypes.ACTION_CARD_GENERATED,
            EventTypes.PA_ANNOUNCEMENT_CREATED,
            EventTypes.ALERT_CONFIRMED,
            EventTypes.ALERT_BROADCASTED
        ]
        for et in event_types:
            # We construct a closure for each event type to subscribe to
            event_bus.register(et, self._make_handler(et))

    def _make_handler(self, event_type: str):
        async def handler(payload: Dict[str, Any]):
            station_id = payload.get("station_id", "NDLS")
            platform_id = payload.get("platform_id")
            
            # If payload doesn't have station_id/platform_id directly, check nested data
            if "station_id" not in payload and "assessment" in payload:
                station_id = payload["assessment"].get("station_id", "NDLS")
                platform_id = payload["assessment"].get("platform_id")
            
            self.log_event(
                event_type=event_type,
                station_id=station_id,
                platform_id=platform_id,
                data=payload
            )
        return handler

# Global instance of audit service
audit_service = AuditService()
