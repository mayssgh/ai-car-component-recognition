from pydantic import BaseModel
from typing import List, Optional

class ScanResponse(BaseModel):
    scan_id: str
    image_url: str
    results: List[dict]
    created_at: str