import logging
from slack_bolt import App
from langchain_manager import LangChainManager
from command_handler import CommandHandler
from utils import extract_command, format_slack_message
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SlackHandler:
    """Handles Slack events and commands"""
    
    def __init__(self, app: App):
        self.app = app
        self.langchain_manager = LangChainManager()
        self.command_handler = CommandHandler()
        self._register_commands()
        self.register_handlers()
        
    def _register_commands(self):
        """Register custom commands with the command handler"""
        self.command_handler.register_command(
            "reset", 
            self._reset_command, 
            "Reset your conversation history with the bot"
        )
        
    def _reset_command(self, args: str, context: Dict[str, Any]) -> str:
        """Handler for the reset command"""
        conversation_key = f"{context['channel_id']}:{context['user_id']}"
        if self.langchain_manager.reset_conversation(conversation_key):
            return "Conversation has been reset."
        return "Failed to reset conversation."
        
    def register_handlers(self):
        """Register all event handlers with the Slack app"""
        # Register for direct messages (im:history scope)
        self.app.event("message")(self.handle_message)
        
        # Register for mentions (app_mentions:read scope)
        self.app.event("app_mention")(self.handle_mention)
        
        # Log the registered handlers
        logger.info("Registered event handlers: message, app_mention")
        
    def handle_message(self, body: Dict[str, Any], logger: logging.Logger):
        """Handle direct messages to the bot"""
        event = body["event"]
        
        # Skip messages from the bot itself
        if event.get("bot_id"):
            return
        
        # Only respond to direct messages
        if event.get("channel_type") != "im":
            return
            
        channel_id = event["channel"]
        user_id = event["user"]
        text = event["text"]
        
        # Create a unique key for this conversation
        conversation_key = f"{channel_id}:{user_id}"
        
        # Check if this is a command
        command, args = extract_command(text)
        
        if command and (command.startswith("!") or self.command_handler.has_command(command)):
            # Remove the ! prefix if present
            if command.startswith("!"):
                command = command[1:]
                
            # Process the command
            context = {
                "user_id": user_id,
                "channel_id": channel_id,
                "conversation_key": conversation_key
            }
            
            response = self.command_handler.handle_command(command, args, context)
            
            if response:
                self.app.client.chat_postMessage(
                    channel=channel_id,
                    text=response
                )
            return
        
        # Get the response from LangChain
        try:
            response = self.langchain_manager.generate_response(conversation_key, text)
            
            # Handle None responses
            if response is None:
                logger.warning("Agent returned None response")
                self.app.client.chat_postMessage(
                    channel=channel_id,
                    text="I'm sorry, I couldn't generate a response. Please try again."
                )
            else:
                self.app.client.chat_postMessage(
                    channel=channel_id,
                    text=response
                )
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            self.app.client.chat_postMessage(
                channel=channel_id,
                text="I'm having trouble processing your request. Please try again later."
            )
    
    def handle_mention(self, body: Dict[str, Any], say: callable):
        """Handle mentions of the bot in channels"""
        try:
            event = body["event"]
            channel_id = event["channel"]
            user_id = event["user"]
            text = event["text"]
            
            # Extract bot ID from the event
            # The bot ID is typically in the text as <@BOT_ID>
            import re
            bot_id_match = re.search(r'<@([A-Z0-9]+)>', text)
            if bot_id_match:
                bot_id = bot_id_match.group(1)
                text = text.replace(f"<@{bot_id}>", "").strip()
            else:
                # If we can't extract the bot ID, just use the text as is
                logger.warning("Could not extract bot ID from mention text")
            
            # Create a unique key for this conversation
            conversation_key = f"{channel_id}:{user_id}"
            
            # Check if this is a command
            command, args = extract_command(text)
            
            if command and (command.startswith("!") or self.command_handler.has_command(command)):
                # Remove the ! prefix if present
                if command.startswith("!"):
                    command = command[1:]
                    
                # Process the command
                context = {
                    "user_id": user_id,
                    "channel_id": channel_id,
                    "conversation_key": conversation_key
                }
                
                response = self.command_handler.handle_command(command, args, context)
                
                if response:
                    say(response)
                return
            
            # Get the response from LangChain
            try:
                response = self.langchain_manager.generate_response(conversation_key, text)
                
                # Handle None responses
                if response is None:
                    logger.warning("Agent returned None response")
                    say("I'm sorry, I couldn't generate a response. Please try again.")
                else:
                    say(response)
            except Exception as e:
                logger.error(f"Error processing mention: {e}")
                say("I'm having trouble processing your request. Please try again later.")
        except Exception as e:
            logger.error(f"Error handling mention: {e}")
            say("Sorry, I encountered an error while processing your mention.")
