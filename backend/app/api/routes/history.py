from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.queries import get_scans_by_user

router = APIRouter()

@router.get("/")
def get_history(user=Depends(get_current_user)):
    res = get_scans_by_user(user["user_id"])
    return res.data