import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RAGService from '../../../services/ragService';

const RAGNode = ({ data, isConnectable, selected }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Function to handle file upload to backend
  const handleFileUpload = useCallback(async () => {
    if (!data.filename) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Create a File object from the data
      const fileContent = data.fileContent || '';
      const file = new File([fileContent], data.filename, { type: 'text/plain' });
      
      // Upload to backend
      await RAGService.uploadDocument(file, {
        chunkSize: data.chunkSize || 1000,
        chunkOverlap: data.chunkOverlap || 200,
        description: data.description || ''
      });
      
      // Update node data to indicate successful upload
      data.onDataChange({
        ...data,
        uploaded: true,
        uploading: false,
        uploadError: null
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Failed to upload file');
      
      // Update node data to indicate upload error
      data.onDataChange({
        ...data,
        uploaded: false,
        uploading: false,
        uploadError: error.message || 'Failed to upload file'
      });
    } finally {
      setIsUploading(false);
    }
  }, [data]);

  // Determine node style based on type
  const getNodeStyle = () => {
    const baseStyle = {
      border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
      backgroundColor: isDarkMode 
        ? theme.palette.background.paper 
        : theme.palette.node.background.rag,
      transition: 'all 0.2s ease',
      boxShadow: selected 
        ? '0 4px 8px rgba(0, 0, 0, 0.2)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
    
    // Add specific styles based on RAG type
    if (data.ragType === 'document') {
      return {
        ...baseStyle,
        borderLeft: `4px solid ${theme.palette.node.rag}`
      };
    } else if (data.ragType === 'retrieval') {
      return {
        ...baseStyle,
        borderRight: `4px solid ${theme.palette.node.rag}`
      };
    }
    
    return baseStyle;
  };

  // Get the appropriate icon and status for the node
  const getStatusInfo = () => {
    if (isUploading || data.uploading) {
      return {
        icon: <CircularProgress size={16} color="primary" />,
        text: 'Uploading...',
        color: theme.palette.info.main
      };
    } else if (uploadError || data.uploadError) {
      return {
        icon: <ErrorIcon fontSize="small" color="error" />,
        text: uploadError || data.uploadError,
        color: theme.palette.error.main
      };
    } else if (data.uploaded) {
      return {
        icon: <CheckCircleIcon fontSize="small" color="success" />,
        text: 'Uploaded successfully',
        color: theme.palette.success.main
      };
    } else if (data.filename) {
      return {
        icon: <DescriptionIcon fontSize="small" color="primary" />,
        text: 'Ready to upload',
        color: theme.palette.text.secondary
      };
    }
    
    return {
      icon: <HelpOutlineIcon fontSize="small" color="disabled" />,
      text: 'No file selected',
      color: theme.palette.text.disabled
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Paper elevation={0} sx={getNodeStyle()}>
      {/* Input handle for document ingestion */}
      {data.ragType === 'document' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: theme.palette.node.rag }}
          isConnectable={isConnectable}
        />
      )}
      
      {/* Output handle for document ingestion */}
      {data.ragType === 'document' && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: theme.palette.node.rag }}
          isConnectable={isConnectable}
        />
      )}
      
      {/* Input handle for knowledge retrieval */}
      {data.ragType === 'retrieval' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: theme.palette.node.rag }}
          isConnectable={isConnectable}
        />
      )}
      
      {/* Output handle for knowledge retrieval */}
      {data.ragType === 'retrieval' && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: theme.palette.node.rag }}
          isConnectable={isConnectable}
        />
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Node header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: theme.palette.node.rag }}>
            {data.ragType === 'document' ? 'Document Ingestion' : 'Knowledge Retrieval'}
          </Typography>
          
          <Tooltip title={statusInfo.text}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {statusInfo.icon}
            </Box>
          </Tooltip>
        </Box>
        
        {/* Node content */}
        <Box sx={{ mt: 1 }}>
          {data.ragType === 'document' && (
            <>
              {data.filename ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                }}>
                  <DescriptionIcon fontSize="small" sx={{ mr: 1, color: theme.palette.node.rag }} />
                  <Typography variant="body2" noWrap sx={{ maxWidth: '140px' }}>
                    {data.filename}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No file selected
                </Typography>
              )}
              
              {data.chunkSize && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Chunk size: {data.chunkSize}
                </Typography>
              )}
            </>
          )}
          
          {data.ragType === 'retrieval' && (
            <>
              <Typography variant="body2">
                {data.topK ? `Top ${data.topK} results` : 'Top 3 results'}
              </Typography>
              
              {data.similarityThreshold && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                  Threshold: {data.similarityThreshold}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default RAGNode;
