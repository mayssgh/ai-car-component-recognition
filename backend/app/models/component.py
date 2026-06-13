from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class Component(BaseModel):
    id: Optional[UUID4] = None
    name: str
    description: Optional[str] = None
    function: Optional[str] = None
    location: Optional[str] = None
    troubleshooting: Optional[str] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None