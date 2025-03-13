from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import workflows, slack, components, tools, executions, rag
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Slack Agent Builder API",
    description="API for building and deploying no-code agents to Slack",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(workflows.router, prefix="/api/v1/workflows", tags=["workflows"])
app.include_router(slack.router, prefix="/api/v1/slack", tags=["slack"])
app.include_router(components.router, prefix="/api/v1/components", tags=["components"])
app.include_router(tools.router, prefix="/api/v1/tools", tags=["tools"])
app.include_router(executions.router, prefix="/api/v1/executions", tags=["executions"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["rag"])

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "0.1.0"}

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Welcome to the Slack Agent Builder API",
        "docs": "/docs",
        "version": "0.1.0"
    }
