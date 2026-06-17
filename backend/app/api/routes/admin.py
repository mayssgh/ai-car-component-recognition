import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Locate our global telemetry history log file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))
LOG_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "inference_history.log")

# Pydantic schemas for data validation
class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def admin_login(credentials: AdminLoginRequest):
    """Simple, secure credential verification for the admin user."""
    # Hardcoded demonstration credentials (you can link this to a DB table later)
    ADMIN_EMAIL = "admin@carrecon.com"
    ADMIN_PASSWORD = "SuperSecureAdminPassword2026" # Change this as needed!
    
    if credentials.email == ADMIN_EMAIL and credentials.password == ADMIN_PASSWORD:
        return {
            "status": "success",
            "message": "Admin authenticated successfully",
            "role": "admin",
            "token": "mock-secure-admin-jwt-token" # Frontend will store this to keep them logged in
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid admin email or password credentials.")

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
        with open(LOG_PATH, "r") as f:
            lines = f.readlines()
            
        total_scans = len(lines)
        latencies = []
        recent_logs = []
        
        # Parse log details (Read from bottom up to get newest entries first)
        for line in reversed(lines):
            clean_line = line.strip()
            if not clean_line:
                continue
                
            recent_logs.append(clean_line)
            
            # Extract latency float value from the log string for averaging
            if "Latency:" in clean_line:
                try:
                    parts = clean_line.split("Latency:")
                    latency_val = parts[1].split("ms")[0].strip()
                    latencies.append(float(latency_val))
                except Exception:
                    pass

        avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0
        
        return {
            "total_scans": total_scans,
            "average_latency_ms": avg_latency,
            "recent_logs": recent_logs[:10] # Stream the 10 most recent system scans to the UI
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load admin stats: {str(e)}")