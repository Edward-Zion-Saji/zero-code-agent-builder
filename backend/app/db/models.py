from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    agents = relationship("Agent", back_populates="owner")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    workflow = Column(JSON)  # Stores the drag-and-drop workflow configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="agents")
    tools = relationship("AgentTool", back_populates="agent")
    slack_deployments = relationship("SlackDeployment", back_populates="agent")

class Tool(Base):
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    config_schema = Column(JSON)  # JSON schema for tool configuration
    icon = Column(String)  # URL or base64 of tool icon
    
    agent_tools = relationship("AgentTool", back_populates="tool")

class AgentTool(Base):
    __tablename__ = "agent_tools"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    tool_id = Column(Integer, ForeignKey("tools.id"))
    config = Column(JSON)  # Tool-specific configuration
    
    agent = relationship("Agent", back_populates="tools")
    tool = relationship("Tool", back_populates="agent_tools")

class SlackDeployment(Base):
    __tablename__ = "slack_deployments"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    workspace_id = Column(String, index=True)
    channel_id = Column(String)
    bot_token = Column(String)
    is_active = Column(Boolean, default=True)
    
    agent = relationship("Agent", back_populates="slack_deployments")
