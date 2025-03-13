import os
import json
import numpy as np
from typing import List, Optional, Dict, Any
from datetime import datetime
import openai
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.models.rag import Document, DocumentChunk, Base
from app.schemas.rag import DocumentCreate, DocumentResponse, QueryResult

class RAGService:
    def __init__(self):
        # Initialize database connection
        database_url = os.getenv("DATABASE_URL", "sqlite:///./slack_agent.db")
        self.engine = create_engine(database_url)
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        # Initialize OpenAI API key
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        # Set embedding model
        self.embedding_model = "text-embedding-ada-002"
        self.embedding_dimension = 1536  # Dimension for text-embedding-ada-002
    
    def get_db(self) -> Session:
        """Get database session"""
        db = self.SessionLocal()
        try:
            return db
        finally:
            db.close()
    
    def _get_embedding(self, text: str) -> List[float]:
        """
        Get embedding for text using OpenAI's text-embedding-ada-002 model
        """
        try:
            # Check if OpenAI API key is set
            if not openai.api_key:
                # Fallback to mock embeddings if no API key
                print("Warning: No OpenAI API key found. Using mock embeddings.")
                vector = np.random.randn(self.embedding_dimension)
                return (vector / np.linalg.norm(vector)).tolist()
            
            # Call OpenAI API to get embeddings
            response = openai.Embedding.create(
                model=self.embedding_model,
                input=text
            )
            
            # Extract the embedding from the response
            embedding = response['data'][0]['embedding']
            return embedding
            
        except Exception as e:
            print(f"Error getting embedding: {str(e)}")
            # Fallback to mock embeddings if API call fails
            vector = np.random.randn(self.embedding_dimension)
            return (vector / np.linalg.norm(vector)).tolist()
    
    def _chunk_text(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Split text into chunks with overlap"""
        if not text:
            return []
            
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = min(start + chunk_size, text_length)
            if end < text_length and text[end] != ' ':
                # Try to end at a space to avoid cutting words
                last_space = text.rfind(' ', start, end)
                if last_space > start:
                    end = last_space
            
            chunks.append(text[start:end])
            start = end - chunk_overlap if end < text_length else text_length
        
        return chunks
    
    async def process_document(self, document: DocumentCreate, file_path: str):
        """Process document and store chunks with embeddings"""
        db = self.get_db()
        
        try:
            # Create document record
            db_document = Document(
                id=document.id,
                filename=document.filename,
                description=document.description,
                chunk_size=document.chunk_size,
                chunk_overlap=document.chunk_overlap,
                status="processing",
                created_at=datetime.utcnow()
            )
            db.add(db_document)
            db.commit()
            
            # Read file content
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            
            # Split text into chunks
            chunks = self._chunk_text(text, document.chunk_size, document.chunk_overlap)
            
            # Process each chunk
            for i, chunk_text in enumerate(chunks):
                # Get embedding
                embedding = self._get_embedding(chunk_text)
                
                # Create chunk record
                db_chunk = DocumentChunk(
                    document_id=document.id,
                    content=chunk_text,
                    chunk_index=i,
                    embedding=json.dumps(embedding),
                    metadata=json.dumps({
                        "index": i,
                        "filename": document.filename,
                        "start_char": i * (document.chunk_size - document.chunk_overlap) if i > 0 else 0
                    })
                )
                db.add(db_chunk)
            
            # Update document status
            db_document.status = "ready"
            db_document.chunk_count = len(chunks)
            db.commit()
            
            # Clean up temp file
            os.remove(file_path)
            
        except Exception as e:
            # Handle errors
            db.rollback()
            db_document = db.query(Document).filter(Document.id == document.id).first()
            if db_document:
                db_document.status = "error"
                db_document.error_message = str(e)
                db.commit()
            
            # Clean up temp file
            if os.path.exists(file_path):
                os.remove(file_path)
        
        finally:
            db.close()
    
    def get_all_documents(self) -> List[DocumentResponse]:
        """Get all documents"""
        db = self.get_db()
        try:
            documents = db.query(Document).all()
            return [
                DocumentResponse(
                    id=doc.id,
                    filename=doc.filename,
                    description=doc.description,
                    chunk_size=doc.chunk_size,
                    chunk_overlap=doc.chunk_overlap,
                    status=doc.status,
                    chunk_count=doc.chunk_count,
                    created_at=doc.created_at,
                    error_message=doc.error_message
                )
                for doc in documents
            ]
        finally:
            db.close()
    
    def get_document(self, doc_id: str) -> Optional[DocumentResponse]:
        """Get document by ID"""
        db = self.get_db()
        try:
            document = db.query(Document).filter(Document.id == doc_id).first()
            if not document:
                return None
                
            return DocumentResponse(
                id=document.id,
                filename=document.filename,
                description=document.description,
                chunk_size=document.chunk_size,
                chunk_overlap=document.chunk_overlap,
                status=document.status,
                chunk_count=document.chunk_count,
                created_at=document.created_at,
                error_message=document.error_message
            )
        finally:
            db.close()
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete document by ID"""
        db = self.get_db()
        try:
            document = db.query(Document).filter(Document.id == doc_id).first()
            if not document:
                return False
                
            db.delete(document)
            db.commit()
            return True
        finally:
            db.close()
    
    def _vector_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        return np.dot(vec1_np, vec2_np) / (np.linalg.norm(vec1_np) * np.linalg.norm(vec2_np))
    
    def query(
        self, 
        query_text: str, 
        top_k: int = 3, 
        similarity_threshold: float = 0.7,
        include_metadata: bool = False,
        include_source: bool = True
    ) -> List[QueryResult]:
        """Query the knowledge base"""
        db = self.get_db()
        try:
            # Get query embedding
            query_embedding = self._get_embedding(query_text)
            
            # Get all chunks
            chunks = db.query(DocumentChunk).all()
            
            # Calculate similarity scores
            results = []
            for chunk in chunks:
                chunk_embedding = json.loads(chunk.embedding)
                score = self._vector_similarity(query_embedding, chunk_embedding)
                
                if score >= similarity_threshold:
                    # Get document info for source
                    document = None
                    if include_source:
                        document = db.query(Document).filter(Document.id == chunk.document_id).first()
                    
                    # Create result
                    result = QueryResult(
                        content=chunk.content,
                        score=score,
                        metadata=json.loads(chunk.metadata) if include_metadata else None,
                        source=document.filename if document and include_source else None
                    )
                    results.append(result)
            
            # Sort by score and limit to top_k
            results.sort(key=lambda x: x.score, reverse=True)
            return results[:top_k]
        finally:
            db.close()
