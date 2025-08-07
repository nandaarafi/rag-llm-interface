"use client";

import React, { useState, useMemo } from 'react';
import { Search, Download, Share2, Eye, FileText, Calendar, ZoomIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/db/schema';
import { DocumentPreviewModal } from './document-preview-modal';
import { DocumentInlinePreview } from './document-inline-preview';

type DocumentWithFormatted = Document & {
  formattedDate: string;
};

function getKindLabel(kind: string): string {
  switch (kind) {
    case 'text': return 'Text';
    case 'code': return 'Code';
    case 'image': return 'Image';
    case 'sheet': return 'Sheet';
    case 'ppt': return 'Presentation';
    default: return 'Document';
  }
}

function getKindColor(kind: string): string {
  switch (kind) {
    case 'text': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'code': return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'image': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'sheet': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'ppt': return 'bg-red-100 text-red-800 hover:bg-red-200';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
}

export function DocumentManagerClient({ documents: initialDocuments, error }: { documents: DocumentWithFormatted[], error: string | null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<DocumentWithFormatted | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return initialDocuments;
    const term = searchTerm.toLowerCase();
    return initialDocuments.filter(
      doc =>
        doc.title.toLowerCase().includes(term) ||
        (doc.content?.toLowerCase().includes(term))
    );
  }, [searchTerm, initialDocuments]);

  const handlePreview = (doc: DocumentWithFormatted) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleView = (doc: DocumentWithFormatted) => {
    window.open(`/document/${doc.id}`, '_blank');
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewDocument(null);
  };

  const handleDownload = (doc: DocumentWithFormatted) => {
    if (doc.content) {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = (doc: DocumentWithFormatted) => {
    const url = `${window.location.origin}/document/${doc.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Document URL copied to clipboard!');
    });
  };

  if (error) {
    return (
      <div className="container py-8 space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and organize your uploaded documents
          </p>
        </div>
        <Card className="text-center p-8">
          <div className="text-destructive">
            <h3 className="text-lg font-medium">Error</h3>
            <p className="mt-2">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 px-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage and organize your uploaded documents
        </p>
      </div>

      {/* Search and Upload */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-screen-xl mx-auto px-10">
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow group relative flex flex-col h-80">
                <CardHeader className="pb-2 shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-secondary">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                    <Badge className={getKindColor(doc.kind)}>
                      {getKindLabel(doc.kind)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4 line-clamp-1">{doc.title}</CardTitle>
                </CardHeader>

                {/* Inline Preview Section */}
                <CardContent className="flex-1 pt-0 pb-2 min-h-0">
                  <div 
                    className="h-24 cursor-pointer rounded-lg border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors relative overflow-hidden"
                    onClick={() => handlePreview(doc)}
                  >
                    <DocumentInlinePreview document={doc} className="h-full p-2" />
                    
                    {/* Hover overlay for modal preview */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <ZoomIn className="size-4" />
                          Click for detailed preview
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document metadata */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{doc.formattedDate}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 pt-0 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc);
                    }}
                  >
                    <Download className="size-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(doc);
                    }}
                  >
                    <Share2 className="size-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(doc);
                    }}
                  >
                    <Eye className="size-4 mr-2" />
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8">
            <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm ? 'Try a different search term' : 'Create your first document in a chat to get started'}
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <a href="/">
                  <FileText className="size-4 mr-2" />
                  Start New Chat
                </a>
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onView={handleView}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
}