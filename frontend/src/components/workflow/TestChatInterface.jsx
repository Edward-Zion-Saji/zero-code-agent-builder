import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import workflowService from '../../services/workflowService';

const TestChatInterface = ({ open, onClose, workflowId, workflowName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Reset chat when opening the dialog
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: 'welcome',
          sender: 'agent',
          text: `Hello! I'm your agent assistant. How can I help you today?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [open]);
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      let response;
      let isRealWorkflow = false;
      
      // Check if we have a valid workflow ID
      if (workflowId && !isNaN(parseInt(workflowId))) {
        // Send message to backend for processing using workflowService
        response = await workflowService.testChatMessage(workflowId, input);
        isRealWorkflow = true;
      } else {
        // Use a mock response for demo purposes when no valid workflow ID is available
        response = {
          response: `This is a demo response. In a real workflow, I would process: "${input}"`,
          metadata: {
            workflow_id: "demo",
            execution_time: 0.5,
            node_count: 3
          }
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Add agent response to chat
      const agentMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: response.response || "I'm not sure how to respond to that.",
        timestamp: new Date().toISOString(),
        isRealWorkflow: isRealWorkflow,
        metadata: response.metadata || {
          workflow_id: isRealWorkflow ? workflowId : "mock",
          execution_time: response.execution_time || 0.5,
          node_count: response.node_count || 0
        }
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Add a system message to indicate if this was a real workflow or mock response
      if (!isRealWorkflow) {
        const systemMessage = {
          id: `system-${Date.now()}`,
          sender: 'system',
          text: "Note: This was a mock response. Connect to a real workflow for actual agent responses.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Error testing workflow:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        sender: 'system',
        text: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: '80vh',
          maxHeight: '700px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6">
            Test Chat: {workflowName || 'Agent'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Messages area */}
        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 2,
          backgroundColor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)'
        }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                mb: 2
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.sender === 'user' 
                    ? theme.palette.primary.main 
                    : message.sender === 'agent'
                      ? theme.palette.secondary.main
                      : 'grey.500',
                  width: 36,
                  height: 36
                }}
              >
                {message.sender === 'user' ? (
                  <PersonIcon />
                ) : message.sender === 'agent' ? (
                  <SmartToyIcon />
                ) : (
                  '!'
                )}
              </Avatar>
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  ml: message.sender === 'user' ? 0 : 1,
                  mr: message.sender === 'user' ? 1 : 0,
                  maxWidth: '70%',
                  borderRadius: 2,
                  backgroundColor: message.sender === 'user'
                    ? isDarkMode ? theme.palette.primary.dark : theme.palette.primary.light
                    : message.sender === 'agent'
                      ? isDarkMode ? theme.palette.background.paper : '#fff'
                      : message.isError
                        ? isDarkMode ? '#4a1c1c' : '#ffebee'
                        : isDarkMode ? '#1c2c1c' : '#e8f5e9',
                  color: message.sender === 'user'
                    ? isDarkMode ? '#fff' : theme.palette.primary.contrastText
                    : 'text.primary'
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.text}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                  {formatTime(message.timestamp)}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Input area */}
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              disabled={loading}
              sx={{ 
                mr: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!input.trim() || loading}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1.5,
                minWidth: 100
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TestChatInterface;
