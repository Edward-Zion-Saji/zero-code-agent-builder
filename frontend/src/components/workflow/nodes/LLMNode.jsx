import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const LLMNode = ({ data, isConnectable }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        border: `2px solid ${isDarkMode ? theme.palette.node.llm : '#66bb6a'}`,
        borderRadius: '8px',
        padding: '12px',
        background: isDarkMode ? theme.palette.node.background.llm : '#c8e6c9',
        width: '220px',
        boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
        color: isDarkMode ? theme.palette.text.primary : '#333',
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ 
          background: isDarkMode ? '#aaa' : '#555', 
          width: '8px', 
          height: '8px',
          border: isDarkMode ? '1px solid #555' : '1px solid #333'
        }}
        isConnectable={isConnectable}
      />
      
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ 
          background: isDarkMode ? '#aaa' : '#555', 
          width: '8px', 
          height: '8px',
          border: isDarkMode ? '1px solid #555' : '1px solid #333'
        }}
        isConnectable={isConnectable}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SmartToyIcon sx={{ mr: 1, color: isDarkMode ? theme.palette.node.llm : '#2e7d32' }} />
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {data.label}
        </Typography>
      </Box>
      
      <Tooltip title={data.description || 'LLM node'}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8rem', 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {data.modelType ? `Model: ${data.modelType}` : 'Model not set'}
        </Typography>
      </Tooltip>
      
      {data.systemPrompt && (
        <Tooltip title={data.systemPrompt}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 1,
              opacity: 0.8
            }}
          >
            {data.systemPrompt.length > 30 
              ? `${data.systemPrompt.substring(0, 30)}...` 
              : data.systemPrompt}
          </Typography>
        </Tooltip>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {data.temperature !== undefined && (
          <Chip 
            label={`Temp: ${data.temperature || 0}`} 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: isDarkMode ? theme.palette.text.primary : 'inherit',
            }} 
          />
        )}
        
        {data.maxTokens && (
          <Chip 
            label={`Max: ${data.maxTokens}`} 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: isDarkMode ? theme.palette.text.primary : 'inherit',
            }} 
          />
        )}
      </Box>
    </Box>
  );
};

export default memo(LLMNode);
