from typing import List, Dict, Any, Optional
import logging
from backend.apis.railway_api import railway_api_client
from backend.models.surge import CrowdRiskAssessment, Platform
from backend.services.train_service import train_service
from backend.surge import SurgeCalculator

logger = logging.getLogger("zenway.surge_service")

class SurgeService:
    async def get_all_platform_assessments(
        self,
        station_code: str,
        demo: bool = False,
        scenario: str = "critical",
        elapsed: Optional[int] = None
    ) -> List[CrowdRiskAssessment]:
        """Fetches platforms, trains, and calculates risk assessments, emitting events."""
        station = railway_api_client.get_station_by_code(station_code)
        if not station:
            logger.error(f"Station not found for code: {station_code}")
            return []

        # Convert raw platforms to objects
        platforms = [Platform(**p) for p in station.get("platforms", [])]

        # Fetch current trains
        trains = await train_service.get_incoming_trains(
            station_code=station_code,
            demo=demo,
            scenario=scenario,
            elapsed=elapsed
        )

        assessments = []
        
        # If in demo mode, try to load pre-scripted assessments for perfect consistency
        demo_assessments = []
        if demo:
            elapsed_sec = railway_api_client.get_elapsed_seconds(scenario, elapsed)
            demo_assessments = railway_api_client.get_demo_assessments(scenario, elapsed_sec)

        for platform in platforms:
            # Match pre-scripted assessment for this platform if available
            matching_demo = None
            for da in demo_assessments:
                if da.get("platform_id") == platform.id:
                    matching_demo = da
                    break
            
            # Process calculation and emit events
            assessment = await SurgeCalculator.process_and_emit(
                station_id=station_code.upper(),
                platform=platform,
                trains=trains,
                simulated_time_str="10:00" if demo else None, # reference time for demo
                demo_assessment=matching_demo,
                demo=demo,
                scenario=scenario
            )
            assessments.append(assessment)

        return assessments

    async def get_platform_assessment(
        self,
        station_code: str,
        platform_id: str,
        demo: bool = False,
        scenario: str = "critical",
        elapsed: Optional[int] = None
    ) -> Optional[CrowdRiskAssessment]:
        assessments = await self.get_all_platform_assessments(station_code, demo, scenario, elapsed)
        for a in assessments:
            if a.platform_id == platform_id:
                return a
        return None

surge_service = SurgeService()
