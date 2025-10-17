import { useState, useRef, useCallback, useEffect } from "react";
import PptxGenJS from "pptxgenjs";
import { useCreateSlideMutation } from "src/hooks/useSlides";
import TopToolbar from "src/components/create/TopToolbar";
import TextToolbar from "src/components/create/TextToolbar";
import Sidebar from "src/components/create/Sidebar";
import Canvas from "src/components/create/Canvas";
import BottomNav from "src/components/create/BottomNav";
import ContextMenu from "src/components/create/ContextMenu";
import SaveDialog from "src/components/create/SaveDialog";
import type { Slide, SlideElement } from "src/types/create";

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
  
    const addElement = useCallback((type: SlideElement['type'], textStyle?: 'heading' | 'subheading' | 'body', symbol?: string) => {
      let content = '';
      let fontSize = 16;
      let fontWeight: 'normal' | 'bold' = 'normal';
      
      if (type === 'text') {
        if (symbol) {
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
  
    const saveToHistory = useCallback((newSlides: Slide[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newSlides);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);
  
    const undo = useCallback(() => {
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        setSlides(history[historyIndex - 1]);
      }
    }, [historyIndex, history]);
  
    const redo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setSlides(history[historyIndex + 1]);
      }
    }, [historyIndex, history]);
  
    const handleElementClick = (elementId: string) => {
      setSelectedElement(elementId);
      const element = currentSlide.elements.find(el => el.id === elementId);
      if (element?.type === 'text') {
        setShowTextToolbar(true);
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
  
    const handleTextEdit = (elementId: string, newContent: string) => {
      const element = currentSlide.elements.find(el => el.id === elementId);
      if (!element) return;
  
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
    };
  
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
  
    const handleResizeStart = (e: React.MouseEvent, elementId: string, handle: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handle);
      setSelectedElement(elementId);
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      const element = currentSlide.elements.find(el => el.id === elementId);
      
      if (element && canvasRect) {
        let offsetX = 0;
        let offsetY = 0;
        
        switch (handle) {
          case 'se':
            offsetX = e.clientX - canvasRect.left - (element.x + element.width);
            offsetY = e.clientY - canvasRect.top - (element.y + element.height);
            break;
          case 'sw':
            offsetX = e.clientX - canvasRect.left - element.x;
            offsetY = e.clientY - canvasRect.top - (element.y + element.height);
            break;
          case 'ne':
            offsetX = e.clientX - canvasRect.left - (element.x + element.width);
            offsetY = e.clientY - canvasRect.top - element.y;
            break;
          case 'nw':
            offsetX = e.clientX - canvasRect.left - element.x;
            offsetY = e.clientY - canvasRect.top - element.y;
            break;
          case 'e':
            offsetX = e.clientX - canvasRect.left - (element.x + element.width);
            offsetY = e.clientY - canvasRect.top - element.y;
            break;
          case 'w':
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
  
    const handleResize = useCallback((e: MouseEvent) => {
      if (!isResizing || !selectedElement || !resizeHandle) return;
      
      requestAnimationFrame(() => {
      
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const element = currentSlide.elements.find(el => el.id === selectedElement);
      if (!element) return;
      
      let newWidth = element.width;
      let newHeight = element.height;
      let newElementX = element.x;
      let newElementY = element.y;
      
      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
          newHeight = Math.max(30, e.clientY - canvasRect.top - element.y - dragOffset.y);
          break;
        case 'sw':
          newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
          newHeight = Math.max(30, e.clientY - canvasRect.top - element.y - dragOffset.y);
          newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
          break;
        case 'ne':
          newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
          newHeight = Math.max(30, (element.y + element.height) - (e.clientY - canvasRect.top - dragOffset.y));
          newElementY = Math.min(e.clientY - canvasRect.top - dragOffset.y, element.y + element.height - 30);
          break;
        case 'nw':
          newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
          newHeight = Math.max(30, (element.y + element.height) - (e.clientY - canvasRect.top - dragOffset.y));
          newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
          newElementY = Math.min(e.clientY - canvasRect.top - dragOffset.y, element.y + element.height - 30);
          break;
        case 'e':
          newWidth = Math.max(50, e.clientX - canvasRect.left - element.x - dragOffset.x);
          break;
        case 'w':
          newWidth = Math.max(50, (element.x + element.width) - (e.clientX - canvasRect.left - dragOffset.x));
          newElementX = Math.min(e.clientX - canvasRect.left - dragOffset.x, element.x + element.width - 50);
          break;
      }
      
      let newFontSize = element.style?.fontSize || 16;
      if (element.type === 'text') {
        const isCornerHandle = ['se', 'sw', 'ne', 'nw'].includes(resizeHandle);
        const isSideHandle = ['e', 'w'].includes(resizeHandle);
        
        if (isCornerHandle) {
          const currentWidth = element.width;
          const widthRatio = newWidth / currentWidth;
          const currentFontSize = element.style?.fontSize || 16;
          newFontSize = currentFontSize * (widthRatio * 1.009);
        }
        
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
          
          if (isCornerHandle || isSideHandle) {
            newHeight = Math.max(measuredHeight, 30);
          }
        } else {
          newHeight = Math.max(newHeight, 30);
        }
      }
      
      setDragPreview({
        x: newElementX,
        y: newElementY
      });
      
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
      
      });
    }, [isResizing, selectedElement, resizeHandle, dragOffset, currentSlide.elements, slides, currentSlideIndex]);
  
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
  
    const handleCanvasClick = (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setSelectedElement(null);
        setShowTextToolbar(false);
      }
    };
  
    const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
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
  
    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !selectedElement) return;
  
      requestAnimationFrame(() => {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;
  
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;
  
        const element = currentSlide.elements.find(el => el.id === selectedElement);
        const elementWidth = element?.width || 100;
        const elementHeight = element?.height || 50;
        
        const constrainedX = Math.max(0, Math.min(newX, 800 - elementWidth));
        const constrainedY = Math.max(0, Math.min(newY, 600 - elementHeight));
  
        setDragPreview({ x: constrainedX, y: constrainedY });
      });
    }, [isDragging, selectedElement, dragOffset, currentSlide.elements]);
  
    const handleMouseUp = useCallback(() => {
      if (isDragging && selectedElement && dragPreview) {
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
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (showSaveDialog) {
          return;
        }
        
        if (e.key === 'Delete' && selectedElement) {
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
            e.preventDefault();
            setCopiedSlide(slides[currentSlideIndex]);
          } else if (e.key === 'v' && copiedSlide && !selectedElement) {
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
  
    useEffect(() => {
      const handleGlobalMouseUp = () => {
        if (isDraggingSlide) {
          setIsDraggingSlide(false);
          setDragSlideIndex(null);
          document.body.style.cursor = '';
          
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
      
      const rect = e.currentTarget.getBoundingClientRect();
      const contextMenuHeight = 200;
      
      let y = rect.top - contextMenuHeight - 10;
      
      if (y < 10) {
        y = rect.bottom + 10;
      }
      
      let x = e.clientX;
      const contextMenuWidth = 200;
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
      if (e.button !== 0) return;
      
      e.preventDefault();
      setIsDraggingSlide(true);
      setDragSlideIndex(slideIndex);
      
      document.body.style.cursor = 'grabbing';
    };
  
    const handleSlideMouseUp = (e: React.MouseEvent, slideIndex: number) => {
      if (!isDraggingSlide || dragSlideIndex === null) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      setIsDraggingSlide(false);
      setDragSlideIndex(null);
      document.body.style.cursor = '';
      
      if (dragSlideIndex !== slideIndex) {
        const newSlides = [...slides];
        const draggedSlide = newSlides[dragSlideIndex];
        
        newSlides.splice(dragSlideIndex, 1);
        
        const insertIndex = slideIndex > dragSlideIndex ? slideIndex - 1 : slideIndex;
        newSlides.splice(insertIndex, 0, draggedSlide);
        
        setSlides(newSlides);
        setCurrentSlideIndex(insertIndex);
        saveToHistory(newSlides);
      }
    };
  
    const handleSlideMouseEnter = (slideIndex: number) => {
      if (isDraggingSlide && dragSlideIndex !== null && dragSlideIndex !== slideIndex) {
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
  
    const exportToPowerPoint = () => {
      if (slides.length === 0) {
        alert('Please add at least one slide to export');
        return;
      }
  
      try {
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
                  align: element.style?.textAlign === 'center' ? 'center' : 
                         element.style?.textAlign === 'right' ? 'right' : 'left',
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
        setSlideTitle('');
        setSlideTopic('');
        setSlidePrice(0);
        setSlideGrade(undefined);
      } catch (error) {
        console.error('Failed to save presentation:', error);
        alert('Failed to save presentation. Please try again.');
      }
    };

    const handleListButtonClick = () => {
        const currentContent = getCurrentTextElement()?.content || '';
        let newContent = '';
        
        if (currentContent.includes('•')) {
          newContent = currentContent.replace(/•\s*/g, '');
        } else {
          const lines = currentContent.split('\n');
          newContent = lines.map(line => 
            line.trim() === '' ? line : `• ${line}`
          ).join('\n');
        }
        
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
      };
  
    return (
        <div className="h-screen flex flex-col bg-gray-50 select-none pt-12">
            <TopToolbar
            undo={undo}
            redo={redo}
            historyIndex={historyIndex}
            historyLength={history.length}
            exportToPowerPoint={exportToPowerPoint}
            setShowSaveDialog={setShowSaveDialog}
            />
    
            {showTextToolbar && (
                <TextToolbar
                    selectedElement={currentSlide.elements.find(el => el.id === selectedElement)}
                    updateTextStyle={updateTextStyle}
                    onListButtonClick={handleListButtonClick}
                />
            )}
    
            <div className="flex flex-1 overflow-hidden">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarExpanded={isSidebarExpanded}
                setIsSidebarExpanded={setIsSidebarExpanded}
                hoveredTab={hoveredTab}
                setHoveredTab={setHoveredTab}
                addElement={addElement}
                slides={slides}
                currentSlideIndex={currentSlideIndex}
                setSlides={setSlides}
                setSelectedElement={setSelectedElement}
                saveToHistory={saveToHistory}
            />
            
            <div className="flex-1 flex flex-col">
                <Canvas
                canvasRef={canvasRef}
                currentSlide={currentSlide}
                selectedElement={selectedElement}
                handleCanvasClick={handleCanvasClick}
                handleElementClick={handleElementClick}
                handleMouseDown={handleMouseDown}
                handleTextEdit={handleTextEdit}
                handleTextEditEnd={handleTextEditEnd}
                setSavedSelection={setSavedSelection}
                handleDeleteElement={handleDeleteElement}
                handleResizeStart={handleResizeStart}
                isDragging={isDragging}
                dragPreview={dragPreview}
                />

                <BottomNav
                    slides={slides}
                    currentSlideIndex={currentSlideIndex}
                    handleSlideClick={handleSlideClick}
                    handleSlideRightClick={handleSlideRightClick}
                    handleSlideMouseDown={handleSlideMouseDown}
                    handleSlideMouseUp={handleSlideMouseUp}
                    handleSlideMouseEnter={handleSlideMouseEnter}
                    handleSlideMouseLeave={handleSlideMouseLeave}
                    addSlide={addSlide}
                    isDraggingSlide={isDraggingSlide}
                    dragSlideIndex={dragSlideIndex}
                />
            </div>
            </div>
    
            <ContextMenu
                contextMenu={contextMenu}
                copySlide={copySlide}
                pasteSlide={pasteSlide}
                duplicateSlide={duplicateSlide}
                deleteSlide={deleteSlide}
                addSlide={addSlide}
                copiedSlide={copiedSlide}
                setCurrentSlideIndex={setCurrentSlideIndex}
                setContextMenu={setContextMenu}
            />
    
            <SaveDialog
                showSaveDialog={showSaveDialog}
                setShowSaveDialog={setShowSaveDialog}
                slides={slides}
                slideTitle={slideTitle}
                setSlideTitle={setSlideTitle}
                slideTopic={slideTopic}
                setSlideTopic={setSlideTopic}
                slidePrice={slidePrice}
                setSlidePrice={setSlidePrice}
                slideGrade={slideGrade}
                setSlideGrade={setSlideGrade}
                handleSavePresentation={handleSavePresentation}
                isSaving={createSlideMutation.isPending}
            />
        </div>
    );
  }