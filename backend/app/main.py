from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import agent_router, tool_router, slack_router, auth_router

app = FastAPI(
    title="Agent Builder API",
    description="Backend API for building and deploying custom agents",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(agent_router, prefix="/api/agents", tags=["agents"])
app.include_router(tool_router, prefix="/api/tools", tags=["tools"])
app.include_router(slack_router, prefix="/api/slack", tags=["slack"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
