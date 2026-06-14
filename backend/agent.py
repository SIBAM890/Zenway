import uuid
import datetime
from typing import TypedDict, List, Dict, Any, Optional
import logging
from langgraph.graph import StateGraph, END
from backend.apis.gemini_client import gemini_client
from backend.apis.bhashini_client import bhashini_client
from backend.events.bus import event_bus
from backend.events.event_types import EventTypes

logger = logging.getLogger("zenway.agent")

# Define LangGraph State
class AgentState(TypedDict):
    assessment: Dict[str, Any]
    alert_id: str
    action_card: Optional[Dict[str, Any]]
    announcements: Optional[List[Dict[str, Any]]]
    steps: List[Dict[str, Any]]
    demo: bool
    scenario: str

# Define node functions
async def call_gemini_node(state: AgentState) -> Dict[str, Any]:
    """Node that invokes Gemini 1.5 Flash to generate safety action cards."""
    step_id = "step_1_gemini_action_card"
    started_at = datetime.datetime.now().isoformat()
    
    assessment = state["assessment"]
    logger.info(f"LangGraph Step 1: Requesting ActionCard from Gemini for Platform {assessment.get('platform_id')} Score {assessment.get('score')}")
    
    # Call Gemini client
    action_card_raw = await gemini_client.generate_action_card(
        assessment=assessment,
        demo=state["demo"],
        scenario=state["scenario"]
    )
    
    # Match the ActionCard Pydantic schema structure
    action_card = {
        "alert_id": state["alert_id"],
        "summary": action_card_raw.get("summary", ""),
        "actions": action_card_raw.get("actions", [])[:5],
        "time_window": action_card_raw.get("time_window", "Next 30 mins"),
        "confidence": action_card_raw.get("confidence", 0.9)
    }
    
    completed_at = datetime.datetime.now().isoformat()
    step_trace = {
        "node": "generate_action_card",
        "description": "Call Gemini 1.5 Flash to produce structured action card recommendations.",
        "input": {"assessment_score": assessment.get("score"), "factors": assessment.get("contributing_factors")},
        "output": action_card,
        "started_at": started_at,
        "completed_at": completed_at
    }
    
    # Emit event ACTION_CARD_GENERATED
    await event_bus.emit(EventTypes.ACTION_CARD_GENERATED, {
        "alert_id": state["alert_id"],
        "action_card": action_card
    })
    
    return {
        "action_card": action_card,
        "steps": state["steps"] + [step_trace]
    }

async def call_bhashini_node(state: AgentState) -> Dict[str, Any]:
    """Node that invokes Bhashini translations for public announcements."""
    step_id = "step_2_bhashini_pa_announcement"
    started_at = datetime.datetime.now().isoformat()
    
    action_card = state["action_card"]
    assessment = state["assessment"]
    logger.info(f"LangGraph Step 2: Requesting Bhashini translations for alert {state['alert_id']} (Platform {assessment.get('platform_id')}, Summary: {action_card['summary'][:60]}...)")
    
    # Call Bhashini client
    announcements = await bhashini_client.translate_announcement(
        summary=action_card["summary"],
        alert_id=state["alert_id"],
        demo=state["demo"],
        scenario=state["scenario"],
        station_id=assessment.get("station_id", "NDLS"),
        platform_id=assessment.get("platform_id", "P1")
    )
    
    completed_at = datetime.datetime.now().isoformat()
    step_trace = {
        "node": "generate_pa_announcements",
        "description": "Call Bhashini API to translate safety announcement script into 5 regional languages.",
        "input": {"summary": action_card["summary"]},
        "output": {"languages_count": len(announcements), "announcements": announcements},
        "started_at": started_at,
        "completed_at": completed_at
    }
    
    # Emit event PA_ANNOUNCEMENT_CREATED
    await event_bus.emit(EventTypes.PA_ANNOUNCEMENT_CREATED, {
        "alert_id": state["alert_id"],
        "announcements": announcements
    })
    
    return {
        "announcements": announcements,
        "steps": state["steps"] + [step_trace]
    }

# Build and compile the Graph
workflow = StateGraph(AgentState)
workflow.add_node("generate_action_card", call_gemini_node)
workflow.add_node("generate_pa_announcements", call_bhashini_node)

workflow.set_entry_point("generate_action_card")
workflow.add_edge("generate_action_card", "generate_pa_announcements")
workflow.add_edge("generate_pa_announcements", END)

agent_graph = workflow.compile()

# Global state tables for stored alerts and runs
ACTIVE_ALERTS: Dict[str, Dict[str, Any]] = {}
AGENT_RUNS: Dict[str, Dict[str, Any]] = {}

async def run_alert_agent(assessment: Dict[str, Any], demo: bool = False, scenario: str = "critical") -> Dict[str, Any]:
    """Orchestrates the full LangGraph execution sequence."""
    alert_id = f"A-{uuid.uuid4().hex[:6].upper()}"
    started_at = datetime.datetime.now().isoformat()
    
    initial_state = {
        "assessment": assessment,
        "alert_id": alert_id,
        "action_card": None,
        "announcements": None,
        "steps": [],
        "demo": demo,
        "scenario": scenario
    }
    
    # Run Compiled StateGraph
    final_state = await agent_graph.ainvoke(initial_state)
    
    completed_at = datetime.datetime.now().isoformat()
    run_id = f"AR-{uuid.uuid4().hex[:6].upper()}"
    
    agent_run = {
        "id": run_id,
        "alert_id": alert_id,
        "started_at": started_at,
        "completed_at": completed_at,
        "steps": final_state["steps"]
    }
    
    alert = {
        "id": alert_id,
        "risk_assessment_id": f"{assessment.get('station_id')}-{assessment.get('platform_id')}",
        "status": "pending",
        "created_at": started_at,
        "action_card": final_state["action_card"],
        "announcements": final_state["announcements"]
    }
    
    ACTIVE_ALERTS[alert_id] = alert
    AGENT_RUNS[alert_id] = agent_run
    
    logger.info(f"Successfully ran LangGraph Agent. Alert {alert_id} created in 'pending' state.")
    return {
        "alert": alert,
        "agent_run": agent_run
    }
