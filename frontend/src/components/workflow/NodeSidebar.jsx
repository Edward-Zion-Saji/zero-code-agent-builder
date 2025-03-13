import React from 'react';
import { Box, Typography, Paper, Divider, useTheme, Tooltip } from '@mui/material';
import { nodeCategories } from './nodeTypes';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BuildIcon from '@mui/icons-material/Build';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import StorageIcon from '@mui/icons-material/Storage';

const NodeSidebar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Function to get the appropriate icon based on iconType
  const getIconComponent = (iconType, fontSize = 'small') => {
    switch (iconType) {
      case 'Notifications':
        return <NotificationsIcon fontSize={fontSize} />;
      case 'SmartToy':
        return <SmartToyIcon fontSize={fontSize} />;
      case 'Build':
        return <BuildIcon fontSize={fontSize} />;
      case 'Code':
        return <CodeIcon fontSize={fontSize} />;
      case 'Chat':
        return <ChatIcon fontSize={fontSize} />;
      case 'Storage':
        return <StorageIcon fontSize={fontSize} />;
      default:
        return null;
    }
  };

  const onDragStart = (event, nodeType, nodeData) => {
    // Create the initial node data with default values based on node type
    let initialData = {
      label: nodeData.label,
      description: nodeData.description || '',
    };

    // Add specific properties based on node type
    if (nodeType === 'rag') {
      // Add RAG-specific default properties
      initialData = {
        ...initialData,
        ragType: nodeData.ragType || 'document', // document or retrieval
        chunkSize: 1000,
        chunkOverlap: 200,
        topK: 3,
        similarityThreshold: 0.7,
        includeMetadata: false,
        includeSource: true,
        // Function to update node data (will be replaced by actual implementation in WorkflowEditor)
        onDataChange: (newData) => {
          console.log('Node data changed:', newData);
        }
      };
    }

    // Store the node data in the drag event
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: nodeType,
      data: initialData
    }));
    
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: isDarkMode ? theme.palette.background.paper : '#f5f5f5',
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Node Types
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Drag and drop nodes to create your workflow
        </Typography>
      </Box>

      <Divider />

      {/* Node categories */}
      {Object.entries(nodeCategories).map(([categoryName, nodes]) => (
        <Box key={categoryName} sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{
              px: 2,
              py: 1,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              fontWeight: 'medium',
            }}
          >
            {categoryName}
          </Typography>

          <Box sx={{ p: 1 }}>
            {nodes.map((node) => (
              <Tooltip
                key={`${node.type}-${node.label}`}
                title={node.description || node.label}
                placement="right"
              >
                <Paper
                  elevation={1}
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type, node)}
                  sx={{
                    p: 1.5,
                    m: 1,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'grab',
                    backgroundColor: isDarkMode
                      ? theme.palette.background.paper
                      : theme.palette.node.background[node.type] || '#fff',
                    borderLeft: `4px solid ${theme.palette.node[node.type]}`,
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {node.iconType && (
                    <Box
                      sx={{
                        mr: 1.5,
                        display: 'flex',
                        color: theme.palette.node[node.type],
                      }}
                    >
                      {getIconComponent(node.iconType)}
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {node.label}
                  </Typography>
                </Paper>
              </Tooltip>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NodeSidebar;
