from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database import Base
from app.models.workflow import Workflow, SlackIntegration, Execution, ExecutionStep
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

def init_db():
    """Initialize the database with tables"""
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)
    print(f"Database initialized at {DATABASE_URL}")
    return engine

def create_sample_workflow(engine):
    """Create a sample customer support workflow for testing"""
    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if we already have workflows
    existing_workflows = db.query(Workflow).all()
    if existing_workflows:
        print(f"Database already has {len(existing_workflows)} workflows. Skipping sample creation.")
        db.close()
        return
    
    # Sample nodes for a customer support workflow
    nodes = [
        {
            "id": "trigger-1",
            "type": "triggerNode",
            "position": {"x": 100, "y": 100},
            "data": {
                "label": "Message Trigger",
                "triggerType": "message",
                "description": "Triggered when a user sends a message"
            }
        },
        {
            "id": "llm-1",
            "type": "llmNode",
            "position": {"x": 100, "y": 250},
            "data": {
                "label": "Intent Classifier",
                "model": "gpt-3.5-turbo",
                "prompt": "Classify the user message into one of these categories: product_question, service_question, order_status, complaint, other. Return only the category name.",
                "temperature": 0.3
            }
        },
        {
            "id": "logic-1",
            "type": "logicNode",
            "position": {"x": 100, "y": 400},
            "data": {
                "label": "Route by Intent",
                "conditions": [
                    {"condition": "input.intent == 'product_question'", "target": "output-1"},
                    {"condition": "input.intent == 'service_question'", "target": "output-1"},
                    {"condition": "input.intent == 'order_status'", "target": "output-2"},
                    {"condition": "input.intent == 'complaint'", "target": "output-3"},
                    {"condition": "true", "target": "output-4"}
                ]
            }
        },
        {
            "id": "output-1",
            "type": "outputNode",
            "position": {"x": 400, "y": 200},
            "data": {
                "label": "Product/Service Response",
                "responseTemplate": "Thank you for your question about our products/services. Here's what I can tell you: {{response}}"
            }
        },
        {
            "id": "output-2",
            "type": "outputNode",
            "position": {"x": 400, "y": 350},
            "data": {
                "label": "Order Status Response",
                "responseTemplate": "Your order status is: {{status}}. It was last updated on {{date}}."
            }
        },
        {
            "id": "output-3",
            "type": "outputNode",
            "position": {"x": 400, "y": 500},
            "data": {
                "label": "Complaint Response",
                "responseTemplate": "I'm sorry to hear about your issue. We've created ticket #{{ticket_id}} and a support agent will contact you shortly."
            }
        },
        {
            "id": "output-4",
            "type": "outputNode",
            "position": {"x": 400, "y": 650},
            "data": {
                "label": "Default Response",
                "responseTemplate": "I'm here to help with product questions, service inquiries, order status, and complaints. How can I assist you today?"
            }
        }
    ]
    
    # Sample edges connecting the nodes
    edges = [
        {"id": "e1-2", "source": "trigger-1", "target": "llm-1"},
        {"id": "e2-3", "source": "llm-1", "target": "logic-1"},
        {"id": "e3-4", "source": "logic-1", "target": "output-1", "label": "Product/Service"},
        {"id": "e3-5", "source": "logic-1", "target": "output-2", "label": "Order Status"},
        {"id": "e3-6", "source": "logic-1", "target": "output-3", "label": "Complaint"},
        {"id": "e3-7", "source": "logic-1", "target": "output-4", "label": "Default"}
    ]
    
    # Create the workflow
    workflow = Workflow(
        name="Customer Support Agent",
        description="A sample workflow for handling customer support inquiries",
        nodes=nodes,
        edges=edges,
        is_active=True
    )
    
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    
    print(f"Created sample workflow: {workflow.name} (ID: {workflow.id})")
    db.close()

if __name__ == "__main__":
    engine = init_db()
    create_sample_workflow(engine)
