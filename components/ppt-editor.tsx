'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PlusIcon, TrashIcon, EyeIcon, PencilEditIcon } from '@/components/icons';

interface Slide {
  id: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
  backgroundColor?: string;
  speakerNotes?: string;
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
}: PresentationEditorProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [showThumbnails, setShowThumbnails] = useState(true);
  const { theme } = useTheme();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  let presentation: Presentation;
  try {
    presentation = JSON.parse(content);
    // Ensure slides array exists and has at least one slide
    if (!presentation.slides || !Array.isArray(presentation.slides) || presentation.slides.length === 0) {
      presentation.slides = [
        {
          id: '1',
          title: 'Slide 1',
          content: ['Content not available'],
          layout: 'content'
        }
      ];
    }
    // Ensure all slides have IDs
    presentation.slides = presentation.slides.map((slide, index) => ({
      ...slide,
      id: slide.id || `slide-${index + 1}`
    }));
  } catch {
    presentation = {
      title: 'Untitled Presentation',
      slides: [
        {
          id: '1',
          title: 'Slide 1',
          content: ['Content not available'],
          layout: 'content'
        }
      ]
    };
  }

  const savePresentation = useCallback((updatedPresentation: Presentation) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSaveContent(JSON.stringify(updatedPresentation, null, 2), true);
    }, 500);
  }, [onSaveContent]);

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${presentation.slides.length + 1}`,
      content: ['New slide content'],
      layout: 'content'
    };
    const updatedPresentation = {
      ...presentation,
      slides: [...presentation.slides, newSlide]
    };
    savePresentation(updatedPresentation);
  };

  const deleteSlide = (slideId: string) => {
    if (presentation.slides.length <= 1) return;
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.filter(slide => slide.id !== slideId)
    };
    if (currentSlide >= updatedPresentation.slides.length) {
      setCurrentSlide(updatedPresentation.slides.length - 1);
    }
    savePresentation(updatedPresentation);
  };

  const updateSlideTitle = (slideId: string, newTitle: string) => {
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map(slide =>
        slide.id === slideId ? { ...slide, title: newTitle } : slide
      )
    };
    savePresentation(updatedPresentation);
  };

  const updateSlideContent = (slideId: string, newContent: string[]) => {
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map(slide =>
        slide.id === slideId ? { ...slide, content: newContent } : slide
      )
    };
    savePresentation(updatedPresentation);
  };

  const startEditing = (slideId: string, content: string) => {
    setEditingSlide(slideId);
    setEditingContent(content);
  };

  const saveEdit = () => {
    if (!editingSlide) return;
    const slide = presentation.slides.find(s => s.id === editingSlide);
    if (!slide) return;
    
    if (editingSlide.endsWith('-title')) {
      const slideId = editingSlide.replace('-title', '');
      updateSlideTitle(slideId, editingContent);
    } else {
      updateSlideContent(editingSlide, [editingContent]);
    }
    setEditingSlide(null);
    setEditingContent('');
  };

  const cancelEdit = () => {
    setEditingSlide(null);
    setEditingContent('');
  };

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is editing or typing in input fields
      if (editingSlide) return;
      
      // Check if user is typing in an input field, textarea, or contenteditable element
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.getAttribute('contenteditable') === 'true' ||
         activeElement.closest('[contenteditable="true"]'))
      ) {
        return;
      }

      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'f' || e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
      }
      if (e.key === 'Escape') setIsFullscreen(false);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, presentation.slides.length, editingSlide, isFullscreen, nextSlide, prevSlide]);

  // Ensure currentSlide is within bounds
  const safeCurrentSlide = Math.min(currentSlide, presentation.slides.length - 1);
  const currentSlideData = presentation.slides[safeCurrentSlide];

  if (status === 'streaming') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full size-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-muted-foreground">Generating presentation...</span>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className={cn("fixed inset-0 z-50 bg-black flex items-center justify-center", {
        'bg-white': theme === 'light'
      })}>
        <div className="w-full max-w-6xl aspect-[16/9] bg-white dark:bg-zinc-900 rounded-lg p-12 flex flex-col shadow-2xl">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            {currentSlideData.title}
          </h2>
          
          <div className="flex-1 flex flex-col justify-center text-center">
            {currentSlideData.layout === 'two-column' ? (
              <div className="grid grid-cols-2 gap-12 h-full">
                <div className="space-y-6">
                  {currentSlideData.content.slice(0, Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                    <div key={index} className="text-2xl leading-relaxed dark:text-white">
                      • {item}
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {currentSlideData.content.slice(Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                    <div key={index} className="text-2xl leading-relaxed dark:text-white">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {currentSlideData.content.map((item, index) => (
                  <div key={index} className="text-2xl leading-relaxed dark:text-white">
                    • {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
          {safeCurrentSlide + 1} / {presentation.slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", {
      'bg-white': theme === 'light',
      'bg-zinc-950': theme === 'dark'
    })}>
      {/* Thumbnails Sidebar */}
      {showThumbnails && (
        <div className={cn("w-64 border-r flex flex-col", {
          'border-gray-200 bg-gray-50': theme === 'light',
          'border-zinc-800 bg-zinc-900': theme === 'dark'
        })}>
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Slides</h3>
              <button
                onClick={addSlide}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                title="Add slide"
              >
                <span className="text-gray-600 dark:text-gray-400">
                  <PlusIcon size={16} />
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {presentation.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "group relative p-3 rounded-lg border-2 cursor-pointer transition-all",
                  {
                    'border-blue-500 bg-blue-50 dark:bg-blue-950': index === currentSlide,
                    'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600': index !== currentSlide
                  }
                )}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="aspect-[16/9] bg-white dark:bg-zinc-800 rounded border mb-2 p-2 text-xs">
                  <div className="font-medium truncate text-gray-800 dark:text-white">{slide.title}</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                    {slide.content.slice(0, 2).map(item => item.substring(0, 30)).join(', ')}...
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Slide {index + 1}</div>
                
                {presentation.slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(slide.id);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded bg-red-500 hover:bg-red-600 transition-all"
                    title="Delete slide"
                  >
                    <span className="text-white">
                      <TrashIcon size={12} />
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Presentation Header */}
        <div className={cn("border-b p-4 flex items-center justify-between", {
          'border-gray-200 bg-gray-50': theme === 'light',
          'border-zinc-800 bg-zinc-900': theme === 'dark'
        })}>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{presentation.title}</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Slide {safeCurrentSlide + 1} of {presentation.slides.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={cn("p-2 rounded transition-colors", {
                'hover:bg-gray-200': theme === 'light',
                'hover:bg-zinc-800': theme === 'dark'
              })}
              title="Toggle thumbnails"
            >
              <span className="text-gray-600 dark:text-gray-400">
                <EyeIcon size={18} />
              </span>
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className={cn("p-2 rounded transition-colors", {
                'hover:bg-gray-200': theme === 'light',
                'hover:bg-zinc-800': theme === 'dark'
              })}
              title="Fullscreen (F)"
            >
              <svg className="size-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className={cn("flex-1 flex items-center justify-center p-8", {
          'bg-gray-100': theme === 'light',
          'bg-zinc-900': theme === 'dark'
        })}>
          <div className={cn("border shadow-lg rounded-lg w-full max-w-4xl aspect-[16/9] p-8 flex flex-col", {
            'bg-white border-gray-200': theme === 'light',
            'bg-zinc-800 border-zinc-700': theme === 'dark'
          })}>
            {editingSlide === `${currentSlideData.id}-title` ? (
              <input
                type="text"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className={cn("text-3xl font-bold mb-6 text-center bg-transparent border-b-2 border-blue-500 focus:outline-none", {
                  'text-gray-800': theme === 'light',
                  'text-white': theme === 'dark'
                })}
                autoFocus
              />
            ) : (
              <div 
                className={cn("text-3xl font-bold mb-6 text-center cursor-pointer group relative", {
                  'text-gray-800 hover:text-blue-600': theme === 'light',
                  'text-white hover:text-blue-400': theme === 'dark'
                })}
                onClick={() => startEditing(`${currentSlideData.id}-title`, currentSlideData.title)}
              >
                {currentSlideData.title}
                <span className="absolute -right-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                  <PencilEditIcon size={16} />
                </span>
              </div>
            )}
            
            <div className="flex-1 flex flex-col justify-center">
              {currentSlideData.layout === 'two-column' ? (
                <div className="grid grid-cols-2 gap-8 h-full">
                  <div className="space-y-4">
                    {currentSlideData.content.slice(0, Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                      <div 
                        key={index} 
                        className={cn("text-lg leading-relaxed cursor-pointer group relative p-2 rounded", {
                          'text-gray-800 hover:bg-gray-100': theme === 'light',
                          'text-white hover:bg-zinc-700': theme === 'dark'
                        })}
                        onClick={() => startEditing(currentSlideData.id, item)}
                      >
                        • {item}
                        <span className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                          <PencilEditIcon size={14} />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {currentSlideData.content.slice(Math.ceil(currentSlideData.content.length / 2)).map((item, index) => (
                      <div 
                        key={index} 
                        className={cn("text-lg leading-relaxed cursor-pointer group relative p-2 rounded", {
                          'text-gray-800 hover:bg-gray-100': theme === 'light',
                          'text-white hover:bg-zinc-700': theme === 'dark'
                        })}
                        onClick={() => startEditing(currentSlideData.id, item)}
                      >
                        • {item}
                        <span className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                          <PencilEditIcon size={14} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentSlideData.content.map((item, index) => (
                    editingSlide === currentSlideData.id && editingContent === item ? (
                      <textarea
                        key={index}
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className={cn("w-full text-lg leading-relaxed bg-transparent border-2 border-blue-500 rounded p-2 focus:outline-none resize-none", {
                          'text-gray-800': theme === 'light',
                          'text-white': theme === 'dark'
                        })}
                        autoFocus
                        rows={3}
                      />
                    ) : (
                      <div 
                        key={index} 
                        className={cn("text-lg leading-relaxed cursor-pointer group relative p-2 rounded", {
                          'text-gray-800 hover:bg-gray-100': theme === 'light',
                          'text-white hover:bg-zinc-700': theme === 'dark'
                        })}
                        onClick={() => startEditing(currentSlideData.id, item)}
                      >
                        • {item}
                        <span className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                          <PencilEditIcon size={14} />
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className={cn("border-t p-4 flex justify-between items-center", {
          'border-gray-200 bg-gray-50': theme === 'light',
          'border-zinc-800 bg-zinc-900': theme === 'dark'
        })}>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={cn("px-4 py-2 bg-blue-500 text-white rounded disabled:cursor-not-allowed hover:bg-blue-600 transition-colors", {
              'disabled:bg-gray-300': theme === 'light',
              'disabled:bg-zinc-600': theme === 'dark'
            })}
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {presentation.slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(`size-3 rounded-full transition-colors`, {
                  'bg-blue-500': index === currentSlide,
                  'bg-gray-300 hover:bg-gray-400': index !== currentSlide && theme === 'light',
                  'bg-zinc-600 hover:bg-zinc-500': index !== currentSlide && theme === 'dark'
                })}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            disabled={currentSlide === presentation.slides.length - 1}
            className={cn("px-4 py-2 bg-blue-500 text-white rounded disabled:cursor-not-allowed hover:bg-blue-600 transition-colors", {
              'disabled:bg-gray-300': theme === 'light',
              'disabled:bg-zinc-600': theme === 'dark'
            })}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}