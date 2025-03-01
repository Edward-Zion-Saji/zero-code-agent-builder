from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agent Builder"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str = "sqlite:///./agent_builder.db"
    
    # Slack
    SLACK_CLIENT_ID: str = ""
    SLACK_CLIENT_SECRET: str = ""
    SLACK_SIGNING_SECRET: str = ""
    
    # MCP
    MCP_SERVER_URL: str = ""
    MCP_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
