import api from './api';

const workflowService = {
  // Get all workflows
  getWorkflows: async () => {
    try {
      const response = await api.get('/workflows');
      return response.data;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  },

  // Get a specific workflow by ID
  getWorkflow: async (id) => {
    try {
      const response = await api.get(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow ${id}:`, error);
      throw error;
    }
  },

  // Create a new workflow
  createWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/workflows', workflowData);
      return response.data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  // Update an existing workflow
  updateWorkflow: async (id, workflowData) => {
    try {
      const response = await api.put(`/workflows/${id}`, workflowData);
      return response.data;
    } catch (error) {
      console.error(`Error updating workflow ${id}:`, error);
      throw error;
    }
  },

  // Delete a workflow
  deleteWorkflow: async (id) => {
    try {
      await api.delete(`/workflows/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting workflow ${id}:`, error);
      throw error;
    }
  },

  // Test a workflow
  testWorkflow: async (id, inputData) => {
    try {
      const response = await api.post(`/workflows/${id}/test`, inputData);
      return response.data;
    } catch (error) {
      console.error(`Error testing workflow ${id}:`, error);
      throw error;
    }
  },
  
  // Test a chat message with a workflow
  testChatMessage: async (id, message, context = {}) => {
    try {
      const response = await api.post(`/workflows/${id}/test`, {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error(`Error testing chat message with workflow ${id}:`, error);
      throw error;
    }
  },

  // Deploy a workflow
  deployWorkflow: async (id) => {
    try {
      const response = await api.post(`/workflows/${id}/deploy`);
      return response.data;
    } catch (error) {
      console.error(`Error deploying workflow ${id}:`, error);
      throw error;
    }
  },

  // Get node types
  getNodeTypes: async () => {
    try {
      const response = await api.get('/components/node-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching node types:', error);
      throw error;
    }
  },

  // Get LLM models
  getLLMModels: async () => {
    try {
      const response = await api.get('/components/llm-models');
      return response.data;
    } catch (error) {
      console.error('Error fetching LLM models:', error);
      throw error;
    }
  },

  // Get tool types
  getToolTypes: async () => {
    try {
      const response = await api.get('/components/tool-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching tool types:', error);
      throw error;
    }
  },

  // Get executions for a workflow
  getExecutions: async (workflowId) => {
    try {
      const response = await api.get(
        workflowId 
          ? `/executions?workflow_id=${workflowId}` 
          : '/executions'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  },

  // Get execution details
  getExecution: async (executionId) => {
    try {
      const response = await api.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching execution ${executionId}:`, error);
      throw error;
    }
  },
};

export default workflowService;
