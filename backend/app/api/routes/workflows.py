from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.models.database import get_db
from app.models.workflow import Workflow as WorkflowModel
from app.schemas.workflow import Workflow, WorkflowCreate, WorkflowUpdate
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()

@router.post("/", response_model=Workflow, status_code=status.HTTP_201_CREATED)
def create_workflow(workflow: WorkflowCreate, db: Session = Depends(get_db)):
    """Create a new workflow"""
    db_workflow = WorkflowModel(
        name=workflow.name,
        description=workflow.description,
        nodes=workflow.dict().get("nodes"),
        edges=workflow.dict().get("edges"),
        is_active=False
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.get("/", response_model=List[Workflow])
def read_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workflows"""
    workflows = db.query(WorkflowModel).offset(skip).limit(limit).all()
    return workflows

@router.get("/{workflow_id}", response_model=Workflow)
def read_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Get a specific workflow by ID"""
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.put("/{workflow_id}", response_model=Workflow)
def update_workflow(workflow_id: int, workflow: WorkflowUpdate, db: Session = Depends(get_db)):
    """Update a workflow"""
    db_workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    update_data = workflow.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_workflow, key, value)
    
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Delete a workflow"""
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return {"ok": True}

class TestWorkflowInput(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

@router.post("/{workflow_id}/test", status_code=status.HTTP_200_OK)
def test_workflow(workflow_id: int, input_data: TestWorkflowInput, db: Session = Depends(get_db)):
    """Test a workflow with a chat message"""
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    engine = WorkflowEngine()
    
    # Create input data with message and context
    workflow_input = {
        "message": input_data.message,
        "channel": "test_channel",
        "user": "test_user",
        "is_test": True
    }
    
    # Add any additional context if provided
    if input_data.context:
        workflow_input.update(input_data.context)
    
    # Execute the workflow
    result = engine.execute_workflow(workflow, workflow_input, is_test=True)
    
    # Return the response in a format suitable for the chat interface
    return {
        "response": result.get("response", "No response generated"),
        "metadata": {
            "workflow_id": workflow_id,
            "execution_time": result.get("execution_time", 0),
            "node_count": len(workflow.nodes) if workflow.nodes else 0
        }
    }

@router.post("/{workflow_id}/deploy", response_model=Workflow)
def deploy_workflow(workflow_id: int, db: Session = Depends(get_db)):
    """Deploy a workflow to make it active"""
    workflow = db.query(WorkflowModel).filter(WorkflowModel.id == workflow_id).first()
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Set all other workflows to inactive
    db.query(WorkflowModel).filter(WorkflowModel.is_active == True).update({"is_active": False})
    
    # Set this workflow to active
    workflow.is_active = True
    db.commit()
    db.refresh(workflow)
    
    return workflow
