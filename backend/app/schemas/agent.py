from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class ToolConfig(BaseModel):
    type: str = Field(..., description="Type of tool (mcp, api, function)")
    name: str = Field(..., description="Name of the tool")
    description: str = Field(..., description="Description of what the tool does")
    return_direct: bool = Field(False, description="Whether to return the tool's output directly")
    config: Dict[str, Any] = Field(default_factory=dict, description="Tool-specific configuration")

class WorkflowConfig(BaseModel):
    llm: str = Field("gpt-4", description="LLM to use for the agent")
    tools: List[ToolConfig] = Field(default_factory=list, description="List of tools to use")
    prompt_template: Optional[str] = Field(None, description="Custom prompt template for the agent")
    memory_type: str = Field("conversation", description="Type of memory to use")
    max_iterations: int = Field(10, description="Maximum number of thought/action iterations")

class AgentBase(BaseModel):
    name: str = Field(..., description="Name of the agent")
    description: str = Field(..., description="Description of what the agent does")
    workflow: WorkflowConfig = Field(..., description="Agent workflow configuration")

class AgentCreate(AgentBase):
    pass

class AgentUpdate(AgentBase):
    name: Optional[str] = None
    description: Optional[str] = None
    workflow: Optional[WorkflowConfig] = None

class AgentResponse(AgentBase):
    id: int
    owner_id: int
    is_active: bool

    class Config:
        from_attributes = True
