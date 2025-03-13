import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import axios from 'axios';

const SlackSettings = () => {
  const [settings, setSettings] = useState({
    botName: '',
    defaultChannel: '',
    autoRespond: true,
    mentionRequired: false,
    responseDelay: 0,
    workflowId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // This would be replaced with an actual API call in a real implementation
        // const response = await axios.get(`${apiUrl}/slack/settings`);
        // setSettings(response.data);
        
        // For now, we'll simulate a response
        setTimeout(() => {
          setSettings({
            botName: 'My Assistant',
            defaultChannel: 'general',
            autoRespond: true,
            mentionRequired: false,
            responseDelay: 0,
            workflowId: 'workflow-123'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching Slack settings:', error);
        setError('Failed to load Slack settings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [apiUrl]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      // This would be replaced with an actual API call in a real implementation
      // await axios.post(`${apiUrl}/slack/settings`, settings);
      
      // For now, we'll simulate a response
      setTimeout(() => {
        setSuccess('Settings saved successfully!');
        setSaveLoading(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Error saving Slack settings:', error);
      setError('Failed to save settings. Please try again later.');
      setSaveLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
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
        Slack Settings
      </Typography>
      
      <Typography variant="body1" paragraph>
        Configure how your agents interact with Slack.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Bot Display Name"
            name="botName"
            value={settings.botName}
            onChange={handleChange}
            margin="normal"
            helperText="This name will be shown in Slack when your agent responds"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Default Channel"
            name="defaultChannel"
            value={settings.defaultChannel}
            onChange={handleChange}
            margin="normal"
            helperText="Default channel for agent messages (without the #)"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.autoRespond}
                onChange={handleChange}
                name="autoRespond"
                color="primary"
              />
            }
            label="Auto-respond to messages"
          />
          <Typography variant="body2" color="text.secondary">
            When enabled, the agent will automatically respond to matching messages
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.mentionRequired}
                onChange={handleChange}
                name="mentionRequired"
                color="primary"
              />
            }
            label="Require @mention to respond"
          />
          <Typography variant="body2" color="text.secondary">
            When enabled, the agent will only respond when explicitly mentioned
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Response Delay (seconds)"
            name="responseDelay"
            type="number"
            value={settings.responseDelay}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0, max: 60 }}
            helperText="Add a delay before responding (0 = immediate)"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Default Workflow ID"
            name="workflowId"
            value={settings.workflowId}
            onChange={handleChange}
            margin="normal"
            helperText="The workflow to use for processing messages"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saveLoading}
          sx={{ 
            py: 1, 
            px: 3, 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'medium'
          }}
        >
          {saveLoading ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Box>
    </Paper>
  );
};

export default SlackSettings;
