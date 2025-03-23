from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain, LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate, MessagesPlaceholder, HumanMessagePromptTemplate
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain.agents import AgentExecutor, AgentType, create_tool_calling_agent
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain.agents.output_parsers import OpenAIFunctionsAgentOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_tools import get_tools
import os
import logging
from flow_manager import FlowManager
from pinecone_manager import PineconeManager

class LangChainManager:
    """Manages LangChain components and conversation contexts"""
    
    def __init__(self):
        # Initialize Flow Manager
        self.flow_manager = FlowManager()
        
        # Initialize Pinecone Manager if RAG is enabled
        self.pinecone_manager = None
        if self.flow_manager.is_rag_enabled():
            self.pinecone_manager = PineconeManager()
        
        # Get LLM configuration from Flow Manager
        llm_config = self.flow_manager.get_llm_config()
        
        # Initialize the language model based on flow configuration
        self._initialize_llm(llm_config)
        
        # Create the conversation template using system prompt from Flow Manager
        system_prompt = self.flow_manager.get_system_prompt()
        self.template = f"""
        {system_prompt}
        
        Current conversation:
        {{history}}
        Human: {{input}}
        AI Assistant:
        """
        
        self.prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=self.template
        )
        
        # Initialize tools based on flow configuration
        self.tools = self._get_configured_tools()
        
        # Store conversation contexts for different users/channels
        self.user_conversations = {}
        self.user_agents = {}
    
    def _initialize_llm(self, llm_config):
        """Initialize the LLM based on the flow configuration"""
        provider = llm_config.get("provider", "openai").lower()
        model = llm_config.get("model", "gpt-4")
        
        if provider == "openai":
            self.llm = ChatOpenAI(
                temperature=0.7,
                model_name=model,
            )
        elif provider == "groq":
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                temperature=0.7,
                model_name=model,
                api_key=os.environ.get("GROQ_API_KEY")
            )
        elif provider == "hyperbolic":
            from langchain_community.chat_models import ChatHyperbolic
            self.llm = ChatHyperbolic(
                temperature=0.7,
                model_name=model,
                api_key=os.environ.get("HYPERBOLIC_API_KEY")
            )
        else:
            # Default to OpenAI if provider not recognized
            self.llm = ChatOpenAI(
                temperature=0.7,
                model_name="gpt-4",
            )
    
    def _get_configured_tools(self):
        """Get tools based on flow configuration"""
        all_tools = get_tools()
        configured_tools = self.flow_manager.get_tools_config()
        
        # Debug logging
        logging.info(f"Available tools: {[tool.name for tool in all_tools]}")
        logging.info(f"Configured tools: {configured_tools}")
        
        # If RAG is enabled, add the RAG tool
        if self.flow_manager.is_rag_enabled() and self.pinecone_manager and self.pinecone_manager.is_initialized():
            from langchain.tools.retriever import create_retriever_tool
            
            # Create a retriever from Pinecone
            retriever = self.pinecone_manager.create_langchain_retriever()
            
            if retriever:
                # Create a retriever tool with a more descriptive name and instructions
                rag_tool = create_retriever_tool(
                    retriever,
                    name="knowledge_base_search",
                    description="""
                    Search the knowledge base for information about specific topics, concepts, or questions.
                    This tool is useful when you need to retrieve specific information that might be stored in the knowledge base.
                    Use this tool whenever a user asks about information that might be in documents, especially for questions about:
                    - Technical concepts, frameworks, or libraries
                    - Company-specific information or documentation
                    - Historical data or facts that might be stored in the knowledge base
                    """
                )
                
                # Always add the RAG tool, regardless of configured tools
                all_tools.append(rag_tool)
                logging.info("Added RAG tool to the agent's toolset")
        
        # If no tools configured, return all tools
        if not configured_tools:
            return all_tools
        
        # Extract tool IDs from the configured tools
        configured_tool_ids = [tool.get("id", "").lower() for tool in configured_tools]
        logging.info(f"Configured tool IDs: {configured_tool_ids}")
        
        # Filter tools based on configuration, but always include the RAG tool if it exists
        filtered_tools = []
        for tool in all_tools:
            tool_name_lower = tool.name.lower()
            logging.info(f"Checking tool: {tool.name} (lower: {tool_name_lower})")
            
            # Check if the tool name or a normalized version of it matches any configured tool ID
            if (tool_name_lower in configured_tool_ids or 
                tool.name == "knowledge_base_search" or
                any(tool_id in tool_name_lower or tool_name_lower in tool_id for tool_id in configured_tool_ids)):
                filtered_tools.append(tool)
                logging.info(f"Added tool: {tool.name}")
            else:
                logging.info(f"Skipped tool: {tool.name}")
        
        logging.info(f"Final filtered tools: {[tool.name for tool in filtered_tools]}")
        return filtered_tools
    
    def get_conversation(self, conversation_key):
        """Get or create a conversation chain for a specific user/channel"""
        if conversation_key not in self.user_conversations:
            self.user_conversations[conversation_key] = ConversationChain(
                llm=self.llm,
                prompt=self.prompt,
                memory=ConversationBufferMemory(return_messages=True),
                verbose=True
            )
        
        return self.user_conversations[conversation_key]
    
    def get_agent(self, conversation_key):
        """Get or create an agent for a specific user/channel"""
        if conversation_key not in self.user_agents:
            try:
                # Create a memory for the agent
                memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
                
                # Get the system prompt
                system_prompt = self.flow_manager.get_system_prompt()
                
                # Create a prompt for the agent with system message
                prompt = ChatPromptTemplate.from_messages([
                    SystemMessage(content=system_prompt),
                    MessagesPlaceholder(variable_name="chat_history"),
                    HumanMessagePromptTemplate.from_template("{input}"),
                    MessagesPlaceholder(variable_name="agent_scratchpad")
                ])
                
                # Create the agent using the newer tool_calling_agent approach
                from langchain.agents import create_tool_calling_agent
                
                # Create the agent
                agent = create_tool_calling_agent(
                    llm=self.llm,
                    tools=self.tools,
                    prompt=prompt
                )
                
                # Create the agent executor
                self.user_agents[conversation_key] = AgentExecutor.from_agent_and_tools(
                    agent=agent,
                    tools=self.tools,
                    memory=memory,
                    verbose=True,
                    handle_parsing_errors=True,
                    max_iterations=3
                )
                
                logging.info(f"Successfully created agent for {conversation_key} with {len(self.tools)} tools")
            except Exception as e:
                logging.error(f"Error creating agent: {e}")
                # Fall back to a simple conversation chain if agent creation fails
                return self.get_conversation(conversation_key)
        
        return self.user_agents[conversation_key]
    
    def generate_response(self, conversation_key, text):
        """Generate a response using the appropriate conversation chain"""
        # Check if the query might need tools
        use_tools = self._might_need_tools(text)
        
        # Check if the query might need RAG
        use_rag = self._might_need_rag(text)
        
        logging.info(f"Using {'RAG' if use_rag else 'standard conversation'} for query: '{text}'")
        
        # If RAG is needed and available, use it directly
        if use_rag and self.pinecone_manager and self.pinecone_manager.is_initialized():
            try:
                # Query the knowledge base
                results = self.pinecone_manager.query(text, top_k=3)
                
                if results and len(results) > 0:
                    # Format the context from the knowledge base
                    context = "\n\n".join([
                        f"Source: {result.get('metadata', {}).get('source', 'Unknown')}\n{result.get('text', '')}" 
                        for result in results
                    ])
                    
                    # Create a prompt with the context
                    rag_prompt = f"""
                    You are a helpful assistant for Slack. 
                    
                    Use the following information to answer the user's question:
                    {context}
                    
                    User question: {text}
                    
                    If the information provided doesn't fully answer the user's question, acknowledge that and provide what you can based on the given information.
                    """
                    
                    # Get a direct response from the LLM with the context
                    response = self.llm.invoke(rag_prompt)
                    return response.content
            except Exception as e:
                logging.error(f"Error using RAG: {e}")
                # Fall back to standard conversation if RAG fails
        
        # Try to use the agent if tools or RAG are needed
        try:
            if use_tools or use_rag:
                agent = self.get_agent(conversation_key)
                
                # Capture stdout to get the full tool output
                import io
                import sys
                from contextlib import redirect_stdout
                
                # Use a StringIO object to capture stdout
                f = io.StringIO()
                with redirect_stdout(f):
                    # Run the agent
                    agent_result = agent.invoke({"input": text})
                
                # Get the captured output
                output = f.getvalue()
                
                # Check if we have a direct tool output in the stdout
                import re
                tool_output_match = re.search(r'✅ Meeting scheduled successfully!(.*?)> Finished chain', output, re.DOTALL)
                
                if tool_output_match:
                    # Extract the tool output
                    tool_output = tool_output_match.group(1).strip()
                    return f"✅ Meeting scheduled successfully!{tool_output}"
                
                # If no direct tool output found, use the agent's response
                response = agent_result.get("response")
                
                # If response is None, try to extract it from the output
                if response is None:
                    # Try to extract any meaningful output
                    clean_output = re.sub(r'> (Entering|Finished) new AgentExecutor chain\.\.\.', '', output)
                    clean_output = re.sub(r'Invoking: .*?with.*?\n', '', clean_output)
                    clean_output = clean_output.strip()
                    
                    if clean_output:
                        return clean_output
                    
                    # If still no response, return a fallback message
                    return "I processed your request but couldn't generate a proper response. Please try again."
                
                return response
            else:
                # Use standard conversation for simple queries
                conversation = self.get_conversation(conversation_key)
                return conversation.invoke({"input": text}).get("response")
        except Exception as e:
            logging.error(f"Agent execution failed: {e}")
            # Fall back to standard conversation if agent fails
            conversation = self.get_conversation(conversation_key)
            return conversation.invoke({"input": text}).get("response")
    
    def _might_need_tools(self, text):
        """Check if a query might benefit from using tools"""
        # Simple heuristic to check if the query might need tools
        tool_keywords = [
            "weather", "temperature", "forecast",
            "wikipedia", "information", "search",
            "time", "date", "current time", "schedule", "meeting"
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in tool_keywords)
    
    def _might_need_rag(self, text):
        """Check if a query might benefit from using RAG"""
        # Only consider RAG if it's enabled and initialized
        if not self.flow_manager.is_rag_enabled() or not self.pinecone_manager or not self.pinecone_manager.is_initialized():
            return False
        
        # More comprehensive heuristic to check if the query might need RAG
        rag_keywords = [
            # General knowledge retrieval keywords
            "knowledge", "document", "information", "data",
            "find", "search", "lookup", "retrieve", "get",
            
            # Question patterns
            "what do you know about", "tell me about", "do you know", 
            "can you tell me", "what is", "who is", "when is", "where is",
            "how does", "why does", "explain", "describe",
            
            # Domain-specific keywords
            "framework", "library", "tool", "technology", "platform",
            "language", "concept", "theory", "approach", "methodology",
            "company", "organization", "person", "event", "history"
        ]
        
        text_lower = text.lower()
        
        # Check for exact keyword matches
        if any(keyword in text_lower for keyword in rag_keywords):
            return True
            
        # Check for question-like patterns that might benefit from RAG
        if text_lower.startswith(("what", "who", "when", "where", "why", "how")):
            return True
            
        # If the query is longer than 5 words, it's likely a complex question that might benefit from RAG
        if len(text_lower.split()) > 5:
            return True
        
        return False
    
    def upload_to_knowledge_base(self, document, metadata=None):
        """Upload a document to the knowledge base"""
        if not self.pinecone_manager or not self.pinecone_manager.is_initialized():
            return False, "Pinecone is not initialized. Check your API key and environment settings."
        
        success = self.pinecone_manager.upload_document(document, metadata)
        
        if success:
            return True, "Document uploaded successfully to the knowledge base."
        else:
            return False, "Failed to upload document to the knowledge base."
    
    def reset_conversation(self, conversation_key):
        """Reset the conversation history for a specific user/channel"""
        if conversation_key in self.user_conversations:
            self.user_conversations[conversation_key] = ConversationChain(
                llm=self.llm,
                prompt=self.prompt,
                memory=ConversationBufferMemory(return_messages=True),
                verbose=True
            )
            
            # Also reset the agent if it exists
            if conversation_key in self.user_agents:
                # Remove the agent so it will be recreated on next use
                del self.user_agents[conversation_key]
                
            return True
        return False
    
    def reload_configuration(self):
        """Reload configuration from Flow Manager"""
        # Get updated LLM configuration
        llm_config = self.flow_manager.get_llm_config()
        self._initialize_llm(llm_config)
        
        # Update system prompt
        system_prompt = self.flow_manager.get_system_prompt()
        self.template = f"""
        {system_prompt}
        
        Current conversation:
        {{history}}
        Human: {{input}}
        AI Assistant:
        """
        
        self.prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=self.template
        )
        
        # Reinitialize Pinecone Manager if RAG is enabled
        if self.flow_manager.is_rag_enabled():
            self.pinecone_manager = PineconeManager()
        else:
            self.pinecone_manager = None
        
        # Update tools
        self.tools = self._get_configured_tools()
        
        # Reset all conversations and agents to use new configuration
        for key in list(self.user_conversations.keys()):
            self.reset_conversation(key)
        
        return True
