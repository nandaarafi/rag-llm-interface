import { auth } from '@/app/(auth)/auth';

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export interface SearchResult {
  document_id: string;
  chunk_id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  chunks_created: number;
  status: string;
  message: string;
}

export class VectorClient {
  private baseUrl: string;

  constructor(baseUrl: string = FASTAPI_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await auth();
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.user?.id ? `Bearer ${session.user.id}` : '',
    };
  }

  private async getFormDataHeaders(): Promise<HeadersInit> {
    const session = await auth();
    return {
      'Authorization': session?.user?.id ? `Bearer ${session.user.id}` : '',
    };
  }

  async uploadDocument(file: File, userId: string): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: await this.getFormDataHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    return response.json();
  }

  async searchDocuments(
    query: string,
    userId: string,
    options: {
      limit?: number;
      score_threshold?: number;
    } = {}
  ): Promise<SearchResponse> {
    const { limit = 10, score_threshold = 0.7 } = options;

    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        query,
        user_id: userId,
        limit,
        score_threshold,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Search failed: ${error}`);
    }

    return response.json();
  }

  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${documentId}?user_id=${userId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Delete failed: ${error}`);
    }
  }

  async listUserDocuments(userId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/documents/${userId}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`List documents failed: ${error}`);
    }

    const data = await response.json();
    return data.documents;
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding creation failed: ${error}`);
    }

    const data = await response.json();
    return data.embeddings;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const vectorClient = new VectorClient();