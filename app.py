import os
import logging
import sys
from dotenv import load_dotenv
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from utils import setup_logger, validate_env_vars
from slack_handler import SlackHandler

# Load environment variables
load_dotenv()

# Configure logging - set to DEBUG for more detailed logs
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    # Validate environment variables
    try:
        validate_env_vars()
        logger.info(f"Environment variables validated successfully")
        logger.info(f"SLACK_BOT_TOKEN: {os.environ.get('SLACK_BOT_TOKEN')[:5]}...{os.environ.get('SLACK_BOT_TOKEN')[-5:]}")
        logger.info(f"SLACK_APP_TOKEN: {os.environ.get('SLACK_APP_TOKEN')[:5]}...{os.environ.get('SLACK_APP_TOKEN')[-5:]}")
    except EnvironmentError as e:
        logger.error(str(e))
        return
    
    # Initialize the Slack app with more detailed logging
    try:
        app = App(token=os.environ.get("SLACK_BOT_TOKEN"), logger=logger)
        logger.info("Slack App initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Slack App: {e}")
        return
    
    # Print bot info to verify connection
    try:
        auth_test = app.client.auth_test()
        logger.info(f"Bot connected as: {auth_test['bot_id']} with name: {auth_test.get('user')}")
        logger.info(f"Team: {auth_test.get('team')}")
        logger.info(f"User ID: {auth_test.get('user_id')}")
    except Exception as e:
        logger.error(f"Error connecting to Slack: {e}")
        logger.error("Please check your SLACK_BOT_TOKEN and make sure it has the correct scopes")
        return
    
    # Initialize the Slack handler
    try:
        slack_handler = SlackHandler(app)
        logger.info("SlackHandler initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize SlackHandler: {e}")
        return
    
    # Start the app using Socket Mode
    try:
        handler = SocketModeHandler(app, os.environ["SLACK_APP_TOKEN"])
        logger.info("SocketModeHandler initialized successfully")
        logger.info("⚡️ LangChain Slackbot is running!")
        handler.start()
    except Exception as e:
        logger.error(f"Error starting SocketModeHandler: {e}")
        logger.error("Please check your SLACK_APP_TOKEN and make sure it has the correct scopes")
        return

if __name__ == "__main__":
    main()
