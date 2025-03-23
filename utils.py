import os
import logging
from typing import Dict, Any, Tuple

def setup_logger():
    """Configure and return a logger instance"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

def validate_env_vars():
    """Validate that all required environment variables are set"""
    required_vars = [
        "SLACK_BOT_TOKEN",
        "SLACK_APP_TOKEN",
        "OPENAI_API_KEY"
    ]
    
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_vars)}. "
            f"Please check your .env file."
        )

def extract_command(text: str) -> Tuple[str, str]:
    """
    Extract command and arguments from a message
    Returns (command, args) tuple
    """
    parts = text.strip().split(maxsplit=1)
    command = parts[0].lower() if parts else ""
    args = parts[1] if len(parts) > 1 else ""
    
    # Remove the ! prefix if present
    if command.startswith('!'):
        command = command[1:]
        
    return command, args

def format_slack_message(blocks: list = None, text: str = None) -> Dict[str, Any]:
    """Format a Slack message with blocks and fallback text"""
    message = {}
    
    if text:
        message["text"] = text
        
    if blocks:
        message["blocks"] = blocks
        
    return message
