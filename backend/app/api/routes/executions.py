from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database import get_db
from app.models.workflow import Execution as ExecutionModel, ExecutionStep as ExecutionStepModel
from app.schemas.workflow import Execution, ExecutionCreate, ExecutionStep
from app.services.workflow_engine import WorkflowEngine

router = APIRouter()
workflow_engine = WorkflowEngine()

@router.post("/", response_model=Execution, status_code=status.HTTP_201_CREATED)
async def create_execution(execution: ExecutionCreate, db: Session = Depends(get_db)):
    """Create a new workflow execution"""
    # Create the execution record
    db_execution = ExecutionModel(
        workflow_id=execution.workflow_id,
        trigger_type=execution.trigger_type,
        input_data=execution.input_data,
        status="pending"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    
    # Start the execution in the background
    # In a production system, this would be handled by a task queue like Celery
    try:
        await workflow_engine.execute_workflow_async(db_execution.id, db)
    except Exception as e:
        # Update execution status to failed
        db_execution.status = "failed"
        db_execution.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing workflow: {str(e)}"
        )
    
    return db_execution

@router.get("/", response_model=List[Execution])
def get_executions(
    workflow_id: int = None, 
    status: str = None, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get workflow executions with optional filtering"""
    query = db.query(ExecutionModel)
    
    if workflow_id:
        query = query.filter(ExecutionModel.workflow_id == workflow_id)
    
    if status:
        query = query.filter(ExecutionModel.status == status)
    
    executions = query.order_by(ExecutionModel.started_at.desc()).offset(skip).limit(limit).all()
    return executions

@router.get("/{execution_id}", response_model=Execution)
def get_execution(execution_id: int, db: Session = Depends(get_db)):
    """Get a specific execution by ID"""
    execution = db.query(ExecutionModel).filter(ExecutionModel.id == execution_id).first()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    return execution

@router.get("/{execution_id}/steps", response_model=List[ExecutionStep])
def get_execution_steps(execution_id: int, db: Session = Depends(get_db)):
    """Get all steps for a specific execution"""
    steps = db.query(ExecutionStepModel).filter(
        ExecutionStepModel.execution_id == execution_id
    ).order_by(ExecutionStepModel.started_at).all()
    
    return steps

@router.post("/{execution_id}/cancel", response_model=Execution)
def cancel_execution(execution_id: int, db: Session = Depends(get_db)):
    """Cancel a running execution"""
    execution = db.query(ExecutionModel).filter(ExecutionModel.id == execution_id).first()
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    if execution.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel execution with status: {execution.status}"
        )
    
    # Update execution status
    execution.status = "cancelled"
    db.commit()
    db.refresh(execution)
    
    return execution
