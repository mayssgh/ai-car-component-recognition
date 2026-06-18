import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Locate our global telemetry history log file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))
LOG_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "inference_history.log")

# Pydantic schemas for structural data validation
class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def admin_login(credentials: AdminLoginRequest):
    """Simple, secure credential verification for the admin terminal user."""
    # Production aligned master credentials
    ADMIN_EMAIL = "admin@bakovision.ai"
    ADMIN_PASSWORD = "BakoVisionSecureRoot2026!"
    
    if credentials.email == ADMIN_EMAIL and credentials.password == ADMIN_PASSWORD:
        return {
            "status": "success",
            "message": "Admin authenticated successfully",
            "role": "admin",
            "token": "mock-secure-admin-jwt-token"
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, 
        detail="Invalid admin email or password credentials."
    )

@router.get("/stats")
async def get_admin_dashboard_stats():
    """Parses the history log file to compile real-time analytical metrics for the dashboard."""
    if not os.path.exists(LOG_PATH):
        return {
            "total_scans": 0,
            "average_latency_ms": 0.0,
            "recent_logs": []
        }
        
    try:
        with open(LOG_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        total_scans = len(lines)
        latencies = []
        recent_logs = []
        
        # Parse log details (Read from bottom up to get newest entries first)
        for line in reversed(lines):
            clean_line = line.strip()
            if not clean_line:
                continue
                
            # Collect the logs to send to the UI terminal console feed
            recent_logs.append(clean_line)
            
            # Safe parsing for latency numbers to avoid calculations crashing
            if "Latency:" in clean_line:
                try:
                    parts = clean_line.split("Latency:")
                    latency_val = parts[1].split("ms")[0].strip()
                    latencies.append(float(latency_val))
                except (IndexError, ValueError):
                    pass

        avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
        
        return {
            "total_scans": total_scans,
            "average_latency_ms": avg_latency,
            "recent_logs": recent_logs[:15]  # Streams the 15 most recent real-time system events
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to load administrative telemetry data matrix: {str(e)}"
        )