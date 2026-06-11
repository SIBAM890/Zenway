from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ActionCard(BaseModel):
    alert_id: str
    summary: str
    actions: List[str] = Field(..., max_items=5)
    time_window: str
    confidence: float

class Announcement(BaseModel):
    alert_id: str
    language: str  # English, Hindi, Tamil, Telugu, Odia, Bengali
    text: str
    audio_url: Optional[str] = None

class Alert(BaseModel):
    id: str
    risk_assessment_id: str
    status: str  # pending, confirmed, broadcasted
    created_at: str
    action_card: Optional[ActionCard] = None
    announcements: Optional[List[Announcement]] = None

class Operator(BaseModel):
    id: str
    name: str
    station_id: str

class AgentRun(BaseModel):
    id: str
    alert_id: str
    started_at: str
    completed_at: str
    steps: List[Dict[str, Any]]
