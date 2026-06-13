from pydantic import BaseModel
from typing import Optional

class FeedbackCreate(BaseModel):
    scan_id: str
    correct_component_id: Optional[str] = None
    note: Optional[str] = None