'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PlusIcon, TrashIcon, EyeIcon, PencilEditIcon } from '@/components/icons';
// Import moved to dynamic import to avoid build issues
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface TextFormat {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  listType?: 'bullet' | 'numbered' | 'none';
}

interface Slide {
  id: string;
  title: string;
  content: string[];
  layout: 'title' | 'content' | 'two-column' | 'image';
  backgroundColor?: string;
  speakerNotes?: string;
  // New positioning data for movable elements
  titlePosition?: { x: number; y: number; width: number; height: number };
  contentPositions?: { x: number; y: number; width: number; height: number }[];
  // Text formatting for title and content
  titleFormat?: TextFormat;
  contentFormats?: TextFormat[];
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

// Helper functions for positioning
const getDefaultTitlePosition = () => ({ x: 10, y: 10, width: 80, height: 15 });
const getDefaultContentPosition = (index: number) => ({ x: 10, y: 30 + (index * 8), width: 80, height: 6 });

export function PresentationEditor({
  content,
  onSaveContent,
  status,
}: PresentationEditorProps) {
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [draggedElement, setDraggedElement] = useState<{ type: 'title' | 'content'; index?: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [localPresentation, setLocalPresentation] = useState<Presentation | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ type: 'title' | 'content'; index?: number } | null>(null);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const { theme } = useTheme();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Parse content and update local state when content changes
  const parsedPresentation = useMemo(() => {
    
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
    } catch (error) {
      
      
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
    
    return presentation;
  }, [content]);

  // Use local presentation if available, otherwise use parsed content
  const presentation = localPresentation || parsedPresentation;
  
  

  // Update local presentation when content changes from external source
  useEffect(() => {
    
    
    
    
    // Always update if streaming, or if we don't have local data yet, 
    // or if the parsed content is different from what we have locally
    const shouldUpdate = 
      status === 'streaming' ||
      !localPresentation ||
      (parsedPresentation.title !== 'Untitled Presentation' && 
       localPresentation.title === 'Untitled Presentation');
    
    if (shouldUpdate) {
      
      setLocalPresentation(parsedPresentation);
    } else {
      
    }
  }, [parsedPresentation, localPresentation, status]);

  const savePresentation = useCallback((updatedPresentation: Presentation) => {
    // Immediately update local state for instant UI feedback
    setLocalPresentation(updatedPresentation);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSaveContent(JSON.stringify(updatedPresentation, null, 2), true);
    }, 500);
  }, [onSaveContent]);

  // Get current format for selected element
  const getCurrentFormat = useCallback((): TextFormat => {
    if (!selectedElement) return {};
    
    const slide = presentation.slides[currentSlide];
    if (selectedElement.type === 'title') {
      return slide.titleFormat || {};
    } else if (selectedElement.type === 'content' && selectedElement.index !== undefined) {
      return slide.contentFormats?.[selectedElement.index] || {};
    }
    return {};
  }, [selectedElement, presentation.slides, currentSlide]);

  // Apply formatting to selected element
  const applyFormat = useCallback((format: Partial<TextFormat>) => {
    if (!selectedElement) return;
    
    const updatedSlides = presentation.slides.map((slide, slideIndex) => {
      if (slideIndex !== currentSlide) return slide;
      
      if (selectedElement.type === 'title') {
        return {
          ...slide,
          titleFormat: { ...slide.titleFormat, ...format }
        };
      } else if (selectedElement.type === 'content' && selectedElement.index !== undefined) {
        const contentFormats = slide.contentFormats || [];
        contentFormats[selectedElement.index] = { ...contentFormats[selectedElement.index], ...format };
        return {
          ...slide,
          contentFormats
        };
      }
      
      return slide;
    });
    
    savePresentation({ ...presentation, slides: updatedSlides });
  }, [selectedElement, presentation, currentSlide, savePresentation]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'title' | 'content', index?: number) => {
    if (editingSlide) return; // Don't allow dragging while editing
    
    e.preventDefault();
    setIsDragging(true);
    setDraggedElement({ type, index });
    
    const rect = (e.target as HTMLElement).closest('.draggable-element')?.getBoundingClientRect();
    if (!rect) return;
    
    const slideContainer = (e.target as HTMLElement).closest('.slide-container');
    if (!slideContainer) return;
    
    const containerRect = slideContainer.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [editingSlide]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedElement) return;
    
    const slideContainer = document.querySelector('.slide-container');
    if (!slideContainer) return;
    
    const containerRect = slideContainer.getBoundingClientRect();
    const x = ((e.clientX - dragOffset.x - containerRect.left) / containerRect.width) * 100;
    const y = ((e.clientY - dragOffset.y - containerRect.top) / containerRect.height) * 100;
    
    // Constrain to slide boundaries
    const constrainedX = Math.max(0, Math.min(90, x));
    const constrainedY = Math.max(0, Math.min(90, y));
    
    // Update position
    const updatedSlides = presentation.slides.map((slide, slideIndex) => {
      if (slideIndex !== currentSlide) return slide;
      
      if (draggedElement.type === 'title') {
        return {
          ...slide,
          titlePosition: {
            ...(slide.titlePosition || getDefaultTitlePosition()),
            x: constrainedX,
            y: constrainedY
          }
        };
      } else if (draggedElement.type === 'content' && draggedElement.index !== undefined) {
        const positions = slide.contentPositions || slide.content.map((_, i) => getDefaultContentPosition(i));
        positions[draggedElement.index!] = {
          ...positions[draggedElement.index!],
          x: constrainedX,
          y: constrainedY
        };
        return {
          ...slide,
          contentPositions: positions
        };
      }
      
      return slide;
    });
    
    savePresentation({ ...presentation, slides: updatedSlides });
  }, [isDragging, draggedElement, dragOffset, presentation, currentSlide, savePresentation]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

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


  const startEditing = (slideId: string, content: string, contentIndex?: number) => {
    setEditingSlide(slideId);
    setEditingContent(content);
    setEditingContentIndex(contentIndex ?? null);
  };

  const saveEdit = () => {
    if (!editingSlide) return;
    
    if (editingSlide === 'presentation-title') {
      const updatedPresentation = {
        ...presentation,
        title: editingContent
      };
      savePresentation(updatedPresentation);
    } else if (editingSlide.endsWith('-title')) {
      const slideId = editingSlide.replace('-title', '');
      const updatedPresentation = {
        ...presentation,
        slides: presentation.slides.map(slide =>
          slide.id === slideId ? { ...slide, title: editingContent } : slide
        )
      };
      savePresentation(updatedPresentation);
    } else {
      const slide = presentation.slides.find(s => s.id === editingSlide);
      if (!slide || editingContentIndex === null) return;
      
      const newContent = [...slide.content];
      newContent[editingContentIndex] = editingContent;
      const updatedPresentation = {
        ...presentation,
        slides: presentation.slides.map(s =>
          s.id === editingSlide ? { ...s, content: newContent } : s
        )
      };
      savePresentation(updatedPresentation);
    }
    setEditingSlide(null);
    setEditingContent('');
    setEditingContentIndex(null);
  };

  const cancelEdit = () => {
    setEditingSlide(null);
    setEditingContent('');
    setEditingContentIndex(null);
  };

  const exportToPPTX = async () => {
    try {
      toast.loading('Generating PPTX file...');
      
      // Dynamic import to avoid build issues
      const { generatePPTX, downloadPPTX } = await import('@/lib/pptx-generator');
      const pptxBlob = await generatePPTX(content);
      
      // Extract presentation title for filename
      let filename = 'presentation.pptx';
      if (presentation.title) {
        filename = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx`;
      }
      
      downloadPPTX(pptxBlob, filename);
      toast.dismiss();
      toast.success('PPTX file exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const exportToHTML = async () => {
    try {
      toast.loading('Generating HTML file...');
      
      // Dynamic import to avoid build issues
      const { generatePresentationHTML, downloadHTML } = await import('@/lib/html-generator');
      const htmlContent = generatePresentationHTML(content);
      
      // Extract presentation title for filename
      let filename = 'presentation.html';
      if (presentation.title) {
        filename = `${presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      }
      
      downloadHTML(htmlContent, filename);
      toast.dismiss();
      toast.success('HTML file exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const nextSlide = useCallback(() => {
    if (currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, presentation.slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is editing or typing in input fields
      if (editingSlide || editingContentIndex !== null) return;
      
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
            {editingSlide === 'presentation-title' ? (
              <input
                type="text"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className={cn("text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none", {
                  'text-gray-800': theme === 'light',
                  'text-white': theme === 'dark'
                })}
                autoFocus
              />
            ) : (
              <h1 
                className={cn("text-2xl font-bold cursor-pointer group relative", {
                  'text-gray-800 hover:text-blue-600': theme === 'light',
                  'text-white hover:text-blue-400': theme === 'dark'
                })}
                onClick={() => startEditing('presentation-title', presentation.title)}
              >
                {presentation.title}
                <span className="absolute -right-6 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                  <PencilEditIcon size={16} />
                </span>
              </h1>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Slide {safeCurrentSlide + 1} of {presentation.slides.length}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={exportToPPTX}
              className="text-sm font-medium"
              title="Export as PPTX"
            >
              Export PPTX
            </Button>
            <Button
              onClick={exportToHTML}
              className="text-sm font-medium"
              variant="outline"
              title="Export as HTML (compatible with Google Slides)"
            >
              Export HTML
            </Button>
            <button
              onClick={() => setShowFormatToolbar(!showFormatToolbar)}
              className={cn("p-2 rounded transition-colors", {
                'bg-blue-500 text-white': showFormatToolbar,
                'hover:bg-gray-200': !showFormatToolbar && theme === 'light',
                'hover:bg-zinc-800': !showFormatToolbar && theme === 'dark',
                'text-gray-600': !showFormatToolbar && theme === 'light',
                'text-gray-400': !showFormatToolbar && theme === 'dark'
              })}
              title="Toggle formatting toolbar"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 10h16M4 15h16M4 20h16" />
              </svg>
            </button>
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

        {/* Formatting Toolbar */}
        {showFormatToolbar && selectedElement && (
          <div className={cn("border-b p-3 flex items-center gap-2 flex-wrap", {
            'border-gray-200 bg-gray-50': theme === 'light',
            'border-zinc-800 bg-zinc-900': theme === 'dark'
          })}>
            {/* Font Family */}
            <select
              value={getCurrentFormat().fontFamily || 'Arial'}
              onChange={(e) => applyFormat({ fontFamily: e.target.value })}
              className={cn("px-2 py-1 rounded border text-sm", {
                'border-gray-300 bg-white': theme === 'light',
                'border-zinc-600 bg-zinc-800 text-white': theme === 'dark'
              })}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>

            {/* Font Size */}
            <select
              value={getCurrentFormat().fontSize || 16}
              onChange={(e) => applyFormat({ fontSize: Number.parseInt(e.target.value) })}
              className={cn("px-2 py-1 rounded border text-sm w-16", {
                'border-gray-300 bg-white': theme === 'light',
                'border-zinc-600 bg-zinc-800 text-white': theme === 'dark'
              })}
            >
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />

            {/* Bold */}
            <button
              onClick={() => applyFormat({ bold: !getCurrentFormat().bold })}
              className={cn("p-2 rounded text-sm font-bold transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().bold,
                'hover:bg-gray-200': !getCurrentFormat().bold && theme === 'light',
                'hover:bg-zinc-800': !getCurrentFormat().bold && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Bold"
            >
              B
            </button>

            {/* Italic */}
            <button
              onClick={() => applyFormat({ italic: !getCurrentFormat().italic })}
              className={cn("p-2 rounded text-sm italic transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().italic,
                'hover:bg-gray-200': !getCurrentFormat().italic && theme === 'light',
                'hover:bg-zinc-800': !getCurrentFormat().italic && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Italic"
            >
              I
            </button>

            {/* Underline */}
            <button
              onClick={() => applyFormat({ underline: !getCurrentFormat().underline })}
              className={cn("p-2 rounded text-sm underline transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().underline,
                'hover:bg-gray-200': !getCurrentFormat().underline && theme === 'light',
                'hover:bg-zinc-800': !getCurrentFormat().underline && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Underline"
            >
              U
            </button>

            {/* Strikethrough */}
            <button
              onClick={() => applyFormat({ strikethrough: !getCurrentFormat().strikethrough })}
              className={cn("p-2 rounded text-sm line-through transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().strikethrough,
                'hover:bg-gray-200': !getCurrentFormat().strikethrough && theme === 'light',
                'hover:bg-zinc-800': !getCurrentFormat().strikethrough && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Strikethrough"
            >
              S
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />

            {/* Text Alignment */}
            <button
              onClick={() => applyFormat({ alignment: 'left' })}
              className={cn("p-2 rounded text-sm transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().alignment === 'left',
                'hover:bg-gray-200': getCurrentFormat().alignment !== 'left' && theme === 'light',
                'hover:bg-zinc-800': getCurrentFormat().alignment !== 'left' && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Align Left"
            >
              ≡
            </button>

            <button
              onClick={() => applyFormat({ alignment: 'center' })}
              className={cn("p-2 rounded text-sm transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().alignment === 'center',
                'hover:bg-gray-200': getCurrentFormat().alignment !== 'center' && theme === 'light',
                'hover:bg-zinc-800': getCurrentFormat().alignment !== 'center' && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Align Center"
            >
              ≡
            </button>

            <button
              onClick={() => applyFormat({ alignment: 'right' })}
              className={cn("p-2 rounded text-sm transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().alignment === 'right',
                'hover:bg-gray-200': getCurrentFormat().alignment !== 'right' && theme === 'light',
                'hover:bg-zinc-800': getCurrentFormat().alignment !== 'right' && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Align Right"
            >
              ≡
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />

            {/* Text Color */}
            <input
              type="color"
              value={getCurrentFormat().color || '#000000'}
              onChange={(e) => applyFormat({ color: e.target.value })}
              className="size-8 rounded border cursor-pointer"
              title="Text Color"
            />

            {/* Background Color */}
            <input
              type="color"
              value={getCurrentFormat().backgroundColor || '#ffffff'}
              onChange={(e) => applyFormat({ backgroundColor: e.target.value })}
              className="size-8 rounded border cursor-pointer"
              title="Background Color"
            />

            <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />

            {/* List Type */}
            <button
              onClick={() => applyFormat({ listType: getCurrentFormat().listType === 'bullet' ? 'none' : 'bullet' })}
              className={cn("p-2 rounded text-sm transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().listType === 'bullet',
                'hover:bg-gray-200': getCurrentFormat().listType !== 'bullet' && theme === 'light',
                'hover:bg-zinc-800': getCurrentFormat().listType !== 'bullet' && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Bullet List"
            >
              •
            </button>

            <button
              onClick={() => applyFormat({ listType: getCurrentFormat().listType === 'numbered' ? 'none' : 'numbered' })}
              className={cn("p-2 rounded text-sm transition-colors", {
                'bg-blue-500 text-white': getCurrentFormat().listType === 'numbered',
                'hover:bg-gray-200': getCurrentFormat().listType !== 'numbered' && theme === 'light',
                'hover:bg-zinc-800': getCurrentFormat().listType !== 'numbered' && theme === 'dark',
                'text-gray-700': theme === 'light',
                'text-gray-300': theme === 'dark'
              })}
              title="Numbered List"
            >
              1.
            </button>
          </div>
        )}

        {/* Slide Content */}
        <div className={cn("flex-1 flex items-center justify-center p-8", {
          'bg-gray-100': theme === 'light',
          'bg-zinc-900': theme === 'dark'
        })}>
          <div className={cn("slide-container border shadow-lg rounded-lg w-full max-w-4xl aspect-[16/9] relative overflow-hidden", {
            'bg-white border-gray-200': theme === 'light',
            'bg-zinc-800 border-zinc-700': theme === 'dark'
          })}>
            {/* Title Element */}
            {(() => {
              const titlePos = currentSlideData.titlePosition || getDefaultTitlePosition();
              return (
                <div
                  className="draggable-element absolute"
                  style={{
                    left: `${titlePos.x}%`,
                    top: `${titlePos.y}%`,
                    width: `${titlePos.width}%`,
                    minHeight: '40px'
                  }}
                >
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
                      className={cn("w-full text-2xl font-bold text-center bg-transparent border-b-2 border-blue-500 focus:outline-none", {
                        'text-gray-800': theme === 'light',
                        'text-white': theme === 'dark'
                      })}
                      autoFocus
                    />
                  ) : (
                    <div className="group cursor-move">
                      <div
                        className={cn("text-2xl font-bold text-center p-2 rounded border-2 transition-colors", {
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedElement?.type === 'title',
                          'border-transparent hover:border-blue-300': selectedElement?.type !== 'title',
                          'text-gray-800 hover:bg-blue-50': theme === 'light',
                          'text-white hover:bg-blue-900/20': theme === 'dark'
                        })}
                        style={{
                          fontFamily: currentSlideData.titleFormat?.fontFamily,
                          fontSize: currentSlideData.titleFormat?.fontSize ? `${currentSlideData.titleFormat.fontSize}px` : undefined,
                          fontWeight: currentSlideData.titleFormat?.bold ? 'bold' : undefined,
                          fontStyle: currentSlideData.titleFormat?.italic ? 'italic' : undefined,
                          textDecoration: [
                            currentSlideData.titleFormat?.underline ? 'underline' : '',
                            currentSlideData.titleFormat?.strikethrough ? 'line-through' : ''
                          ].filter(Boolean).join(' ') || undefined,
                          color: currentSlideData.titleFormat?.color,
                          backgroundColor: currentSlideData.titleFormat?.backgroundColor,
                          textAlign: currentSlideData.titleFormat?.alignment || 'center'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'title')}
                        onDoubleClick={() => startEditing(`${currentSlideData.id}-title`, currentSlideData.title)}
                        onClick={() => {
                          setSelectedElement({ type: 'title' });
                          setShowFormatToolbar(true);
                        }}
                      >
                        {currentSlideData.title}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <span className="bg-blue-500 text-white p-1 rounded-full text-xs cursor-move">⋮⋮</span>
                          <span className="bg-gray-500 text-white p-1 rounded-full text-xs cursor-pointer">
                            <PencilEditIcon size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Content Elements */}
            {currentSlideData.content.map((item, index) => {
              const contentPos = currentSlideData.contentPositions?.[index] || getDefaultContentPosition(index);
              return (
                <div
                  key={index}
                  className="draggable-element absolute"
                  style={{
                    left: `${contentPos.x}%`,
                    top: `${contentPos.y}%`,
                    width: `${contentPos.width}%`,
                    minHeight: '30px'
                  }}
                >
                  {editingSlide === currentSlideData.id && editingContentIndex === index ? (
                    <textarea
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
                      rows={2}
                    />
                  ) : (
                    <div className="group cursor-move">
                      <div
                        className={cn("text-lg leading-relaxed p-2 rounded border-2 transition-colors", {
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedElement?.type === 'content' && selectedElement?.index === index,
                          'border-transparent hover:border-blue-300': !(selectedElement?.type === 'content' && selectedElement?.index === index),
                          'text-gray-800 hover:bg-blue-50': theme === 'light',
                          'text-white hover:bg-blue-900/20': theme === 'dark'
                        })}
                        style={{
                          fontFamily: currentSlideData.contentFormats?.[index]?.fontFamily,
                          fontSize: currentSlideData.contentFormats?.[index]?.fontSize ? `${currentSlideData.contentFormats[index].fontSize}px` : undefined,
                          fontWeight: currentSlideData.contentFormats?.[index]?.bold ? 'bold' : undefined,
                          fontStyle: currentSlideData.contentFormats?.[index]?.italic ? 'italic' : undefined,
                          textDecoration: [
                            currentSlideData.contentFormats?.[index]?.underline ? 'underline' : '',
                            currentSlideData.contentFormats?.[index]?.strikethrough ? 'line-through' : ''
                          ].filter(Boolean).join(' ') || undefined,
                          color: currentSlideData.contentFormats?.[index]?.color,
                          backgroundColor: currentSlideData.contentFormats?.[index]?.backgroundColor,
                          textAlign: currentSlideData.contentFormats?.[index]?.alignment || 'left'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'content', index)}
                        onDoubleClick={() => startEditing(currentSlideData.id, item, index)}
                        onClick={() => {
                          setSelectedElement({ type: 'content', index });
                          setShowFormatToolbar(true);
                        }}
                      >
                        {(() => {
                          const format = currentSlideData.contentFormats?.[index];
                          const listType = format?.listType || 'bullet';
                          const prefix = listType === 'numbered' ? `${index + 1}.` : listType === 'bullet' ? '•' : '';
                          return prefix ? `${prefix} ${item}` : item;
                        })()}
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <span className="bg-blue-500 text-white p-1 rounded-full text-xs cursor-move">⋮⋮</span>
                          <span className="bg-gray-500 text-white p-1 rounded-full text-xs cursor-pointer">
                            <PencilEditIcon size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className={cn("border-t p-4 flex justify-between items-center", {
          'border-gray-200 bg-gray-50': theme === 'light',
          'border-zinc-800 bg-zinc-900': theme === 'dark'
        })}>
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            Previous
          </Button>
          
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
          
          <Button
            onClick={nextSlide}
            disabled={currentSlide === presentation.slides.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}