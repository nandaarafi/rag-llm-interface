import os
import uuid
import asyncio
import aiofiles
from typing import List, Dict, Any, BinaryIO
import logging
from pathlib import Path
import tempfile

# Document processing imports
import PyPDF2
from docx import Document
import io

from models.schemas import DocumentChunk, DocumentData

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.chunk_size = 1000  # Characters per chunk
        self.chunk_overlap = 200  # Overlap between chunks
        self.supported_extensions = {'.pdf', '.docx', '.txt', '.md'}

    async def process_document(self, file, user_id: str) -> Dict[str, Any]:
        """Process an uploaded document and return chunks"""
        try:
            # Validate file
            await self._validate_file(file)
            
            # Generate document ID
            document_id = str(uuid.uuid4())
            
            # Extract text content
            content = await self._extract_text(file)
            
            # Create chunks
            chunks = await self._create_chunks(content, document_id)
            
            # Prepare metadata
            metadata = {
                "filename": file.filename,
                "content_type": file.content_type,
                "file_size": len(content),
                "user_id": user_id,
                "processed_at": str(uuid.uuid4())  # timestamp placeholder
            }
            
            return {
                "document_id": document_id,
                "filename": file.filename,
                "content": content,
                "chunks": chunks,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

    async def _validate_file(self, file) -> None:
        """Validate uploaded file"""
        if not file.filename:
            raise ValueError("No filename provided")
        
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {file_extension}")
        
        # Check file size (limit to 10MB)
        content = await file.read()
        await file.seek(0)  # Reset file pointer
        
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise ValueError("File too large. Maximum size is 10MB")

    async def _extract_text(self, file) -> str:
        """Extract text content from various file types"""
        try:
            content = await file.read()
            file_extension = Path(file.filename).suffix.lower()
            
            if file_extension == '.pdf':
                return await self._extract_pdf_text(content)
            elif file_extension == '.docx':
                return await self._extract_docx_text(content)
            elif file_extension in ['.txt', '.md']:
                return await self._extract_text_content(content)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise

    async def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            loop = asyncio.get_event_loop()
            
            def extract_sync():
                pdf_file = io.BytesIO(content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                
                return text.strip()
            
            return await loop.run_in_executor(None, extract_sync)
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    async def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            loop = asyncio.get_event_loop()
            
            def extract_sync():
                docx_file = io.BytesIO(content)
                doc = Document(docx_file)
                
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                
                return text.strip()
            
            return await loop.run_in_executor(None, extract_sync)
            
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

    async def _extract_text_content(self, content: bytes) -> str:
        """Extract text from plain text files"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'utf-16', 'ascii', 'latin-1']
            
            for encoding in encodings:
                try:
                    return content.decode(encoding).strip()
                except UnicodeDecodeError:
                    continue
            
            raise ValueError("Could not decode text file")
            
        except Exception as e:
            logger.error(f"Error extracting text content: {e}")
            raise

    async def _create_chunks(self, content: str, document_id: str) -> List[DocumentChunk]:
        """Split content into chunks for embedding"""
        try:
            chunks = []
            
            # Simple chunking strategy
            words = content.split()
            current_chunk = []
            current_length = 0
            chunk_index = 0
            
            for word in words:
                word_length = len(word) + 1  # +1 for space
                
                if current_length + word_length > self.chunk_size and current_chunk:
                    # Create chunk
                    chunk_content = " ".join(current_chunk)
                    chunk = DocumentChunk(
                        chunk_id=f"{document_id}_chunk_{chunk_index}",
                        content=chunk_content,
                        chunk_index=chunk_index,
                        metadata={
                            "char_count": len(chunk_content),
                            "word_count": len(current_chunk)
                        }
                    )
                    chunks.append(chunk)
                    
                    # Start new chunk with overlap
                    overlap_words = current_chunk[-self.chunk_overlap//5:] if len(current_chunk) > self.chunk_overlap//5 else []
                    current_chunk = overlap_words + [word]
                    current_length = sum(len(w) + 1 for w in current_chunk)
                    chunk_index += 1
                else:
                    current_chunk.append(word)
                    current_length += word_length
            
            # Add final chunk if there's content
            if current_chunk:
                chunk_content = " ".join(current_chunk)
                chunk = DocumentChunk(
                    chunk_id=f"{document_id}_chunk_{chunk_index}",
                    content=chunk_content,
                    chunk_index=chunk_index,
                    metadata={
                        "char_count": len(chunk_content),
                        "word_count": len(current_chunk)
                    }
                )
                chunks.append(chunk)
            
            logger.info(f"Created {len(chunks)} chunks for document {document_id}")
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating chunks: {e}")
            raise

    async def get_document_summary(self, content: str) -> str:
        """Generate a summary of the document content"""
        try:
            # Simple summary - first 500 characters
            if len(content) <= 500:
                return content
            
            sentences = content.split('.')
            summary = ""
            for sentence in sentences:
                if len(summary + sentence) <= 500:
                    summary += sentence + "."
                else:
                    break
            
            return summary.strip()
            
        except Exception as e:
            logger.error(f"Error creating summary: {e}")
            return content[:500] + "..." if len(content) > 500 else content