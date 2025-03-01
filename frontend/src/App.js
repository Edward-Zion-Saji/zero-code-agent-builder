import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    data: { label: "Node 1" },
    style: { background: "blue", color: "white", padding: 10 },
    draggable: true, // Ensure nodes are draggable
  },
  {
    id: "2",
    position: { x: 250, y: 200 },
    data: { label: "Node 2" },
    style: { background: "blue", color: "white", padding: 10 },
    draggable: true, // Ensure nodes are draggable
  },
];

const initialEdges = [];

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nodeId, setNodeId] = useState(3); // Start from 3 since 1 & 2 exist

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = () => {
    const newNode = {
      id: `${nodeId}`,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `Node ${nodeId}` },
      style: { background: "blue", color: "white", padding: 10 },
      draggable: true, // Ensure new nodes are draggable
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId((prev) => prev + 1);
  };

  const deleteNode = () => {
    if (nodes.length > 0) {
      setNodes((nds) => nds.slice(0, -1));
    }
  };

  const onNodeDragStop = (event, node) => {
    console.log('Node dragged:', node);
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  };

  return (
    <div className="app-container">
      <h2>React Flow - Draggable Nodes</h2>

      {/* Buttons to add and delete nodes */}
      <div className="buttons">
        <button onClick={addNode}>Add Node</button>
        <button onClick={deleteNode}>Delete Node</button>
      </div>

      <div className="main-container">
        {/* Left Side Overview Panel */}
        <div className="overview-panel">
          <h3>Overview Panel</h3>
          <p>This is where you can see an overview of your flow.</p>
          <button className="deploy-button">Deploy</button>
        </div>

        {/* React Flow Canvas */}
        <div className="flow-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default App;
