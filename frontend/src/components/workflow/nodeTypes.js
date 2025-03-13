import TriggerNode from './nodes/TriggerNode';
import LLMNode from './nodes/LLMNode';
import ToolNode from './nodes/ToolNode';
import LogicNode from './nodes/LogicNode';
import OutputNode from './nodes/OutputNode';
import RAGNode from './nodes/RAGNode';

// Node type registry for React Flow
export const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  tool: ToolNode,
  logic: LogicNode,
  output: OutputNode,
  rag: RAGNode
};

// Node categories for organization in the sidebar
export const nodeCategories = {
  'Triggers': [
    {
      type: 'trigger',
      label: 'Message Received',
      iconType: 'Notifications',
      description: 'Triggered when a message is received',
      ragType: null
    },
    {
      type: 'trigger',
      label: 'Mention Trigger',
      iconType: 'Notifications',
      description: 'Triggered when the bot is mentioned',
      ragType: null
    }
  ],
  'LLM Components': [
    {
      type: 'llm',
      label: 'Chat Model',
      iconType: 'SmartToy',
      description: 'Processes input with an LLM',
      ragType: null
    },
    {
      type: 'llm',
      label: 'Prompt Template',
      iconType: 'Chat',
      description: 'Template for structuring prompts',
      ragType: null
    }
  ],
  'Knowledge Base': [
    {
      type: 'rag',
      label: 'Document Ingestion',
      iconType: 'Storage',
      description: 'Ingest documents for retrieval augmented generation',
      ragType: 'document'
    },
    {
      type: 'rag',
      label: 'Knowledge Retrieval',
      iconType: 'Storage',
      description: 'Retrieve relevant information from ingested documents',
      ragType: 'retrieval'
    }
  ],
  'Tools': [
    {
      type: 'tool',
      label: 'Web Search',
      iconType: 'Build',
      description: 'Search the web for information',
      ragType: null
    },
    {
      type: 'tool',
      label: 'API Call',
      iconType: 'Build',
      description: 'Make an API request',
      ragType: null
    },
    {
      type: 'tool',
      label: 'Database Query',
      iconType: 'Build',
      description: 'Query a database',
      ragType: null
    }
  ],
  'Logic': [
    {
      type: 'logic',
      label: 'Condition',
      iconType: 'Code',
      description: 'Branch based on a condition',
      ragType: null
    },
    {
      type: 'logic',
      label: 'Switch',
      iconType: 'Code',
      description: 'Multiple conditional branches',
      ragType: null
    },
    {
      type: 'logic',
      label: 'Loop',
      iconType: 'Code',
      description: 'Iterate over items',
      ragType: null
    }
  ],
  'Outputs': [
    {
      type: 'output',
      label: 'Slack Message',
      iconType: 'Chat',
      description: 'Send a message to Slack',
      ragType: null
    },
    {
      type: 'output',
      label: 'Email',
      iconType: 'Chat',
      description: 'Send an email',
      ragType: null
    }
  ]
};
