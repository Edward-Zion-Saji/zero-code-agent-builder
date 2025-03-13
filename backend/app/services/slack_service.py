import os
import json
from typing import Dict, Any, Optional, List
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import aiohttp
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

class SlackService:
    """Service for interacting with the Slack API"""
    
    def __init__(self):
        self.client_id = os.getenv("SLACK_CLIENT_ID")
        self.client_secret = os.getenv("SLACK_CLIENT_SECRET")
        self.redirect_uri = os.getenv("SLACK_REDIRECT_URI")
    
    def get_client(self, token: str) -> WebClient:
        """Get a Slack WebClient with the provided token"""
        return WebClient(token=token)
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange an OAuth code for access tokens"""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://slack.com/api/oauth.v2.access",
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri
                }
            ) as response:
                return await response.json()
    
    async def process_message_event(self, event: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Process a message event from Slack"""
        # Extract relevant information from the event
        channel = event.get("channel")
        user = event.get("user")
        text = event.get("text", "")
        ts = event.get("ts")
        
        # Find active workflows with message triggers
        from app.models.workflow import Workflow, SlackIntegration
        
        # Get the team ID from the event
        team_id = event.get("team")
        
        # Get the team's integration
        integration = db.query(SlackIntegration).filter(
            SlackIntegration.team_id == team_id
        ).first()
        
        if not integration:
            return {"error": "No integration found for this team"}
        
        # Find workflows with message triggers for this team
        workflows = db.query(Workflow).filter(
            Workflow.slack_integration_id == integration.id,
            Workflow.is_active == True,
            Workflow.trigger_type == "message"
        ).all()
        
        if not workflows:
            return {"status": "no_matching_workflows"}
        
        # Create a Slack client with the team's token
        client = self.get_client(integration.bot_token)
        
        # Execute each matching workflow
        for workflow in workflows:
            try:
                # Create the workflow input data
                input_data = {
                    "message": text,
                    "user": user,
                    "channel": channel,
                    "ts": ts,
                    "team_id": team_id
                }
                
                # Execute the workflow (this would call your workflow engine)
                # For now, we'll just mock this since we don't have the actual workflow engine implementation
                # In a real implementation, you would call your workflow engine here
                # from app.services.workflow_engine import WorkflowEngine
                # engine = WorkflowEngine()
                # result = await engine.execute_workflow(workflow.id, input_data, db)
                
                # Mock response for testing
                result = {
                    "response": f"I processed your message: '{text}' using workflow '{workflow.name}'"
                }
                
                # Send the response back to Slack if there is one
                if result and result.get("response"):
                    try:
                        client.chat_postMessage(
                            channel=channel,
                            text=result.get("response"),
                            thread_ts=ts
                        )
                    except SlackApiError as e:
                        print(f"Error sending message: {e.response['error']}")
            except Exception as e:
                print(f"Error executing workflow {workflow.id}: {str(e)}")
                # Optionally send error message to Slack
        
        return {"status": "processed"}
    
    async def process_mention_event(self, event: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Process an app_mention event from Slack"""
        # Extract relevant information from the event
        channel = event.get("channel")
        user = event.get("user")
        text = event.get("text", "")
        ts = event.get("ts")
        
        # Find active workflows with mention triggers
        from app.models.workflow import Workflow, SlackIntegration
        
        # Get the team ID from the event
        team_id = event.get("team")
        
        # Get the team's integration
        integration = db.query(SlackIntegration).filter(
            SlackIntegration.team_id == team_id
        ).first()
        
        if not integration:
            return {"error": "No integration found for this team"}
        
        # Find workflows with mention triggers for this team
        workflows = db.query(Workflow).filter(
            Workflow.slack_integration_id == integration.id,
            Workflow.is_active == True,
            Workflow.trigger_type == "mention"
        ).all()
        
        if not workflows:
            return {"status": "no_matching_workflows"}
        
        # Create a Slack client with the team's token
        client = self.get_client(integration.bot_token)
        
        # Execute each matching workflow
        for workflow in workflows:
            try:
                # Create the workflow input data
                input_data = {
                    "message": text,
                    "user": user,
                    "channel": channel,
                    "ts": ts,
                    "team_id": team_id
                }
                
                # Mock response for testing
                result = {
                    "response": f"I noticed you mentioned me with: '{text}' using workflow '{workflow.name}'"
                }
                
                # Send the response back to Slack if there is one
                if result and result.get("response"):
                    try:
                        client.chat_postMessage(
                            channel=channel,
                            text=result.get("response"),
                            thread_ts=ts
                        )
                    except SlackApiError as e:
                        print(f"Error sending message: {e.response['error']}")
            except Exception as e:
                print(f"Error executing workflow {workflow.id}: {str(e)}")
        
        return {"status": "processed"}
    
    async def process_interactive_action(self, action_id: str, action: Dict[str, Any], payload: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Process an interactive action from Slack"""
        # Extract relevant information from the payload
        team_id = payload.get("team", {}).get("id")
        channel = payload.get("channel", {}).get("id")
        user = payload.get("user", {}).get("id")
        
        # Get the team's integration
        from app.models.workflow import SlackIntegration
        integration = db.query(SlackIntegration).filter(
            SlackIntegration.team_id == team_id
        ).first()
        
        if not integration:
            return {"error": "No integration found for this team"}
        
        # Create a Slack client with the team's token
        client = self.get_client(integration.bot_token)
        
        # Process the action based on its ID
        # This is where you would implement your action handling logic
        # For now, we'll just send a confirmation message
        try:
            client.chat_postMessage(
                channel=channel,
                text=f"You clicked the button with action ID: {action_id}",
                user=user
            )
        except SlackApiError as e:
            print(f"Error sending message: {e.response['error']}")
        
        return {"status": "processed"}
    
    async def process_view_submission(self, view: Dict[str, Any], payload: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Process a view submission from Slack"""
        # Extract relevant information from the payload
        team_id = payload.get("team", {}).get("id")
        user = payload.get("user", {}).get("id")
        
        # Get the team's integration
        from app.models.workflow import SlackIntegration
        integration = db.query(SlackIntegration).filter(
            SlackIntegration.team_id == team_id
        ).first()
        
        if not integration:
            return {"error": "No integration found for this team"}
        
        # Create a Slack client with the team's token
        client = self.get_client(integration.bot_token)
        
        # Process the view submission
        # This is where you would implement your form processing logic
        # For now, we'll just send a confirmation message to the user
        try:
            client.chat_postMessage(
                channel=user,
                text=f"Thanks for submitting the form!"
            )
        except SlackApiError as e:
            print(f"Error sending message: {e.response['error']}")
        
        return {"status": "processed"}
    
    def send_message(self, token: str, channel: str, text: str, thread_ts: Optional[str] = None) -> Dict[str, Any]:
        """Send a message to a Slack channel"""
        client = self.get_client(token)
        try:
            response = client.chat_postMessage(
                channel=channel,
                text=text,
                thread_ts=thread_ts
            )
            return {"status": "sent", "ts": response.get("ts")}
        except SlackApiError as e:
            return {"status": "error", "error": e.response["error"]}
    
    def send_blocks(self, token: str, channel: str, blocks: List[Dict[str, Any]], text: str = "", thread_ts: Optional[str] = None) -> Dict[str, Any]:
        """Send a message with blocks to a Slack channel"""
        client = self.get_client(token)
        try:
            response = client.chat_postMessage(
                channel=channel,
                blocks=blocks,
                text=text,  # Fallback text for notifications
                thread_ts=thread_ts
            )
            return {"status": "sent", "ts": response.get("ts")}
        except SlackApiError as e:
            return {"status": "error", "error": e.response["error"]}
