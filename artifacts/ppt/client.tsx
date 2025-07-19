import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  PresentationIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { PresentationEditor } from '@/components/ppt-editor';
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
        toast.success('Presentation downloaded');
      },
    },
  ],
});