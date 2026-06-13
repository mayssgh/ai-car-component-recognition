from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.feedback import FeedbackCreate
from app.db.queries import insert_feedback

router = APIRouter()

@router.post("/")
def submit_feedback(data: FeedbackCreate, user=Depends(get_current_user)):
    feedback = {
        "scan_id": data.scan_id,
        "user_id": user["user_id"],
        "correct_component_id": data.correct_component_id,
        "note": data.note
    }
    res = insert_feedback(feedback)
    return {"message": "Feedback submitted", "data": res.data}