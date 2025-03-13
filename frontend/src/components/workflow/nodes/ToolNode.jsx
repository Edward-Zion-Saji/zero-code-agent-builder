import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

const ToolNode = ({ data, isConnectable }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        border: `2px solid ${isDarkMode ? theme.palette.node.tool : '#5c6bc0'}`,
        borderRadius: '8px',
        padding: '12px',
        background: isDarkMode ? theme.palette.node.background.tool : '#e8eaf6',
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
        <BuildIcon sx={{ mr: 1, color: isDarkMode ? theme.palette.node.tool : '#3949ab' }} />
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {data.label}
        </Typography>
      </Box>
      
      <Tooltip title={data.description || 'Tool node'}>
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
          {data.toolType ? `Type: ${data.toolType}` : 'Tool type not set'}
        </Typography>
      </Tooltip>
      
      {data.parameters && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {Object.entries(data.parameters).map(([key, value]) => (
            <Chip 
              key={key}
              label={`${key}: ${typeof value === 'string' && value.length > 10 
                ? `${value.substring(0, 10)}...` 
                : value}`} 
              size="small" 
              sx={{ 
                height: '20px',
                fontSize: '0.7rem',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: isDarkMode ? theme.palette.text.primary : 'inherit',
              }} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default memo(ToolNode);
