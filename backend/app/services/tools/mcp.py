import aiohttp
from typing import Dict, Any
from app.core.config import settings

class MCPConnector:
    def __init__(self, server_url: str, api_key: str):
        self.server_url = server_url
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def execute_command(self, command: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a command on the MCP server."""
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.post(
                f"{self.server_url}/execute",
                json=command
            ) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise ValueError(f"MCP command failed: {error_data}")
                
                return await response.json()

    async def get_capabilities(self) -> Dict[str, Any]:
        """Get the capabilities of the MCP server."""
        async with aiohttp.ClientSession(headers=self.headers) as session:
            async with session.get(
                f"{self.server_url}/capabilities"
            ) as response:
                if response.status != 200:
                    error_data = await response.json()
                    raise ValueError(f"Failed to get capabilities: {error_data}")
                
                return await response.json()

    async def validate_command(self, command: Dict[str, Any]) -> bool:
        """Validate if a command is supported by the MCP server."""
        capabilities = await self.get_capabilities()
        
        command_type = command.get("type")
        if command_type not in capabilities["supported_commands"]:
            return False
        
        # Validate command parameters against capability schema
        command_schema = capabilities["command_schemas"].get(command_type)
        if not command_schema:
            return False
            
        # Basic schema validation
        required_params = command_schema.get("required_parameters", [])
        for param in required_params:
            if param not in command.get("parameters", {}):
                return False
                
        return True
