from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import os
from typing import List, Optional
import logging
from datetime import datetime

from services.vector_service import VectorService
from services.document_service import DocumentService
from models.schemas import (
    DocumentResponse, 
    SearchRequest, 
    SearchResponse,
    EmbeddingRequest,
    EmbeddingResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Chatbot Vector Search API",
    description="FastAPI backend for document embedding and vector search using Qdrant",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vector_service = VectorService()
document_service = DocumentService()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        await vector_service.initialize()
        logger.info("Vector service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize vector service: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Chatbot Vector Search API", 
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check Qdrant connection
        qdrant_status = await vector_service.check_health()
        
        return {
            "status": "healthy",
            "services": {
                "qdrant": qdrant_status,
                "document_processor": "ok"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = None
):
    """Upload and process a document for vector search"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        # Process the document
        document_data = await document_service.process_document(file, user_id)
        
        # Create embeddings and store in Qdrant
        embedding_result = await vector_service.create_document_embeddings(
            document_data["chunks"],
            document_data["document_id"],
            user_id
        )
        
        return DocumentResponse(
            document_id=document_data["document_id"],
            filename=document_data["filename"],
            chunks_created=len(document_data["chunks"]),
            status="processed",
            message="Document successfully processed and indexed"
        )
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search documents using vector similarity"""
    try:
        results = await vector_service.search_documents(
            query=request.query,
            user_id=request.user_id,
            limit=request.limit,
            score_threshold=request.score_threshold
        )
        
        return SearchResponse(
            query=request.query,
            results=results,
            total_results=len(results)
        )
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(request: EmbeddingRequest):
    """Create embeddings for text"""
    try:
        embeddings = await vector_service.create_embeddings(request.texts)
        
        return EmbeddingResponse(
            embeddings=embeddings,
            model_name=vector_service.model_name,
            dimension=len(embeddings[0]) if embeddings else 0
        )
        
    except Exception as e:
        logger.error(f"Error creating embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, user_id: str):
    """Delete a document and its embeddings"""
    try:
        await vector_service.delete_document(document_id, user_id)
        return {"message": f"Document {document_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents/{user_id}")
async def list_user_documents(user_id: str):
    """List all documents for a user"""
    try:
        documents = await vector_service.list_user_documents(user_id)
        return {"user_id": user_id, "documents": documents}
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )