from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import json
from app.models.database import get_db
from app.models.workflow import SlackIntegration as SlackIntegrationModel
from app.schemas.workflow import SlackIntegration, SlackIntegrationCreate
from app.services.slack_service import SlackService
from app.api.dependencies import verify_slack_signature
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
slack_service = SlackService()

@router.get("/auth")
def slack_auth():
    """Get Slack OAuth URL for authorization"""
    client_id = os.getenv("SLACK_CLIENT_ID")
    redirect_uri = os.getenv("SLACK_REDIRECT_URI")
    scopes = "channels:history,channels:read,chat:write,commands,users:read,app_mentions:read,im:history,im:write"
    
    auth_url = f"https://slack.com/oauth/v2/authorize?client_id={client_id}&scope={scopes}&redirect_uri={redirect_uri}"
    return {"auth_url": auth_url}

@router.get("/oauth-callback")
async def slack_oauth_callback(code: str, db: Session = Depends(get_db)):
    """Handle Slack OAuth callback"""
    try:
        # Exchange code for tokens
        oauth_response = await slack_service.exchange_code_for_token(code)
        
        if not oauth_response.get("ok", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slack OAuth failed: {oauth_response.get('error')}"
            )
        
        # Extract team info and tokens
        team_id = oauth_response.get("team", {}).get("id")
        team_name = oauth_response.get("team", {}).get("name")
        bot_token = oauth_response.get("access_token")
        
        # Check if this team already exists
        existing_integration = db.query(SlackIntegrationModel).filter(
            SlackIntegrationModel.team_id == team_id
        ).first()
        
        if existing_integration:
            # Update existing integration
            existing_integration.team_name = team_name
            existing_integration.bot_token = bot_token
            db.commit()
            db.refresh(existing_integration)
            return {"status": "updated", "team_id": team_id, "team_name": team_name}
        
        # Create new integration
        new_integration = SlackIntegrationModel(
            team_id=team_id,
            team_name=team_name,
            bot_token=bot_token
        )
        db.add(new_integration)
        db.commit()
        db.refresh(new_integration)
        
        return {"status": "created", "team_id": team_id, "team_name": team_name}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during OAuth: {str(e)}"
        )

@router.post("/integrations")
def create_slack_integration(integration: SlackIntegrationCreate, db: Session = Depends(get_db)):
    """Create a new Slack integration for a workflow"""
    db_integration = SlackIntegrationModel(**integration.dict())
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    return db_integration

@router.get("/integrations")
def get_slack_integrations(db: Session = Depends(get_db)):
    """Get all Slack integrations"""
    integrations = db.query(SlackIntegrationModel).all()
    return integrations

@router.get("/integrations/{team_id}")
def get_slack_integration(team_id: str, db: Session = Depends(get_db)):
    """Get Slack integration by team ID"""
    integration = db.query(SlackIntegrationModel).filter(
        SlackIntegrationModel.team_id == team_id
    ).first()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slack integration not found"
        )
    
    return integration

@router.post("/events")
async def slack_events(
    request: Request, 
    db: Session = Depends(get_db),
    verified: bool = Depends(verify_slack_signature)
):
    """Handle Slack events (messages, mentions, etc.)"""
    payload = await request.json()
    
    # Handle Slack URL verification challenge
    if payload.get("type") == "url_verification":
        return {"challenge": payload.get("challenge")}
    
    # Handle actual events
    event = payload.get("event", {})
    event_type = event.get("type")
    
    if event_type == "message":
        # Skip messages from bots to prevent loops
        if event.get("bot_id") or event.get("subtype") == "bot_message":
            return {"status": "ignored_bot_message"}
        
        # Process message event
        return await slack_service.process_message_event(event, db)
    
    elif event_type == "app_mention":
        # Process mention event
        return await slack_service.process_mention_event(event, db)
    
    # Default response for unhandled events
    return {"status": "received"}

@router.post("/interactive")
async def slack_interactive(
    request: Request, 
    db: Session = Depends(get_db),
    verified: bool = Depends(verify_slack_signature)
):
    """Handle Slack interactive components (buttons, menus, etc.)"""
    form_data = await request.form()
    payload = json.loads(form_data.get("payload", "{}"))
    
    action_type = payload.get("type")
    
    if action_type == "block_actions":
        # Handle block actions (buttons, dropdowns, etc.)
        actions = payload.get("actions", [])
        for action in actions:
            action_id = action.get("action_id")
            # Process the action based on its ID
            await slack_service.process_interactive_action(action_id, action, payload, db)
    
    elif action_type == "view_submission":
        # Handle modal submissions
        view = payload.get("view", {})
        await slack_service.process_view_submission(view, payload, db)
    
    # Always respond quickly to interactive requests
    return {"status": "processing"}
