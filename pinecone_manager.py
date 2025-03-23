#!/usr/bin/env python3
"""
Pinecone Manager - Handles integration with Pinecone for RAG
"""
import os
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Path(__file__).parent / "pinecone.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("pinecone_manager")

# Load environment variables
load_dotenv()

class PineconeManager:
    """Manages Pinecone integration for RAG"""
    
    def __init__(self):
        """Initialize the Pinecone manager"""
        self.api_key = os.environ.get("PINECONE_API_KEY")
        self.environment = os.environ.get("PINECONE_ENVIRONMENT")
        self.index_name = os.environ.get("PINECONE_INDEX", "slack-knowledge")
        self.pinecone_client = None
        self.index = None
        
        # Initialize Pinecone if credentials are available
        if self.api_key and self.environment:
            self._initialize_pinecone()
    
    def _initialize_pinecone(self):
        """Initialize the Pinecone client and index"""
        try:
            import pinecone
            from pinecone import Pinecone, ServerlessSpec
            
            # Initialize Pinecone
            self.pinecone_client = Pinecone(api_key=self.api_key)
            
            # Check if index exists, if not create it
            existing_indexes = [index.name for index in self.pinecone_client.list_indexes()]
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating Pinecone index: {self.index_name}")
                self.pinecone_client.create_index(
                    name=self.index_name,
                    dimension=1536,  # OpenAI embeddings dimension
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region=self.environment)
                )
            
            # Connect to the index
            self.index = self.pinecone_client.Index(self.index_name)
            logger.info(f"Successfully connected to Pinecone index: {self.index_name}")
            
        except ImportError:
            logger.error("Pinecone package not installed. Install with: pip install pinecone")
        except Exception as e:
            logger.error(f"Error initializing Pinecone: {e}")
    
    def is_initialized(self) -> bool:
        """Check if Pinecone is properly initialized"""
        return self.index is not None
    
    def upload_document(self, document: str, metadata: Dict[str, Any] = None) -> bool:
        """
        Upload a document to Pinecone
        
        Args:
            document: The text content to embed and store
            metadata: Additional metadata to store with the vector
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.is_initialized():
            logger.error("Pinecone not initialized. Cannot upload document.")
            return False
        
        try:
            # Get OpenAI embeddings
            from langchain_openai import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings()
            doc_embedding = embeddings.embed_query(document)
            
            # Create a unique ID for the document
            import uuid
            doc_id = str(uuid.uuid4())
            
            # Prepare metadata
            if metadata is None:
                metadata = {}
            
            metadata["text"] = document[:1000]  # Store first 1000 chars of text in metadata
            
            # Upsert to Pinecone using new API
            self.index.upsert(
                vectors=[
                    {
                        "id": doc_id,
                        "values": doc_embedding,
                        "metadata": metadata
                    }
                ]
            )
            
            logger.info(f"Successfully uploaded document with ID: {doc_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error uploading document to Pinecone: {e}")
            return False
    
    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Query Pinecone for similar documents
        
        Args:
            query_text: The query text
            top_k: Number of results to return
            
        Returns:
            List of results with text and metadata
        """
        if not self.is_initialized():
            logger.error("Pinecone not initialized. Cannot query.")
            return []
        
        try:
            # Get OpenAI embeddings
            from langchain_openai import OpenAIEmbeddings
            
            embeddings = OpenAIEmbeddings()
            query_embedding = embeddings.embed_query(query_text)
            
            # Query Pinecone using new API
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
            
            # Format results
            formatted_results = []
            for match in results["matches"]:
                formatted_results.append({
                    "id": match["id"],
                    "score": match["score"],
                    "text": match["metadata"].get("text", ""),
                    "metadata": {k: v for k, v in match["metadata"].items() if k != "text"}
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error querying Pinecone: {e}")
            return []
    
    def create_langchain_retriever(self):
        """
        Create a LangChain retriever for the Pinecone index
        
        Returns:
            A LangChain retriever or None if initialization failed
        """
        if not self.is_initialized():
            logger.error("Pinecone not initialized. Cannot create retriever.")
            return None
        
        try:
            from langchain_openai import OpenAIEmbeddings
            from langchain_pinecone import PineconeVectorStore
            
            embeddings = OpenAIEmbeddings()
            
            # Create a PineconeVectorStore directly
            vectorstore = PineconeVectorStore(
                index_name=self.index_name,
                embedding=embeddings,
                text_key="text"
            )
            
            # Create retriever
            retriever = vectorstore.as_retriever()
            
            logger.info("Successfully created LangChain retriever")
            return retriever
            
        except ImportError:
            logger.error("langchain_pinecone not installed. Install with: pip install langchain-pinecone")
            return None
        except Exception as e:
            logger.error(f"Error creating LangChain retriever: {e}")
            return None

# Example usage
if __name__ == "__main__":
    pinecone_manager = PineconeManager()
    if pinecone_manager.is_initialized():
        print("Pinecone initialized successfully!")
        
        # Upload a test document
        result = pinecone_manager.upload_document(
            "This is a test document for the Slack agent with RAG capabilities.",
            {"source": "test", "date": "2025-03-21"}
        )
        print(f"Upload result: {result}")
        
        # Query the index
        results = pinecone_manager.query("What capabilities does the agent have?")
        print(f"Query results: {results}")
    else:
        print("Failed to initialize Pinecone. Check your API key and environment settings.")
