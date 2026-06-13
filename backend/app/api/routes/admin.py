from fastapi import APIRouter, Depends
from app.api.deps import get_admin_user
from app.schemas.component import ComponentCreate, ComponentUpdate
from app.core.supabase import supabase

router = APIRouter()

@router.post("/components")
def create_component(data: ComponentCreate, admin=Depends(get_admin_user)):
    res = supabase.table("components").insert(data.dict()).execute()
    return res.data

@router.put("/components/{component_id}")
def update_component(component_id: str, data: ComponentUpdate, admin=Depends(get_admin_user)):
    res = supabase.table("components").update(data.dict(exclude_none=True)).eq("id", component_id).execute()
    return res.data

@router.delete("/components/{component_id}")
def delete_component(component_id: str, admin=Depends(get_admin_user)):
    supabase.table("components").delete().eq("id", component_id).execute()
    return {"message": "Component deleted"}