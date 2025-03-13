from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Node schemas
class NodeBase(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class EdgeBase(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

# Workflow schemas
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkflowCreate(WorkflowBase):
    nodes: List[NodeBase]
    edges: List[EdgeBase]

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[List[NodeBase]] = None
    edges: Optional[List[EdgeBase]] = None
    is_active: Optional[bool] = None

class WorkflowInDB(WorkflowBase):
    id: int
    nodes: List[NodeBase]
    edges: List[EdgeBase]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Workflow(WorkflowInDB):
    pass

# Slack integration schemas
class SlackIntegrationBase(BaseModel):
    team_id: str
    team_name: str
    bot_token: str
    access_token: Optional[str] = None

class SlackIntegrationCreate(SlackIntegrationBase):
    workflow_id: int

class SlackIntegrationUpdate(BaseModel):
    team_name: Optional[str] = None
    bot_token: Optional[str] = None
    access_token: Optional[str] = None
    is_active: Optional[bool] = None

class SlackIntegrationInDB(SlackIntegrationBase):
    id: int
    workflow_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SlackIntegration(SlackIntegrationInDB):
    pass

# Execution schemas
class ExecutionBase(BaseModel):
    workflow_id: int
    trigger_type: str
    input_data: Dict[str, Any]

class ExecutionCreate(ExecutionBase):
    pass

class ExecutionUpdate(BaseModel):
    output_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None

class ExecutionInDB(ExecutionBase):
    id: int
    output_data: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Execution(ExecutionInDB):
    pass

# Execution step schemas
class ExecutionStepBase(BaseModel):
    execution_id: int
    node_id: str
    node_type: str
    input_data: Dict[str, Any]

class ExecutionStepCreate(ExecutionStepBase):
    pass

class ExecutionStepUpdate(BaseModel):
    output_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    completed_at: Optional[datetime] = None

class ExecutionStepInDB(ExecutionStepBase):
    id: int
    output_data: Optional[Dict[str, Any]] = None
    status: str
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ExecutionStep(ExecutionStepInDB):
    pass
