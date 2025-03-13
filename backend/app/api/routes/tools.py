from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
import requests
import json

router = APIRouter()

@router.get("/connectors")
def get_tool_connectors() -> List[Dict[str, Any]]:
    """Get available tool connectors"""
    connectors = [
        {
            "id": "google_search",
            "name": "Google Search",
            "description": "Search the web using Google",
            "auth_type": "api_key",
            "auth_config": {
                "api_key_name": "GOOGLE_API_KEY",
                "engine_id_name": "GOOGLE_CSE_ID"
            }
        },
        {
            "id": "weather_api",
            "name": "Weather API",
            "description": "Get weather information",
            "auth_type": "api_key",
            "auth_config": {
                "api_key_name": "WEATHER_API_KEY"
            }
        },
        {
            "id": "notion",
            "name": "Notion",
            "description": "Interact with Notion databases and pages",
            "auth_type": "oauth",
            "auth_config": {
                "client_id_name": "NOTION_CLIENT_ID",
                "client_secret_name": "NOTION_CLIENT_SECRET"
            }
        },
        {
            "id": "github",
            "name": "GitHub",
            "description": "Interact with GitHub repositories",
            "auth_type": "oauth",
            "auth_config": {
                "client_id_name": "GITHUB_CLIENT_ID",
                "client_secret_name": "GITHUB_CLIENT_SECRET"
            }
        }
    ]
    return connectors

@router.post("/web-search")
def web_search(query: Dict[str, str]) -> Dict[str, Any]:
    """Perform a web search"""
    search_query = query.get("query")
    if not search_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter is required"
        )
    
    # In a real implementation, this would use a proper search API
    # This is a mock response for demonstration
    results = [
        {
            "title": f"Result 1 for {search_query}",
            "link": f"https://example.com/result1?q={search_query}",
            "snippet": f"This is a sample result for the query '{search_query}'."
        },
        {
            "title": f"Result 2 for {search_query}",
            "link": f"https://example.com/result2?q={search_query}",
            "snippet": f"Another sample result for the query '{search_query}'."
        }
    ]
    
    return {"results": results}

@router.post("/api-request")
async def api_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Make an API request to an external service"""
    url = request_data.get("url")
    method = request_data.get("method", "GET")
    headers = request_data.get("headers", {})
    body = request_data.get("body")
    
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is required"
        )
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=body)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=body)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported method: {method}"
            )
        
        # Try to parse JSON response
        try:
            response_data = response.json()
        except json.JSONDecodeError:
            response_data = {"text": response.text}
        
        return {
            "status_code": response.status_code,
            "headers": dict(response.headers),
            "data": response_data
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making API request: {str(e)}"
        )
