from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.api.deps import get_current_user
from app.services.image_service import validate_image
from app.services.ai_service import run_pipeline
from app.db.queries import insert_scan
from app.core.supabase import supabase
import uuid

router = APIRouter()

@router.post("/")
async def scan_image(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    contents = await file.read()

    # Validate image quality
    is_valid, error = validate_image(contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Upload image to Supabase Storage
    file_path = f"scans/{user['user_id']}/{uuid.uuid4()}.jpg"
    supabase.storage.from_("images").upload(file_path, contents)
    image_url = supabase.storage.from_("images").get_public_url(file_path)

    # Run AI pipeline (Khadija fills this)
    results = run_pipeline(contents)

    # Save scan to DB
    scan_data = {
        "user_id": user["user_id"],
        "image_url": image_url,
        "results": results
    }
    res = insert_scan(scan_data)

    return {"scan_id": res.data[0]["id"], "image_url": image_url, "results": results}