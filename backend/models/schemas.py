from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    chunks_created: int
    status: str
    message: str

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query text")
    user_id: str = Field(..., description="User ID for filtering results")
    limit: int = Field(default=10, ge=1, le=100, description="Maximum number of results")
    score_threshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity score")

class SearchResult(BaseModel):
    document_id: str
    chunk_id: str
    content: str
    score: float
    metadata: Dict[str, Any]

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int

class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to embed")

class EmbeddingResponse(BaseModel):
    embeddings: List[List[float]]
    model_name: str
    dimension: int

class DocumentChunk(BaseModel):
    chunk_id: str
    content: str
    chunk_index: int
    metadata: Dict[str, Any] = {}

class DocumentData(BaseModel):
    document_id: str
    filename: str
    content: str
    chunks: List[DocumentChunk]
    metadata: Dict[str, Any] = {}

class HealthStatus(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]