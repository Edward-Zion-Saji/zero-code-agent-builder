# Slack Agent

This application provides a Slack bot with Google Calendar integration, allowing users to schedule meetings and view calendar events directly from Slack. The application consists of a backend Python service and a Flow Editor frontend for configuring the agent.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
   - [Slack Configuration](#slack-configuration)
   - [Google Calendar API Setup](#google-calendar-api-setup)
   - [OpenAI API Key](#openai-api-key)
   - [Pinecone Setup for RAG (Retrieval Augmented Generation)](#pinecone-setup-for-rag-retrieval-augmented-generation)
4. [Running the Application](#running-the-application)
5. [Using the Flow Editor](#using-the-flow-editor)
6. [Available Tools](#available-tools)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- pnpm (for the Flow Editor)
- A Slack workspace with admin privileges
- A Google Cloud account
- An OpenAI account

## Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone <repository-url>
   cd slack-new
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Flow Editor dependencies:
   ```bash
   cd app/flow-editor
   pnpm install
   ```

## Configuration

### Slack Configuration

1. Create a new Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Under "Basic Information", note your App ID, Client ID, and Client Secret
3. Enable Socket Mode in the "Socket Mode" section
4. Generate an App-Level Token with the `connections:write` scope
5. Under "OAuth & Permissions", add the following Bot Token Scopes:
   - `app_mentions:read`
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `im:history`
   - `im:read`
   - `im:write`
   - `users:read`
6. Install the app to your workspace
7. Copy the Bot User OAuth Token from the "OAuth & Permissions" section

Create a `.env` file in the `app` directory with the following variables:
```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
```

### Google Calendar API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API for your project
4. Configure the OAuth consent screen:
   - Set the user type to "External"
   - Add the necessary scopes for Google Calendar (`https://www.googleapis.com/auth/calendar`)
   - Add test users if needed
5. Create OAuth 2.0 credentials:
   - Application type: Desktop application
   - Download the credentials JSON file
   - Rename it to `credentials.json` and place it in the `app` directory

The first time you run the application, it will prompt you to authorize access to your Google Calendar. Follow the instructions to complete the OAuth flow and generate a `token.json` file.

### OpenAI API Key

1. Sign up for an OpenAI account at [platform.openai.com](https://platform.openai.com/)
2. Generate an API key in the API Keys section
3. Add the API key to your `.env` file:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

### Pinecone Setup for RAG (Retrieval Augmented Generation)

1. Create a Pinecone account at [pinecone.io](https://www.pinecone.io/)
2. Create a new index with the following settings:
   - Dimensions: 1536 (for OpenAI embeddings)
   - Metric: Cosine
   - Pod Type: p1.x1 (or choose based on your needs)
3. Get your API key from the Pinecone dashboard
4. Add the Pinecone credentials to your `.env` file:
   ```
   PINECONE_API_KEY=your-pinecone-api-key
   PINECONE_ENVIRONMENT=your-pinecone-environment
   PINECONE_INDEX=your-pinecone-index
   ```
5. To upload documents to your knowledge base, use the provided script:
   ```bash
   cd app
   python upload_to_pinecone.py --file path/to/your/document.pdf
   ```
   Supported file formats include PDF, DOCX, TXT, and more.

## Running the Application

1. Start the Flow Editor:
   ```bash
   cd app/flow-editor
   pnpm run dev
   ```
   The Flow Editor will be available at http://localhost:3000

2. In a separate terminal, start the Slack agent:
   ```bash
   cd app
   python app.py
   ```

## Using the Flow Editor

The Flow Editor provides a visual interface for configuring your Slack agent:

1. Open http://localhost:3000 in your browser
2. Use the sidebar to add or remove nodes
3. Configure the System Prompt to define your agent's personality
4. Select the LLM model to use (default: gpt-4)
5. Enable or disable tools in the Tools node
6. Configure RAG settings if needed
7. Click "Apply Changes" to update your agent configuration
8. Use the Chat sidebar to test your agent directly from the Flow Editor

## Available Tools

The Slack agent comes with several built-in tools:

1. **Google Calendar Create Meeting** - Schedule meetings with Google Meet integration
2. **Google Calendar View Events** - View upcoming events on your calendar
3. **Weather** - Get weather information for a location
4. **Wikipedia** - Search for information on Wikipedia
5. **DateTime** - Get the current date and time
6. **Knowledge Base Search (RAG)** - Search through your uploaded documents to answer questions based on your custom knowledge base

### Using RAG in Conversations

When you upload documents to Pinecone, the agent can use this information to answer questions. To use RAG in a conversation:

1. Upload your documents using the `upload_to_pinecone.py` script
2. Enable the RAG tool in the Flow Editor
3. Ask questions related to the content of your uploaded documents
4. The agent will automatically detect when to use RAG and retrieve relevant information from your knowledge base

The agent uses semantic search to find the most relevant passages in your documents and provides answers based on this information, citing the source when possible.

## Troubleshooting

### Common Issues

1. **Slack connection issues**:
   - Verify that your Slack tokens are correct
   - Ensure the app is installed to your workspace
   - Check that all required scopes are enabled

2. **Google Calendar authentication errors**:
   - Delete `token.json` and re-authenticate
   - Verify that the Google Calendar API is enabled
   - Check that your OAuth credentials are correct

3. **Tool not working**:
   - Ensure the tool is enabled in the Flow Editor
   - Check the logs for any error messages
   - Verify that all required credentials are set up

### Logs

- Application logs are stored in `app.log`
- Check the logs for detailed error messages and debugging information
