import datetime
from typing import List, Dict, Any, Optional
import logging
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes
from backend.models.alert import Alert, ActionCard, Announcement, AgentRun
from backend.agent import run_alert_agent, ACTIVE_ALERTS, AGENT_RUNS

logger = logging.getLogger("zenway.alert_service")

class AlertService:
    def __init__(self):
        # Register the critical risk subscriber
        event_bus.register(EventTypes.SURGE_RISK_CRITICAL, self.handle_critical_risk)

    async def handle_critical_risk(self, payload: Dict[str, Any]):
        """Triggered when SURGE_RISK_CRITICAL fires."""
        station_id = payload.get("station_id", "NDLS")
        platform_id = payload.get("platform_id", "P1")
        demo = payload.get("demo", False)
        scenario = payload.get("scenario", "critical")
        score = payload.get("score", 0.0)

        logger.info(f"AlertService: Critical risk detected on {station_id}/{platform_id} (Score: {score}). Running LangGraph Agent...")

        # Avoid double-spawning alerts if a pending alert already exists for this platform
        existing_pending = self.get_pending_alert(station_id, platform_id)
        if existing_pending:
            logger.info(f"AlertService: Pending alert already exists for {station_id}/{platform_id}. Skipping duplicate generation.")
            return

        # Run the agent pipeline
        result = await run_alert_agent(
            assessment=payload,
            demo=demo,
            scenario=scenario
        )
        alert = result["alert"]
        logger.info(f"AlertService: Generated Alert {alert['id']} for {station_id}/{platform_id}")

    def get_pending_alert(self, station_id: str, platform_id: str) -> Optional[Dict[str, Any]]:
        """Finds any active alert that is still in pending status."""
        for alert in ACTIVE_ALERTS.values():
            risk_key = f"{station_id.upper()}-{platform_id.upper()}"
            if alert.get("risk_assessment_id") == risk_key and alert.get("status") == "pending":
                return alert
        return None

    def get_alerts(self, station_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all alerts, optionally filtered by station."""
        alerts = list(ACTIVE_ALERTS.values())
        if station_code:
            alerts = [a for a in alerts if a.get("risk_assessment_id", "").startswith(station_code.upper())]
        # Return sorted by creation date descending
        return sorted(alerts, key=lambda x: x.get("created_at", ""), reverse=True)

    def get_alert_by_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        return ACTIVE_ALERTS.get(alert_id)

    def get_agent_run_by_alert_id(self, alert_id: str) -> Optional[Dict[str, Any]]:
        return AGENT_RUNS.get(alert_id)

    async def confirm_alert(self, alert_id: str) -> Optional[Dict[str, Any]]:
        """Operator confirmation action gate."""
        alert = ACTIVE_ALERTS.get(alert_id)
        if not alert:
            logger.error(f"Alert not found for confirmation: {alert_id}")
            return None

        if alert["status"] != "pending":
            logger.info(f"Alert {alert_id} is already in state: {alert['status']}. Skipping.")
            return alert

        # Update status
        alert["status"] = "broadcasted"
        ACTIVE_ALERTS[alert_id] = alert

        # Extract station/platform details for the event
        risk_key = alert.get("risk_assessment_id", "-")
        parts = risk_key.split("-")
        station_id = parts[0] if len(parts) > 0 else "NDLS"
        platform_id = parts[1] if len(parts) > 1 else "P1"

        # Emit ALERT_CONFIRMED event
        await event_bus.emit(EventTypes.ALERT_CONFIRMED, {
            "alert_id": alert_id,
            "station_id": station_id,
            "platform_id": platform_id,
            "confirmed_at": datetime.datetime.now().isoformat()
        })

        # Emit ALERT_BROADCASTED event
        await event_bus.emit(EventTypes.ALERT_BROADCASTED, {
            "alert_id": alert_id,
            "station_id": station_id,
            "platform_id": platform_id,
            "broadcasted_at": datetime.datetime.now().isoformat(),
            "announcements": alert.get("announcements", [])
        })

        logger.info(f"Alert {alert_id} confirmed and broadcasted successfully.")
        return alert

    def clear_alerts(self):
        """Clears all stored alerts (useful when resetting demo)."""
        ACTIVE_ALERTS.clear()
        AGENT_RUNS.clear()
        logger.info("Cleared all alerts and agent runs.")

alert_service = AlertService()
