from langchain.agents import Tool
from langchain.tools import BaseTool
from typing import List

# Import your custom tools
from .google_calendar_tool import GoogleCalendarTool, GoogleCalendarViewTool

def get_tools() -> List[BaseTool]:
    """
    Returns a list of tools available to the agent.
    Add your custom tools here.
    """
    tools = [
        GoogleCalendarTool(),
        GoogleCalendarViewTool(),
        # Add other tools here
    ]
    
    return tools
