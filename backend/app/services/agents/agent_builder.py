from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.memory import ConversationBufferMemory
from typing import List, Dict, Any
from app.core.config import settings

class AgentBuilder:
    def __init__(self):
        self.llm_map = {
            "gpt-4": ChatOpenAI(model_name="gpt-4", temperature=0),
            "gpt-3.5-turbo": ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
        }

    async def create_agent_executor(
        self,
        workflow: Dict[str, Any],
        tools: List[Tool],
        memory: ConversationBufferMemory = None
    ) -> AgentExecutor:
        """Create a LangChain agent executor based on workflow configuration."""
        
        # Get the specified LLM or default to gpt-4
        llm = self.llm_map.get(workflow.get("llm", "gpt-4"))
        
        # Create the agent prompt from workflow configuration
        prompt = PromptTemplate(
            template=workflow.get("prompt_template", self.default_prompt_template),
            input_variables=["input", "agent_scratchpad", "chat_history"]
        )
        
        # Create the React agent
        agent = create_react_agent(llm, tools, prompt)
        
        # Create the agent executor
        return AgentExecutor.from_agent_and_tools(
            agent=agent,
            tools=tools,
            memory=memory or ConversationBufferMemory(memory_key="chat_history"),
            verbose=True
        )

    async def build_tool_from_config(self, tool_config: Dict[str, Any]) -> Tool:
        """Build a LangChain tool from configuration."""
        tool_type = tool_config.get("type")
        
        if tool_type == "mcp":
            return self._build_mcp_tool(tool_config)
        elif tool_type == "api":
            return self._build_api_tool(tool_config)
        elif tool_type == "function":
            return self._build_function_tool(tool_config)
        else:
            raise ValueError(f"Unsupported tool type: {tool_type}")

    def _build_mcp_tool(self, config: Dict[str, Any]) -> Tool:
        """Build a tool that connects to an MCP server."""
        from app.services.tools.mcp import MCPConnector
        
        connector = MCPConnector(
            server_url=config.get("server_url") or settings.MCP_SERVER_URL,
            api_key=config.get("api_key") or settings.MCP_API_KEY
        )
        
        return Tool(
            name=config["name"],
            description=config["description"],
            func=connector.execute_command,
            return_direct=config.get("return_direct", False)
        )

    def _build_api_tool(self, config: Dict[str, Any]) -> Tool:
        """Build a tool that makes API calls."""
        from app.services.tools.api import APIConnector
        
        connector = APIConnector(
            base_url=config["base_url"],
            headers=config.get("headers", {}),
            auth=config.get("auth", {})
        )
        
        return Tool(
            name=config["name"],
            description=config["description"],
            func=connector.make_request,
            return_direct=config.get("return_direct", False)
        )

    def _build_function_tool(self, config: Dict[str, Any]) -> Tool:
        """Build a tool from a Python function."""
        import importlib
        
        module_path = config["module"]
        function_name = config["function"]
        
        module = importlib.import_module(module_path)
        function = getattr(module, function_name)
        
        return Tool(
            name=config["name"],
            description=config["description"],
            func=function,
            return_direct=config.get("return_direct", False)
        )

    @property
    def default_prompt_template(self) -> str:
        return """You are a helpful AI assistant. Use the following tools to help accomplish tasks:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Previous conversation history:
{chat_history}

Question: {input}
{agent_scratchpad}"""

agent_builder = AgentBuilder()
