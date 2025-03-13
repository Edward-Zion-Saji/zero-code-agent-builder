from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import List, Optional
from app.schemas.rag import DocumentCreate, DocumentResponse, QueryRequest, QueryResponse
from app.services.rag_service import RAGService
import os
import uuid
import shutil

router = APIRouter()
rag_service = RAGService()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    chunk_size: int = Form(1000),
    chunk_overlap: int = Form(200),
    description: Optional[str] = Form(None)
):
    """
    Upload a text document for ingestion into the knowledge base
    """
    if not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    # Create a unique ID for the document
    doc_id = str(uuid.uuid4())
    
    # Create temp directory if it doesn't exist
    os.makedirs("temp", exist_ok=True)
    
    # Save the file temporarily
    temp_file_path = f"temp/{doc_id}_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document record
    document = DocumentCreate(
        id=doc_id,
        filename=file.filename,
        description=description,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    # Process document in background
    background_tasks.add_task(
        rag_service.process_document,
        document,
        temp_file_path
    )
    
    return DocumentResponse(
        id=doc_id,
        filename=file.filename,
        description=description,
        status="processing",
        chunk_count=0  # Will be updated after processing
    )

@router.get("/documents", response_model=List[DocumentResponse])
async def get_documents():
    """
    Get all documents in the knowledge base
    """
    return rag_service.get_all_documents()

@router.get("/documents/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: str):
    """
    Get a specific document by ID
    """
    document = rag_service.get_document(doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """
    Delete a document from the knowledge base
    """
    success = rag_service.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": "Document deleted"}

@router.post("/query", response_model=QueryResponse)
async def query_knowledge_base(query: QueryRequest):
    """
    Query the knowledge base with a natural language query
    """
    results = rag_service.query(
        query.query_text,
        top_k=query.top_k,
        similarity_threshold=query.similarity_threshold,
        include_metadata=query.include_metadata,
        include_source=query.include_source
    )
    
    return QueryResponse(
        query=query.query_text,
        results=results
    )
