import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Typography, useTheme, Snackbar, Alert, Paper, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublishIcon from '@mui/icons-material/Publish';
import NodeSidebar from './NodeSidebar';
import NodeProperties from './NodeProperties';
import TestChatInterface from './TestChatInterface';
import { nodeTypes } from './nodeTypes';
import RAGService from '../../services/ragService';

const WorkflowEditor = ({ workflowId }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [testChatOpen, setTestChatOpen] = useState(false);

  // Load workflow data if workflowId is provided
  useEffect(() => {
    if (workflowId) {
      // TODO: Fetch workflow data from API
      console.log('Loading workflow:', workflowId);
    }
  }, [workflowId]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle drag over for node placement
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop for node creation
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped data is valid
      if (!data) return;
      
      const { type, data: nodeData } = JSON.parse(data);

      // Get the position of the drop
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a unique ID for the new node
      const newNodeId = `${type}-${Date.now()}`;

      // For RAG nodes, we need to add the onDataChange function
      if (type === 'rag') {
        nodeData.onDataChange = (updatedData) => {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === newNodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    ...updatedData,
                  },
                };
              }
              return node;
            })
          );

          // If a file was uploaded and the node is a document ingestion node,
          // automatically trigger the upload to the backend
          if (updatedData.filename && 
              updatedData.fileContent && 
              nodeData.ragType === 'document' && 
              !updatedData.uploaded && 
              !updatedData.uploading) {
            
            handleFileUpload(newNodeId, updatedData);
          }
        };
      }

      // Create the new node
      const newNode = {
        id: newNodeId,
        type,
        position,
        data: nodeData,
      };

      // Add the new node to the flow
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle file upload for RAG nodes
  const handleFileUpload = async (nodeId, nodeData) => {
    // Mark the node as uploading
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              uploading: true,
            },
          };
        }
        return node;
      })
    );

    try {
      // Create a File object from the nodeData
      const fileContent = nodeData.fileContent || '';
      const file = new File([fileContent], nodeData.filename, { type: 'text/plain' });
      
      // Upload to backend
      const response = await RAGService.uploadDocument(file, {
        chunkSize: nodeData.chunkSize || 1000,
        chunkOverlap: nodeData.chunkOverlap || 200,
        description: nodeData.description || ''
      });
      
      // Update node data with upload success
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                uploading: false,
                uploaded: true,
                uploadError: null,
                documentId: response.id,
              },
            };
          }
          return node;
        })
      );

      // Show success notification
      setNotification({
        open: true,
        message: `File "${nodeData.filename}" uploaded successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Update node data with upload error
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                uploading: false,
                uploaded: false,
                uploadError: error.message || 'Failed to upload file',
              },
            };
          }
          return node;
        })
      );

      // Show error notification
      setNotification({
        open: true,
        message: `Error uploading file: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // For RAG nodes, call the onDataChange function if it exists
            if (node.type === 'rag' && node.data.onDataChange) {
              node.data.onDataChange(newData);
            }
            
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSave = useCallback(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (reactFlowInstance) {
        const flow = reactFlowInstance.toObject();
        console.log('Workflow saved:', flow);
        
        setSnackbar({
          open: true,
          message: 'Workflow saved successfully',
          severity: 'success'
        });
      }
      setLoading(false);
    }, 1000);
  }, [reactFlowInstance]);

  const handleTest = useCallback(() => {
    setTestChatOpen(true);
  }, []);

  const handleCloseTestChat = () => {
    setTestChatOpen(false);
  };

  const handleDeploy = useCallback(() => {
    setSnackbar({
      open: true,
      message: 'Workflow deployed successfully',
      severity: 'success'
    });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: 'calc(100vh - 64px)',
      backgroundColor: isDarkMode ? theme.palette.background.default : '#f5f5f5'
    }}>
      {/* Left Sidebar - Node Types */}
      <Box sx={{ 
        width: 250, 
        height: '100%',
        overflow: 'hidden',
        borderRight: `1px solid ${theme.palette.divider}`
      }}>
        <NodeSidebar />
      </Box>

      {/* Main Flow Area */}
      <Box sx={{ 
        flexGrow: 1,
        height: '100%',
        position: 'relative'
      }}>
        <ReactFlowProvider>
          <Box
            ref={reactFlowWrapper}
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              snapToGrid
              snapGrid={[15, 15]}
            >
              <Background
                color={isDarkMode ? '#333' : '#aaa'}
                gap={16}
                size={1}
                variant="dots"
              />
              <Controls />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === 'trigger') return theme.palette.node.trigger;
                  if (n.type === 'llm') return theme.palette.node.llm;
                  if (n.type === 'tool') return theme.palette.node.tool;
                  if (n.type === 'logic') return theme.palette.node.logic;
                  if (n.type === 'output') return theme.palette.node.output;
                  if (n.type === 'rag') return theme.palette.node.rag;
                  return '#eee';
                }}
                nodeColor={(n) => {
                  if (n.type === 'trigger') return theme.palette.node.background.trigger;
                  if (n.type === 'llm') return theme.palette.node.background.llm;
                  if (n.type === 'tool') return theme.palette.node.background.tool;
                  if (n.type === 'logic') return theme.palette.node.background.logic;
                  if (n.type === 'output') return theme.palette.node.background.output;
                  if (n.type === 'rag') return theme.palette.node.background.rag;
                  return '#fff';
                }}
                maskColor={isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)'}
              />
              <Panel position="top-right">
                <Paper
                  elevation={2}
                  sx={{
                    p: 1,
                    display: 'flex',
                    gap: 1,
                    backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    size="small"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleTest}
                    size="small"
                  >
                    Test
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PublishIcon />}
                    onClick={handleDeploy}
                    size="small"
                  >
                    Deploy
                  </Button>
                </Paper>
              </Panel>
            </ReactFlow>
          </Box>
        </ReactFlowProvider>
      </Box>

      {/* Right Sidebar - Node Properties */}
      <Box sx={{ 
        width: 300,
        height: '100%',
        overflow: 'hidden',
        borderLeft: `1px solid ${theme.palette.divider}`
      }}>
        <NodeProperties selectedNode={selectedNode} updateNodeData={updateNodeData} />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Test Chat Interface */}
      <TestChatInterface
        open={testChatOpen}
        onClose={handleCloseTestChat}
        workflowId={workflowId || 'temp-workflow'}
        workflowName={workflowName}
      />
    </Box>
  );
};

export default WorkflowEditor;
