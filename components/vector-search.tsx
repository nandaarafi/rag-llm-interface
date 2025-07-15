'use client';

import { useState } from 'react';
import { Search, Loader2, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vectorClient, type SearchResult } from '@/lib/vector-client';
import { toast } from 'sonner';

interface VectorSearchProps {
  userId: string;
  onResultClick?: (result: SearchResult) => void;
}

export function VectorSearch({ userId, onResultClick }: VectorSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const response = await vectorClient.searchDocuments(query, userId, {
        limit: 20,
        score_threshold: 0.5,
      });

      setResults(response.results);
      setHasSearched(true);

      if (response.results.length === 0) {
        toast.info('No documents found matching your query');
      } else {
        toast.success(`Found ${response.results.length} relevant results`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.7) return 'bg-blue-100 text-blue-800';
    if (score >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search through your documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !query.trim()}
          className="px-6"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </Button>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search Results</h3>
            {results.length > 0 && (
              <Badge variant="secondary">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium mb-2">No results found</h4>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search query or upload more documents to search through.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <Card 
                  key={`${result.document_id}-${result.chunk_id}`}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onResultClick?.(result)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium">
                          Document Chunk #{result.metadata.chunk_index || index + 1}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Document ID: {result.document_id.slice(0, 8)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={getScoreColor(result.score)}
                        >
                          {formatScore(result.score)}% match
                        </Badge>
                        {onResultClick && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {result.content}
                    </p>
                    {result.metadata.word_count && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {result.metadata.word_count} words • {result.metadata.char_count} characters
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}