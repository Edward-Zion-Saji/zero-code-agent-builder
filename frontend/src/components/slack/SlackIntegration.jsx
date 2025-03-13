import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import axios from 'axios';

const SlackIntegration = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Get the client ID from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  // Fetch existing integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/slack/integrations`);
        setIntegrations(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching Slack integrations:', error);
        setError('Failed to load Slack integrations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchIntegrations();
  }, [apiUrl]);
  
  // Generate Slack OAuth URL
  const handleConnectToSlack = async () => {
    try {
      const response = await axios.get(`${apiUrl}/slack/auth`);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error getting Slack auth URL:', error);
      setError('Failed to connect to Slack. Please try again later.');
    }
  };
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 4, 
        backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
        borderRadius: 2,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: theme.palette.primary.main }}>
        Slack Integration
      </Typography>
      <Typography variant="body1" paragraph>
        Connect your Slack workspace to enable your agents to interact with your team.
        Your no-code agents will be able to respond to messages, mentions, and interactive components.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      {/* Display existing integrations */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : integrations.length > 0 ? (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            Connected Workspaces
          </Typography>
          <List>
            {integrations.map((integration) => (
              <ListItem 
                key={integration.id} 
                divider 
                sx={{ 
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <ListItemText 
                  primary={integration.team_name} 
                  secondary={`Connected on ${new Date(integration.created_at).toLocaleDateString()}`} 
                />
                <Chip 
                  label="Connected" 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 'medium' }}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            No Slack workspaces connected yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect your Slack workspace to start building no-code agents that can interact with your team.
          </Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectToSlack}
          sx={{ 
            py: 1.2, 
            px: 3, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'medium',
            fontSize: '1rem'
          }}
          startIcon={
            <svg width="18" height="18" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
              <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
              <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
              <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
            </svg>
          }
        >
          {integrations.length > 0 ? 'Add Another Workspace' : 'Connect to Slack'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SlackIntegration;
