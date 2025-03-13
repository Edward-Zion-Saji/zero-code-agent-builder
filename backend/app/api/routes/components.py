from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter()

# Available node types and their configurations
NODE_TYPES = {
    "trigger": {
        "types": ["message", "mention", "scheduled"],
        "properties": ["triggerType", "channelType", "pattern", "schedule"]
    },
    "llm": {
        "types": ["chat", "completion", "prompt_template"],
        "properties": ["modelType", "temperature", "maxTokens", "systemPrompt", "template", "variables"]
    },
    "tool": {
        "types": ["web_search", "database", "api_call", "file_operation"],
        "properties": ["toolType", "parameters"]
    },
    "logic": {
        "types": ["condition", "code", "loop", "switch"],
        "properties": ["condition", "code", "language", "iterations", "cases"]
    },
    "output": {
        "types": ["message", "file", "action", "reaction"],
        "properties": ["messageType", "channel", "text", "blocks", "filePath", "actionType"]
    }
}

@router.get("/node-types")
def get_node_types() -> Dict[str, Any]:
    """Get all available node types and their configurations"""
    return NODE_TYPES

@router.get("/llm-models")
def get_llm_models() -> List[Dict[str, Any]]:
    """Get available LLM models"""
    models = [
        {"id": "gpt-4", "name": "GPT-4", "provider": "OpenAI", "contextWindow": 8192},
        {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "OpenAI", "contextWindow": 4096},
        {"id": "claude-2", "name": "Claude 2", "provider": "Anthropic", "contextWindow": 100000},
        {"id": "gemini-pro", "name": "Gemini Pro", "provider": "Google", "contextWindow": 32768},
    ]
    return models

@router.get("/tool-types")
def get_tool_types() -> List[Dict[str, Any]]:
    """Get available tool types"""
    tools = [
        {
            "id": "web_search",
            "name": "Web Search",
            "description": "Search the web for information",
            "parameters": [
                {"name": "query", "type": "string", "required": True}
            ]
        },
        {
            "id": "database",
            "name": "Database Query",
            "description": "Query a database",
            "parameters": [
                {"name": "query", "type": "string", "required": True},
                {"name": "database", "type": "string", "required": False}
            ]
        },
        {
            "id": "api_call",
            "name": "API Call",
            "description": "Make an API request",
            "parameters": [
                {"name": "url", "type": "string", "required": True},
                {"name": "method", "type": "string", "required": True},
                {"name": "headers", "type": "object", "required": False},
                {"name": "body", "type": "object", "required": False}
            ]
        },
        {
            "id": "file_operation",
            "name": "File Operation",
            "description": "Read or write to a file",
            "parameters": [
                {"name": "operation", "type": "string", "required": True},
                {"name": "path", "type": "string", "required": True},
                {"name": "content", "type": "string", "required": False}
            ]
        }
    ]
    return tools
