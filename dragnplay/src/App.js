import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // State for AI Agent Builder
  const [view, setView] = useState('agentList'); // 'agentList' or 'agentBuilder'
  const [activeSection, setActiveSection] = useState('llm');
  const [temperature, setTemperature] = useState(0.7);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data for AI Agent Builder
  const knowledgeSources = [
    { id: 'docs', name: 'Document Collection', icon: 'file-text' },
    { id: 'web', name: 'Web Pages', icon: 'globe' },
    { id: 'qa', name: 'Q&A Pairs', icon: 'message-square' }
  ];

  const tools = [
    { id: 'search', name: 'Web Search', icon: 'search' },
    { id: 'calendar', name: 'Calendar', icon: 'calendar' },
    { id: 'email', name: 'Email', icon: 'mail' },
    { id: 'chat', name: 'Chat Interface', icon: 'message-circle' }
  ];

  // State management for AI Agent Builder
  const [state, setState] = useState({
    selectedKnowledge: [],
    selectedTools: [],
    agents: [
      { id: 1, name: 'Customer Support Bot', type: 'support', status: 'active' },
      { id: 2, name: 'Data Analysis Agent', type: 'analysis', status: 'active' },
      { id: 3, name: 'Calendar Assistant', type: 'scheduling', status: 'inactive' }
    ],
    agentName: '',
    agentDescription: '',
    llmModel: 'gpt4',
    maxTokens: 2000
  });

  useEffect(() => {
    // Load Lucide icons script when component mounts
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.359.0/lucide.min.js';
    script.async = true;
    script.onload = () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Re-render icons when view changes
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [view, activeSection, state]);

  const showAgentBuilder = () => {
    setView('agentBuilder');
  };

  const showAgentList = () => {
    setView('agentList');
  };

  const switchSection = (section) => {
    setActiveSection(section);
  };

  const addKnowledgeSource = (sourceId) => {
    if (!state.selectedKnowledge.includes(sourceId)) {
      setState({
        ...state,
        selectedKnowledge: [...state.selectedKnowledge, sourceId]
      });
    }
  };

  const addTool = (toolId) => {
    if (!state.selectedTools.includes(toolId)) {
      setState({
        ...state,
        selectedTools: [...state.selectedTools, toolId]
      });
    }
  };

  const removeComponent = (type, id) => {
    if (type === 'knowledge') {
      setState({
        ...state,
        selectedKnowledge: state.selectedKnowledge.filter(k => k !== id)
      });
    } else {
      setState({
        ...state,
        selectedTools: state.selectedTools.filter(t => t !== id)
      });
    }
  };

  const saveAgent = () => {
    if (!state.agentName || !state.agentDescription) {
      alert('Please fill in all required fields');
      return;
    }

    const newAgent = {
      id: state.agents.length + 1,
      name: state.agentName,
      description: state.agentDescription,
      type: 'custom',
      status: 'active',
      config: {
        model: state.llmModel,
        temperature,
        maxTokens: state.maxTokens,
        knowledgeSources: state.selectedKnowledge,
        tools: state.selectedTools
      }
    };

    setState({
      ...state,
      agents: [...state.agents, newAgent],
      selectedKnowledge: [],
      selectedTools: [],
      agentName: '',
      agentDescription: ''
    });

    alert('Agent saved successfully!');
    showAgentList();
  };

  const editAgent = (agentId) => {
    const agent = state.agents.find(a => a.id === agentId);
    if (agent) {
      setState({
        ...state,
        agentName: agent.name,
        agentDescription: agent.description || '',
        llmModel: agent.config?.model || 'gpt4',
        maxTokens: agent.config?.maxTokens || 2000,
        selectedKnowledge: agent.config?.knowledgeSources || [],
        selectedTools: agent.config?.tools || []
      });
      setTemperature(agent.config?.temperature || 0.7);
      showAgentBuilder();
    }
  };

  const toggleAgentStatus = (agentId) => {
    setState({
      ...state,
      agents: state.agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' } 
          : agent
      )
    });
  };

  const filteredAgents = state.agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      {/* Header Section */}
      <header className="header">
        <div className="logo">DndKit</div>
        <nav>
          <ul className="nav-links">
            <li><a href="https://github.com/dndkit">GitHub</a></li>
            <li><a href="/documentation">Documentation</a></li>
            <li><a href="#" onClick={() => setView('agentList')}>AI Agents</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to DndKit</h1>
        <p>The ultimate drag-and-drop toolkit for modern web applications.</p>
        <button className="cta-button">Get Started</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <div className="feature-cards">
          <div className="feature">
            <h3>Easy to Use</h3>
            <p>Intuitive API that makes drag-and-drop functionality a breeze.</p>
          </div>
          <div className="feature">
            <h3>Customizable</h3>
            <p>Fully customizable components to fit your design needs.</p>
          </div>
          <div className="feature">
            <h3>Responsive</h3>
            <p>Works seamlessly on all devices, ensuring a great user experience.</p>
          </div>
        </div>
      </section>

      {/* Drag & Drop Section */}
      <section className="drag-drop-section">
        <h2 className="section-title">Try It Out!</h2>
        <div className="drag-drop-area">
          <h2>Drag and Drop</h2>
          <p>Drag and drop your items here!</p>
          {/* Implement your drag-and-drop functionality here */}
        </div>
      </section>

      {/* AI Agent Builder Section */}
      <section className="ai-agent-builder">
        <div className="agent-builder-container">
          <div className="sidebar">
            <button className="new-agent-btn" onClick={showAgentBuilder}>
              <i data-lucide="plus-circle"></i>
              <span>New Agent</span>
            </button>
            
            <div style={{ marginTop: '1.5rem' }}>
              <div className={`menu-item ${view === 'agentList' ? 'active' : ''}`} onClick={showAgentList}>
                <i data-lucide="bot"></i>
                <span>My Agents</span>
              </div>
              <div className="menu-item">
                <i data-lucide="database"></i>
                <span>Knowledge Base</span>
              </div>
              <div className="menu-item">
                <i data-lucide="settings"></i>
                <span>Settings</span>
              </div>
            </div>
          </div>

          <div className="content-area">
            {/* Agent List View */}
            {view === 'agentList' && (
              <div>
                <div className="content-header">
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Agents</h1>
                  <div className="search-bar">
                    <i data-lucide="search"></i>
                    <input 
                      type="text" 
                      placeholder="Search agents..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="agent-list">
                  {filteredAgents.map(agent => (
                    <div className="card" key={agent.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: '600' }}>{agent.name}</h3>
                        <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                      </div>
                      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Type: {agent.type}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="edit-btn" onClick={() => editAgent(agent.id)}>
                          <i data-lucide="edit"></i>
                          Edit
                        </button>
                        <button className="toggle-btn" onClick={() => toggleAgentStatus(agent.id)}>
                          {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Builder View */}
            {view === 'agentBuilder' && (
              <div>
                <div className="content-header">
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create New Agent</h1>
                  <button className="save-btn" onClick={saveAgent}>
                    <i data-lucide="save"></i>
                    <span>Save Agent</span>
                  </button>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Agent Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter agent name"
                      value={state.agentName}
                      onChange={(e) => setState({ ...state, agentName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      placeholder="Describe what this agent does" 
                      rows="3"
                      value={state.agentDescription}
                      onChange={(e) => setState({ ...state, agentDescription: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="section-tabs">
                  <div 
                    className={`tab ${activeSection === 'llm' ? 'active' : ''}`} 
                    onClick={() => switchSection('llm')}
                  >
                    <i data-lucide="cpu"></i>
                    <span>LLM Settings</span>
                  </div>
                  <div 
                    className={`tab ${activeSection === 'knowledge' ? 'active' : ''}`} 
                    onClick={() => switchSection('knowledge')}
                  >
                    <i data-lucide="database"></i>
                    <span>Knowledge Sources</span>
                  </div>
                  <div 
                    className={`tab ${activeSection === 'tools' ? 'active' : ''}`} 
                    onClick={() => switchSection('tools')}
                  >
                    <i data-lucide="tool"></i>
                    <span>Tools & Actions</span>
                  </div>
                </div>

                <div className="builder-grid">
                  {/* LLM Settings Section */}
                  {activeSection === 'llm' && (
                    <div className="card">
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>LLM Configuration</h2>
                      <div className="form-group">
                        <label>Model</label>
                        <select 
                          value={state.llmModel}
                          onChange={(e) => setState({ ...state, llmModel: e.target.value })}
                        >
                          <option value="gpt4">GPT-4</option>
                          <option value="gpt35">GPT-3.5 Turbo</option>
                          <option value="claude">Claude 2</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Temperature</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        />
                        <span>{temperature}</span>
                      </div>
                      <div className="form-group">
                        <label>Max Tokens</label>
                        <input 
                          type="number" 
                          value={state.maxTokens}
                          onChange={(e) => setState({ ...state, maxTokens: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Knowledge Sources Section */}
                  {activeSection === 'knowledge' && (
                    <div className="card">
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Available Sources</h2>
                      <div className="component-list">
                        {knowledgeSources.map(source => (
                          <div className="component-item" key={source.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <i data-lucide={source.icon}></i>
                              <span>{source.name}</span>
                            </div>
                            <button className="add-btn" onClick={() => addKnowledgeSource(source.id)}>
                              <i data-lucide="plus"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools Section */}
                  {activeSection === 'tools' && (
                    <div className="card">
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Available Tools</h2>
                      <div className="component-list">
                        {tools.map(tool => (
                          <div className="component-item" key={tool.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <i data-lucide={tool.icon}></i>
                              <span>{tool.name}</span>
                            </div>
                            <button className="add-btn" onClick={() => addTool(tool.id)}>
                              <i data-lucide="plus"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Components */}
                  <div className="card selected-components">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Selected Components</h2>
                    <div>
                      {state.selectedKnowledge.length === 0 && state.selectedTools.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>No components selected</p>
                      ) : (
                        <>
                          {state.selectedKnowledge.map(k => {
                            const source = knowledgeSources.find(s => s.id === k);
                            return (
                              <div className="component-item" key={k}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <i data-lucide={source.icon}></i>
                                  <span>{source.name}</span>
                                </div>
                                <button className="remove-btn" onClick={() => removeComponent('knowledge', k)}>
                                  <i data-lucide="x"></i>
                                </button>
                              </div>
                            );
                          })}
                          {state.selectedTools.map(t => {
                            const tool = tools.find(tool => tool.id === t);
                            return (
                              <div className="component-item" key={t}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <i data-lucide={tool.icon}></i>
                                  <span>{tool.name}</span>
                                </div>
                                <button className="remove-btn" onClick={() => removeComponent('tool', t)}>
                                  <i data-lucide="x"></i>
                                </button>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;