import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography, Tooltip, Chip, useTheme } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const LogicNode = ({ data, isConnectable }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <Box
      sx={{
        border: `2px solid ${isDarkMode ? theme.palette.node.logic : '#9c27b0'}`,
        borderRadius: '8px',
        padding: '12px',
        background: isDarkMode ? theme.palette.node.background.logic : '#f3e5f5',
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
      
      {data.label === 'Condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output-true"
            style={{ 
              background: isDarkMode ? '#aaa' : '#555', 
              width: '8px', 
              height: '8px',
              border: isDarkMode ? '1px solid #555' : '1px solid #333',
              top: '35%'
            }}
            isConnectable={isConnectable}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="output-false"
            style={{ 
              background: isDarkMode ? '#aaa' : '#555', 
              width: '8px', 
              height: '8px',
              border: isDarkMode ? '1px solid #555' : '1px solid #333',
              top: '65%'
            }}
            isConnectable={isConnectable}
          />
        </>
      )}
      
      {data.label === 'Code Execution' && (
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
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccountTreeIcon sx={{ mr: 1, color: isDarkMode ? theme.palette.node.logic : '#7b1fa2' }} />
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {data.label}
        </Typography>
      </Box>
      
      <Tooltip title={data.description || 'Logic node'}>
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
          {data.logicType ? `Type: ${data.logicType}` : 'Logic type not set'}
        </Typography>
      </Tooltip>
      
      {data.condition && (
        <Tooltip title={data.condition}>
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
            {`Condition: ${data.condition.length > 20 
              ? `${data.condition.substring(0, 20)}...` 
              : data.condition}`}
          </Typography>
        </Tooltip>
      )}
      
      {data.label === 'Condition' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip 
            label="True →" 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
              color: isDarkMode ? '#81c784' : '#2e7d32',
            }} 
          />
          
          <Chip 
            label="False →" 
            size="small" 
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
              color: isDarkMode ? '#e57373' : '#d32f2f',
            }} 
          />
        </Box>
      )}
      
      {data.label === 'Code Execution' && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
          Language: {data.language || 'Not set'}
        </Typography>
      )}
    </Box>
  );
};

export default memo(LogicNode);
