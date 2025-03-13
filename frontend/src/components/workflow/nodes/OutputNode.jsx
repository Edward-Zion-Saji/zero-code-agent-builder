import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const OutputNode = ({ data, isConnectable }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        border: `2px solid ${isDarkMode ? theme.palette.node.output : '#f57c00'}`,
        borderRadius: '8px',
        padding: '12px',
        background: isDarkMode ? theme.palette.node.background.output : '#fff3e0',
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SendIcon sx={{ mr: 1, color: isDarkMode ? theme.palette.node.output : '#e65100' }} />
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {data.label}
        </Typography>
      </Box>
      
      <Tooltip title={data.description || 'Output node'}>
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
          {data.messageType ? `Type: ${data.messageType}` : 'Output type not set'}
        </Typography>
      </Tooltip>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {data.channel && (
          <Chip 
            label={`Channel: ${data.channel}`} 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: isDarkMode ? theme.palette.text.primary : 'inherit',
            }} 
          />
        )}
        
        {data.text && (
          <Tooltip title={data.text}>
            <Chip 
              label={`Text: ${data.text.length > 15 ? data.text.substring(0, 15) + '...' : data.text}`} 
              size="small" 
              sx={{ 
                height: '20px',
                fontSize: '0.7rem',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: isDarkMode ? theme.palette.text.primary : 'inherit',
              }} 
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default memo(OutputNode);
