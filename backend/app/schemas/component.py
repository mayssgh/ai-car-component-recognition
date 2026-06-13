from pydantic import BaseModel
from typing import Optional

class ComponentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    function: Optional[str] = None
    location: Optional[str] = None
    troubleshooting: Optional[str] = None
    image_url: Optional[str] = None

class ComponentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    function: Optional[str] = None
    location: Optional[str] = None
    troubleshooting: Optional[str] = None
    image_url: Optional[str] = None

class ComponentResponse(ComponentCreate):
    id: str
    created_at: str
    updated_at: str