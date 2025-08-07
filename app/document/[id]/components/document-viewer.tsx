'use client';

import { useState } from 'react';
import { formatDistance } from 'date-fns';
import { Download, Share2, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Document } from '@/lib/db/schema';
import { artifactDefinitions } from '@/components/artifact';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: Document;
  isReadonly?: boolean;
}

function getKindLabel(kind: string): string {
  switch (kind) {
    case 'text': return 'Text Document';
    case 'code': return 'Code';
    case 'image': return 'Image';
    case 'sheet': return 'Spreadsheet';
    case 'ppt': return 'Presentation';
    default: return 'Document';
  }
}

function getKindColor(kind: string): string {
  switch (kind) {
    case 'text': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    case 'code': return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400';
    case 'image': return 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400';
    case 'sheet': return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
    case 'ppt': return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

export function DocumentViewer({ document, isReadonly = true }: DocumentViewerProps) {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const artifactDefinition = artifactDefinitions.find(
    (def) => def.kind === document.kind,
  );

  if (!artifactDefinition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h1 className="text-xl font-semibold">Unsupported Document Type</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This document type ({document.kind}) is not supported for viewing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    if (document.content) {
      let blob: Blob;
      let filename: string;

      // Handle different content types
      if (document.kind === 'image') {
        // For images, create appropriate blob based on content format
        if (document.content.startsWith('http') || document.content.startsWith('data:')) {
          // If it's a URL or data URL, we can't directly download, so create a text file with the URL
          blob = new Blob([document.content], { type: 'text/plain' });
          filename = `${document.title}.txt`;
        } else {
          // If it's base64, convert to binary
          try {
            const binaryString = atob(document.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            blob = new Blob([bytes], { type: 'image/png' });
            filename = `${document.title}.png`;
          } catch {
            blob = new Blob([document.content], { type: 'text/plain' });
            filename = `${document.title}.txt`;
          }
        }
      } else {
        // For other document types, create text file
        blob = new Blob([document.content], { type: 'text/plain' });
        const extension = document.kind === 'code' ? '.txt' : '.txt';
        filename = `${document.title}${extension}`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/chat/library">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge className={cn(getKindColor(document.kind), "shrink-0")}>
                  {getKindLabel(document.kind)}
                </Badge>
                
                <div>
                  <h1 className="text-lg font-semibold line-clamp-1">
                    {document.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistance(new Date(document.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className={showCopySuccess ? 'bg-green-50 border-green-200 text-green-700' : ''}
              >
                <Share2 className="size-4 mr-2" />
                {showCopySuccess ? 'Copied!' : 'Share'}
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link href="/" target="_blank">
                  <ExternalLink className="size-4 mr-2" />
                  Open in Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="min-h-[calc(100vh-200px)]">
          <CardContent className="p-0">
            <div className={cn(
              "w-full h-full",
              {
                'min-h-[600px]': document.kind === 'text',
                'min-h-[400px]': document.kind === 'image',
                'min-h-[500px]': document.kind === 'sheet',
              }
            )}>
              <artifactDefinition.content
                title={document.title}
                content={document.content ?? ''}
                mode="edit"
                status="idle"
                currentVersionIndex={0}
                suggestions={[]}
                onSaveContent={() => {}} // Read-only, so no save functionality
                isInline={false}
                isCurrentVersion={true}
                getDocumentContentById={() => document.content ?? ''}
                isLoading={false}
                metadata={null}
                setMetadata={() => {}}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}