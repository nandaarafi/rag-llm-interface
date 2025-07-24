import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { PresentationEditor } from '@/components/ppt-editor';
import { generatePPTX, downloadPPTX } from '@/lib/pptx-generator';
import { toast } from 'sonner';

type Metadata = any;

export const pptArtifact = new Artifact<'ppt', Metadata>({
  kind: 'ppt',
  description: 'Useful for creating presentations and slide decks',
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'ppt-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  toolbar: [],
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <PresentationEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        onSaveContent={onSaveContent}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy presentation data',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Presentation data copied to clipboard');
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: 'Download as JSON',
      onClick: ({ content }) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'presentation.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Presentation downloaded as JSON');
      },
    },
    {
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14,2 14,8 20,8"/>
          <path d="M10 12h4"/>
          <path d="M10 16h4"/>
        </svg>
      ),
      description: 'Export as PPTX',
      onClick: async ({ content }) => {
        try {
          toast.loading('Generating PPTX file...');
          const pptxBlob = await generatePPTX(content);
          
          // Extract presentation title for filename
          let filename = 'presentation.pptx';
          try {
            const presentation = JSON.parse(content);
            if (presentation.title) {
              filename = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
            }
          } catch (e) {
            // Use default filename if parsing fails
          }
          
          downloadPPTX(pptxBlob, filename);
          toast.dismiss();
          toast.success('PPTX file exported successfully!');
        } catch (error) {
          toast.dismiss();
          toast.error(`Failed to export PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      },
    },
  ],
});