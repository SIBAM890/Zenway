from pydantic import BaseModel
from typing import Dict, Any, Optional

class AuditLogEntry(BaseModel):
    id: str
    event_type: str
    timestamp: str
    station_id: str
    platform_id: Optional[str] = None
    data: Dict[str, Any]
