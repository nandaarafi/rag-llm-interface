import os
import uuid
import asyncio
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

from models.schemas import SearchResult, DocumentChunk

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))
        self.collection_name = "documents"
        self.model_name = "all-MiniLM-L6-v2"  # Lightweight but effective model
        
        self.client: Optional[QdrantClient] = None
        self.encoder: Optional[SentenceTransformer] = None

    async def initialize(self):
        """Initialize Qdrant client and sentence transformer"""
        try:
            # Initialize Qdrant client
            self.client = QdrantClient(
                host=self.qdrant_host,
                port=self.qdrant_port,
                timeout=30
            )
            
            # Load sentence transformer model
            self.encoder = SentenceTransformer(self.model_name)
            
            # Create collection if it doesn't exist
            await self._create_collection()
            
            logger.info("Vector service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize vector service: {e}")
            raise

    async def _create_collection(self):
        """Create Qdrant collection if it doesn't exist"""
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            if self.collection_name not in collection_names:
                # Get vector dimension from the model
                test_embedding = self.encoder.encode(["test"])
                vector_size = len(test_embedding[0])
                
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created collection '{self.collection_name}' with vector size {vector_size}")
            else:
                logger.info(f"Collection '{self.collection_name}' already exists")
                
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            raise

    async def check_health(self) -> str:
        """Check if Qdrant is healthy"""
        try:
            if not self.client:
                return "not_initialized"
            
            # Try to get collection info
            self.client.get_collection(self.collection_name)
            return "healthy"
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return "unhealthy"

    async def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for a list of texts"""
        try:
            if not self.encoder:
                raise Exception("Encoder not initialized")
            
            # Run encoding in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None, 
                lambda: self.encoder.encode(texts, convert_to_tensor=False)
            )
            
            return embeddings.tolist()
            
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise

    async def create_document_embeddings(
        self, 
        chunks: List[DocumentChunk], 
        document_id: str, 
        user_id: str
    ) -> Dict[str, Any]:
        """Create embeddings for document chunks and store in Qdrant"""
        try:
            # Extract text content from chunks
            texts = [chunk.content for chunk in chunks]
            
            # Create embeddings
            embeddings = await self.create_embeddings(texts)
            
            # Prepare points for Qdrant
            points = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point = PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "document_id": document_id,
                        "user_id": user_id,
                        "chunk_id": chunk.chunk_id,
                        "chunk_index": chunk.chunk_index,
                        "content": chunk.content,
                        "created_at": datetime.utcnow().isoformat(),
                        **chunk.metadata
                    }
                )
                points.append(point)
            
            # Store in Qdrant
            operation_info = self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            
            logger.info(f"Stored {len(points)} embeddings for document {document_id}")
            
            return {
                "document_id": document_id,
                "chunks_processed": len(chunks),
                "operation_info": operation_info
            }
            
        except Exception as e:
            logger.error(f"Error creating document embeddings: {e}")
            raise

    async def search_documents(
        self, 
        query: str, 
        user_id: str, 
        limit: int = 10, 
        score_threshold: float = 0.7
    ) -> List[SearchResult]:
        """Search for similar documents using vector similarity"""
        try:
            # Create query embedding
            query_embedding = await self.create_embeddings([query])
            
            # Search in Qdrant
            search_results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding[0],
                query_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_id",
                            match=models.MatchValue(value=user_id)
                        )
                    ]
                ),
                limit=limit,
                score_threshold=score_threshold
            )
            
            # Convert to SearchResult objects
            results = []
            for result in search_results:
                search_result = SearchResult(
                    document_id=result.payload["document_id"],
                    chunk_id=result.payload["chunk_id"],
                    content=result.payload["content"],
                    score=result.score,
                    metadata={
                        k: v for k, v in result.payload.items() 
                        if k not in ["document_id", "chunk_id", "content", "user_id"]
                    }
                )
                results.append(search_result)
            
            logger.info(f"Found {len(results)} results for query: {query}")
            return results
            
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            raise

    async def delete_document(self, document_id: str, user_id: str):
        """Delete all embeddings for a document"""
        try:
            # Delete points with matching document_id and user_id
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="document_id",
                                match=models.MatchValue(value=document_id)
                            ),
                            models.FieldCondition(
                                key="user_id",
                                match=models.MatchValue(value=user_id)
                            )
                        ]
                    )
                )
            )
            
            logger.info(f"Deleted embeddings for document {document_id}")
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise

    async def list_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """List all documents for a user"""
        try:
            # Get all points for the user
            response = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_id",
                            match=models.MatchValue(value=user_id)
                        )
                    ]
                ),
                limit=1000  # Adjust as needed
            )
            
            # Group by document_id
            documents = {}
            for point in response[0]:
                doc_id = point.payload["document_id"]
                if doc_id not in documents:
                    documents[doc_id] = {
                        "document_id": doc_id,
                        "chunk_count": 0,
                        "created_at": point.payload.get("created_at"),
                        "metadata": {}
                    }
                documents[doc_id]["chunk_count"] += 1
            
            return list(documents.values())
            
        except Exception as e:
            logger.error(f"Error listing user documents: {e}")
            raise