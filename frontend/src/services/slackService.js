import api from './api';

const slackService = {
  // Get the Slack OAuth URL for connecting a workspace
  getOAuthUrl: () => {
    const clientId = import.meta.env.VITE_SLACK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/slack/callback`;
    const scope = 'chat:write,channels:read,channels:history,im:history,im:read,groups:read,groups:history';
    
    return `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
  },
  
  // Exchange the OAuth code for a token
  exchangeCodeForToken: async (code) => {
    try {
      const response = await api.post('/slack/oauth', { code });
      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  },
  
  // Get connected Slack workspaces
  getWorkspaces: async () => {
    try {
      const response = await api.get('/slack/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching Slack workspaces:', error);
      throw error;
    }
  },
  
  // Disconnect a Slack workspace
  disconnectWorkspace: async (workspaceId) => {
    try {
      const response = await api.delete(`/slack/workspaces/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error disconnecting workspace ${workspaceId}:`, error);
      throw error;
    }
  },
  
  // Get channels for a workspace
  getChannels: async (workspaceId) => {
    try {
      const response = await api.get(`/slack/workspaces/${workspaceId}/channels`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching channels for workspace ${workspaceId}:`, error);
      throw error;
    }
  }
};

export default slackService;
