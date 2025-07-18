'use client';

import { useState } from 'react';

interface Slide {
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
}

interface Presentation {
  title: string;
  slides: Slide[];
}

interface PresentationEditorProps {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
}

export function PresentationEditor({
  content,
  onSaveContent,
  status,
  isCurrentVersion,
  currentVersionIndex,
}: PresentationEditorProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  let presentation: Presentation;
  try {
    presentation = JSON.parse(content);
    // Ensure slides array exists and has at least one slide
    if (!presentation.slides || !Array.isArray(presentation.slides) || presentation.slides.length === 0) {
      presentation.slides = [
        {
          title: 'Slide 1',
          content: ['Content not available'],
          layout: 'content'
        }
      ];
    }
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

  // Ensure currentSlide is within bounds
  const safeCurrentSlide = Math.min(currentSlide, presentation.slides.length - 1);
  const currentSlideData = presentation.slides[safeCurrentSlide];

  if (status === 'streaming') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full size-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-muted-foreground">Generating presentation...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Presentation Header */}
      <div className="border-b p-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">{presentation.title}</h1>
        <div className="text-sm text-gray-600 mt-1">
          Slide {safeCurrentSlide + 1} of {presentation.slides.length}
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
              className={`size-3 rounded-full transition-colors ${
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