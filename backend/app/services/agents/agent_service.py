from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.db.models import Agent, SlackDeployment
from app.schemas.agent import AgentCreate, AgentUpdate
from app.services.slack import slack_service
from app.services.tools import tool_service
from .agent_builder import agent_builder
from langchain.memory import ConversationBufferMemory

class AgentService:
    async def create_agent(
        self,
        db: Session,
        agent_data: AgentCreate,
        current_user: dict
    ) -> Agent:
        """Create a new agent with the specified workflow configuration."""
        # Create agent record
        agent = Agent(
            name=agent_data.name,
            description=agent_data.description,
            workflow=agent_data.workflow,
            owner_id=current_user.id
        )
        
        # Build and validate tools
        tools = []
        for tool_config in agent_data.workflow.get("tools", []):
            tool = await agent_builder.build_tool_from_config(tool_config)
            tools.append(tool)
            
        # Test agent creation
        memory = ConversationBufferMemory(memory_key="chat_history")
        executor = await agent_builder.create_agent_executor(
            workflow=agent_data.workflow,
            tools=tools,
            memory=memory
        )
        
        # If agent creation successful, save to database
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    async def get_user_agents(
        self,
        db: Session,
        current_user: dict
    ) -> List[Agent]:
        """Retrieve all agents owned by the user."""
        return db.query(Agent).filter(
            Agent.owner_id == current_user.id,
            Agent.is_active == True
        ).all()

    async def update_agent(
        self,
        db: Session,
        agent_id: int,
        agent_data: AgentUpdate,
        current_user: dict
    ) -> Optional[Agent]:
        """Update an existing agent's configuration."""
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        ).first()
        
        if not agent:
            return None
            
        # Update agent attributes
        for key, value in agent_data.dict(exclude_unset=True).items():
            setattr(agent, key, value)
            
        # Rebuild and validate tools
        tools = []
        for tool_config in agent.workflow.get("tools", []):
            tool = await agent_builder.build_tool_from_config(tool_config)
            tools.append(tool)
            
        # Test updated agent
        memory = ConversationBufferMemory(memory_key="chat_history")
        executor = await agent_builder.create_agent_executor(
            workflow=agent.workflow,
            tools=tools,
            memory=memory
        )
            
        db.commit()
        db.refresh(agent)
        return agent

    async def deploy_to_slack(
        self,
        db: Session,
        agent_id: int,
        workspace_id: str,
        channel_id: str,
        current_user: dict
    ) -> SlackDeployment:
        """Deploy an agent to a Slack workspace and channel."""
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        ).first()
        
        if not agent:
            raise ValueError("Agent not found")
            
        # Create Slack bot and get credentials
        bot_token = await slack_service.create_bot(
            workspace_id,
            channel_id,
            agent.workflow
        )
        
        # Create deployment record
        deployment = SlackDeployment(
            agent_id=agent.id,
            workspace_id=workspace_id,
            channel_id=channel_id,
            bot_token=bot_token,
            is_active=True
        )
        
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        return deployment

    async def test_agent(
        self,
        db: Session,
        agent_id: int,
        test_input: dict,
        current_user: dict
    ) -> dict:
        """Test an agent with sample input before deployment."""
        agent = db.query(Agent).filter(
            Agent.id == agent_id,
            Agent.owner_id == current_user.id
        ).first()
        
        if not agent:
            raise ValueError("Agent not found")
            
        # Build tools
        tools = []
        for tool_config in agent.workflow.get("tools", []):
            tool = await agent_builder.build_tool_from_config(tool_config)
            tools.append(tool)
            
        # Create agent executor
        memory = ConversationBufferMemory(memory_key="chat_history")
        executor = await agent_builder.create_agent_executor(
            workflow=agent.workflow,
            tools=tools,
            memory=memory
        )
        
        # Run test
        result = await executor.arun(input=test_input)
        return {"success": True, "result": result}

    async def _execute_workflow(self, workflow: dict, input_data: dict) -> dict:
        """Execute the agent's workflow with the given input."""
        # Implement workflow execution logic here
        # This would involve processing the workflow steps and tool interactions
        result = {"processed": input_data}  # Placeholder
        return result

agent_service = AgentService()
