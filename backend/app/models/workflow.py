from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    nodes = Column(JSON)
    edges = Column(JSON)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    slack_integrations = relationship("SlackIntegration", back_populates="workflow")
    executions = relationship("Execution", back_populates="workflow")

class SlackIntegration(Base):
    __tablename__ = "slack_integrations"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    team_id = Column(String, index=True)
    team_name = Column(String)
    bot_token = Column(String)
    access_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="slack_integrations")

class Execution(Base):
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    trigger_type = Column(String)
    input_data = Column(JSON)
    output_data = Column(JSON, nullable=True)
    status = Column(String)  # "pending", "running", "completed", "failed"
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    execution_steps = relationship("ExecutionStep", back_populates="execution")

class ExecutionStep(Base):
    __tablename__ = "execution_steps"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("executions.id"))
    node_id = Column(String)
    node_type = Column(String)
    input_data = Column(JSON)
    output_data = Column(JSON, nullable=True)
    status = Column(String)  # "pending", "running", "completed", "failed"
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    execution = relationship("Execution", back_populates="execution_steps")
