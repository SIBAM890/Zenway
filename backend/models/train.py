from pydantic import BaseModel
from typing import Dict, Optional

class Train(BaseModel):
    id: str
    number: str
    name: str
    scheduled_arrival: str  # Format: "HH:MM"
    current_delay_mins: int
    avg_passengers: int
    class_breakdown: Dict[str, int]

class DelayEvent(BaseModel):
    train_id: str
    station_id: str
    platform_id: str
    delay_mins: int
    detected_at: str  # ISO Timestamp
