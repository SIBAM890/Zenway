import datetime
from typing import List, Dict, Any, Optional
import logging
from backend.models.surge import CrowdRiskAssessment, Platform
from backend.models.train import Train
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes
from backend.constants import LEVEL_NORMAL, LEVEL_ELEVATED, LEVEL_CRITICAL, RISK_NORMAL_MAX, RISK_ELEVATED_MAX

logger = logging.getLogger("zenway.surge")

def parse_time(time_str: str) -> datetime.time:
    """Parses a HH:MM string into a time object."""
    parts = time_str.split(":")
    return datetime.time(int(parts[0]), int(parts[1]))

def time_diff_minutes(t1: datetime.time, t2: datetime.time) -> int:
    """Returns the difference in minutes between t2 and t1 (t2 - t1)."""
    # Assuming same day
    d1 = datetime.datetime.combine(datetime.date.today(), t1)
    d2 = datetime.datetime.combine(datetime.date.today(), t2)
    diff = d2 - d1
    return int(diff.total_seconds() / 60)

class SurgeCalculator:
    @staticmethod
    def calculate_platform_surge(
        station_id: str,
        platform: Platform,
        trains: List[Train],
        simulated_time_str: Optional[str] = None
    ) -> CrowdRiskAssessment:
        """
        Calculates the surge risk score for a platform.
        Formula:
          expected_passengers_from_delayed_trains = delayed_trains_arriving_in_30min * avg_passengers_per_train
          score = min(100, ((typical_load + expected_passengers_from_delayed_trains) / platform_capacity) * 100)
        """
        # Determine the reference current time
        if simulated_time_str:
            ref_time = parse_time(simulated_time_str)
        else:
            ref_time = datetime.datetime.now().time()

        delayed_trains_in_window = []
        expected_passengers = 0

        # For the formula, we check trains scheduled or arriving within the next 30 minutes that are delayed
        for train in trains:
            # We assume train matches platform
            # In simple demo, we map trains or look at their delay status
            if train.current_delay_mins > 0:
                sched_arrival = parse_time(train.scheduled_arrival)
                # Estimated arrival = scheduled_arrival + delay
                sched_dt = datetime.datetime.combine(datetime.date.today(), sched_arrival)
                est_arrival_dt = sched_dt + datetime.timedelta(minutes=train.current_delay_mins)
                est_arrival = est_arrival_dt.time()
                
                diff = time_diff_minutes(ref_time, est_arrival)
                # If train is arriving within 30 minutes from now (diff >= 0 and diff <= 30)
                if 0 <= diff <= 30:
                    delayed_trains_in_window.append(train)
                    expected_passengers += train.avg_passengers

        # Default typical load is offpeak. If peak hour (e.g., 9-11 AM or 5-7 PM), use peak load.
        # For simplicity, we default to typical_load_offpeak as base
        base_load = platform.typical_load_offpeak
        
        platform_capacity = platform.max_capacity
        total_predicted = base_load + expected_passengers
        
        score = min(100.0, (total_predicted / platform_capacity) * 100.0)
        score = round(score, 1)

        if score <= RISK_NORMAL_MAX:
            level = LEVEL_NORMAL
        elif score <= RISK_ELEVATED_MAX:
            level = LEVEL_ELEVATED
        else:
            level = LEVEL_CRITICAL

        # Calculate time to critical (if elevated, how many minutes before it hits critical, or mock)
        time_to_critical = None
        if level == LEVEL_ELEVATED:
            time_to_critical = 15
        elif level == LEVEL_CRITICAL:
            time_to_critical = 0

        contributing_factors = {
            "platform_capacity": platform_capacity,
            "typical_load": base_load,
            "expected_passengers_from_delayed_trains": expected_passengers,
            "delayed_trains_count": len(delayed_trains_in_window),
            "delayed_train_numbers": [t.number for t in delayed_trains_in_window],
            "formula": "min(100, ((typical_load + expected_passengers_from_delayed_trains) / platform_capacity) * 100)"
        }

        return CrowdRiskAssessment(
            station_id=station_id,
            platform_id=platform.id,
            score=score,
            level=level,
            time_to_critical=time_to_critical,
            contributing_factors=contributing_factors,
            calculated_at=datetime.datetime.now().isoformat()
        )

    @classmethod
    async def process_and_emit(
        cls,
        station_id: str,
        platform: Platform,
        trains: List[Train],
        simulated_time_str: Optional[str] = None,
        demo_assessment: Optional[Dict[str, Any]] = None,
        demo: bool = False,
        scenario: str = "critical"
    ) -> CrowdRiskAssessment:
        """Calculates score, emits SURGE_RISK_UPDATED, and optionally SURGE_RISK_CRITICAL."""
        if demo_assessment:
            # Reconstruct assessment from demo script
            assessment = CrowdRiskAssessment(**demo_assessment)
            # Override calculated_at to current time
            assessment.calculated_at = datetime.datetime.now().isoformat()
        else:
            assessment = cls.calculate_platform_surge(station_id, platform, trains, simulated_time_str)

        # Build payload with metadata
        payload = assessment.model_dump()
        payload["demo"] = demo
        payload["scenario"] = scenario

        # Emit update event
        await event_bus.emit(EventTypes.SURGE_RISK_UPDATED, payload)

        # If Critical (score >= 76), emit CRITICAL event
        from backend.constants import RISK_CRITICAL_MIN
        if assessment.score >= RISK_CRITICAL_MIN:
            await event_bus.emit(EventTypes.SURGE_RISK_CRITICAL, payload)

        return assessment

