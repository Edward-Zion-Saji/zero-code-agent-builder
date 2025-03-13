import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const TriggerNode = ({ data, isConnectable }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        border: `2px solid ${isDarkMode ? theme.palette.node.trigger : '#d32f2f'}`,
        borderRadius: '8px',
        padding: '12px',
        background: isDarkMode ? theme.palette.node.background.trigger : '#ffebee',
        width: '220px',
        boxShadow: isDarkMode ? '0 4px 8px rgba(0,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
        color: isDarkMode ? theme.palette.text.primary : '#333',
        fontFamily: theme.typography.fontFamily,
      }}
    >
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
        <NotificationsIcon sx={{ mr: 1, color: isDarkMode ? theme.palette.node.trigger : '#d32f2f' }} />
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {data.label}
        </Typography>
      </Box>
      
      <Tooltip title={data.description || 'Trigger node'}>
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
          {data.triggerType ? `Type: ${data.triggerType}` : 'Trigger type not set'}
        </Typography>
      </Tooltip>
      
      {data.pattern && (
        <Tooltip title={`Pattern: ${data.pattern}`}>
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
            {`Pattern: ${data.pattern.length > 20 
              ? `${data.pattern.substring(0, 20)}...` 
              : data.pattern}`}
          </Typography>
        </Tooltip>
      )}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {data.channelType && (
          <Chip 
            label={`Channel: ${data.channelType}`} 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              color: isDarkMode ? theme.palette.text.primary : 'inherit',
            }} 
          />
        )}
        
        {data.schedule && (
          <Chip 
            label={`Schedule: ${data.schedule}`} 
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

export default memo(TriggerNode);
