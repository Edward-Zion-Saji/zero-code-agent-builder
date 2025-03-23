from langchain.tools import BaseTool
from langchain_core.tools import Tool
from typing import List, Dict, Any, Optional, Type, Annotated
import requests
import json
import datetime
from tools.google_calendar_tool import GoogleCalendarTool, GoogleCalendarViewTool

class WeatherTool(BaseTool):
    """Tool for getting weather information"""
    
    name: str = "weather_tool"
    description: str = "Useful for getting weather information for a specific location"
    
    def _run(self, location: str) -> str:
        """Get weather information for a location"""
        # This is a mock implementation
        # In a real application, you would use a weather API
        return f"Weather for {location}: Sunny, 75°F"
        
    async def _arun(self, location: str) -> str:
        """Get weather information for a location (async)"""
        # For simplicity, we'll just call the sync version
        return self._run(location)

class WikipediaTool(BaseTool):
    """Tool for searching Wikipedia"""
    
    name: str = "wikipedia_tool"
    description: str = "Useful for searching information on Wikipedia"
    
    def _run(self, query: str) -> str:
        """Search Wikipedia for information"""
        # This is a mock implementation
        # In a real application, you would use the Wikipedia API
        return f"Wikipedia result for '{query}': This is a mock result for demonstration purposes."
        
    async def _arun(self, query: str) -> str:
        """Search Wikipedia for information (async)"""
        # For simplicity, we'll just call the sync version
        return self._run(query)

class DateTimeTool(BaseTool):
    """Tool for getting current date and time"""
    
    name: str = "datetime_tool"
    description: str = "Useful for getting the current date and time"
    
    def _run(self, timezone: str = "UTC") -> str:
        """Get current date and time"""
        now = datetime.datetime.now()
        return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')} (Server time)"
        
    async def _arun(self, timezone: str = "UTC") -> str:
        """Get current date and time (async)"""
        # For simplicity, we'll just call the sync version
        return self._run(timezone)

def get_tools() -> List[Tool]:
    """Get a list of all available tools"""
    tools = [
        # Google Calendar Tools
        GoogleCalendarTool(),
        GoogleCalendarViewTool(),
        
        # Default tools
        Tool.from_function(
            func=WeatherTool()._run,
            name="Weather",
            description="Useful for getting weather information for a specific location. Input should be a location name."
        ),
        Tool.from_function(
            func=WikipediaTool()._run,
            name="Wikipedia",
            description="Useful for searching information on Wikipedia. Input should be a search query."
        ),
        Tool.from_function(
            func=DateTimeTool()._run,
            name="DateTime",
            description="Useful for getting the current date and time. No input required."
        )
    ]
    
    return tools
