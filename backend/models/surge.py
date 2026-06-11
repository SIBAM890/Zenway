from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Platform(BaseModel):
    id: str
    name: str
    max_capacity: int
    typical_load_peak: int
    typical_load_offpeak: int

class Station(BaseModel):
    id: str
    name: str
    code: str
    platforms: List[Platform]

class CrowdRiskAssessment(BaseModel):
    station_id: str
    platform_id: str
    score: float
    level: str  # Normal, Elevated, Critical
    time_to_critical: Optional[int] = None
    contributing_factors: Dict[str, Any]
    calculated_at: str
