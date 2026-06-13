from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_token
from app.core.supabase import supabase_admin

bearer_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    token = credentials.credentials
    return verify_token(token)

def get_admin_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    user = supabase_admin.auth.admin.get_user_by_id(current_user["user_id"])
    role = user.user.user_metadata.get("role", "user")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user