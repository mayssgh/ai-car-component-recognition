from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime

class ScanResult(BaseModel):
    component_id: Optional[UUID4] = None
    component_name: str
    confidence: float
    bbox: Optional[List[float]] = None

class Scan(BaseModel):
    id: Optional[UUID4] = None
    user_id: UUID4
    image_url: str
    results: List[ScanResult]
    created_at: Optional[datetime] = None