import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Slider,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Paper,
  useTheme,
  IconButton,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const NodeProperties = ({ selectedNode, updateNodeData }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [fileUploadStatus, setFileUploadStatus] = useState({ success: false, error: false, message: '' });

  if (!selectedNode) {
    return (
      <Box sx={{ 
        p: 2, 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? theme.palette.background.paper : '#f5f5f5',
        borderLeft: `1px solid ${isDarkMode ? theme.palette.divider : '#e0e0e0'}`
      }}>
        <Typography variant="body2" color="text.secondary">
          Select a node to view and edit its properties
        </Typography>
      </Box>
    );
  }

  const handleChange = (field, value) => {
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('text.*') && !file.name.endsWith('.txt')) {
      setFileUploadStatus({
        success: false,
        error: true,
        message: 'Only text files are supported',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      updateNodeData(selectedNode.id, { 
        filename: file.name,
        fileContent: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''), 
        fileSize: file.size,
        uploadDate: new Date().toISOString()
      });
      
      setFileUploadStatus({
        success: true,
        error: false,
        message: `File "${file.name}" uploaded successfully`,
      });

      setTimeout(() => {
        setFileUploadStatus({ success: false, error: false, message: '' });
      }, 5000);
    };

    reader.onerror = () => {
      setFileUploadStatus({
        success: false,
        error: true,
        message: 'Error reading file',
      });
    };

    reader.readAsText(file);
  };

  const handleRemoveFile = () => {
    updateNodeData(selectedNode.id, { 
      filename: '',
      fileContent: '',
      fileSize: 0,
      uploadDate: null
    });
    
    setFileUploadStatus({
      success: true,
      error: false,
      message: 'File removed',
    });

    setTimeout(() => {
      setFileUploadStatus({ success: false, error: false, message: '' });
    }, 3000);
  };

  const renderTriggerProperties = () => {
    const { triggerType, channelType, pattern, description } = selectedNode.data;
    
    return (
      <>
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Trigger Type</InputLabel>
          <Select
            value={triggerType || ''}
            label="Trigger Type"
            onChange={(e) => handleChange('triggerType', e.target.value)}
          >
            <MenuItem value="message">Message Received</MenuItem>
            <MenuItem value="mention">Mention</MenuItem>
            <MenuItem value="reaction">Reaction Added</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Channel Type</InputLabel>
          <Select
            value={channelType || ''}
            label="Channel Type"
            onChange={(e) => handleChange('channelType', e.target.value)}
          >
            <MenuItem value="direct">Direct Message</MenuItem>
            <MenuItem value="channel">Public Channel</MenuItem>
            <MenuItem value="private">Private Channel</MenuItem>
            <MenuItem value="any">Any</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Pattern (regex or keywords)"
          value={pattern || ''}
          onChange={(e) => handleChange('pattern', e.target.value)}
          helperText="Optional: Only trigger on messages matching this pattern"
        />
        
        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Description"
          value={description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          multiline
          rows={2}
        />
      </>
    );
  };

  const renderLLMProperties = () => {
    if (selectedNode.data.label === 'Chat Model') {
      const { modelType, temperature, maxTokens, systemPrompt, description } = selectedNode.data;
      
      return (
        <>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Model</InputLabel>
            <Select
              value={modelType || ''}
              label="Model"
              onChange={(e) => handleChange('modelType', e.target.value)}
            >
              <MenuItem value="gpt-4">GPT-4</MenuItem>
              <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
              <MenuItem value="claude-2">Claude 2</MenuItem>
              <MenuItem value="llama-2">Llama 2</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography gutterBottom>Temperature: {temperature}</Typography>
            <Slider
              value={temperature || 0}
              min={0}
              max={1}
              step={0.1}
              onChange={(_, value) => handleChange('temperature', value)}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Max Tokens"
            type="number"
            value={maxTokens || 0}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="System Prompt"
            value={systemPrompt || ''}
            onChange={(e) => handleChange('systemPrompt', e.target.value)}
            multiline
            rows={4}
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    } else if (selectedNode.data.label === 'Prompt Template') {
      const { template, variables, description } = selectedNode.data;
      
      return (
        <>
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Template"
            value={template || ''}
            onChange={(e) => handleChange('template', e.target.value)}
            multiline
            rows={4}
            helperText="Use {{variable}} syntax for variables"
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Variables (comma-separated)"
            value={variables.join(', ') || ''}
            onChange={(e) => handleChange('variables', e.target.value.split(',').map(v => v.trim()))}
            helperText="List all variables used in the template"
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    }
    
    return null;
  };

  const renderToolProperties = () => {
    const { toolType, parameters, description } = selectedNode.data;
    
    return (
      <>
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>Tool Type</InputLabel>
          <Select
            value={toolType || ''}
            label="Tool Type"
            onChange={(e) => handleChange('toolType', e.target.value)}
          >
            <MenuItem value="web_search">Web Search</MenuItem>
            <MenuItem value="database">Database Query</MenuItem>
            <MenuItem value="api_call">API Call</MenuItem>
            <MenuItem value="file_operation">File Operation</MenuItem>
          </Select>
        </FormControl>
        
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
          Parameters
        </Typography>
        
        {toolType === 'web_search' && (
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Query"
            value={parameters.query || ''}
            onChange={(e) => handleChange('parameters', { ...parameters, query: e.target.value })}
          />
        )}
        
        {toolType === 'database' && (
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="SQL Query"
            value={parameters.query || ''}
            onChange={(e) => handleChange('parameters', { ...parameters, query: e.target.value })}
            multiline
            rows={3}
          />
        )}
        
        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Description"
          value={description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          multiline
          rows={2}
        />
      </>
    );
  };

  const renderLogicProperties = () => {
    if (selectedNode.data.label === 'Condition') {
      const { condition, description } = selectedNode.data;
      
      return (
        <>
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Condition"
            value={condition || ''}
            onChange={(e) => handleChange('condition', e.target.value)}
            helperText="Use {{variable}} syntax for variables"
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    } else if (selectedNode.data.label === 'Code Execution') {
      const { code, language, description } = selectedNode.data;
      
      return (
        <>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Language</InputLabel>
            <Select
              value={language || ''}
              label="Language"
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Code"
            value={code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            multiline
            rows={6}
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    }
    
    return null;
  };

  const renderOutputProperties = () => {
    if (selectedNode.data.label === 'Slack Message') {
      const { messageType, channel, description } = selectedNode.data;
      
      return (
        <>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Message Type</InputLabel>
            <Select
              value={messageType || ''}
              label="Message Type"
              onChange={(e) => handleChange('messageType', e.target.value)}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="blocks">Blocks</MenuItem>
              <MenuItem value="attachment">Attachment</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Channel"
            value={channel || ''}
            onChange={(e) => handleChange('channel', e.target.value)}
            helperText="Channel ID or name (leave empty for same channel as trigger)"
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    } else if (selectedNode.data.label === 'Slack Action') {
      const { actionType, text, description } = selectedNode.data;
      
      return (
        <>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Action Type</InputLabel>
            <Select
              value={actionType || ''}
              label="Action Type"
              onChange={(e) => handleChange('actionType', e.target.value)}
            >
              <MenuItem value="button">Button</MenuItem>
              <MenuItem value="select">Select Menu</MenuItem>
              <MenuItem value="datepicker">Date Picker</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Text"
            value={text || ''}
            onChange={(e) => handleChange('text', e.target.value)}
          />
          
          <TextField
            fullWidth
            size="small"
            margin="normal"
            label="Description"
            value={description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={2}
          />
        </>
      );
    }
    
    return null;
  };

  const renderRAGProperties = () => {
    const { ragType, filename, fileContent, fileSize, uploadDate, chunkSize, chunkOverlap, topK, similarityThreshold, includeMetadata, includeSource, description } = selectedNode.data;
    
    return (
      <>
        <FormControl fullWidth margin="normal" size="small">
          <InputLabel>RAG Type</InputLabel>
          <Select
            value={ragType || 'document'}
            label="RAG Type"
            onChange={(e) => handleChange('ragType', e.target.value)}
          >
            <MenuItem value="document">Document Ingestion</MenuItem>
            <MenuItem value="retrieval">Knowledge Retrieval</MenuItem>
          </Select>
        </FormControl>
        
        {ragType === 'document' && (
          <>
            <Box sx={{ mt: 2, mb: 2 }}>
              {fileUploadStatus.message && (
                <Alert 
                  severity={fileUploadStatus.error ? "error" : "success"} 
                  sx={{ mb: 2 }}
                >
                  {fileUploadStatus.message}
                </Alert>
              )}
              
              {!filename ? (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ 
                    width: '100%', 
                    height: '100px',
                    border: '2px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  Upload Text File
                  <VisuallyHiddenInput type="file" onChange={handleFileUpload} accept=".txt,text/plain" />
                </Button>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <DescriptionIcon sx={{ mr: 1, color: theme.palette.node.rag }} />
                    <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'medium' }}>
                      {filename}
                    </Typography>
                    <IconButton size="small" onClick={handleRemoveFile} aria-label="remove file">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary">
                    Size: {fileSize ? Math.round(fileSize / 1024) + ' KB' : 'Unknown'}
                  </Typography>
                  
                  {fileContent && (
                    <Box 
                      sx={{ 
                        mt: 1, 
                        p: 1, 
                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                        borderRadius: 1,
                        width: '100%',
                        maxHeight: '100px',
                        overflow: 'auto',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Typography variant="caption" component="pre" sx={{ m: 0, fontFamily: 'monospace' }}>
                        {fileContent}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
            
            <Typography gutterBottom>Chunk Size: {chunkSize || 1000}</Typography>
            <Slider
              value={chunkSize || 1000}
              min={100}
              max={2000}
              step={100}
              onChange={(_, value) => handleChange('chunkSize', value)}
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom>Chunk Overlap: {chunkOverlap || 200}</Typography>
            <Slider
              value={chunkOverlap || 200}
              min={0}
              max={500}
              step={50}
              onChange={(_, value) => handleChange('chunkOverlap', value)}
              valueLabelDisplay="auto"
            />
          </>
        )}
        
        {ragType === 'retrieval' && (
          <>
            <Typography gutterBottom>Top K Results: {topK || 3}</Typography>
            <Slider
              value={topK || 3}
              min={1}
              max={10}
              step={1}
              onChange={(_, value) => handleChange('topK', value)}
              valueLabelDisplay="auto"
            />
            
            <Typography gutterBottom>Similarity Threshold: {similarityThreshold || 0.7}</Typography>
            <Slider
              value={similarityThreshold || 0.7}
              min={0.1}
              max={1}
              step={0.1}
              onChange={(_, value) => handleChange('similarityThreshold', value)}
              valueLabelDisplay="auto"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={includeMetadata || false}
                  onChange={(e) => handleChange('includeMetadata', e.target.checked)}
                />
              }
              label="Include Metadata"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={includeSource || true}
                  onChange={(e) => handleChange('includeSource', e.target.checked)}
                />
              }
              label="Include Source"
            />
          </>
        )}
        
        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Description"
          value={description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          multiline
          rows={2}
        />
      </>
    );
  };

  const renderProperties = () => {
    switch (selectedNode.type) {
      case 'trigger':
        return renderTriggerProperties();
      case 'llm':
        return renderLLMProperties();
      case 'tool':
        return renderToolProperties();
      case 'logic':
        return renderLogicProperties();
      case 'output':
        return renderOutputProperties();
      case 'rag':
        return renderRAGProperties();
      default:
        return (
          <Typography>Unknown node type</Typography>
        );
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      overflow: 'auto',
      p: 2,
      backgroundColor: isDarkMode ? theme.palette.background.paper : '#f5f5f5',
      borderLeft: `1px solid ${isDarkMode ? theme.palette.divider : '#e0e0e0'}`
    }}>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          fontWeight: 'medium',
          color: isDarkMode ? theme.palette.text.primary : theme.palette.text.primary,
          borderBottom: `1px solid ${isDarkMode ? theme.palette.divider : '#e0e0e0'}`,
          pb: 1,
          mb: 2
        }}
      >
        {selectedNode.data.label} Properties
      </Typography>
      
      {renderProperties()}
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{
            mb: 1,
            backgroundColor: isDarkMode ? theme.palette.primary.main : theme.palette.primary.main,
            '&:hover': {
              backgroundColor: isDarkMode ? theme.palette.primary.dark : theme.palette.primary.dark,
            }
          }}
        >
          Apply Changes
        </Button>
      </Box>
    </Box>
  );
};

export default NodeProperties;
