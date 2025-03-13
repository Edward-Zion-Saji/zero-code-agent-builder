import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Box
} from '@mui/material';
import Header from './components/layout/Header';
import WorkflowEditor from './components/workflow/WorkflowEditor';
import SlackIntegration from './components/slack/SlackIntegration';
import './styles/index.css';

function App() {
  // State for theme mode (light/dark)
  const [mode, setMode] = useState('dark');

  // Create theme based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: {
                  main: '#1976d2',
                },
                secondary: {
                  main: '#f50057',
                },
                background: {
                  default: '#f5f5f5',
                  paper: '#ffffff',
                },
                node: {
                  trigger: '#d32f2f',
                  llm: '#66bb6a',
                  tool: '#5c6bc0',
                  logic: '#9c27b0',
                  output: '#f57c00',
                  rag: '#0277bd',
                  background: {
                    trigger: '#ffebee',
                    llm: '#c8e6c9',
                    tool: '#e8eaf6',
                    logic: '#f3e5f5',
                    output: '#fff3e0',
                    rag: '#e1f5fe'
                  }
                }
              }
            : {
                // Dark mode palette
                primary: {
                  main: '#90caf9',
                },
                secondary: {
                  main: '#f48fb1',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                node: {
                  trigger: '#ef5350',
                  llm: '#4caf50',
                  tool: '#5c6bc0',
                  logic: '#ab47bc',
                  output: '#ff9800',
                  rag: '#1976d2',
                  background: {
                    trigger: '#2c1c1c',
                    llm: '#1c2c1c',
                    tool: '#1c1c2c',
                    logic: '#2c1c2c',
                    output: '#2c2c1c',
                    rag: '#1a2a42'
                  }
                }
              }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: mode === 'dark' ? '#555' : '#bbb',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: mode === 'dark' ? '#777' : '#999',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
              },
            },
          },
          MuiAccordion: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '8px 0',
                },
              },
            },
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 600,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [mode]
  );

  // Toggle theme mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header toggleTheme={toggleTheme} mode={mode} />
          <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Routes>
              <Route path="/" element={<WorkflowEditor />} />
              <Route path="/slack" element={<SlackIntegration />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
