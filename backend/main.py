import asyncio
import datetime
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes
from backend.models.surge import CrowdRiskAssessment
from backend.models.train import Train
from backend.models.alert import Alert, Announcement
from backend.models.audit_log import AuditLogEntry

from backend.services.surge_service import surge_service
from backend.services.train_service import train_service
from backend.services.alert_service import alert_service
from backend.services.audit_service import audit_service
from backend.apis.railway_api import railway_api_client

# Feature 2 Integrations
from backend.feature2.router_crew import router as crew_router
from backend.feature2.router_fois import router as fois_router
from backend.feature2.router_concierge import router as concierge_router

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("zenway.main")

app = FastAPI(
    title="Zenway API - RailMind Sentinel",
    description="Real-time crowd surge prediction and multilingual alert system for Indian Railways.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon ease of deployment, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Feature 2 Routers
app.include_router(crew_router)
app.include_router(fois_router)
app.include_router(concierge_router)

# SSE Connection Queues
sse_queues = set()

def make_sse_handler(event_type: str):
    async def handler(payload: dict):
        event_wrapper = {
            "event_type": event_type,
            "timestamp": datetime.datetime.now().isoformat(),
            "data": payload
        }
        for q in list(sse_queues):
            try:
                await q.put(event_wrapper)
            except Exception as e:
                logger.error(f"Error pushing to SSE queue: {e}")
    return handler

# Register SSE listener for all events on startup
for et in [
    EventTypes.TRAIN_DELAY_DETECTED,
    EventTypes.SURGE_RISK_UPDATED,
    EventTypes.SURGE_RISK_CRITICAL,
    EventTypes.ACTION_CARD_GENERATED,
    EventTypes.PA_ANNOUNCEMENT_CREATED,
    EventTypes.ALERT_CONFIRMED,
    EventTypes.ALERT_BROADCASTED
]:
    event_bus.register(et, make_sse_handler(et))

# Request/Response schemas
class AlertConfirmRequest(BaseModel):
    alert_id: str

class AlertGenerateRequest(BaseModel):
    station_id: str
    platform_id: str
    score: float
    contributing_factors: Dict[str, Any]
    demo: bool = False
    scenario: str = "critical"

class AlertAnnounceRequest(BaseModel):
    alert_id: str
    summary: str
    demo: bool = False
    scenario: str = "critical"
    station_id: str = "NDLS"
    platform_id: str = "P1"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Zenway - RailMind Sentinel",
        "timestamp": datetime.datetime.now().isoformat(),
        "demo_mode_enabled": True
    }

@app.get("/surge-score", response_model=CrowdRiskAssessment)
async def get_surge_score(
    station: str = Query(..., description="Station code (e.g. NDLS)"),
    platform: str = Query(..., description="Platform ID (e.g. P1)"),
    demo: bool = Query(False, description="Whether to run in Judge Demo Mode"),
    scenario: str = Query("critical", description="Scenario type: normal, elevated, critical"),
    elapsed: Optional[int] = Query(None, description="Elapsed seconds in the compressed demo timeline")
):
    assessment = await surge_service.get_platform_assessment(
        station_code=station,
        platform_id=platform,
        demo=demo,
        scenario=scenario,
        elapsed=elapsed
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="Platform assessment not found")
    return assessment

@app.get("/surge-score/all", response_model=List[CrowdRiskAssessment])
async def get_all_surge_scores(
    station: str = Query(..., description="Station code (e.g. NDLS)"),
    demo: bool = Query(False, description="Whether to run in Judge Demo Mode"),
    scenario: str = Query("critical", description="Scenario type: normal, elevated, critical"),
    elapsed: Optional[int] = Query(None, description="Elapsed seconds in the compressed demo timeline")
):
    return await surge_service.get_all_platform_assessments(
        station_code=station,
        demo=demo,
        scenario=scenario,
        elapsed=elapsed
    )

@app.get("/trains/incoming", response_model=List[Train])
async def get_incoming_trains(
    station: str = Query(..., description="Station code (e.g. NDLS)"),
    demo: bool = Query(False, description="Whether to run in Judge Demo Mode"),
    scenario: str = Query("critical", description="Scenario type: normal, elevated, critical"),
    elapsed: Optional[int] = Query(None, description="Elapsed seconds in the compressed demo timeline")
):
    return await train_service.get_incoming_trains(
        station_code=station,
        demo=demo,
        scenario=scenario,
        elapsed=elapsed
    )

@app.post("/alert/generate")
async def generate_alert(payload: AlertGenerateRequest):
    """Triggers the Feature 2 pipeline manually (returns Alert and ActionCard)."""
    assessment_payload = {
        "station_id": payload.station_id,
        "platform_id": payload.platform_id,
        "score": payload.score,
        "contributing_factors": payload.contributing_factors,
        "calculated_at": datetime.datetime.now().isoformat()
    }
    result = await run_alert_agent(
        assessment=assessment_payload,
        demo=payload.demo,
        scenario=payload.scenario
    )
    return result

@app.post("/alert/announce", response_model=List[Announcement])
async def generate_announcements(payload: AlertAnnounceRequest):
    """Generates the Bhashini translations manually."""
    from backend.apis.bhashini_client import bhashini_client
    announcements_raw = await bhashini_client.translate_announcement(
        summary=payload.summary,
        alert_id=payload.alert_id,
        demo=payload.demo,
        scenario=payload.scenario,
        station_id=payload.station_id,
        platform_id=payload.platform_id
    )
    # Ensure correct object shapes
    return [Announcement(**item) for item in announcements_raw]

@app.post("/alert/confirm")
async def confirm_alert(payload: AlertConfirmRequest):
    """Confirms and broadcasts the alert (Human-in-the-loop gate)."""
    alert = await alert_service.confirm_alert(payload.alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found or already processed")
    return alert

@app.get("/events/history", response_model=List[AuditLogEntry])
async def get_events_history(
    station: Optional[str] = Query(None, description="Filter history by station code")
):
    return audit_service.get_history(station_code=station)

@app.post("/demo/reset")
def reset_demo_scenario(
    scenario: str = Query(..., description="Scenario to reset: normal, elevated, critical"),
    station: Optional[str] = Query(None, description="Filter history by station code")
):
    """Resets the demo timeline, clears in-memory alerts and audit log history."""
    railway_api_client.reset_demo(scenario)
    alert_service.clear_alerts()
    audit_service.clear_history(station_code=station)
    return {"status": "success", "message": f"Demo state reset for scenario: {scenario}"}

@app.get("/events/stream")
async def events_stream():
    """SSE endpoint delivering live event-bus telemetry directly to the frontend."""
    async def event_generator():
        queue = asyncio.Queue()
        sse_queues.add(queue)
        logger.info(f"New client connected to SSE. Total clients: {len(sse_queues)}")
        try:
            # Yield initial keep-alive message
            yield "data: {}\n\n"
            while True:
                event = await queue.get()
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            logger.info("SSE client connection cancelled.")
        finally:
            sse_queues.remove(queue)
            logger.info(f"SSE client disconnected. Total clients: {len(sse_queues)}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")
