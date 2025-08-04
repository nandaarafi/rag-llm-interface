import { LoaderIcon } from './icons';
import cn from 'classnames';
import { useState } from 'react';
import { ImageZoomModal } from './image-zoom-modal';

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({
  title,
  content,
  status,
  isInline,
}: ImageEditorProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  return (
    <div
      className={cn('flex flex-row items-center justify-center w-full', {
        'h-[calc(100dvh-60px)]': !isInline,
        'h-[200px]': isInline,
      })}
    >
      {status === 'streaming' ? (
        <div className="flex flex-row gap-4 items-center">
          {!isInline && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
          <div>Generating Image...</div>
        </div>
      ) : (
        <picture>
          <img
            className={cn('w-full h-fit max-w-[800px] cursor-pointer hover:opacity-80 transition-opacity', {
              'p-0 md:p-20': !isInline,
            })}
            src={content.startsWith('http') || content.startsWith('data:') ? content : `data:image/png;base64,${content}`}
            alt={title}
            onClick={() => setIsZoomOpen(true)}
          />
        </picture>
      )}
      
      {status !== 'streaming' && (
        <ImageZoomModal
          src={content.startsWith('http') || content.startsWith('data:') ? content : `data:image/png;base64,${content}`}
          alt={title}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
        />
      )}
    </div>
  );
}
