import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Button, 
  Box,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GitHubIcon from '@mui/icons-material/GitHub';
import TestChatInterface from '../workflow/TestChatInterface';
import workflowService from '../../services/workflowService';

const Header = ({ toggleTheme, mode }) => {
  const location = useLocation();
  const [testChatOpen, setTestChatOpen] = useState(false);
  const [demoWorkflowId, setDemoWorkflowId] = useState(null);
  
  // Fetch a sample workflow ID for testing
  useEffect(() => {
    const fetchDemoWorkflow = async () => {
      try {
        // Try to get the first workflow from the list
        const workflows = await workflowService.getWorkflows();
        if (workflows && workflows.length > 0) {
          setDemoWorkflowId(workflows[0].id);
        }
      } catch (error) {
        console.error('Error fetching demo workflow:', error);
        // If no workflows exist, we'll use the fallback in TestChatInterface
      }
    };
    
    fetchDemoWorkflow();
  }, []);
  
  const handleOpenTestChat = () => {
    setTestChatOpen(true);
  };
  
  const handleCloseTestChat = () => {
    setTestChatOpen(false);
  };
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          Slack Agent Builder
        </Typography>
        
        <Tabs 
          value={location.pathname} 
          sx={{ flexGrow: 1 }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Workflow Editor" 
            value="/" 
            component={Link} 
            to="/" 
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label="Slack Integration" 
            value="/slack" 
            component={Link} 
            to="/slack" 
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<SaveIcon />}
            size="small"
          >
            Save
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PlayArrowIcon />}
            onClick={handleOpenTestChat}
            size="small"
          >
            Test Agent
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<CloudUploadIcon />}
            size="small"
          >
            Deploy
          </Button>
          
          <Tooltip title="View on GitHub">
            <IconButton
              color="inherit"
              aria-label="github"
              edge="end"
              component="a"
              href="https://github.com/yourusername/slack-agent"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton color="inherit" onClick={toggleTheme} edge="end">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      
      {/* Test Chat Interface */}
      <TestChatInterface
        open={testChatOpen}
        onClose={handleCloseTestChat}
        workflowId={demoWorkflowId}
        workflowName={demoWorkflowId ? `Workflow #${demoWorkflowId}` : "Demo Workflow"}
      />
    </AppBar>
  );
};

export default Header;
