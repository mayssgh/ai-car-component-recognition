from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, scan, components, history, feedback, admin, inference

app = FastAPI(
    title="AI Car Component Recognition API",
    description="Backend for AI-based car component detection and assistance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Application API Routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(scan.router,       prefix="/api/scan",       tags=["Scan"])
app.include_router(components.router, prefix="/api/components", tags=["Components"])
app.include_router(history.router,    prefix="/api/history",    tags=["History"])
app.include_router(feedback.router,   prefix="/api/feedback",   tags=["Feedback"])
app.include_router(admin.router,      prefix="/api/admin",      tags=["Admin"])
app.include_router(inference.router,  prefix="/api/inference",  tags=["Inference"])

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Car Component API is running"}