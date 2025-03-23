import logging
from typing import Dict, Callable, Any, Optional

logger = logging.getLogger(__name__)

class CommandHandler:
    """Handles command registration and execution for the Slackbot"""
    
    def __init__(self):
        self.commands: Dict[str, Dict[str, Any]] = {}
        self._register_default_commands()
    
    def _register_default_commands(self):
        """Register the default set of commands"""
        self.register_command("help", self._help_command, "Display available commands")
    
    def register_command(self, command_name: str, handler_func: Callable[[str, Dict[str, Any]], str], description: str):
        """Register a new command with the handler"""
        command_name = command_name.lower()
        self.commands[command_name] = {
            "handler": handler_func,
            "description": description
        }
        logger.info(f"Registered command: {command_name}")
    
    def handle_command(self, command: str, args: str, context: Dict[str, Any]) -> Optional[str]:
        """
        Process a command and return the response
        
        Args:
            command: The command name
            args: The arguments passed to the command
            context: Additional context (user_id, channel_id, etc.)
            
        Returns:
            Response message or None if no response
        """
        command = command.lower()
        
        if command in self.commands:
            try:
                return self.commands[command]["handler"](args, context)
            except Exception as e:
                logger.error(f"Error executing command '{command}': {e}")
                return f"Error executing command: {str(e)}"
        
        return None
    
    def _help_command(self, args: str, context: Dict[str, Any]) -> str:
        """Handler for the help command"""
        help_text = "Available commands:\n"
        
        for cmd, info in sorted(self.commands.items()):
            help_text += f"• `!{cmd}`: {info['description']}\n"
            
        return help_text
    
    def has_command(self, command: str) -> bool:
        """Check if a command exists"""
        return command.lower() in self.commands
