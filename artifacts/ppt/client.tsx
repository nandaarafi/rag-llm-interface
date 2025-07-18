import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  DownloadIcon,
  PresentationIcon,
  RedoIcon,
  UndoIcon,
} from '@/components/icons';
import { toast } from 'sonner';
import { useState } from 'react';

type Metadata = any;

interface Slide {
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
}

interface Presentation {
  title: string;
  slides: Slide[];
}

function PresentationViewer({
  content,
  onSaveContent,
}: {
  content: string;
  onSaveContent: (content: string, debounce: boolean) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  let presentation: Presentation;
  try {
    presentation = JSON.parse(content);
  } catch {
    presentation = {
      title: 'Untitled Presentation',
      slides: [
        {
          title: 'Slide 1',
          content: ['Content not available'],
          layout: 'content'
        }
      ]
    };
  }

  const nextSlide = () => {
    if (currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const currentSlideData = presentation.slides[currentSlide];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Presentation Header */}
      <div className="border-b p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">{presentation.title}</h1>
        <div className="text-sm text-gray-600 mt-1">
          Slide {currentSlide + 1} of {presentation.slides.length}
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border shadow-lg rounded-lg w-full max-w-4xl aspect-[16/9] p-8 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {currentSlideData.title}
          </h2>
          
          <div className="flex-1 flex flex-col justify-center">
            {currentSlideData.layout === 'two-column' ? (
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="space-y-4">
                  {currentSlideData.content.slice(0, Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                    <div key={index} className="text-lg leading-relaxed">
                      • {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {currentSlideData.content.slice(Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                    <div key={index} className="text-lg leading-relaxed">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentSlideData.content.map((item, index) => (
                  <div key={index} className="text-lg leading-relaxed">
                    • {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-2">
          {presentation.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

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
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <PresentationViewer
        content={content}
        onSaveContent={onSaveContent}
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
      onClick: ({ content, title }) => {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Presentation downloaded');
      },
    },
  ],
});