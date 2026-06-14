from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.api.deps import get_current_user
from app.services.image_service import validate_image
from app.services.ai_service import run_pipeline
from app.services.component_service import enrich_results_with_info
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

    is_valid, error = validate_image(contents)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    file_path = f"scans/{user['user_id']}/{uuid.uuid4()}.jpg"
    try:
        supabase.storage.from_("images").upload(file_path, contents)
        image_url = supabase.storage.from_("images").get_public_url(file_path)
    except Exception as e:
        image_url = ""
        print(f"Storage error: {e}")

    results = run_pipeline(contents)
    enriched_results = enrich_results_with_info(results)

    scan_data = {
        "user_id": user["user_id"],
        "image_url": image_url,
        "results": enriched_results
    }
    res = insert_scan(scan_data)

    return {
        "scan_id": res.data[0]["id"],
        "image_url": image_url,
        "results": enriched_results
    }
