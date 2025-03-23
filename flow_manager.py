#!/usr/bin/env python3
"""
Flow Manager - Integrates the Flow Editor with the Slack Agent
"""
import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

class FlowManager:
    """Manages the integration between the Flow Editor and Slack Agent"""
    
    def __init__(self):
        self.config_dir = Path(__file__).parent / "config"
        self.flow_path = self.config_dir / "slack-agent-flow.json"
        self.settings_path = self.config_dir / "settings.json"
        
        # Create config directory if it doesn't exist
        if not self.config_dir.exists():
            self.config_dir.mkdir(parents=True)
    
    def load_flow(self) -> Dict[str, Any]:
        """Load the flow configuration"""
        if not self.flow_path.exists():
            return {"nodes": [], "edges": []}
        
        try:
            with open(self.flow_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading flow: {e}")
            return {"nodes": [], "edges": []}
    
    def save_flow(self, flow_data: Dict[str, Any]) -> bool:
        """Save the flow configuration"""
        try:
            with open(self.flow_path, 'w') as f:
                json.dump(flow_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving flow: {e}")
            return False
    
    def load_settings(self) -> Dict[str, Any]:
        """Load settings"""
        if not self.settings_path.exists():
            return {}
        
        try:
            with open(self.settings_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading settings: {e}")
            return {}
    
    def get_llm_config(self) -> Dict[str, Any]:
        """Extract LLM configuration from the flow"""
        flow_data = self.load_flow()
        llm_config = {
            "provider": "openai",
            "model": "gpt-4"
        }
        
        for node in flow_data.get("nodes", []):
            if node.get("type") == "llm":
                llm_config["provider"] = node.get("data", {}).get("provider", "openai")
                llm_config["model"] = node.get("data", {}).get("model", "gpt-4")
                break
        
        return llm_config
    
    def get_system_prompt(self) -> str:
        """Extract system prompt from the flow"""
        flow_data = self.load_flow()
        default_prompt = "You are a helpful assistant for Slack."
        
        for node in flow_data.get("nodes", []):
            if node.get("type") == "systemPrompt":
                return node.get("data", {}).get("prompt", default_prompt)
        
        return default_prompt
    
    def get_tools_config(self) -> List[Dict[str, Any]]:
        """Extract tools configuration from the flow"""
        flow_data = self.load_flow()
        tools = []
        
        for node in flow_data.get("nodes", []):
            if node.get("type") == "tools":
                node_tools = node.get("data", {}).get("tools", [])
                # Only include enabled tools
                tools = [tool for tool in node_tools if tool.get("enabled", False)]
                break
        
        return tools
    
    def get_rag_config(self) -> Optional[Dict[str, Any]]:
        """Extract RAG configuration from the flow"""
        flow_data = self.load_flow()
        
        for node in flow_data.get("nodes", []):
            if node.get("type") == "rag":
                return {
                    "provider": node.get("data", {}).get("provider", "pinecone"),
                    "indexName": node.get("data", {}).get("indexName", "slack-knowledge"),
                    "enabled": True
                }
        
        return None
    
    def get_pinecone_settings(self) -> Dict[str, Any]:
        """Get Pinecone settings from the settings file"""
        settings = self.load_settings()
        
        if not settings or "pineconeSettings" not in settings:
            return {
                "apiKey": os.environ.get("PINECONE_API_KEY", ""),
                "environment": os.environ.get("PINECONE_ENVIRONMENT", ""),
                "indexName": os.environ.get("PINECONE_INDEX", "slack-knowledge")
            }
        
        pinecone_settings = settings.get("pineconeSettings", {})
        
        # Use environment variables as fallback
        if not pinecone_settings.get("apiKey"):
            pinecone_settings["apiKey"] = os.environ.get("PINECONE_API_KEY", "")
        
        if not pinecone_settings.get("environment"):
            pinecone_settings["environment"] = os.environ.get("PINECONE_ENVIRONMENT", "")
        
        if not pinecone_settings.get("indexName"):
            pinecone_settings["indexName"] = os.environ.get("PINECONE_INDEX", "slack-knowledge")
        
        return pinecone_settings
    
    def is_rag_enabled(self) -> bool:
        """Check if RAG is enabled in the flow"""
        rag_config = self.get_rag_config()
        return rag_config is not None and rag_config.get("enabled", False)
    
    def get_active_llm_api_key(self) -> Optional[str]:
        """Get the active LLM API key based on the flow configuration"""
        settings = self.load_settings()
        llm_config = self.get_llm_config()
        
        if not settings or "apiKeys" not in settings:
            return os.environ.get("OPENAI_API_KEY")
        
        for api_key in settings.get("apiKeys", []):
            if api_key.get("isActive") and api_key.get("name", "").lower() == llm_config.get("provider", "").lower():
                return api_key.get("key")
        
        # Fallback to OpenAI if the selected provider doesn't have an active key
        for api_key in settings.get("apiKeys", []):
            if api_key.get("isActive") and api_key.get("name") == "OpenAI":
                return api_key.get("key")
        
        return os.environ.get("OPENAI_API_KEY")

# Example usage
if __name__ == "__main__":
    flow_manager = FlowManager()
    print("LLM Config:", flow_manager.get_llm_config())
    print("System Prompt:", flow_manager.get_system_prompt())
    print("Tools:", flow_manager.get_tools_config())
    print("RAG Config:", flow_manager.get_rag_config())
    print("Pinecone Settings:", flow_manager.get_pinecone_settings())
    print("RAG Enabled:", flow_manager.is_rag_enabled())
