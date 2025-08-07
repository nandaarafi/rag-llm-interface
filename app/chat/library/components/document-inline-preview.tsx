'use client';

import { artifactDefinitions } from '@/components/artifact';
import type { Document } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

interface DocumentInlinePreviewProps {
  document: Document;
  className?: string;
}

function TextPreview({ content }: { content: string }) {
  if (!content) return <div className="text-muted-foreground text-sm">No content</div>;
  
  return (
    <div className="text-sm leading-relaxed overflow-hidden">
      <div className="line-clamp-4 text-muted-foreground">
        {content.substring(0, 200)}{content.length > 200 ? '...' : ''}
      </div>
    </div>
  );
}

function CodePreview({ content }: { content: string }) {
  if (!content) return <div className="text-muted-foreground text-sm">No code</div>;
  
  return (
    <div className="bg-muted/50 rounded-md p-2 text-xs font-mono overflow-hidden">
      <div className="line-clamp-4 text-muted-foreground">
        {content.substring(0, 150)}{content.length > 150 ? '...' : ''}
      </div>
    </div>
  );
}

function ImagePreview({ content, title }: { content: string; title: string }) {
  if (!content) return <div className="text-muted-foreground text-sm">No image</div>;
  
  // Handle different image formats
  const imageSrc = content.startsWith('http') || content.startsWith('data:') 
    ? content 
    : `data:image/png;base64,${content}`;
  
  return (
    <div className="relative overflow-hidden rounded-md bg-muted/30">
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-20 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="h-20 flex items-center justify-center text-muted-foreground text-sm">Image preview unavailable</div>';
          }
        }}
      />
    </div>
  );
}

function SheetPreview({ content }: { content: string }) {
  if (!content) return <div className="text-muted-foreground text-sm">No data</div>;
  
  try {
    // Try to parse as CSV or basic data
    const lines = content.split('\n').slice(0, 3);
    return (
      <div className="text-xs">
        {lines.map((line, index) => (
          <div key={index} className="truncate text-muted-foreground py-1 border-b border-muted/50">
            {line.substring(0, 50)}{line.length > 50 ? '...' : ''}
          </div>
        ))}
        {content.split('\n').length > 3 && (
          <div className="text-muted-foreground/60 text-center py-1">
            +{content.split('\n').length - 3} more rows
          </div>
        )}
      </div>
    );
  } catch {
    return <div className="text-muted-foreground text-sm">Spreadsheet data</div>;
  }
}

function PresentationPreview({ content }: { content: string }) {
  if (!content) return <div className="text-muted-foreground text-sm">No slides</div>;
  
  return (
    <div className="bg-gradient-to-br from-muted/30 to-muted/60 rounded-md p-3 text-xs">
      <div className="line-clamp-3 text-muted-foreground">
        {content.substring(0, 120)}{content.length > 120 ? '...' : ''}
      </div>
    </div>
  );
}

export function DocumentInlinePreview({ document, className }: DocumentInlinePreviewProps) {
  const content = document.content || '';
  
  return (
    <div className={cn("w-full", className)}>
      {document.kind === 'text' && <TextPreview content={content} />}
      {document.kind === 'code' && <CodePreview content={content} />}
      {document.kind === 'image' && <ImagePreview content={content} title={document.title} />}
      {document.kind === 'sheet' && <SheetPreview content={content} />}
      {document.kind === 'ppt' && <PresentationPreview content={content} />}
    </div>
  );
}