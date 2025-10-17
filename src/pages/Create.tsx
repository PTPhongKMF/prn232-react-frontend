import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Save, 
  Undo, 
  Redo, 
  Type, 
  Image, 
  Square,
  Table,
  Shapes,
  Grid3X3,
  Trash2,
  FileText,
  Upload,
  Plus,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Minus,
  Palette,
  Copy,
  Clipboard,
  Layers,
  FileDown
} from "lucide-react";
import { cn } from "src/utils/cn";
import { useCreateSlideMutation } from "src/hooks/useSlides";
import PptxGenJS from "pptxgenjs";

// Types
interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'graphic';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  isEditing?: boolean;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
  };
}

interface Slide {
  id: string;
  elements: SlideElement[];
  backgroundColor: string;
}

export default function Create() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const initialSlides = [
    {
      id: '1',
      elements: [],
      backgroundColor: '#ffffff'
    }
  ];
  
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  
  // Debug: Log when slides state changes
  useEffect(() => {
    console.log('Slides state changed:', slides.length, slides);
  }, [slides]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'elements' | 'text' | 'uploads'>('design');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [history, setHistory] = useState<Slide[][]>([initialSlides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slideIndex: number } | null>(null);
  const [copiedSlide, setCopiedSlide] = useState<Slide | null>(null);
  const [isDraggingSlide, setIsDraggingSlide] = useState(false);
  const [dragSlideIndex, setDragSlideIndex] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideTopic, setSlideTopic] = useState('');
  const [slidePrice, setSlidePrice] = useState(0);
  const [slideGrade, setSlideGrade] = useState<number | undefined>();

  const currentSlide = slides[currentSlideIndex];
  const createSlideMutation = useCreateSlideMutation();

  // Add element to slide
  const addElement = useCallback((type: SlideElement['type'], textStyle?: 'heading' | 'subheading' | 'body', symbol?: string) => {
    let content = '';
    let fontSize = 16;
    let fontWeight: 'normal' | 'bold' = 'normal';
    
    if (type === 'text') {
      if (symbol) {
        // Math symbol
        content = symbol;
        fontSize = 48;
        fontWeight = 'bold';
      } else {
        switch (textStyle) {
          case 'heading':
            content = 'Add a heading';
            fontSize = 32;
            fontWeight = 'bold';
            break;
          case 'subheading':
            content = 'Add a subheading';
            fontSize = 24;
            fontWeight = 'bold';
            break;
          case 'body':
            content = 'Add a little bit of body text';
            fontSize = 16;
            fontWeight = 'normal';
            break;
          default:
            content = 'Text';
            fontSize = 16;
            fontWeight = 'normal';
        }
      }
    }

    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? (textStyle === 'heading' ? 300 : 200) : type === 'image' ? 150 : 100,
      height: type === 'text' ? (textStyle === 'heading' ? 60 : 50) : type === 'image' ? 150 : 100,
      content,
      isEditing: type === 'text',
      style: {
        fontSize,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight,
        textAlign: 'left',
        backgroundColor: type === 'shape' ? '#3b82f6' : undefined,
        borderRadius: type === 'shape' ? 0 : undefined,
      }
    };

    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: [...slide.elements, newElement]
        };
      }
      return slide;
    });

    setSlides(newSlides);
    setSelectedElement(newElement.id);
    saveToHistory(newSlides);
  }, [slides, currentSlideIndex]);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSlides);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  // Handle element selection
  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (element?.type === 'text') {
      setShowTextToolbar(true);
      // Start editing text
      const newSlides = slides.map((slide, index) => {
        if (index === currentSlideIndex) {
          return {
            ...slide,
            elements: slide.elements.map(el => 
              el.id === elementId 
                ? { ...el, isEditing: true }
                : el
            )
          };
        }
        return slide;
      });
      setSlides(newSlides);
    } else {
      setShowTextToolbar(false);
    }
  };

  // Handle text editing with auto-resize
  const handleTextEdit = (elementId: string, newContent: string) => {
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (!element) return;

    // Create a temporary div to measure text dimensions
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.fontSize = `${element.style?.fontSize || 16}px`;
    tempDiv.style.fontFamily = element.style?.fontFamily || 'Arial';
    tempDiv.style.fontWeight = element.style?.fontWeight || 'normal';
    tempDiv.style.fontStyle = element.style?.fontStyle || 'normal';
    tempDiv.style.textDecoration = element.style?.textDecoration || 'none';
    tempDiv.style.width = `${element.width}px`;
    tempDiv.style.padding = '8px';
    tempDiv.style.boxSizing = 'border-box';
    tempDiv.textContent = newContent;
    
    document.body.appendChild(tempDiv);
    
    // Calculate required height
    const requiredHeight = Math.max(30, tempDiv.scrollHeight);
    document.body.removeChild(tempDiv);

    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map(el => 
            el.id === elementId 
              ? { 
                  ...el, 
                  content: newContent,
                  height: requiredHeight
                }
              : el
          )
        };
      }
      return slide;
    });
    setSlides(newSlides);
  };

  // Handle text edit end
  const handleTextEditEnd = (elementId: string) => {
    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map(element => 
            element.id === elementId 
              ? { ...element, isEditing: false }
              : element
          )
        };
      }
      return slide;
    });
    setSlides(newSlides);
    saveToHistory(newSlides);
    // Keep text toolbar visible even after editing ends
  };

  // Handle text formatting
  const updateTextStyle = (property: string, value: any) => {
    if (!selectedElement) return;
    
    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map(element => 
            element.id === selectedElement 
              ? { 
                  ...element, 
                  style: { 
                    ...element.style, 
                    [property]: value 
                  } 
                }
              : element
          )
        };
      }
      return slide;
    });
    setSlides(newSlides);
    saveToHistory(newSlides);
    
    // Restore selection after style update
    setTimeout(() => {
      const textareas = document.querySelectorAll('textarea');
      const activeTextarea = Array.from(textareas).find(ta => 
        ta === document.activeElement || ta.parentElement?.contains(document.activeElement)
      ) as HTMLTextAreaElement;
      
      if (activeTextarea && savedSelection) {
        activeTextarea.focus();
        activeTextarea.setSelectionRange(savedSelection.start, savedSelection.end);
      }
    }, 50);
  };

  // Get current text element
  const getCurrentTextElement = () => {
    return currentSlide.elements.find(el => el.id === selectedElement);
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const element = currentSlide.elements.find(el => el.id === elementId);
    
    if (element && canvasRect) {
      // Calculate offset based on the resize handle position
      let offsetX = 0;
      let offsetY = 0;
      
      switch (handle) {
        case 'se': // Southeast - offset from element's right-bottom corner
          offsetX = e.clientX - canvasRect.left - (element.x + element.width);
          offsetY = e.clientY - canvasRect.top - (element.y + element.height);
          break;
        case 'sw': // Southwest - offset from element's left-bottom corner
          offsetX = e.clientX - canvasRect.left - element.x;
          offsetY = e.clientY - canvasRect.top - (element.y + element.height);
          break;
        case 'ne': // Northeast - offset from element's right-top corner
          offsetX = e.clientX - canvasRect.left - (element.x + element.width);
          offsetY = e.clientY - canvasRect.top - element.y;
          break;
        case 'nw': // Northwest - offset from element's left-top corner
          offsetX = e.clientX - canvasRect.left - element.x;
          offsetY = e.clientY - canvasRect.top - element.y;
          break;
        case 'e': // East - offset from element's right side
          offsetX = e.clientX - canvasRect.left - (element.x + element.width);
          offsetY = e.clientY - canvasRect.top - element.y;
          break;
        case 'w': // West - offset from element's left side
          offsetX = e.clientX - canvasRect.left - element.x;
          offsetY = e.clientY - canvasRect.top - element.y;
          break;
      }
      
      setDragOffset({
        x: offsetX,
        y: offsetY
      });
    }
  };

  // Handle resize with throttling for smooth performance
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !selectedElement || !resizeHandle) return;
    
    // Throttle resize updates for smooth performance
    requestAnimationFrame(() => {
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const element = currentSlide.elements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newWidth = element.width;
    let newHeight = element.height;
    let newElementX = element.x;
    let newElementY = element.y;
    
    // Calculate new dimensions based on resize handle
    switch (resizeHandle) {
      case 'se': // Southeast - resize from right-bottom corner
        newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
        newHeight = Math.max(30, e.clientY - canvasRect.top - element.y - dragOffset.y);
        break;
      case 'sw': // Southwest - resize from left-bottom corner
        newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
        newHeight = Math.max(30, e.clientY - canvasRect.top - element.y - dragOffset.y);
        newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
        break;
      case 'ne': // Northeast - resize from right-top corner
        newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
        newHeight = Math.max(30, (element.y + element.height) - (e.clientY - canvasRect.top - dragOffset.y));
        newElementY = Math.min(e.clientY - canvasRect.top - dragOffset.y, element.y + element.height - 30);
        break;
      case 'nw': // Northwest - resize from left-top corner
        newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
        newHeight = Math.max(30, (element.y + element.height) - (e.clientY - canvasRect.top - dragOffset.y));
        newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
        newElementY = Math.min(e.clientY - canvasRect.top - dragOffset.y, element.y + element.height - 30);
        break;
      case 'e': // East - resize from right side
        newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
        break;
      case 'w': // West - resize from left side
        newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
        newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
        break;
    }
    
    // Calculate font size and height for text elements
    let newFontSize = element.style?.fontSize || 16;
    if (element.type === 'text') {
      const isCornerHandle = ['se', 'sw', 'ne', 'nw'].includes(resizeHandle);
      const isSideHandle = ['e', 'w'].includes(resizeHandle);
      
      if (isCornerHandle) {
        // For corner handles: scale font size based on width ratio
        const currentWidth = element.width;
        const widthRatio = newWidth / currentWidth;
        const currentFontSize = element.style?.fontSize || 16;
        // Gentle zoom - optimized sensitivity boost for smooth control
        newFontSize = currentFontSize * (widthRatio * 1.009);
      }
      // For side handles (e, w): keep original font size
      
      // Calculate height based on content, width, and font size
      if (element.content && element.content.trim()) {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.wordWrap = 'break-word';
        tempDiv.style.fontSize = `${newFontSize}px`;
        tempDiv.style.fontFamily = element.style?.fontFamily || 'Arial';
        tempDiv.style.fontWeight = element.style?.fontWeight || 'normal';
        tempDiv.style.fontStyle = element.style?.fontStyle || 'normal';
        tempDiv.style.textDecoration = element.style?.textDecoration || 'none';
        tempDiv.style.textAlign = element.style?.textAlign || 'left';
        tempDiv.style.width = `${newWidth}px`;
        tempDiv.style.padding = '8px';
        tempDiv.style.boxSizing = 'border-box';
        tempDiv.style.lineHeight = '1.2';
        tempDiv.textContent = element.content;
        
        document.body.appendChild(tempDiv);
        const measuredHeight = tempDiv.scrollHeight;
        document.body.removeChild(tempDiv);
        
        // For corner handles: use measured height (zoom behavior)
        // For side handles: use measured height (text wrap behavior)
        if (isCornerHandle || isSideHandle) {
          newHeight = Math.max(measuredHeight, 30);
        }
      } else {
        // If no content, use minimum height
        newHeight = Math.max(newHeight, 30);
      }
    }
    
    setDragPreview({
      x: newElementX,
      y: newElementY
    });
    
    // Update element with new dimensions and font size (for corner handles)
    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map(el => 
            el.id === selectedElement 
              ? { 
                  ...el, 
                  x: newElementX,
                  y: newElementY,
                  width: newWidth,
                  height: newHeight,
                  style: {
                    ...el.style,
                    fontSize: element.type === 'text' ? newFontSize : el.style?.fontSize
                  }
                }
              : el
          )
        };
      }
      return slide;
    });
    setSlides(newSlides);
    
    }); // End requestAnimationFrame
  }, [isResizing, selectedElement, resizeHandle, dragOffset, currentSlide.elements, slides, currentSlideIndex]);

  // Handle delete element
  const handleDeleteElement = (elementId: string) => {
    const newSlides = slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.filter(el => el.id !== elementId)
        };
      }
      return slide;
    });

    setSlides(newSlides);
    setSelectedElement(null);
    saveToHistory(newSlides);
  };

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
      setShowTextToolbar(false);
    }
  };

  // Handle drag start (always enabled, no tool required)
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    // Don't start drag if editing text
    const element = currentSlide.elements.find(el => el.id === elementId);
    if (element?.isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElement(elementId);
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (element && canvasRect) {
      setDragOffset({
        x: e.clientX - canvasRect.left - element.x,
        y: e.clientY - canvasRect.top - element.y
      });
    }
  };

  // Handle drag with throttling for better performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      // Constrain to canvas bounds
      const element = currentSlide.elements.find(el => el.id === selectedElement);
      const elementWidth = element?.width || 100;
      const elementHeight = element?.height || 50;
      
      const constrainedX = Math.max(0, Math.min(newX, 800 - elementWidth));
      const constrainedY = Math.max(0, Math.min(newY, 600 - elementHeight));

      // Update preview position for smooth dragging
      setDragPreview({ x: constrainedX, y: constrainedY });
    });
  }, [isDragging, selectedElement, dragOffset, currentSlide.elements]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (isDragging && selectedElement && dragPreview) {
      // Apply the final position to the actual element
      const newSlides = slides.map((slide, index) => {
        if (index === currentSlideIndex) {
          return {
            ...slide,
            elements: slide.elements.map(element => 
              element.id === selectedElement 
                ? { ...element, x: dragPreview.x, y: dragPreview.y }
                : element
            )
          };
        }
        return slide;
      });

      setSlides(newSlides);
      setIsDragging(false);
      setDragPreview(null);
      saveToHistory(newSlides);
    }
  }, [isDragging, selectedElement, dragPreview, slides, currentSlideIndex, saveToHistory]);

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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => handleResize(e);
      const handleMouseUp = () => {
        setIsResizing(false);
        setResizeHandle(null);
        setDragPreview(null);
        saveToHistory(slides);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleResize, slides]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when save dialog is open
      if (showSaveDialog) {
        return;
      }
      
      if (e.key === 'Delete' && selectedElement) {
        // Delete selected element
        setSlides(prevSlides => {
          const newSlides = prevSlides.map((slide, index) => {
            if (index === currentSlideIndex) {
              return {
                ...slide,
                elements: slide.elements.filter(el => el.id !== selectedElement)
              };
            }
            return slide;
          });
          saveToHistory(newSlides);
          return newSlides;
        });
        setSelectedElement(null);
      } else if (e.key === 'Escape') {
        setContextMenu(null);
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c' && !selectedElement) {
          // Copy current slide
          e.preventDefault();
          setCopiedSlide(slides[currentSlideIndex]);
        } else if (e.key === 'v' && copiedSlide && !selectedElement) {
          // Paste slide after current
          e.preventDefault();
          const newSlide = {
            ...copiedSlide,
            id: `slide-${Date.now()}`,
            elements: copiedSlide.elements.map(el => ({
              ...el,
              id: `element-${Date.now()}-${Math.random()}`
            }))
          };
          const newSlides = [...slides];
          newSlides.splice(currentSlideIndex + 1, 0, newSlide);
          setSlides(newSlides);
          saveToHistory(newSlides);
          setCurrentSlideIndex(currentSlideIndex + 1);
        } else if (e.key === 'd' && !selectedElement) {
          // Duplicate current slide
          e.preventDefault();
          const currentSlide = slides[currentSlideIndex];
          const duplicatedSlide = {
            ...currentSlide,
            id: `slide-${Date.now()}`,
            elements: currentSlide.elements.map(el => ({
              ...el,
              id: `element-${Date.now()}-${Math.random()}`
            }))
          };
          const newSlides = [...slides];
          newSlides.splice(currentSlideIndex + 1, 0, duplicatedSlide);
          setSlides(newSlides);
          saveToHistory(newSlides);
          setCurrentSlideIndex(currentSlideIndex + 1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, currentSlideIndex, contextMenu, copiedSlide, showSaveDialog, slides, saveToHistory]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu && !(e.target as Element).closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  // Handle global mouse events for slide dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingSlide) {
        setIsDraggingSlide(false);
        setDragSlideIndex(null);
        document.body.style.cursor = '';
        
        // Remove all ring classes
        document.querySelectorAll('[data-slide-index]').forEach(el => {
          el.classList.remove('ring-2', 'ring-blue-400');
        });
      }
    };

    if (isDraggingSlide) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingSlide]);

  // Add new slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      backgroundColor: '#ffffff'
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    saveToHistory(newSlides);
  };

  const duplicateSlide = (slideIndex: number) => {
    const slideToDuplicate = slides[slideIndex];
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      elements: slideToDuplicate.elements.map(element => ({
        ...element,
        id: `element-${Date.now()}-${Math.random()}`
      }))
    };
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(slideIndex + 1);
    saveToHistory(newSlides);
    setContextMenu(null);
  };

  const deleteSlide = (slideIndex: number) => {
    console.log('deleteSlide called with index:', slideIndex, 'showSaveDialog:', showSaveDialog);
    if (slides.length <= 1) {
      alert('Cannot delete the last slide');
      return;
    }
    const newSlides = slides.filter((_, index) => index !== slideIndex);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    } else if (currentSlideIndex > slideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
    saveToHistory(newSlides);
    setContextMenu(null);
  };

  const handleSlideRightClick = (e: React.MouseEvent, slideIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Position context menu above the slide thumbnail
    const rect = e.currentTarget.getBoundingClientRect();
    const contextMenuHeight = 200; // Approximate height of context menu
    
    let y = rect.top - contextMenuHeight - 10; // Position above by default
    
    // If not enough space above, position below
    if (y < 10) {
      y = rect.bottom + 10;
    }
    
    // Ensure it doesn't go off screen horizontally
    let x = e.clientX;
    const contextMenuWidth = 200; // Approximate width of context menu
    if (x + contextMenuWidth > window.innerWidth) {
      x = window.innerWidth - contextMenuWidth - 10;
    }
    
    setContextMenu({
      x,
      y,
      slideIndex
    });
  };

  const handleSlideClick = (slideIndex: number) => {
    setCurrentSlideIndex(slideIndex);
    setContextMenu(null);
  };

  const copySlide = (slideIndex: number) => {
    const slideToCopy = slides[slideIndex];
    setCopiedSlide(slideToCopy);
    setContextMenu(null);
  };

  const pasteSlide = (slideIndex: number) => {
    if (!copiedSlide) return;
    
    const pastedSlide: Slide = {
      ...copiedSlide,
      id: `slide-${Date.now()}`,
      elements: copiedSlide.elements.map(element => ({
        ...element,
        id: `element-${Date.now()}-${Math.random()}`
      }))
    };
    
    const newSlides = [...slides];
    newSlides.splice(slideIndex + 1, 0, pastedSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(slideIndex + 1);
    saveToHistory(newSlides);
    setContextMenu(null);
  };

  const handleSlideMouseDown = (e: React.MouseEvent, slideIndex: number) => {
    // Only start drag if it's not a right click
    if (e.button !== 0) return;
    
    e.preventDefault();
    setIsDraggingSlide(true);
    setDragSlideIndex(slideIndex);
    
    // Add drag cursor
    document.body.style.cursor = 'grabbing';
  };

  const handleSlideMouseUp = (e: React.MouseEvent, slideIndex: number) => {
    if (!isDraggingSlide || dragSlideIndex === null) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    setIsDraggingSlide(false);
    setDragSlideIndex(null);
    document.body.style.cursor = '';
    
    // If dropped on different slide, reorder
    if (dragSlideIndex !== slideIndex) {
      const newSlides = [...slides];
      const draggedSlide = newSlides[dragSlideIndex];
      
      // Remove from original position
      newSlides.splice(dragSlideIndex, 1);
      
      // Insert at new position
      const insertIndex = slideIndex > dragSlideIndex ? slideIndex - 1 : slideIndex;
      newSlides.splice(insertIndex, 0, draggedSlide);
      
      setSlides(newSlides);
      setCurrentSlideIndex(insertIndex);
      saveToHistory(newSlides);
    }
  };

  const handleSlideMouseEnter = (slideIndex: number) => {
    if (isDraggingSlide && dragSlideIndex !== null && dragSlideIndex !== slideIndex) {
      // Add visual feedback for drop target
      const slideElement = document.querySelector(`[data-slide-index="${slideIndex}"]`);
      if (slideElement) {
        slideElement.classList.add('ring-2', 'ring-blue-400');
      }
    }
  };

  const handleSlideMouseLeave = (slideIndex: number) => {
    const slideElement = document.querySelector(`[data-slide-index="${slideIndex}"]`);
    if (slideElement) {
      slideElement.classList.remove('ring-2', 'ring-blue-400');
    }
  };


  // Handle save slide
  const exportToPowerPoint = () => {
    if (slides.length === 0) {
      alert('Please add at least one slide to export');
      return;
    }

    try {
      // Create new presentation
      const pptx = new PptxGenJS();
      
      // Set presentation properties
      pptx.layout = 'LAYOUT_16x9'; // 16:9 aspect ratio
      pptx.author = 'MathSlide Creator';
      pptx.company = 'MathSlide Learning';
      pptx.subject = slideTopic || 'Mathematics Presentation';
      pptx.title = slideTitle || 'Untitled Presentation';

      // Add slides
      slides.forEach((slide) => {
        const pptxSlide = pptx.addSlide();
        
        // Set slide background
        pptxSlide.background = { color: slide.backgroundColor || '#ffffff' };
        
        // Add elements to slide
        slide.elements.forEach((element) => {
          const elementProps: any = {
            x: (element.x / 800) * 10, // Convert to inches (assuming 800px = 10 inches)
            y: (element.y / 600) * 5.625, // Convert to inches (assuming 600px = 5.625 inches)
            w: (element.width / 800) * 10,
            h: (element.height / 600) * 5.625,
          };

          switch (element.type) {
            case 'text':
              pptxSlide.addText(element.content || 'Text', {
                ...elementProps,
                fontSize: parseInt(String(element.style?.fontSize)) || 16,
                color: element.style?.color || '#000000',
                bold: element.style?.fontWeight === 'bold',
                italic: element.style?.fontStyle === 'italic',
                underline: element.style?.textDecoration === 'underline',
                align: element.style?.textAlign === 'center' ? 'center' : 
                       element.style?.textAlign === 'right' ? 'right' : 'left',
                fontFace: element.style?.fontFamily || 'Arial',
              });
              break;

            case 'image':
              if (element.content) {
                pptxSlide.addImage({
                  ...elementProps,
                  data: element.content, // Base64 data URL
                });
              }
              break;

            case 'shape':
              pptxSlide.addShape('rect', {
                ...elementProps,
                fill: { color: element.style?.backgroundColor || '#f3f4f6' },
                line: { color: '#d1d5db', width: 1 },
              });
              break;

            case 'table':
              pptxSlide.addTable([
                [{ text: 'Cell 1', options: { fontSize: 12 } }],
                [{ text: 'Cell 2', options: { fontSize: 12 } }]
              ], {
                ...elementProps,
                border: { type: 'solid', color: '#d1d5db', pt: 1 },
                fill: { color: '#ffffff' },
              });
              break;

            case 'graphic':
              pptxSlide.addShape('rect', {
                ...elementProps,
                fill: { type: 'gradient', gradientStops: [
                  { position: 0, color: '#3b82f6' },
                  { position: 100, color: '#8b5cf6' }
                ]},
              });
              break;
          }
        });
      });

      // Generate and download
      const fileName = slideTitle 
        ? `${slideTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
        : `MathPresentation_${new Date().toISOString().split('T')[0]}.pptx`;
      
      pptx.writeFile({ fileName });
      
      console.log(`PowerPoint exported: ${fileName} with ${slides.length} slides`);
      
    } catch (error) {
      console.error('Error exporting PowerPoint:', error);
      alert('Failed to export PowerPoint file. Please try again.');
    }
  };

  const handleSavePresentation = async () => {
    if (!slideTitle.trim()) {
      alert('Please enter a presentation title');
      return;
    }

    if (!slideTopic.trim()) {
      alert('Please enter a presentation topic');
      return;
    }

    if (slidePrice < 0) {
      alert('Price must be non-negative');
      return;
    }

    if (!slideGrade || slideGrade < 1 || slideGrade > 12) {
      alert('Please enter a valid grade (1-12)');
      return;
    }

    if (slides.length === 0) {
      alert('Please add at least one slide to save');
      return;
    }

    try {
      // Prepare presentation data with all slides
      const presentationData = {
        title: slideTitle,
        topic: slideTopic,
        price: slidePrice,
        grade: slideGrade,
        isPublished: false,
        slidePages: slides.map((slide, index) => ({
          orderNumber: index + 1,
          title: `Slide ${index + 1}`,
          content: JSON.stringify({
            elements: slide.elements.map(element => ({
              ...element,
              // Ensure all elements have proper styling
              style: {
                fontSize: element.style?.fontSize || 16,
                fontFamily: element.style?.fontFamily || 'Arial',
                color: element.style?.color || '#000000',
                fontWeight: element.style?.fontWeight || 'normal',
                fontStyle: element.style?.fontStyle || 'normal',
                textDecoration: element.style?.textDecoration || 'none',
                textAlign: element.style?.textAlign || 'left',
                backgroundColor: element.style?.backgroundColor || 'transparent',
                borderRadius: element.style?.borderRadius || '0px'
              }
            })),
            backgroundColor: slide.backgroundColor || '#ffffff'
          })
        }))
      };

      console.log('Saving presentation with:', {
        title: presentationData.title,
        topic: presentationData.topic,
        price: presentationData.price,
        grade: presentationData.grade,
        totalSlides: presentationData.slidePages.length,
        totalElements: slides.reduce((sum, slide) => sum + slide.elements.length, 0)
      });

      // Generate a REAL PPTX from current slides using pptxgenjs (frontend)
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'MathSlide Creator';
      pptx.company = 'MathSlide Learning';
      pptx.subject = slideTopic || 'Mathematics Presentation';
      pptx.title = slideTitle || 'Untitled Presentation';

      slides.forEach((slide) => {
        const pptxSlide = pptx.addSlide();
        pptxSlide.background = { color: slide.backgroundColor || '#ffffff' };

        slide.elements.forEach((element) => {
          const elementProps: any = {
            x: (element.x / 800) * 10,
            y: (element.y / 600) * 5.625,
            w: (element.width / 800) * 10,
            h: (element.height / 600) * 5.625,
          };

          switch (element.type) {
            case 'text':
              pptxSlide.addText(element.content || 'Text', {
                ...elementProps,
                fontSize: parseInt(String(element.style?.fontSize)) || 16,
                color: element.style?.color || '#000000',
                bold: element.style?.fontWeight === 'bold',
                italic: element.style?.fontStyle === 'italic',
                underline: element.style?.textDecoration === 'underline',
                align:
                  element.style?.textAlign === 'center'
                    ? 'center'
                    : element.style?.textAlign === 'right'
                      ? 'right'
                      : 'left',
                fontFace: element.style?.fontFamily || 'Arial',
              });
              break;
            case 'image':
              if (element.content) {
                pptxSlide.addImage({
                  ...elementProps,
                  data: element.content,
                });
              }
              break;
            case 'shape':
              pptxSlide.addShape('rect', {
                ...elementProps,
                fill: { color: element.style?.backgroundColor || '#f3f4f6' },
                line: { color: '#d1d5db', width: 1 },
              });
              break;
            case 'table':
              pptxSlide.addTable(
                [
                  [{ text: 'Cell 1', options: { fontSize: 12 } }],
                  [{ text: 'Cell 2', options: { fontSize: 12 } }],
                ],
                {
                  ...elementProps,
                  border: { type: 'solid', color: '#d1d5db', pt: 1 },
                  fill: { color: '#ffffff' },
                },
              );
              break;
            case 'graphic':
              pptxSlide.addShape('rect', {
                ...elementProps,
                fill: {
                  type: 'gradient',
                  gradientStops: [
                    { position: 0, color: '#3b82f6' },
                    { position: 100, color: '#8b5cf6' },
                  ],
                },
              });
              break;
          }
        });
      });

      const blob = (await (pptx as any).write({ outputType: 'blob' })) as Blob;
      const realFile = new File([blob as BlobPart], `${slideTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`, {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      await createSlideMutation.mutateAsync({
        slideDto: presentationData,
        file: realFile,
      });

      alert(`Presentation "${slideTitle}" saved successfully with ${slides.length} slides!`);
      setShowSaveDialog(false);
      // Reset form but keep slides
      setSlideTitle('');
      setSlideTopic('');
      setSlidePrice(0);
      setSlideGrade(undefined);
    } catch (error) {
      console.error('Failed to save presentation:', error);
      alert('Failed to save presentation. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Create Slide</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <Redo size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={exportToPowerPoint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileDown size={16} />
            Export PPTX
          </button>
          <button 
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save size={16} />
            Save to Cloud
          </button>
        </div>
      </div>

      {/* Text Formatting Toolbar */}
      {showTextToolbar && selectedElement && (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 z-19">
          {/* Font Family */}
          <select
            value={getCurrentTextElement()?.style?.fontFamily || 'Arial'}
            onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
          </select>

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateTextStyle('fontSize', Math.max(4, (getCurrentTextElement()?.style?.fontSize || 16) - 2))}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              value={Math.round(getCurrentTextElement()?.style?.fontSize || 16)}
              onChange={(e) => updateTextStyle('fontSize', parseInt(e.target.value) || 16)}
              className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="4"
              step="0.5"
            />
            <button
              onClick={() => updateTextStyle('fontSize', (getCurrentTextElement()?.style?.fontSize || 16) + 2)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Font Color */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <input
                type="color"
                value={getCurrentTextElement()?.style?.color || '#000000'}
                onChange={(e) => updateTextStyle('color', e.target.value)}
                onMouseDown={() => {
                  // Save current selection before opening color picker
                  const activeElement = document.activeElement as HTMLTextAreaElement;
                  if (activeElement && activeElement.tagName === 'TEXTAREA') {
                    setSavedSelection({
                      start: activeElement.selectionStart || 0,
                      end: activeElement.selectionEnd || 0
                    });
                    console.log('Saved selection:', activeElement.selectionStart, activeElement.selectionEnd);
                  }
                }}
                onBlur={() => {
                  // Restore focus to textarea when color picker closes
                  setTimeout(() => {
                    const textareas = document.querySelectorAll('textarea');
                    const activeTextarea = Array.from(textareas).find(ta => 
                      ta.getAttribute('data-element-id') === selectedElement
                    ) as HTMLTextAreaElement;
                    
                    if (activeTextarea && savedSelection) {
                      activeTextarea.focus();
                      activeTextarea.setSelectionRange(savedSelection.start, savedSelection.end);
                      console.log('Restored selection:', savedSelection.start, savedSelection.end);
                    }
                  }, 100);
                }}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                title="Font Color"
              />
            </div>
            <Palette size={16} className="text-gray-500" />
          </div>

          {/* Text Styling */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
            <button
              onClick={() => updateTextStyle('fontWeight', getCurrentTextElement()?.style?.fontWeight === 'bold' ? 'normal' : 'bold')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.fontWeight === 'bold' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => updateTextStyle('fontStyle', getCurrentTextElement()?.style?.fontStyle === 'italic' ? 'normal' : 'italic')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.fontStyle === 'italic' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => updateTextStyle('textDecoration', getCurrentTextElement()?.style?.textDecoration === 'underline' ? 'none' : 'underline')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.textDecoration === 'underline' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
            <button
              onClick={() => updateTextStyle('textAlign', 'left')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.textAlign === 'left' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => updateTextStyle('textAlign', 'center')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.textAlign === 'center' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => updateTextStyle('textAlign', 'right')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.textAlign === 'right' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => updateTextStyle('textAlign', 'justify')}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.style?.textAlign === 'justify' ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <AlignJustify size={16} />
            </button>
          </div>

          {/* List */}
          <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
            <button
              onClick={() => {
                const currentContent = getCurrentTextElement()?.content || '';
                let newContent = '';
                
                if (currentContent.includes('•')) {
                  // Remove bullet points
                  newContent = currentContent.replace(/•\s*/g, '');
                } else {
                  // Add bullet points to each line
                  const lines = currentContent.split('\n');
                  newContent = lines.map(line => 
                    line.trim() === '' ? line : `• ${line}`
                  ).join('\n');
                }
                
                // Update content directly
                if (selectedElement) {
                  const newSlides = slides.map((slide, index) => {
                    if (index === currentSlideIndex) {
                      return {
                        ...slide,
                        elements: slide.elements.map(element => 
                          element.id === selectedElement 
                            ? { ...element, content: newContent }
                            : element
                        )
                      };
                    }
                    return slide;
                  });
                  setSlides(newSlides);
                  saveToHistory(newSlides);
                }
              }}
              className={cn(
                "p-2 rounded hover:bg-gray-100 transition-colors",
                getCurrentTextElement()?.content?.includes('•') ? "bg-blue-100 text-blue-700" : ""
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Canva Style with Hover Expand */}
        <div className="relative flex">
          {/* Narrow Icon Bar */}
          <div className="w-16 bg-white border-r border-gray-200 flex flex-col relative z-10">
            {/* Navbar Items */}
            <div className="flex flex-col">
              <button
                onClick={() => {
                  if (activeTab === 'design' && isSidebarExpanded) {
                    setIsSidebarExpanded(false);
                  } else {
                    setActiveTab('design');
                    setIsSidebarExpanded(true);
                  }
                }}
                onMouseEnter={() => {
                  if (!isSidebarExpanded) {
                    setHoveredTab('design');
                  }
                }}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "p-4 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200",
                  activeTab === 'design' ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <FileText size={20} />
                <span>Design</span>
              </button>
              
              <button
                onClick={() => {
                  if (activeTab === 'elements' && isSidebarExpanded) {
                    setIsSidebarExpanded(false);
                  } else {
                    setActiveTab('elements');
                    setIsSidebarExpanded(true);
                  }
                }}
                onMouseEnter={() => {
                  if (!isSidebarExpanded) {
                    setHoveredTab('elements');
                  }
                }}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "p-4 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200",
                  activeTab === 'elements' ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Shapes size={20} />
                <span>Math</span>
              </button>
              
              <button
                onClick={() => {
                  if (activeTab === 'text' && isSidebarExpanded) {
                    setIsSidebarExpanded(false);
                  } else {
                    setActiveTab('text');
                    setIsSidebarExpanded(true);
                  }
                }}
                onMouseEnter={() => {
                  if (!isSidebarExpanded) {
                    setHoveredTab('text');
                  }
                }}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "p-4 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200",
                  activeTab === 'text' ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Type size={20} />
                <span>Text</span>
              </button>
              
              <button
                onClick={() => {
                  if (activeTab === 'uploads' && isSidebarExpanded) {
                    setIsSidebarExpanded(false);
                  } else {
                    setActiveTab('uploads');
                    setIsSidebarExpanded(true);
                  }
                }}
                onMouseEnter={() => {
                  if (!isSidebarExpanded) {
                    setHoveredTab('uploads');
                  }
                }}
                onMouseLeave={() => setHoveredTab(null)}
                className={cn(
                  "p-4 flex flex-col items-center gap-1 text-xs font-medium transition-all duration-200",
                  activeTab === 'uploads' ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Upload size={20} />
                <span>Uploads</span>
              </button>
              
            </div>
          </div>

          {/* Expandable Content Panel */}
          {((activeTab === 'design' && isSidebarExpanded) || hoveredTab === 'design') && (
            <div className="w-80 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative h-full flex flex-col">
              {/* Collapse Button - Fixed position at right edge */}
              {isSidebarExpanded && activeTab === 'design' && (
                <button
                  onClick={() => setIsSidebarExpanded(false)}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 z-10"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              )}
              <div className="p-6 flex-1 overflow-y-auto">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Use 4+ words to describe..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6">
                <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600">Templates</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Layouts</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Styles</button>
              </div>
              
              {/* Templates Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Premium Templates for You</h3>
                  <button className="text-xs text-purple-600 hover:text-purple-700">See all</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-green-400 to-green-600 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200" />
                </div>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">All results</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="aspect-video bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-red-400 to-red-600 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg border border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all duration-200" />
                  <button className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Math Elements Tab */}
        {((activeTab === 'elements' && isSidebarExpanded) || hoveredTab === 'elements') && (
          <div className="w-80 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative h-full flex flex-col">
            {/* Collapse Button */}
            {isSidebarExpanded && activeTab === 'elements' && (
              <button
                onClick={() => setIsSidebarExpanded(false)}
                className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 z-10"
              >
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            )}
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Operations */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Operations</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => addElement('text', 'heading', '+')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">+</span>
                      <span className="text-xs">Plus</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '−')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">−</span>
                      <span className="text-xs">Minus</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '×')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">×</span>
                      <span className="text-xs">Multiply</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '÷')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">÷</span>
                      <span className="text-xs">Divide</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '=')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">=</span>
                      <span className="text-xs">Equals</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '≠')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">≠</span>
                      <span className="text-xs">Not Equal</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '<')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">&lt;</span>
                      <span className="text-xs">Less</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '>')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-2xl">&gt;</span>
                      <span className="text-xs">Greater</span>
                    </button>
                  </div>
                </div>

                {/* Fractions */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Fractions & Decimals</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => addElement('text', 'heading', '½')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">½</span>
                      <span className="text-xs">Half</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '⅓')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">⅓</span>
                      <span className="text-xs">Third</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '¼')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">¼</span>
                      <span className="text-xs">Quarter</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '⅔')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">⅔</span>
                      <span className="text-xs">Two Thirds</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '¾')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">¾</span>
                      <span className="text-xs">Three Fourths</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '%')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">%</span>
                      <span className="text-xs">Percent</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '‰')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">‰</span>
                      <span className="text-xs">Per mille</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '°')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">°</span>
                      <span className="text-xs">Degree</span>
                    </button>
                  </div>
                </div>

                {/* Advanced Symbols */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced Symbols</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => addElement('text', 'heading', '√')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">√</span>
                      <span className="text-xs">Square Root</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '∛')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">∛</span>
                      <span className="text-xs">Cube Root</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', 'π')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">π</span>
                      <span className="text-xs">Pi</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '∞')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">∞</span>
                      <span className="text-xs">Infinity</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '∑')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">∑</span>
                      <span className="text-xs">Sum</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '∫')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">∫</span>
                      <span className="text-xs">Integral</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', '∆')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">∆</span>
                      <span className="text-xs">Delta</span>
                    </button>
                    <button onClick={() => addElement('text', 'heading', 'α')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">α</span>
                      <span className="text-xs">Alpha</span>
                    </button>
                  </div>
                </div>

                {/* Geometric Shapes */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Geometric Shapes</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => addElement('shape')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <Square size={20} />
                      <span className="text-xs">Square</span>
                    </button>
                    <button onClick={() => addElement('shape')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">○</span>
                      <span className="text-xs">Circle</span>
                    </button>
                    <button onClick={() => addElement('shape')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">△</span>
                      <span className="text-xs">Triangle</span>
                    </button>
                    <button onClick={() => addElement('shape')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <span className="text-lg">◇</span>
                      <span className="text-xs">Diamond</span>
                    </button>
                    <button onClick={() => addElement('table')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <Table size={20} />
                      <span className="text-xs">Grid</span>
                    </button>
                    <button onClick={() => addElement('graphic')} className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 flex flex-col items-center gap-1 hover:shadow-md transition-all duration-200">
                      <Shapes size={20} />
                      <span className="text-xs">Graph</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Text Tab */}
          {((activeTab === 'text' && isSidebarExpanded) || hoveredTab === 'text') && (
            <div className="w-80 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative h-full flex flex-col">
              {/* Collapse Button - Fixed position at right edge */}
              {isSidebarExpanded && activeTab === 'text' && (
                <button
                  onClick={() => setIsSidebarExpanded(false)}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 z-10"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              )}
              <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <button
                    onClick={() => addElement('text')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 flex items-center gap-3 transition-all duration-200"
                  >
                    <Plus size={20} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Add a text box</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Default text styles</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => addElement('text', 'heading')}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="text-lg font-bold">Add a heading</div>
                    </button>
                    <button
                      onClick={() => addElement('text', 'subheading')}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="text-base font-semibold">Add a subheading</div>
                    </button>
                    <button
                      onClick={() => addElement('text', 'body')}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    >
                      <div className="text-sm">Add a little bit of body text</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Uploads Tab */}
          {((activeTab === 'uploads' && isSidebarExpanded) || hoveredTab === 'uploads') && (
            <div className="w-80 bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative h-full flex flex-col">
              {/* Collapse Button - Fixed position at right edge */}
              {isSidebarExpanded && activeTab === 'uploads' && (
                <button
                  onClick={() => setIsSidebarExpanded(false)}
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 z-10"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              )}
              <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Uploads</h3>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-purple-400', 'bg-purple-50');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                  
                  const files = e.dataTransfer.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    console.log('Dropped file:', file.name, file.type, file.size);
                    if (file.type.startsWith('image/')) {
                      console.log('Processing dropped image with FileReader');
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target?.result as string;
                        console.log('Dropped image loaded successfully');
                        
                        const newElement: SlideElement = {
                          id: `element-${Date.now()}`,
                          type: 'image',
                          x: 100,
                          y: 100,
                          width: 200,
                          height: 200,
                          content: dataUrl,
                          style: { backgroundColor: '#f3f4f6' }
                        };
                        const newSlides = slides.map((slide, index) => {
                          if (index === currentSlideIndex) {
                            return { ...slide, elements: [...slide.elements, newElement] };
                          }
                          return slide;
                        });
                        setSlides(newSlides);
                        setSelectedElement(newElement.id);
                        saveToHistory(newSlides);
                        console.log('Image element added to slide via drag & drop');
                      };
                      reader.onerror = (e) => {
                        console.error('FileReader error (drop):', e);
                        console.error('FileReader error details (drop):', reader.error);
                        console.error('Dropped file info:', { name: file.name, size: file.size, type: file.type });
                        alert(`Failed to load dropped image: ${reader.error?.message || 'Unknown error'}. Please try again with a different image.`);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      alert('Please drop a valid image file (JPG, PNG, etc.)');
                    }
                  }
                }}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drag and drop your image here</p>
                <p className="text-xs text-gray-500">or</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    console.log('File input changed:', e.target.files);
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      console.log('Selected file:', file.name, file.type, file.size);
                    if (file.type.startsWith('image/')) {
                      console.log('Processing image file with FileReader');
                      
                      // Check file size (max 10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File size too large. Please select an image smaller than 10MB.');
                        return;
                      }
                      
                      const reader = new FileReader();
                      
                      reader.onloadstart = () => {
                        console.log('FileReader started loading file');
                      };
                      
                      reader.onprogress = (e) => {
                        if (e.lengthComputable) {
                          const percentLoaded = Math.round((e.loaded / e.total) * 100);
                          console.log(`Loading progress: ${percentLoaded}%`);
                        }
                      };
                      
                      reader.onload = (event) => {
                        try {
                          const dataUrl = event.target?.result as string;
                          if (!dataUrl || dataUrl.length === 0) {
                            throw new Error('Empty data URL received');
                          }
                          console.log('Image loaded successfully, data URL length:', dataUrl.length);
                          
                          const newElement: SlideElement = {
                            id: `element-${Date.now()}`,
                            type: 'image',
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 200,
                            content: dataUrl,
                            style: { backgroundColor: '#f3f4f6' }
                          };

                          const newSlides = slides.map((slide, index) => {
                            if (index === currentSlideIndex) {
                              return { ...slide, elements: [...slide.elements, newElement] };
                            }
                            return slide;
                          });

                          setSlides(newSlides);
                          setSelectedElement(newElement.id);
                          saveToHistory(newSlides);
                          console.log('Image element added to slide successfully');
                        } catch (err) {
                          console.error('Error processing loaded image:', err);
                          alert('Failed to process image data. Please try again.');
                        }
                      };
                      
                      reader.onerror = (e) => {
                        console.error('FileReader error:', e);
                        console.error('FileReader error details:', reader.error);
                        console.error('File info:', { name: file.name, size: file.size, type: file.type });
                        alert(`Failed to load image: ${reader.error?.message || 'Unknown error'}. Please try again with a different image.`);
                      };
                      
                      reader.onabort = () => {
                        console.log('FileReader aborted');
                        alert('Image loading was cancelled.');
                      };
                      
                      // Try to read as data URL
                      try {
                        reader.readAsDataURL(file);
                      } catch (err) {
                        console.error('Failed to start FileReader:', err);
                        alert('Failed to start reading the file. Please try again.');
                      }
                    } else {
                        alert('Please select a valid image file (JPG, PNG, etc.)');
                      }
                    }
                    // Reset file input
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    console.log('Choose files button clicked');
                    // Trigger file input click
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                >
                  Choose files
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG up to 10MB</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Create Slide</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Undo size={20} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Redo size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={exportToPowerPoint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileDown size={16} />
              Export PPTX
            </button>
            <button 
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={16} />
              Save to Cloud
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative bg-white shadow-lg"
            style={{
              width: '800px',
              height: '600px',
              backgroundColor: currentSlide.backgroundColor
            }}
          >
              {currentSlide.elements.map((element) => {
                // Use drag preview position if this element is being dragged
                const isDraggingElement = isDragging && selectedElement === element.id;
                const displayX = isDraggingElement && dragPreview ? dragPreview.x : element.x;
                const displayY = isDraggingElement && dragPreview ? dragPreview.y : element.y;
                
                return (
                  <div 
                    key={element.id} 
                    className="relative"
                    style={{
                      left: displayX,
                      top: displayY,
                      width: element.width,
                      height: element.height
                    }}
                  >
                    <div
                      onClick={() => handleElementClick(element.id)}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                      className={cn(
                        "w-full h-full border-2 transition-none",
                        selectedElement === element.id ? "border-blue-500" : "border-transparent",
                        isDraggingElement ? "cursor-grabbing" : "cursor-grab",
                        isDraggingElement && "opacity-90 shadow-lg"
                      )}
                      style={{
                        fontSize: element.style?.fontSize,
                        fontFamily: element.style?.fontFamily,
                        color: element.style?.color,
                        backgroundColor: element.style?.backgroundColor,
                        borderRadius: element.style?.borderRadius,
                        userSelect: 'none',
                        transform: isDraggingElement ? 'scale(1.02)' : 'scale(1)',
                        transition: isDraggingElement ? 'none' : 'transform 0.1s ease'
                      }}
                    >
                      {element.type === 'text' && (
                        element.isEditing ? (
                          <textarea
                            value={element.content || ''}
                            onChange={(e) => handleTextEdit(element.id, e.target.value)}
                            onBlur={() => handleTextEditEnd(element.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                handleTextEditEnd(element.id);
                              }
                            }}
                            onSelect={(e) => {
                              const textarea = e.target as HTMLTextAreaElement;
                              setSavedSelection({
                                start: textarea.selectionStart || 0,
                                end: textarea.selectionEnd || 0
                              });
                            }}
                            data-element-id={element.id}
                            className="w-full h-full resize-none border-none outline-none bg-transparent overflow-hidden"
                            style={{
                              fontSize: element.style?.fontSize,
                              fontFamily: element.style?.fontFamily,
                              color: element.style?.color,
                              fontWeight: element.style?.fontWeight,
                              fontStyle: element.style?.fontStyle,
                              textDecoration: element.style?.textDecoration,
                              textAlign: element.style?.textAlign,
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word'
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: element.style?.fontSize,
                              fontFamily: element.style?.fontFamily,
                              color: element.style?.color,
                              fontWeight: element.style?.fontWeight,
                              fontStyle: element.style?.fontStyle,
                              textDecoration: element.style?.textDecoration,
                              textAlign: element.style?.textAlign,
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word'
                            }}
                          >
                            {element.content}
                          </div>
                        )
                      )}
                      {element.type === 'image' && (
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                          {element.content ? (
                            <img 
                              src={element.content} 
                              alt="Uploaded" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <Image size={32} />
                            </div>
                          )}
                        </div>
                      )}
                      {element.type === 'shape' && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Square size={32} />
                        </div>
                      )}
                      {element.type === 'table' && (
                        <div className="w-full h-full bg-white border border-gray-300 flex items-center justify-center text-gray-500">
                          <Table size={32} />
                        </div>
                      )}
                      {element.type === 'graphic' && (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                          <Shapes size={32} />
                        </div>
                      )}
                    </div>

                    {/* Element Controls */}
                    {selectedElement === element.id && !isDraggingElement && (
                      <div
                        className="absolute flex gap-1"
                        style={{
                          left: element.width + 5,
                          top: -5
                        }}
                      >
                        <button
                          onClick={() => handleDeleteElement(element.id)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Delete element"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}

                    {/* Resize Handles */}
                    {selectedElement === element.id && !isDraggingElement && (
                      <>
                        {/* Southeast */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-se-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            right: -6,
                            bottom: -6
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'se')}
                        />
                        {/* Southwest */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-sw-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            left: -6,
                            bottom: -6
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'sw')}
                        />
                        {/* Northeast */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-ne-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            right: -6,
                            top: -6
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'ne')}
                        />
                        {/* Northwest */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-nw-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            left: -6,
                            top: -6
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'nw')}
                        />
                        {/* East (Right) */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-e-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            right: -6,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'e')}
                        />
                        {/* West (Left) */}
                        <div
                          className="absolute w-3 h-3 bg-blue-500 cursor-w-resize hover:bg-blue-600 transition-colors duration-200"
                          style={{
                            left: -6,
                            top: '50%',
                            transform: 'translateY(-50%)'
                          }}
                          onMouseDown={(e) => handleResizeStart(e, element.id, 'w')}
                        />
                      </>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Bottom Slide Navigation - Enhanced Canva Style */}
        <div className="bg-white border-t border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Slide thumbnails - Larger and more spacious */}
            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  data-slide-index={index}
                  onClick={() => handleSlideClick(index)}
                  onContextMenu={(e) => handleSlideRightClick(e, index)}
                  onMouseDown={(e) => handleSlideMouseDown(e, index)}
                  onMouseUp={(e) => handleSlideMouseUp(e, index)}
                  onMouseEnter={() => handleSlideMouseEnter(index)}
                  onMouseLeave={() => handleSlideMouseLeave(index)}
                  className={cn(
                    "w-32 h-20 bg-white border-2 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden group select-none",
                    index === currentSlideIndex 
                      ? "border-purple-500 shadow-lg ring-2 ring-purple-100" 
                      : "border-gray-200 hover:border-gray-300",
                    isDraggingSlide && dragSlideIndex === index && "opacity-50 scale-95",
                    isDraggingSlide && dragSlideIndex !== index && "cursor-grab"
                  )}
                  style={{
                    cursor: isDraggingSlide ? (dragSlideIndex === index ? 'grabbing' : 'grab') : 'pointer'
                  }}
                >
                  {/* Slide thumbnail content - Better preview */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-sm relative">
                    {/* Mini elements preview */}
                    {slide.elements.length > 0 ? (
                      <div className="w-full h-full p-2">
                        {slide.elements.slice(0, 3).map((element, elIndex) => (
                          <div
                            key={elIndex}
                            className="absolute"
                            style={{
                              left: `${(element.x / 800) * 100}%`,
                              top: `${(element.y / 600) * 100}%`,
                              width: `${Math.min((element.width / 800) * 100, 20)}%`,
                              height: `${Math.min((element.height / 600) * 100, 15)}%`,
                              backgroundColor: element.type === 'text' ? '#3b82f6' : element.type === 'image' ? '#10b981' : '#f59e0b',
                              borderRadius: '2px'
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Layers size={16} className="mb-1" />
                        <span className="text-xs font-medium">Slide {index + 1}</span>
                      </div>
                    )}
                    
                    {/* Slide number badge */}
                    <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add slide button - Enhanced */}
              <button
                onClick={addSlide}
                className="w-32 h-20 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-all duration-200 hover:border-purple-400 hover:bg-purple-50 group"
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus size={20} className="text-gray-400 group-hover:text-purple-500" />
                  <span className="text-xs text-gray-500 group-hover:text-purple-600 font-medium">Add page</span>
                </div>
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-3 ml-auto">
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                <span className="text-xs text-gray-600">-</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 bg-gray-200 rounded-full">
                  <div className="w-12 h-1 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-600 w-8">45%</span>
              </div>
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                <span className="text-xs text-gray-600">+</span>
              </button>
            </div>

            {/* Slide info */}
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                <Grid3X3 size={14} className="text-gray-600" />
              </button>
              <span className="text-xs text-gray-600">Pages {currentSlideIndex + 1}/{slides.length}</span>
              <button className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200">
                <span className="text-xs text-gray-600">⛶</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="context-menu fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            transform: contextMenu.y > window.innerHeight / 2 ? 'translateY(-100%)' : 'none'
          }}
        >
          {/* Arrow pointer */}
          <div 
            className="absolute w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"
            style={{
              left: '20px',
              bottom: contextMenu.y > window.innerHeight / 2 ? '-4px' : 'auto',
              top: contextMenu.y > window.innerHeight / 2 ? 'auto' : '-4px'
            }}
          />
          <div className="px-3 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Slide {contextMenu.slideIndex + 1}</h3>
            <p className="text-xs text-gray-500">Presentation • 800 x 600 px</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => copySlide(contextMenu.slideIndex)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <Copy size={16} className="text-gray-500" />
              Copy
              <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
            </button>
            
            <button
              onClick={() => pasteSlide(contextMenu.slideIndex)}
              disabled={!copiedSlide}
              className={cn(
                "w-full px-3 py-2 text-left text-sm flex items-center gap-3",
                copiedSlide 
                  ? "text-gray-700 hover:bg-gray-100" 
                  : "text-gray-400 cursor-not-allowed"
              )}
            >
              <Clipboard size={16} className="text-gray-500" />
              Paste
              <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
            </button>
            
            <button
              onClick={() => duplicateSlide(contextMenu.slideIndex)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <Copy size={16} className="text-gray-500" />
              Duplicate page
              <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
            </button>
            
            <button
              onClick={() => deleteSlide(contextMenu.slideIndex)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <Trash2 size={16} className="text-gray-500" />
              Delete page
              <span className="ml-auto text-xs text-gray-400">DELETE</span>
            </button>
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setCurrentSlideIndex(contextMenu.slideIndex);
                addSlide();
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
            >
              <Plus size={16} className="text-gray-500" />
              Add page
              <span className="ml-auto text-xs text-gray-400">Ctrl+Enter</span>
            </button>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Save to Cloud</h2>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Total Slides:</strong> {slides.length} | 
                <strong> Total Elements:</strong> {slides.reduce((sum, slide) => sum + slide.elements.length, 0)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 This will save your presentation to the cloud database. Use "Export PPTX" to download a PowerPoint file.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presentation Title *
                </label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter presentation title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject/Topic *
                </label>
                <input
                  type="text"
                  value={slideTopic}
                  onChange={(e) => setSlideTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Algebra, Geometry, Calculus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={slidePrice}
                    onChange={(e) => setSlidePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    type="number"
                    value={slideGrade || ''}
                    onChange={(e) => setSlideGrade(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  This will save your slide as a draft. You can publish it later from your slides page.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePresentation}
                disabled={createSlideMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {createSlideMutation.isPending ? 'Saving...' : 'Save Presentation'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
