'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Eye, } from 'lucide-react';
import { artifactDefinitions } from '@/components/artifact';
import type { Document } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onShare: (doc: Document) => void;
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

function DocumentPreviewContent({ document }: { document: Document }) {
  const artifactDefinition = artifactDefinitions.find(
    (def) => def.kind === document.kind,
  );

  if (!artifactDefinition) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Preview not available for this document type</p>
      </div>
    );
  }

  // For preview mode, we want a smaller, read-only version
  return (
    <div className={cn(
      "w-full border rounded-lg overflow-hidden bg-background",
      {
        'h-80': document.kind === 'image',
        'h-64': document.kind === 'sheet' || document.kind === 'ppt',
      }
    )}>
      <artifactDefinition.content
        title={document.title}
        content={document.content ?? ''}
        mode="edit"
        status="idle"
        currentVersionIndex={0}
        suggestions={[]}
        onSaveContent={() => {}} // Read-only in preview
        isInline={true}
        isCurrentVersion={true}
        getDocumentContentById={() => document.content ?? ''}
        isLoading={false}
        metadata={{ suggestions: [], outputs: [] } as any}
        setMetadata={() => {}}
      />
    </div>
  );
}

export function DocumentPreviewModal({ 
  document, 
  isOpen, 
  onClose, 
  onView, 
  onDownload, 
  onShare 
}: DocumentPreviewModalProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn(getKindColor(document.kind), "shrink-0")}>
                  {getKindLabel(document.kind)}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-semibold line-clamp-2">
                {document.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <DocumentPreviewContent document={document} />
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
            Close Preview
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onDownload(document)}>
              <Download className="size-4 mr-2" />
              Download
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => onShare(document)}>
              <Share2 className="size-4 mr-2" />
              Share
            </Button>
            
            <Button onClick={() => onView(document)}>
              <Eye className="size-4 mr-2" />
              Open Full View
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}