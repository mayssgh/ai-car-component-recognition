from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.queries import get_all_components, get_component_by_id

router = APIRouter()

@router.get("/")
def list_components(user=Depends(get_current_user)):
    res = get_all_components()
    return res.data

@router.get("/{component_id}")
def get_component(component_id: str, user=Depends(get_current_user)):
    res = get_component_by_id(component_id)
    return res.data