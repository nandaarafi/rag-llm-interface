# AI Chatbot Vector Search Backend

FastAPI backend with Qdrant integration for document embedding and vector search.

## Features

- **Document Processing**: Support for PDF, DOCX, TXT, and MD files
- **Vector Embeddings**: Using Sentence Transformers (all-MiniLM-L6-v2)
- **Vector Search**: Powered by Qdrant vector database
- **Document Chunking**: Intelligent text chunking with overlap
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Health Monitoring**: Built-in health checks for all services

## Quick Start

### Using Docker (Recommended)

1. **Start the services**:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Check services are running**:
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:6333/health
   ```

### Manual Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start Qdrant**:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant:latest
   ```

3. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start FastAPI**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /` - Basic status

### Document Management
- `POST /documents/upload` - Upload and process documents
- `GET /documents/{user_id}` - List user documents
- `DELETE /documents/{document_id}` - Delete document

### Vector Search
- `POST /search` - Search documents by similarity
- `POST /embeddings` - Create text embeddings

## API Usage Examples

### Upload Document
```bash
curl -X POST "http://localhost:8000/documents/upload" \
  -F "file=@document.pdf" \
  -F "user_id=user123"
```

### Search Documents
```bash
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning algorithms",
    "user_id": "user123",
    "limit": 5,
    "score_threshold": 0.7
  }'
```

### Create Embeddings
```bash
curl -X POST "http://localhost:8000/embeddings" \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Hello world", "Machine learning is fascinating"]
  }'
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
QDRANT_HOST=localhost
QDRANT_PORT=6333
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
MAX_FILE_SIZE_MB=10
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### Docker Configuration

The `docker-compose.yml` includes:
- **Qdrant**: Vector database on port 6333
- **FastAPI**: Backend API on port 8000
- **Persistent Storage**: Qdrant data persisted in Docker volume

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│   FastAPI API   │───▶│   Qdrant DB     │
│                 │    │                 │    │                 │
│ - Document UI   │    │ - File Upload   │    │ - Vector Store  │
│ - Search UI     │    │ - Text Extract  │    │ - Similarity    │
│ - Results       │    │ - Embeddings    │    │ - Collections   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Document Processing Pipeline

1. **File Upload** → FastAPI receives file
2. **Text Extraction** → Extract text from PDF/DOCX/TXT/MD
3. **Chunking** → Split text into overlapping chunks
4. **Embedding** → Create vector embeddings using Sentence Transformers
5. **Storage** → Store embeddings in Qdrant with metadata
6. **Search** → Query using vector similarity

## Monitoring & Health

### Health Endpoints
- `/health` - Comprehensive health check
- `/` - Basic API status

### Logs
FastAPI and Qdrant logs are available via Docker:
```bash
docker-compose logs -f fastapi
docker-compose logs -f qdrant
```

### Qdrant Web UI
Access Qdrant's web interface at: http://localhost:6333/dashboard

## Development

### Running Tests
```bash
cd backend
python -m pytest tests/
```

### API Documentation
FastAPI automatically generates OpenAPI docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Adding New File Types

1. Update `document_service.py` with new extraction logic
2. Add file extension to `supported_extensions`
3. Update validation in `_validate_file`
4. Test with sample files

## Troubleshooting

### Common Issues

1. **Qdrant Connection Failed**
   ```bash
   # Check if Qdrant is running
   curl http://localhost:6333/health
   
   # Restart Qdrant
   docker-compose restart qdrant
   ```

2. **Model Download Issues**
   ```bash
   # Pre-download models
   python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
   ```

3. **File Upload Errors**
   - Check file size limits (default: 10MB)
   - Verify file format is supported
   - Check disk space for temp files

4. **CORS Issues**
   ```bash
   # Update ALLOWED_ORIGINS in .env
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```

### Performance Tuning

- **Chunk Size**: Adjust `CHUNK_SIZE` for better retrieval
- **Model Selection**: Use larger models for better accuracy
- **Qdrant Settings**: Configure collection parameters for your use case

## Production Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production
```env
QDRANT_HOST=qdrant-prod
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
FASTAPI_RELOAD=false
LOG_LEVEL=INFO
```

### Security Considerations
- Add authentication middleware
- Use HTTPS in production
- Secure Qdrant with API keys
- Implement rate limiting