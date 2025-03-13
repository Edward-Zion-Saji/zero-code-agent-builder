import axios from 'axios';

// Use Vite's environment variables format
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Service for interacting with the RAG API endpoints
 */
const RAGService = {
  /**
   * Upload a document for ingestion
   * @param {File} file - The text file to upload
   * @param {Object} options - Additional options
   * @param {number} options.chunkSize - Size of text chunks
   * @param {number} options.chunkOverlap - Overlap between chunks
   * @param {string} options.description - Optional document description
   * @returns {Promise<Object>} - The document response
   */
  uploadDocument: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.chunkSize) {
      formData.append('chunk_size', options.chunkSize);
    }
    
    if (options.chunkOverlap) {
      formData.append('chunk_overlap', options.chunkOverlap);
    }
    
    if (options.description) {
      formData.append('description', options.description);
    }
    
    const response = await axios.post(`${API_URL}/rag/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  /**
   * Get all documents in the knowledge base
   * @returns {Promise<Array>} - List of documents
   */
  getDocuments: async () => {
    const response = await axios.get(`${API_URL}/rag/documents`);
    return response.data;
  },
  
  /**
   * Get a specific document by ID
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} - The document
   */
  getDocument: async (documentId) => {
    const response = await axios.get(`${API_URL}/rag/documents/${documentId}`);
    return response.data;
  },
  
  /**
   * Delete a document from the knowledge base
   * @param {string} documentId - The document ID
   * @returns {Promise<Object>} - The response
   */
  deleteDocument: async (documentId) => {
    const response = await axios.delete(`${API_URL}/rag/documents/${documentId}`);
    return response.data;
  },
  
  /**
   * Query the knowledge base
   * @param {Object} queryParams - Query parameters
   * @param {string} queryParams.queryText - The query text
   * @param {number} queryParams.topK - Number of results to return
   * @param {number} queryParams.similarityThreshold - Minimum similarity score
   * @param {boolean} queryParams.includeMetadata - Whether to include metadata
   * @param {boolean} queryParams.includeSource - Whether to include source
   * @returns {Promise<Object>} - The query response
   */
  queryKnowledgeBase: async (queryParams) => {
    const response = await axios.post(`${API_URL}/rag/query`, {
      query_text: queryParams.queryText,
      top_k: queryParams.topK,
      similarity_threshold: queryParams.similarityThreshold,
      include_metadata: queryParams.includeMetadata,
      include_source: queryParams.includeSource
    });
    
    return response.data;
  }
};

export default RAGService;
