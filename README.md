# Slack Agent Builder

A no-code platform for building AI agents for Slack using a visual drag-and-drop interface. Create powerful LangChain-based agents that can interact with users in Slack without writing any code.

## Features

- **Visual Workflow Editor**: Drag and drop components to build your agent's logic
- **LLM Integration**: Connect to various language models like GPT-4, Claude, etc.
- **Slack Integration**: Deploy your agents directly to Slack workspaces
- **Tool Connectors**: Add capabilities like web search, database queries, and API calls
- **Logic Components**: Add conditional branching and custom code execution
- **Test Chat Interface**: Test your agents before deploying them to Slack

## Project Structure

- **Frontend**: React application with React Flow for the visual editor
  - Components for different node types (Trigger, LLM, Tool, Logic, Output)
  - Services for API communication and Slack integration
  - Material-UI for styling

- **Backend**: FastAPI application for:
  - Workflow management and execution
  - Slack integration (OAuth, events, messaging)
  - LangChain integration for agent execution
  - SQLite database for development (PostgreSQL for production)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+ (for backend)
- OpenAI API key (for LLM functionality)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd slack-agent/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file:
   ```
   DATABASE_URL=sqlite:///./app.db
   OPENAI_API_KEY=your_openai_api_key
   SECRET_KEY=your_secret_key
   SLACK_CLIENT_ID=your_slack_client_id
   SLACK_CLIENT_SECRET=your_slack_client_secret
   ```

6. Initialize the database:
   ```
   python init_db.py
   ```

7. Start the backend server:
   ```
   python -m uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd slack-agent/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Using the Platform

### Creating a Workflow

1. Click on "New Workflow" in the dashboard
2. Give your workflow a name and description
3. Use the visual editor to build your workflow:
   - Drag nodes from the sidebar onto the canvas
   - Connect nodes by dragging from one node's output to another node's input
   - Configure each node by clicking on it and adjusting its settings

### Testing Your Agent

1. After creating a workflow, click the "Test Agent" button in the header
2. A chat interface will appear where you can interact with your agent
3. Type messages to see how your agent responds based on the workflow you've created
4. The agent will process your message through the workflow nodes and return a response

### Deploying to Slack

1. Click on "Deploy to Slack" in the workflow editor
2. Authorize the application in your Slack workspace
3. Select the channels where you want the agent to be active
4. Click "Deploy" to make your agent live in Slack

## Development

### Adding New Node Types

1. Define the node type in `frontend/src/components/workflow/nodeTypes.js`
2. Create a component for the node in `frontend/src/components/workflow/nodes/`
3. Add the node's execution logic in the backend's workflow engine

### Extending Tool Connectors

1. Add the tool definition in the frontend
2. Implement the tool's backend logic in `backend/app/services/tools/`
3. Register the tool in the workflow engine

## Troubleshooting

### Common Issues

- **Backend Connection Error**: Ensure the backend server is running and the frontend `.env` file has the correct API URL
- **Database Errors**: Try re-initializing the database with `python init_db.py`
- **OpenAI API Errors**: Verify your API key is correct in the backend `.env` file
- **Node Execution Errors**: Check the backend logs for details on execution failures

