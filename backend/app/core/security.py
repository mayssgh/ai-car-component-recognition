from jose import JWTError, jwt
from fastapi import HTTPException, status
from config import settings

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )