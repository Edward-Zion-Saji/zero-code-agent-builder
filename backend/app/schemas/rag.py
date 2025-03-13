from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    """Base schema for document data"""
    filename: str
    description: Optional[str] = None
    chunk_size: int = 1000
    chunk_overlap: int = 200

class DocumentCreate(DocumentBase):
    """Schema for creating a new document"""
    id: str

class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: str
    status: str  # "processing", "ready", "error"
    chunk_count: int
    created_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        orm_mode = True

class QueryRequest(BaseModel):
    """Schema for querying the knowledge base"""
    query_text: str
    top_k: int = 3
    similarity_threshold: float = 0.7
    include_metadata: bool = False
    include_source: bool = True
    
class QueryResult(BaseModel):
    """Schema for a single query result"""
    content: str
    score: float
    metadata: Optional[Dict[str, Any]] = None
    source: Optional[str] = None

class QueryResponse(BaseModel):
    """Schema for query response"""
    query: str
    results: List[QueryResult]
