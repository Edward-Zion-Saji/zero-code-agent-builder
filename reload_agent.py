#!/usr/bin/env python3
"""
Reload agent configuration when the flow is updated
"""
import os
import sys
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Path(__file__).parent / "agent_reload.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("agent_reload")

def reload_agent():
    """Reload the agent configuration"""
    try:
        # Import the LangChainManager
        sys.path.append(str(Path(__file__).parent))
        from langchain_manager import LangChainManager
        
        # Create a new instance of LangChainManager to reload configuration
        manager = LangChainManager()
        
        # Reload the configuration
        success = manager.reload_configuration()
        
        if success:
            logger.info("Successfully reloaded agent configuration")
            return True
        else:
            logger.error("Failed to reload agent configuration")
            return False
            
    except Exception as e:
        logger.error(f"Error reloading agent configuration: {e}")
        return False

if __name__ == "__main__":
    reload_agent()
