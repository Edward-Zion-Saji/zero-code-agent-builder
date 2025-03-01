from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.services.agents import agent_service
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new agent with drag-and-drop workflow configuration."""
    return await agent_service.create_agent(db, agent, current_user)

@router.get("/", response_model=List[AgentResponse])
async def list_agents(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List all agents owned by the current user."""
    return await agent_service.get_user_agents(db, current_user)

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: int,
    agent: AgentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update an existing agent's configuration."""
    return await agent_service.update_agent(db, agent_id, agent, current_user)

@router.post("/{agent_id}/deploy")
async def deploy_agent(
    agent_id: int,
    workspace_id: str,
    channel_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Deploy an agent to a Slack workspace and channel."""
    return await agent_service.deploy_to_slack(
        db, agent_id, workspace_id, channel_id, current_user
    )

@router.post("/{agent_id}/test")
async def test_agent(
    agent_id: int,
    test_input: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Test an agent with sample input before deployment."""
    return await agent_service.test_agent(db, agent_id, test_input, current_user)
