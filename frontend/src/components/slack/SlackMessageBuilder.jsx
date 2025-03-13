import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PreviewIcon from '@mui/icons-material/Preview';

const SlackMessageBuilder = ({ onSave }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [message, setMessage] = useState({
    text: '',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hello! This is a sample message.'
        }
      }
    ]
  });
  
  const [showPreview, setShowPreview] = useState(false);
  
  const handleTextChange = (e) => {
    setMessage({
      ...message,
      text: e.target.value
    });
  };
  
  const handleBlockTextChange = (index, value) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[index].text.text = value;
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const handleBlockTypeChange = (index, value) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[index].type = value;
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const addBlock = (type) => {
    let newBlock;
    
    switch (type) {
      case 'section':
        newBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'New section text'
          }
        };
        break;
      case 'divider':
        newBlock = {
          type: 'divider'
        };
        break;
      case 'button':
        newBlock = {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click Me',
                emoji: true
              },
              value: 'button_click',
              action_id: `button_${Date.now()}`
            }
          ]
        };
        break;
      default:
        newBlock = {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'New section text'
          }
        };
    }
    
    setMessage({
      ...message,
      blocks: [...message.blocks, newBlock]
    });
  };
  
  const removeBlock = (index) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks.splice(index, 1);
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const handleButtonTextChange = (blockIndex, buttonIndex, value) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[blockIndex].elements[buttonIndex].text.text = value;
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const handleButtonValueChange = (blockIndex, buttonIndex, value) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[blockIndex].elements[buttonIndex].value = value;
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const addButton = (blockIndex) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[blockIndex].elements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'New Button',
        emoji: true
      },
      value: `button_value_${Date.now()}`,
      action_id: `button_${Date.now()}`
    });
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const removeButton = (blockIndex, buttonIndex) => {
    const updatedBlocks = [...message.blocks];
    updatedBlocks[blockIndex].elements.splice(buttonIndex, 1);
    setMessage({
      ...message,
      blocks: updatedBlocks
    });
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(message);
    }
  };
  
  const renderBlockEditor = (block, index) => {
    switch (block.type) {
      case 'section':
        return (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Block Type</InputLabel>
                  <Select
                    value={block.type}
                    label="Block Type"
                    onChange={(e) => handleBlockTypeChange(index, e.target.value)}
                  >
                    <MenuItem value="section">Section</MenuItem>
                    <MenuItem value="divider">Divider</MenuItem>
                    <MenuItem value="actions">Actions</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Text"
                  value={block.text.text}
                  onChange={(e) => handleBlockTextChange(index, e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => removeBlock(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'divider':
        return (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Block Type</InputLabel>
                  <Select
                    value={block.type}
                    label="Block Type"
                    onChange={(e) => handleBlockTypeChange(index, e.target.value)}
                  >
                    <MenuItem value="section">Section</MenuItem>
                    <MenuItem value="divider">Divider</MenuItem>
                    <MenuItem value="actions">Actions</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <Chip label="Divider" sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => removeBlock(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'actions':
        return (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Block Type</InputLabel>
                  <Select
                    value={block.type}
                    label="Block Type"
                    onChange={(e) => handleBlockTypeChange(index, e.target.value)}
                  >
                    <MenuItem value="section">Section</MenuItem>
                    <MenuItem value="divider">Divider</MenuItem>
                    <MenuItem value="actions">Actions</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {block.elements.map((button, buttonIndex) => (
                    <Grid container spacing={2} key={buttonIndex} sx={{ mb: 1 }}>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Button Text"
                          value={button.text.text}
                          onChange={(e) => handleButtonTextChange(index, buttonIndex, e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Button Value"
                          value={button.value}
                          onChange={(e) => handleButtonValueChange(index, buttonIndex, e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton color="error" onClick={() => removeButton(index, buttonIndex)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => addButton(index)}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Add Button
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={1}>
                <IconButton color="error" onClick={() => removeBlock(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  const renderMessagePreview = () => {
    return (
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 3, 
          backgroundColor: isDarkMode ? '#1a1d21' : '#f8f9fa',
          borderRadius: 2
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Message Preview
          </Typography>
          
          {message.blocks.map((block, index) => {
            switch (block.type) {
              case 'section':
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {block.text.text}
                    </Typography>
                  </Box>
                );
              
              case 'divider':
                return <Divider key={index} sx={{ my: 2 }} />;
              
              case 'actions':
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {block.elements.map((button, buttonIndex) => (
                        <Button
                          key={buttonIndex}
                          variant="outlined"
                          size="small"
                        >
                          {button.text.text}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                );
              
              default:
                return null;
            }
          })}
        </CardContent>
      </Card>
    );
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
        Slack Message Builder
      </Typography>
      
      <Typography variant="body1" paragraph>
        Create interactive Slack messages with buttons and other UI elements.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Fallback Text"
          helperText="This text will be shown in notifications and when blocks cannot be displayed"
          value={message.text}
          onChange={handleTextChange}
          multiline
          rows={2}
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Message Blocks
        </Typography>
        
        {message.blocks.map((block, index) => (
          <Box key={index}>
            {renderBlockEditor(block, index)}
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => addBlock('section')}
        >
          Add Section
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => addBlock('divider')}
        >
          Add Divider
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => addBlock('button')}
        >
          Add Buttons
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<PreviewIcon />}
          onClick={() => setShowPreview(!showPreview)}
          sx={{ mr: 1 }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save Message
        </Button>
      </Box>
      
      {showPreview && renderMessagePreview()}
    </Paper>
  );
};

export default SlackMessageBuilder;
