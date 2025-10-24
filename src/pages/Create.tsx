// src/pages/Create.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Save, Undo, Redo, Type, Image, Square, Shapes, Trash2, Upload, Plus,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Minus,
  Palette, Copy, Clipboard, Layers, FileDown, ZoomIn, ZoomOut, ChevronLeft,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from 'src/utils/cn';
import { useCreateSlideMutation } from 'src/hooks/useSlides';
import PptxGenJS from 'pptxgenjs';
import { Slot } from "@radix-ui/react-slot"; // Thêm import Slot

// Import các component shadcn/ui mà bạn CÓ
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "src/components/libs/shadcn/dialog";
import { Input } from "src/components/libs/shadcn/input";

// --- Component Giả Lập (Vì bạn chưa có các tệp này) ---
// (Component Button giả lập - Đã sửa lỗi 'icon-lg' và 'Slot')
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; asChild?: boolean }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"; // Sửa: Dùng Slot
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variantStyle = variant === "outline" ? "border border-gray-300 bg-white hover:bg-gray-50" :
                     variant === "ghost" ? "hover:bg-gray-100" :
                     variant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" :
                     "bg-blue-600 text-white hover:bg-blue-700";
  // Sửa: Thêm 'icon-lg'
  const sizeStyle = size === "icon" ? "h-10 w-10" :
                    size === "icon-sm" ? "h-8 w-8" :
                    size === "icon-xs" ? "h-6 w-6" :
                    size === "icon-lg" ? "h-12 w-12" : // Đã thêm
                    size === "sm" ? "h-9 px-3" :
                    "h-10 px-4 py-2";
  return <Comp className={cn(baseStyle, variantStyle, sizeStyle, className)} ref={ref} {...props} />;
});
Button.displayName = "Button";

// (Component Label giả lập)
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return <label ref={ref} className={cn("text-sm font-medium leading-none", className)} {...props} />;
});
Label.displayName = "Label";

// (Component Tooltip giả lập - Đã sửa)
const TooltipProvider = ({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block">{children}</div>;
const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => asChild ? <>{children}</> : <div>{children}</div>;
const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: string; sideOffset?: number }
>(({ className, side, sideOffset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-white border-gray-200 text-gray-900 px-3 py-1.5 text-sm shadow-md animate-in fade-in-0 zoom-in-95",
      "hidden group-hover:block", // Giả lập hiển thị tooltip đơn giản
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";
// --- Kết thúc Component Giả Lập ---


// Import Types
import type { 
    Slide, SlideElement, InteractionState, DragResizeInfo, SidebarTab, SaveOptions, SlideElementStyle 
} from '../types/create'; 
import { 
    CANVAS_WIDTH, CANVAS_HEIGHT, MIN_ELEMENT_WIDTH, MIN_ELEMENT_HEIGHT, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM 
} from '../types/create'; 

// Hằng số
const INITIAL_SLIDES: Slide[] = [{ id: `slide-${Date.now()}`, elements: [], backgroundColor: '#ffffff' }];


// --- 1. TẤT CẢ CÁC COMPONENT CON ĐƯỢC ĐỊNH NGHĨA Ở ĐÂY ---

// --- TopToolbar ---
interface TopToolbarProps { canUndo: boolean; onUndo: () => void; canRedo: boolean; onRedo: () => void; zoomLevel: number; onZoomIn: () => void; onZoomOut: () => void; onZoomReset: () => void; onExport: () => void; onSave: () => void; minZoom: number; maxZoom: number; }
const TopToolbar: React.FC<TopToolbarProps> = ({ canUndo, onUndo, canRedo, onRedo, zoomLevel, onZoomIn, onZoomOut, onZoomReset, onExport, onSave, minZoom, maxZoom }) => (
  <TooltipProvider delayDuration={200}>
    {/* SỬA: Thêm 'sticky', 'top-12' (để nằm dưới NavBar), 'w-full' */}
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 z-20 flex-shrink-0 h-14 sticky top-12 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">Slide Editor</h1>
        <div className="flex items-center gap-1 border-l pl-3 ml-2">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo"><Undo size={18} /></Button></TooltipTrigger><TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo"><Redo size={18} /></Button></TooltipTrigger><TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent></Tooltip>
        </div>
        <div className="flex items-center gap-1 border-l pl-3 ml-2">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomOut} disabled={zoomLevel <= minZoom} aria-label="Zoom Out"><ZoomOut size={18} /></Button></TooltipTrigger><TooltipContent side="bottom">Zoom Out (Ctrl+-)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" className="w-16 text-sm" onClick={onZoomReset} disabled={zoomLevel === 1}>{(zoomLevel * 100).toFixed(0)}%</Button></TooltipTrigger><TooltipContent side="bottom">Reset Zoom (Ctrl+0)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomIn} disabled={zoomLevel >= maxZoom} aria-label="Zoom In"><ZoomIn size={18} /></Button></TooltipTrigger><TooltipContent side="bottom">Zoom In (Ctrl++)</TooltipContent></Tooltip>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={onExport}><FileDown size={16} className="mr-1.5"/> Export PPTX</Button></TooltipTrigger><TooltipContent side="bottom">Download as .pptx</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><Button size="sm" onClick={onSave}><Save size={16} className="mr-1.5"/> Save</Button></TooltipTrigger><TooltipContent side="bottom">Save to Cloud (Ctrl+S)</TooltipContent></Tooltip>
      </div>
    </header>
  </TooltipProvider>
);

// --- TextFormatToolbar ---
interface TextFormatToolbarProps { element: SlideElement | undefined; onStyleChange: (property: keyof SlideElementStyle, value: any) => void; onListToggle: () => void; textAreaRef: React.RefObject<HTMLTextAreaElement | null>; }
const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({ element, onStyleChange, onListToggle, textAreaRef }) => {
  if (!element || element.type !== 'text') return null;
  const [savedSelection, setSavedSelection] = React.useState<{ start: number, end: number } | null>(null);
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => { onStyleChange('color', e.target.value); setTimeout(() => { if(textAreaRef.current && savedSelection) { textAreaRef.current.focus(); textAreaRef.current.setSelectionRange(savedSelection.start, savedSelection.end); setSavedSelection(null); } }, 50); };
  const handleColorMouseDown = () => { const el = textAreaRef.current; if (el) setSavedSelection({ start: el.selectionStart, end: el.selectionEnd }); };
  return (
    <TooltipProvider delayDuration={200}>
      {/* SỬA: Thêm 'sticky', 'top-[calc(3rem+3.5rem)]' (dưới NavBar+TopToolbar), 'w-full' */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center gap-3 z-10 flex-shrink-0 h-12 text-sm overflow-x-auto sticky top-[calc(3rem+3.5rem)] w-full">
        <select value={element.style?.fontFamily || 'Arial'} onChange={(e) => onStyleChange('fontFamily', e.target.value)} className="w-[130px] h-8 text-xs px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white" aria-label="Font family">
          <option value="Arial">Arial</option><option value="Verdana">Verdana</option><option value="Times New Roman">Times New Roman</option><option value="Georgia">Georgia</option><option value="Courier New">Courier New</option>
        </select>
        <div className="flex items-center">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontSize', Math.max(8, (element.style?.fontSize || 16) - 1))}><Minus size={14}/></Button></TooltipTrigger><TooltipContent>Decrease Font Size</TooltipContent></Tooltip>
          <Input type="number" value={Math.round(element.style?.fontSize || 16)} onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value) || 16)} className="w-12 h-7 px-1 text-xs text-center focus:ring-1 focus:ring-blue-500" min="8" max="120" step="1" aria-label="Font size"/>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontSize', Math.min(120, (element.style?.fontSize || 16) + 1))}><Plus size={14}/></Button></TooltipTrigger><TooltipContent>Increase Font Size</TooltipContent></Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" className="relative w-7 h-7"><input type="color" value={element.style?.color || '#000000'} onChange={handleColorChange} onMouseDown={handleColorMouseDown} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Font color" /><Palette size={16} /><div className="absolute bottom-1 left-1 right-1 h-1 rounded-sm border border-gray-300" style={{ backgroundColor: element.style?.color || '#000000' }} /></Button></TooltipTrigger>
          <TooltipContent>Font Color</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontWeight', element.style?.fontWeight === 'bold' ? 'normal' : 'bold')} data-active={element.style?.fontWeight === 'bold'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.style?.fontWeight === 'bold'}><Bold size={16} /></Button></TooltipTrigger><TooltipContent>Bold (Ctrl+B)</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontStyle', element.style?.fontStyle === 'italic' ? 'normal' : 'italic')} data-active={element.style?.fontStyle === 'italic'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.style?.fontStyle === 'italic'}><Italic size={16} /></Button></TooltipTrigger><TooltipContent>Italic (Ctrl+I)</TooltipContent></Tooltip>
           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('textDecoration', element.style?.textDecoration === 'underline' ? 'none' : 'underline')} data-active={element.style?.textDecoration === 'underline'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.style?.textDecoration === 'underline'}><Underline size={16} /></Button></TooltipTrigger><TooltipContent>Underline (Ctrl+U)</TooltipContent></Tooltip>
        </div>
        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('textAlign', 'left')} data-active={!element.style?.textAlign || element.style?.textAlign === 'left'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={!element.style?.textAlign || element.style?.textAlign === 'left'}><AlignLeft size={16} /></Button></TooltipTrigger><TooltipContent>Align Left</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('textAlign', 'center')} data-active={element.style?.textAlign === 'center'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.style?.textAlign === 'center'}><AlignCenter size={16} /></Button></TooltipTrigger><TooltipContent>Align Center</TooltipContent></Tooltip>
           <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('textAlign', 'right')} data-active={element.style?.textAlign === 'right'} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.style?.textAlign === 'right'}><AlignRight size={16} /></Button></TooltipTrigger><TooltipContent>Align Right</TooltipContent></Tooltip>
        </div>
        <div className="flex items-center gap-0.5 border-l pl-2 ml-1">
          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={onListToggle} data-active={element.content?.includes('• ')} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.content?.includes('• ')}><List size={16} /></Button></TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

// --- Sidebar ---
interface SidebarProps { activeTab: SidebarTab; setActiveTab: (tab: SidebarTab) => void; isOpen: boolean; setIsOpen: (isOpen: boolean) => void; onAddElement: (type: SlideElement['type']) => void; onFileUpload: (files: FileList | null) => void; stickyTop: string; } // SỬA: Thêm stickyTop
const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onAddElement, onFileUpload, stickyTop }) => {
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); setActiveTab('uploads'); setIsOpen(true); onFileUpload(e.dataTransfer.files); };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); };
  return (
    <TooltipProvider delayDuration={200}>
      {/* SỬA: Thêm 'sticky' và 'top', tính toán 'h' */}
      <div 
        className={cn("flex flex-shrink-0 bg-white border-r border-gray-200 sticky", stickyTop)}
        style={{ height: `calc(100vh - ${stickyTop})` }} // Chiều cao = 100vh - chiều cao của mọi thứ bên trên
      >
        {/* Icon Bar */}
        <div className="w-16 bg-gray-800 text-gray-400 flex flex-col items-center py-2 flex-shrink-0 z-10 relative">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setActiveTab('elements')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'elements'})}><Shapes size={20} /></Button></TooltipTrigger><TooltipContent side="right">Elements</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setActiveTab('text')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'text'})}><Type size={20} /></Button></TooltipTrigger><TooltipContent side="right">Text</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setActiveTab('uploads')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'uploads'})}><Upload size={20} /></Button></TooltipTrigger><TooltipContent side="right">Uploads</TooltipContent></Tooltip>
          
          {/* SỬA LỖI 2: Nút thu gọn nằm BÊN NGOÀI Icon Bar nhưng BÊN TRONG div cha 'sticky' */}
          <Button
            variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "absolute top-1/2 -translate-y-1/2 z-20 w-6 h-10 rounded-r-md rounded-l-none border-l-0 shadow hover:bg-gray-50",
                "transition-all duration-300 ease-in-out",
                // Định vị nó dựa trên `isOpen`
                isOpen ? "left-[calc(16rem+4rem-0.75rem)]" : "left-[4rem-0.75rem]" 
            )}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <ChevronLeft size={16} className={cn("transition-transform", { "rotate-180": !isOpen })} />
          </Button>
        </div>

        {/* Content Panel */}
        <div className={cn( "transition-all duration-300 ease-in-out overflow-y-auto border-l border-gray-200", isOpen ? "w-64 p-4" : "w-0 p-0 overflow-hidden" )}>
          <div className={cn("w-64", { 'opacity-0': !isOpen })}>
            {activeTab === 'elements' && ( <div> <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Shapes</h3> <div className="grid grid-cols-3 gap-2"> <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon-lg" onClick={() => onAddElement('shape')}><Square size={20} /></Button></TooltipTrigger><TooltipContent>Add Square</TooltipContent></Tooltip> </div> </div> )}
            {activeTab === 'text' && ( <div className="space-y-2"> <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Add Text</h3> <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-lg font-bold" onClick={() => onAddElement('text')}>Add Heading</Button> <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-base font-semibold" onClick={() => onAddElement('text')}>Add Subheading</Button> <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-sm" onClick={() => onAddElement('text')}>Add body text</Button> </div> )}
            {activeTab === 'uploads' && ( <div> <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Upload Image</h3> <label htmlFor="image-upload-sidebar" className="block cursor-pointer p-4 border-2 border-dashed rounded hover:border-blue-400 hover:bg-blue-50 text-center text-gray-500 hover:text-blue-600" onDrop={handleDrop} onDragOver={handleDragOver}> <ImageIcon size={24} className="mx-auto" /> <span className="mt-1 block text-xs">Click or drag image</span> <span className="mt-1 block text-[10px] text-gray-400">PNG, JPG up to 10MB</span> </label> <input id="image-upload-sidebar" type="file" accept="image/*" className="hidden" onChange={(e) => { onFileUpload(e.target.files); e.target.value = ''; }} /> </div> )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// --- ResizeHandles ---
interface ResizeHandlesProps { elementId: string; onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void; }
const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as const;
const ResizeHandles: React.FC<ResizeHandlesProps> = ({ elementId, onResizeHandleMouseDown }) => ( <>{handles.map(handle => ( <div key={handle} data-handle={handle} className={`absolute w-2.5 h-2.5 bg-white border border-blue-600 rounded-sm cursor-${handle}-resize z-20`} style={{ left: handle.includes('w') ? '-5px' : handle.includes('e') ? 'calc(100% - 5px)' : 'calc(50% - 5px)', top: handle.includes('n') ? '-5px' : handle.includes('s') ? 'calc(100% - 5px)' : 'calc(50% - 5px)', }} onMouseDown={(e) => onResizeHandleMouseDown(e, elementId, handle)} /> ))}</> );

// --- ElementComponent ---
interface ElementComponentProps { element: SlideElement; isSelected: boolean; interactionState: InteractionState; onMouseDown: (e: React.MouseEvent, elementId: string) => void; onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void; onClick: (e: React.MouseEvent, elementId: string) => void; onTextChange: (id: string, content: string) => void; onTextBlur: (id: string) => void; displayX: number; displayY: number; displayWidth: number; displayHeight: number; activeTextareaRef: React.RefObject<HTMLTextAreaElement | null>; onDeleteElement: (elementId: string) => void; }
const ElementComponent: React.FC<ElementComponentProps> = ({ element, isSelected, interactionState, onMouseDown, onResizeHandleMouseDown, onClick, onTextChange, onTextBlur, displayX, displayY, displayWidth, displayHeight, activeTextareaRef, onDeleteElement }) => {
  const isDraggingThis = interactionState === 'draggingElement' && isSelected; const isResizingThis = interactionState === 'resizingElement' && isSelected;
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { onTextChange(element.id, e.target.value); };
  const handleTextBlur = () => { onTextBlur(element.id); };
  return (
    <div className={cn( "absolute cursor-grab", { "cursor-grabbing": isDraggingThis }, { "select-none": isDraggingThis || isResizingThis } )} style={{ left: `${displayX}px`, top: `${displayY}px`, width: `${displayWidth}px`, height: `${displayHeight}px`, border: isSelected ? '1px solid #3b82f6' : 'none', outline: isSelected ? '1px solid rgba(255,255,255,0.7)' : 'none', zIndex: isSelected ? 10 : 1, transition: 'none', boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none', boxSizing: 'border-box', }} onClick={(e) => onClick(e, element.id)} onMouseDown={(e) => onMouseDown(e, element.id)} >
      <div className="w-full h-full overflow-hidden relative" style={{ ...element.style, borderRadius: typeof element.style.borderRadius === 'number' ? `${element.style.borderRadius}px` : element.style.borderRadius, borderWidth: element.style.borderWidth ? `${element.style.borderWidth}px` : undefined, boxSizing: 'border-box', }} >
        {element.type === 'text' && ( element.isEditing ? ( <textarea ref={activeTextareaRef} value={element.content || ''} onChange={handleTextChange} onBlur={handleTextBlur} onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }} data-element-id={element.id} className="absolute inset-0 w-full h-full resize-none border-none outline-none bg-transparent p-1 box-border m-0 leading-tight focus:ring-0" style={{ fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', fontWeight: element.style.fontWeight, fontStyle: element.style.fontStyle, textDecoration: element.style.textDecoration, textAlign: element.style.textAlign, whiteSpace: 'pre-wrap', wordWrap: 'break-word', lineHeight: '1.2' }} autoFocus spellCheck="false" onMouseDown={(e) => e.stopPropagation()} /> ) : ( <div className="w-full h-full p-1 box-border whitespace-pre-wrap break-words" style={{ fontWeight: element.style.fontWeight, fontStyle: element.style.fontStyle, textDecoration: element.style.textDecoration, textAlign: element.style.textAlign, lineHeight: '1.2', }} > {element.content || <span className="text-gray-400 italic pointer-events-none"></span>} </div> ) )}
        {element.type === 'image' && ( element.content ? <img src={element.content} alt="" className="w-full h-full object-contain block" draggable="false" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"> <ImageIcon size={24} /> </div> )}
        {element.type === 'shape' && ( <div className="w-full h-full" style={{ backgroundColor: element.style.backgroundColor || '#ccc' }}></div> )}
      </div>
      {isSelected && ( <ResizeHandles elementId={element.id} onResizeHandleMouseDown={onResizeHandleMouseDown} /> )}
      {isSelected && ( <Button variant="destructive" size="icon-xs" className="absolute -top-2 -right-2 z-20 rounded-full" onClick={(e) => { e.stopPropagation(); onDeleteElement(element.id); }} onMouseDown={(e) => e.stopPropagation()} title="Delete element"> <Trash2 size={10} /> </Button> )}
    </div>
  );
};

// --- CanvasArea ---
interface CanvasAreaProps { slide: Slide | undefined; zoomLevel: number; selectedElementId: string | null; interactionState: InteractionState; onCanvasMouseDown: (e: React.MouseEvent) => void; onElementMouseDown: (e: React.MouseEvent, elementId: string) => void; onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void; onElementClick: (e: React.MouseEvent, elementId: string) => void; onTextChange: (id: string, content: string) => void; onTextBlur: (id: string) => void; canvasRef: React.RefObject<HTMLDivElement | null>; activeTextareaRef: React.RefObject<HTMLTextAreaElement | null>; onDeleteElement: (elementId: string) => void; }
const CanvasArea = React.forwardRef<HTMLDivElement, CanvasAreaProps>(({ slide, zoomLevel, selectedElementId, interactionState, onCanvasMouseDown, onElementMouseDown, onResizeHandleMouseDown, onElementClick, onTextChange, onTextBlur, canvasRef, activeTextareaRef, onDeleteElement }, ref) => (
    // SỬA LỖI 4: Xóa 'overflow-auto'
    <main ref={ref} className="flex-1 flex items-center justify-center p-4 bg-gray-200 relative">
      <div ref={canvasRef} className="relative bg-white shadow-lg overflow-hidden transform origin-center" style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, backgroundColor: slide?.backgroundColor || '#ffffff', transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease-out', minWidth: `${CANVAS_WIDTH}px`, minHeight: `${CANVAS_HEIGHT}px`, }} onMouseDown={onCanvasMouseDown} >
        {slide?.elements.map((element) => ( <ElementComponent key={element.id} element={element} isSelected={selectedElementId === element.id} interactionState={interactionState} onMouseDown={onElementMouseDown} onResizeHandleMouseDown={onResizeHandleMouseDown} onClick={onElementClick} onTextChange={onTextChange} onTextBlur={onTextBlur} displayX={element.x} displayY={element.y} displayWidth={element.width} displayHeight={element.height} activeTextareaRef={activeTextareaRef} onDeleteElement={onDeleteElement} /> ))}
      </div>
    </main>
));
CanvasArea.displayName = 'CanvasArea';

// --- SlideThumbnail ---
interface SlideThumbnailProps { slide: Slide; index: number; isCurrent: boolean; isDragged: boolean; isDropTarget: boolean; onClick: (index: number) => void; onContextMenu: (e: React.MouseEvent, index: number) => void; onMouseDown: (e: React.MouseEvent, index: number) => void; onMouseEnter: (index: number) => void; onMouseUp: (index: number) => void; }
const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ slide, index, isCurrent, isDragged, isDropTarget, onClick, onContextMenu, onMouseDown, onMouseEnter, onMouseUp }) => (
    <div data-slide-index={index} onClick={() => onClick(index)} onContextMenu={(e) => onContextMenu(e, index)} onMouseDown={(e) => onMouseDown(e, index)} onMouseUp={() => onMouseUp(index)} onMouseEnter={() => onMouseEnter(index)} className={cn( "slide-thumbnail w-24 h-[67.5px] flex-shrink-0 bg-white border rounded shadow-sm cursor-pointer transition-all duration-150 relative overflow-hidden group select-none", isCurrent ? "border-blue-500 border-2 ring-1 ring-blue-500 ring-offset-1" : "border-gray-300 hover:border-gray-400", {"opacity-40 scale-95 cursor-grabbing": isDragged}, {"outline outline-2 outline-offset-1 outline-blue-400": isDropTarget} )} style={{ backgroundColor: slide.backgroundColor }} >
        <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] px-1 rounded-sm font-medium">{index + 1}</div>
        <div className="w-full h-full flex items-center justify-center text-gray-300 pointer-events-none"> {slide.elements.length === 0 && <Layers size={14} />} </div>
        {isDragged && ( <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none"> <Layers size={24} /> </div> )}
    </div>
);

// --- SlideNavigator ---
interface SlideNavigatorProps { slides: Slide[]; currentSlideIndex: number; onSlideClick: (index: number) => void; onAddSlide: () => void; onContextMenu: (e: React.MouseEvent, index: number) => void; onSlideMouseDown: (e: React.MouseEvent, index: number) => void; onSlideMouseEnter: (index: number) => void; onSlideMouseLeave: () => void; onSlideMouseUp: (index: number) => void; isDragging: boolean; draggedIndex: number | null; dropTargetIndex: number | null; }
const SlideNavigator: React.FC<SlideNavigatorProps> = ({ slides, currentSlideIndex, onSlideClick, onAddSlide, onContextMenu, onSlideMouseDown, onSlideMouseEnter, onSlideMouseLeave, onSlideMouseUp, isDragging, draggedIndex, dropTargetIndex }) => (
    // SỬA: Bỏ 'flex-shrink-0' và 'z-10' (Footer của SiteLayout sẽ xử lý việc này)
    <footer className="bg-gray-100 border-t border-gray-200 px-4 py-3 overflow-x-auto">
        <div className="flex items-center gap-3 w-max">
            {slides.map((slide, index) => ( <SlideThumbnail key={slide.id} slide={slide} index={index} isCurrent={index === currentSlideIndex} isDragged={isDragging && draggedIndex === index} isDropTarget={isDragging && dropTargetIndex === index && draggedIndex !== index} onClick={onSlideClick} onContextMenu={onContextMenu} onMouseDown={onSlideMouseDown} onMouseEnter={onSlideMouseEnter} onMouseUp={onSlideMouseUp} /> ))}
            <Button variant="outline" className="w-24 h-[67.5px] flex-shrink-0 border-dashed text-gray-500 hover:text-blue-600 hover:border-blue-400 flex-col" onClick={onAddSlide}> <Plus size={18} /> <span className="text-xs mt-1">Add Slide</span> </Button>
        </div>
    </footer>
);

// --- ContextMenu ---
interface ContextMenuProps { x: number; y: number; slideIndex: number; canPaste: boolean; canDelete: boolean; onCopy: () => void; onPaste: () => void; onDuplicate: () => void; onDelete: () => void; onAddSlide: () => void; onClose: () => void; }
const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, slideIndex, canPaste, canDelete, onCopy, onPaste, onDuplicate, onDelete, onAddSlide, onClose }) => (
    <div className="context-menu fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-40 text-sm animate-in fade-in zoom-in-95" style={{ left: x, top: y }} onContextMenu={(e) => e.preventDefault()} onClick={onClose} >
        <div className="px-2 py-1 text-xs text-gray-500 border-b mb-1">Slide {slideIndex + 1}</div>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onCopy}> <Copy size={14} className="mr-2"/> Copy <span className="ml-auto text-gray-400 text-xs">Ctrl+C</span> </Button>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onPaste} disabled={!canPaste}> <Clipboard size={14} className="mr-2"/> Paste <span className="ml-auto text-gray-400 text-xs">Ctrl+V</span> </Button>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onDuplicate}> <Copy size={14} className="mr-2"/> Duplicate <span className="ml-auto text-gray-400 text-xs">Ctrl+D</span> </Button>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent" onClick={onDelete} disabled={!canDelete}> <Trash2 size={14} className="mr-2"/> Delete <span className="ml-auto text-gray-400 text-xs">Del</span> </Button>
        <div className="border-t my-1 mx-2"></div>
        <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onAddSlide}> <Plus size={14} className="mr-2"/> Add Slide </Button>
    </div>
);

// --- SaveDialog ---
interface SaveDialogProps { isOpen: boolean; onClose: () => void; saveOptions: SaveOptions; onSaveOptionsChange: (newOptions: SaveOptions) => void; onSave: () => void; isSaving: boolean; }
const SaveDialog: React.FC<SaveDialogProps> = ({ isOpen, onClose, saveOptions, onSaveOptionsChange, onSave, isSaving }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Presentation</DialogTitle>
          <DialogDescription> Enter details for your presentation. It will be saved as a draft. </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="title" className="text-right text-sm">Title *</Label> <Input id="title" value={saveOptions.title} onChange={e => onSaveOptionsChange({ ...saveOptions, title: e.target.value })} className="col-span-3 h-9" placeholder="Presentation Title" /> </div>
          <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="topic" className="text-right text-sm">Topic *</Label> <Input id="topic" value={saveOptions.topic} onChange={e => onSaveOptionsChange({ ...saveOptions, topic: e.target.value })} className="col-span-3 h-9" placeholder="e.g., Algebra Basics" /> </div>
          <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="price" className="text-right text-sm">Price ($)</Label> <Input id="price" type="number" value={saveOptions.price} onChange={e => onSaveOptionsChange({ ...saveOptions, price: Number(e.target.value) || 0 })} className="col-span-3 h-9" min="0" step="0.01" /> </div>
          <div className="grid grid-cols-4 items-center gap-4"> <Label htmlFor="grade" className="text-right text-sm">Grade</Label> <Input id="grade" type="number" value={saveOptions.grade ?? ''} onChange={e => onSaveOptionsChange({ ...saveOptions, grade: e.target.value ? Number(e.target.value) : undefined })} className="col-span-3 h-9" min="1" max="12" placeholder="1-12 (Optional)" /> </div>
        </div>
        <DialogFooter> <Button variant="outline" onClick={onClose}>Cancel</Button> <Button onClick={onSave} disabled={isSaving || !saveOptions.title || !saveOptions.topic}> {isSaving ? 'Saving...' : 'Save'} </Button> </DialogFooter>
      </DialogContent>
    </Dialog>
);


// --- 2. COMPONENT CHÍNH (Create) ---
export default function Create() {
    // --- Refs ---
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    // --- State ---
    const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('elements');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [history, setHistory] = useState<Slide[][]>([INITIAL_SLIDES]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [interactionState, setInteractionState] = useState<InteractionState>('idle');
    const [dragResizeInfo, setDragResizeInfo] = useState<DragResizeInfo | null>(null);
    const [showTextToolbar, setShowTextToolbar] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slideIndex: number } | null>(null);
    const [copiedSlide, setCopiedSlide] = useState<Slide | null>(null);
    const [isDraggingSlideThumb, setIsDraggingSlideThumb] = useState(false);
    const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveOptions, setSaveOptions] = useState<SaveOptions>({ title: '', topic: '', price: 0, grade: undefined });
    const [zoomLevel, setZoomLevel] = useState(1);

    // --- Derived State ---
    const currentSlide = slides[currentSlideIndex];
    const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);
    const createSlideMutation = useCreateSlideMutation();
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // --- SỬA LỖI 2: DI CHUYỂN TẤT CẢ CÁC HÀM LÊN ĐẦU ---

    // --- Core Logic Callbacks ---
    const updateSlides = useCallback((newSlides: Slide[], options?: { saveHistory?: boolean, newIndex?: number }) => {
        const { saveHistory = true, newIndex } = options || {};
        setSlides(newSlides);
        if (saveHistory) {
            const historyCopy = newSlides.map(s => ({ ...s, elements: s.elements.map(e => ({ ...e, style: { ...e.style } })) }));
            const nextHistory = history.slice(0, historyIndex + 1); nextHistory.push(historyCopy);
            setHistory(nextHistory); setHistoryIndex(nextHistory.length - 1);
        }
        if (newIndex !== undefined) {
            const clampedIndex = Math.max(0, Math.min(newIndex, newSlides.length - 1));
            if (currentSlideIndex !== clampedIndex) { setCurrentSlideIndex(clampedIndex); setSelectedElementId(null); setShowTextToolbar(false); }
        }
    }, [history, historyIndex, currentSlideIndex]);

    const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>, saveHistoryNow = false) => {
        const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, ...updates, style: { ...el.style, ...updates.style } } : el ) } : s );
        if (saveHistoryNow || interactionState === 'idle') updateSlides(newSlides, { saveHistory: true }); else setSlides(newSlides);
    }, [slides, currentSlideIndex, updateSlides, interactionState]);

    const handleTextEditEnd = useCallback((elementId: string) => {
        const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, isEditing: false } : el ) } : s );
        updateSlides(newSlides, {saveHistory: true});
        setShowTextToolbar(selectedElementId === elementId);
    }, [slides, currentSlideIndex, updateSlides, selectedElementId]);

    const getCurrentTextElement = useCallback(() => currentSlide?.elements.find(el => el.id === selectedElementId && el.type === 'text'), [currentSlide, selectedElementId]);

    const updateTextStyle = useCallback((property: keyof SlideElementStyle, value: any) => {
        if (!selectedElementId) return;
        const currentElement = getCurrentTextElement(); if (!currentElement) return; let newValue = value;
        if (['fontWeight', 'fontStyle', 'textDecoration'].includes(property)) { const currentVal = currentElement.style?.[property as keyof typeof currentElement.style]; const normalVal = property === 'fontWeight' ? 'normal' : property === 'fontStyle' ? 'normal' : 'none'; const activeVal = property === 'fontWeight' ? 'bold' : property === 'fontStyle' ? 'italic' : 'underline'; newValue = currentVal === activeVal ? normalVal : activeVal; }
        const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: s.elements.map(el => el.id === selectedElementId ? { ...el, style: { ...el.style, [property]: newValue } } : el ) } : s );
        setSlides(newSlides);
        requestAnimationFrame(() => updateSlides(newSlides, { saveHistory: true }));
        activeTextareaRef.current?.focus();
    }, [selectedElementId, slides, currentSlideIndex, updateSlides, getCurrentTextElement]);

     const handleListToggle = useCallback(() => {
         if (!selectedElementId) return;
         const currentElement = getCurrentTextElement(); if (!currentElement || currentElement.type !== 'text') return;
         const currentContent = currentElement.content || ''; const lines = currentContent.split('\n'); const isBulleted = lines.some(line => line.trim().startsWith('• '));
         const newContent = lines.map((line: string) => { const trimmedLine = line.trim(); if (!trimmedLine) return line; return isBulleted ? trimmedLine.startsWith('• ') ? trimmedLine.substring(2) : line : `• ${trimmedLine}`; }).join('\n');
         updateElement(selectedElementId, { content: newContent }, true);
     }, [selectedElementId, getCurrentTextElement, updateElement]);

    const handleZoom = useCallback((newZoomLevel: number) => { const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel)); setZoomLevel(clampedZoom); }, []);
    const undo = useCallback(() => { if (canUndo) { const prevIndex = historyIndex - 1; setHistoryIndex(prevIndex); const prevSlides = history[prevIndex]; updateSlides(prevSlides, { saveHistory: false, newIndex: currentSlideIndex >= prevSlides.length ? Math.max(0, prevSlides.length - 1) : currentSlideIndex }); setSelectedElementId(null); } }, [canUndo, historyIndex, history, updateSlides, currentSlideIndex]);
    const redo = useCallback(() => { if (canRedo) { const nextIndex = historyIndex + 1; setHistoryIndex(nextIndex); const nextSlides = history[nextIndex]; updateSlides(nextSlides, { saveHistory: false, newIndex: currentSlideIndex >= nextSlides.length ? Math.max(0, nextSlides.length - 1) : currentSlideIndex }); setSelectedElementId(null); } }, [canRedo, historyIndex, history, updateSlides, currentSlideIndex]);

    const addElement = useCallback((type: SlideElement['type']) => {
        let newElementData: Partial<SlideElement> = {}; const commonStyle: SlideElementStyle = { fontSize: 16, fontFamily: 'Arial', color: '#000000', textAlign: 'left', opacity: 1 };
        let width = 100; let height = 100;
        switch (type) { case 'text': newElementData = { content: 'Text', style: { ...commonStyle, fontSize: 16 }, isEditing: true }; width = 200; height = 50; break; case 'image': newElementData = { style: { ...commonStyle, backgroundColor: '#e5e7eb' } }; width = 150; height = 150; break; case 'shape': newElementData = { style: { ...commonStyle, backgroundColor: '#3b82f6' } }; width = 100; height = 100; break; default: return; }
        const newElement: SlideElement = { id: `el-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, x: 50, y: 50, width, height, ...newElementData, style: { ...commonStyle, ...newElementData.style }, };
        const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: [...s.elements, newElement] } : s); updateSlides(newSlides, { saveHistory: true }); setSelectedElementId(newElement.id); setShowTextToolbar(type === 'text');
    }, [slides, currentSlideIndex, updateSlides]);

    const deleteElement = useCallback((elementId: string) => { const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: s.elements.filter(el => el.id !== elementId) } : s); updateSlides(newSlides, { saveHistory: true }); setSelectedElementId(null); setShowTextToolbar(false); }, [slides, currentSlideIndex, updateSlides]);

    const addSlide = useCallback((index?: number) => { const newSlide: Slide = { id: `slide-${Date.now()}`, elements: [], backgroundColor: '#ffffff' }; const insertIndex = index !== undefined ? index + 1 : slides.length; const newSlides = [...slides]; newSlides.splice(insertIndex, 0, newSlide); updateSlides(newSlides, { saveHistory: true, newIndex: insertIndex }); }, [slides, updateSlides]);
    const duplicateSlide = useCallback((slideIndex: number) => { const slideToDuplicate = slides[slideIndex]; const duplicatedSlide: Slide = { ...JSON.parse(JSON.stringify(slideToDuplicate)), id: `slide-${Date.now()}`, elements: slideToDuplicate.elements.map((el: SlideElement) => ({ ...el, id: `element-${Date.now()}-${Math.random().toString(16).slice(2)}` })) }; const insertIndex = slideIndex + 1; const newSlides = [...slides]; newSlides.splice(insertIndex, 0, duplicatedSlide); updateSlides(newSlides, { saveHistory: true, newIndex: insertIndex }); setContextMenu(null); }, [slides, updateSlides]);
    const deleteSlide = useCallback((slideIndex: number) => { if (slides.length <= 1) return; const newSlides = slides.filter((_, index) => index !== slideIndex); let newCurrentIndex = currentSlideIndex; if (currentSlideIndex === slideIndex) newCurrentIndex = Math.max(0, slideIndex - 1); else if (currentSlideIndex > slideIndex) newCurrentIndex = currentSlideIndex - 1; updateSlides(newSlides, { saveHistory: true, newIndex: newCurrentIndex }); setContextMenu(null); }, [slides, currentSlideIndex, updateSlides]);
    const copySlide = useCallback((slideIndex: number) => { setCopiedSlide(JSON.parse(JSON.stringify(slides[slideIndex]))); setContextMenu(null); }, [slides]);
    const pasteSlide = useCallback((slideIndex: number) => { if (!copiedSlide) return; const pastedSlide: Slide = { ...JSON.parse(JSON.stringify(copiedSlide)), id: `slide-${Date.now()}`, elements: copiedSlide.elements.map((el: SlideElement) => ({ ...el, id: `element-${Date.now()}-${Math.random().toString(16).slice(2)}` })) }; const insertIndex = slideIndex + 1; const newSlides = [...slides]; newSlides.splice(insertIndex, 0, pastedSlide); updateSlides(newSlides, { saveHistory: true, newIndex: insertIndex }); setContextMenu(null); }, [slides, copiedSlide, updateSlides]);
    const handleFileUpload = useCallback((files: FileList | null) => { if (files && files.length > 0) { const file = files[0]; if (file.type.startsWith('image/') && file.size <= 10*1024*1024) { const reader = new FileReader(); reader.onload = (event) => { const dataUrl = event.target?.result as string; if (dataUrl) { const newImageElement: SlideElement = { id: `el-${Date.now()}-${Math.random().toString(16).slice(2)}`, type: 'image', x: 50, y: 50, width: 200, height: 150, content: dataUrl, style: {} }; const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: [...s.elements, newImageElement] } : s ); updateSlides(newSlides, { saveHistory: true }); setSelectedElementId(newImageElement.id); } else alert('Failed to read image file.'); }; reader.onerror = () => alert(`Error reading file: ${reader.error?.message}`); reader.readAsDataURL(file); } else if (file.size > 10*1024*1024) alert('File size exceeds 10MB limit.'); else alert('Please select a valid image file.'); } }, [slides, currentSlideIndex, updateSlides]);

    // --- Interaction Handlers ---
    const handleCanvasMouseDown = (e: React.MouseEvent) => { if (e.target === canvasRef.current) { setSelectedElementId(null); setShowTextToolbar(false); const editingElement = currentSlide?.elements.find(el => el.isEditing); if (editingElement) { activeTextareaRef.current?.blur(); } } };
    const handleElementClick = (e: React.MouseEvent, elementId: string) => { e.stopPropagation(); setSelectedElementId(elementId); const element = currentSlide.elements.find(el => el.id === elementId); setShowTextToolbar(element?.type === 'text'); if (element?.type === 'text' && !element.isEditing) { const newSlides = slides.map((s, i) => i === currentSlideIndex ? { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, isEditing: true } : el ) } : s ); setSlides(newSlides); } };
    const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => { e.stopPropagation(); const element = currentSlide.elements.find(el => el.id === elementId); if (!element || (element.isEditing && (e.target as HTMLElement).tagName === 'TEXTAREA')) return; setSelectedElementId(elementId); setShowTextToolbar(element.type === 'text'); setInteractionState('draggingElement'); const canvasRect = canvasRef.current?.getBoundingClientRect(); if (canvasRect) { const startX = (e.clientX - canvasRect.left) / zoomLevel; const startY = (e.clientY - canvasRect.top) / zoomLevel; setDragResizeInfo({ startX, startY, initialX: element.x, initialY: element.y }); document.body.style.cursor = 'grabbing'; } };
    const handleResizeHandleMouseDown = (e: React.MouseEvent, elementId: string, handle: string) => { e.preventDefault(); e.stopPropagation(); const element = currentSlide.elements.find(el => el.id === elementId); if (!element) return; setSelectedElementId(elementId); setInteractionState('resizingElement'); const canvasRect = canvasRef.current?.getBoundingClientRect(); if (canvasRect) { const startX = (e.clientX - canvasRect.left) / zoomLevel; const startY = (e.clientY - canvasRect.top) / zoomLevel; setDragResizeInfo({ startX, startY, initialX: element.x, initialY: element.y, initialW: element.width, initialH: element.height, handle }); document.body.style.cursor = `${handle}-resize`; } };

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (interactionState === 'idle' || !dragResizeInfo || !selectedElementId) return;
        const canvasRect = canvasRef.current?.getBoundingClientRect(); if (!canvasRect) return;
        const currentX = (e.clientX - canvasRect.left) / zoomLevel; const currentY = (e.clientY - canvasRect.top) / zoomLevel;
        const { startX, startY, initialX, initialY, initialW, initialH, handle } = dragResizeInfo;
        const deltaX = currentX - startX; const deltaY = currentY - startY;

        if (interactionState === 'draggingElement') {
            const newX = initialX + deltaX; const newY = initialY + deltaY; const element = currentSlide.elements.find(el => el.id === selectedElementId); if (!element) return; const constrainedX = Math.max(0, Math.min(newX, CANVAS_WIDTH - element.width)); const constrainedY = Math.max(0, Math.min(newY, CANVAS_HEIGHT - element.height));
            updateElement(selectedElementId, { x: constrainedX, y: constrainedY }, false);
        } else if (interactionState === 'resizingElement' && handle && initialW !== undefined && initialH !== undefined) {
            let newElementX = initialX, newElementY = initialY, newElementW = initialW, newElementH = initialH;
            if (handle.includes('e')) newElementW = Math.max(MIN_ELEMENT_WIDTH, initialW + deltaX); if (handle.includes('s')) newElementH = Math.max(MIN_ELEMENT_HEIGHT, initialH + deltaY); if (handle.includes('w')) { const widthChange = initialW - deltaX; newElementW = Math.max(MIN_ELEMENT_WIDTH, widthChange); newElementX = initialX + (initialW - newElementW); } if (handle.includes('n')) { const heightChange = initialH - deltaY; newElementH = Math.max(MIN_ELEMENT_HEIGHT, heightChange); newElementY = initialY + (initialH - newElementH); }
            updateElement(selectedElementId, { x: newElementX, y: newElementY, width: newElementW, height: newElementH }, false);
        }
    }, [interactionState, selectedElementId, dragResizeInfo, zoomLevel, currentSlide, updateElement]);

    const handleGlobalMouseUp = useCallback(() => {
        if (interactionState !== 'idle') { document.body.style.cursor = ''; if (slides !== history[historyIndex]) { updateSlides(slides, { saveHistory: true }); } setInteractionState('idle'); setDragResizeInfo(null); }
        if (isDraggingSlideThumb) { document.body.style.cursor = ''; setIsDraggingSlideThumb(false); if (draggedSlideIndex !== null && dropTargetIndex !== null && draggedSlideIndex !== dropTargetIndex) { const newSlides = [...slides]; const [draggedItem] = newSlides.splice(draggedSlideIndex, 1); const actualDropIndex = draggedSlideIndex < dropTargetIndex ? dropTargetIndex -1 : dropTargetIndex; newSlides.splice(actualDropIndex, 0, draggedItem); let newCurrentIndex = currentSlideIndex; if (currentSlideIndex === draggedSlideIndex) newCurrentIndex = actualDropIndex; else if (draggedSlideIndex < currentSlideIndex && actualDropIndex >= currentSlideIndex) newCurrentIndex--; else if (draggedSlideIndex > currentSlideIndex && actualDropIndex <= currentSlideIndex) newCurrentIndex++; updateSlides(newSlides, { saveHistory: true, newIndex: newCurrentIndex }); } setDraggedSlideIndex(null); setDropTargetIndex(null); }
    }, [interactionState, slides, history, historyIndex, updateSlides, isDraggingSlideThumb, draggedSlideIndex, dropTargetIndex, currentSlideIndex]);

    // --- Slide Thumb Callbacks ---
    const handleSlideThumbContextMenu = (e: React.MouseEvent, slideIndex: number) => { e.preventDefault(); e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); let y = rect.bottom + 5; let x = e.clientX; const menuHeight = 200; const menuWidth = 160; if (y + menuHeight > window.innerHeight) y = rect.top - menuHeight - 5; if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10; setContextMenu({ x: Math.max(0, x), y: Math.max(0, y), slideIndex }); };
    const handleSlideThumbClick = (slideIndex: number) => { if (slideIndex !== currentSlideIndex) { setCurrentSlideIndex(slideIndex); setSelectedElementId(null); setShowTextToolbar(false); } setContextMenu(null); };
    const handleSlideThumbMouseDown = (e: React.MouseEvent, slideIndex: number) => { if (e.button !== 0) return; e.preventDefault(); setIsDraggingSlideThumb(true); setDraggedSlideIndex(slideIndex); setDropTargetIndex(slideIndex); document.body.style.cursor = 'grabbing'; };
    const handleSlideThumbMouseEnter = (targetIndex: number) => { if (isDraggingSlideThumb) setDropTargetIndex(targetIndex); };
    const handleSlideThumbContainerMouseLeave = () => { if (isDraggingSlideThumb) setDropTargetIndex(null); }
    const handleSlideThumbMouseUp = (index: number) => { if (isDraggingSlideThumb) { handleGlobalMouseUp(); } else { handleSlideThumbClick(index); } };

    // --- Save & Export ---
    const exportToPowerPoint = () => { if (slides.length === 0) return; try { const pptx = new PptxGenJS(); pptx.layout = 'LAYOUT_16x9'; pptx.author = 'MathSlide Creator'; pptx.title = saveOptions.title || 'Untitled MathSlide'; slides.forEach((slide) => { const pptxSlide = pptx.addSlide(); pptxSlide.background = { color: slide.backgroundColor.replace('#', '') }; slide.elements.forEach((element) => { const inchX=element.x/96, inchY=element.y/96, inchW=element.width/96, inchH=element.height/96; const baseProps = { x: inchX, y: inchY, w: inchW, h: inchH }; const cleanColor = (c?:string)=>c?.replace('#','')||'000000'; if(element.type==='text') pptxSlide.addText(element.content||'', {...baseProps, fontSize:element.style?.fontSize||16, color:cleanColor(element.style?.color), fontFace:element.style?.fontFamily||'Arial', bold:element.style?.fontWeight==='bold', italic:element.style?.fontStyle==='italic', underline:element.style?.textDecoration==='underline'?{ style: 'sng' }:undefined, align:element.style?.textAlign||'left', valign:'middle', margin:0}); else if(element.type==='image' && element.content?.startsWith('data:image')) pptxSlide.addImage({...baseProps, data:element.content}); else if(element.type==='shape') pptxSlide.addShape(pptx.ShapeType.rect, {...baseProps, fill:{color:cleanColor(element.style?.backgroundColor)}}); }); }); const fileName = (saveOptions.title || 'MathSlide_Presentation') + '.pptx'; pptx.writeFile({ fileName }); } catch (error) { console.error('Error exporting PowerPoint:', error); alert('Failed to export PowerPoint file.'); } };
    const handleSave = async () => { if (!saveOptions.title.trim() || !saveOptions.topic.trim() || saveOptions.price < 0 || (saveOptions.grade && (saveOptions.grade < 1 || saveOptions.grade > 12))) { alert('Invalid save options.'); return; } if (slides.length === 0) { alert('Empty presentation.'); return; } try { const presentationData = { title: saveOptions.title, topic: saveOptions.topic, price: saveOptions.price, grade: saveOptions.grade, isPublished: false, slidePages: slides.map((slide, index) => ({ orderNumber: index + 1, title: `Slide ${index + 1}`, content: JSON.stringify({ elements: slide.elements, backgroundColor: slide.backgroundColor }) })) }; const pptx = new PptxGenJS(); slides.forEach((slide) => { const pptxSlide = pptx.addSlide(); pptxSlide.background = { color: slide.backgroundColor.replace('#', '') }; slide.elements.forEach((element) => { const inchX=element.x/96, inchY=element.y/96, inchW=element.width/96, inchH=element.height/96; const baseProps = { x: inchX, y: inchY, w: inchW, h: inchH }; const cleanColor = (c?:string)=>c?.replace('#','')||'000000'; if(element.type==='text') pptxSlide.addText(element.content||'', {...baseProps, fontSize:element.style?.fontSize||16, color:cleanColor(element.style?.color), fontFace:element.style?.fontFamily||'Arial', bold:element.style?.fontWeight==='bold', italic:element.style?.fontStyle==='italic', underline:element.style?.textDecoration==='underline'?{style:'sng'}:undefined, align:element.style?.textAlign||'left', valign:'middle', margin:0}); else if(element.type==='image' && element.content?.startsWith('data:image')) pptxSlide.addImage({...baseProps, data:element.content}); else if(element.type==='shape') pptxSlide.addShape(pptx.ShapeType.rect, {...baseProps, fill:{color:cleanColor(element.style?.backgroundColor)}}); }); }); const blob = await pptx.write({ outputType: 'blob' }) as Blob; const file = new File([blob], `${saveOptions.title.replace(/[^a-z0-9]/gi, '_')}.pptx`, { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }); await createSlideMutation.mutateAsync({ slideDto: presentationData, file }); alert(`Presentation "${saveOptions.title}" saved!`); setShowSaveDialog(false); } catch (error) { console.error('Failed to save:', error); alert('Failed to save presentation.'); } };

    // --- Effects ---
    // Keyboard Shortcuts
    useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (showSaveDialog || ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return; const isCtrlOrMeta = e.ctrlKey || e.metaKey; const key = e.key.toLowerCase(); if ((key === 'delete' || key === 'backspace') && selectedElementId) { e.preventDefault(); deleteElement(selectedElementId); } else if ((key === 'delete' || key === 'backspace') && slides.length > 1) { e.preventDefault(); deleteSlide(currentSlideIndex); } else if (key === 'escape') { setContextMenu(null); setSelectedElementId(null); setShowTextToolbar(false); } else if (isCtrlOrMeta) { switch (key) { case 'z': e.preventDefault(); undo(); break; case 'y': e.preventDefault(); redo(); break; case 'c': if (!selectedElementId) { e.preventDefault(); copySlide(currentSlideIndex); } break; case 'v': if (copiedSlide && !selectedElementId) { e.preventDefault(); pasteSlide(currentSlideIndex); } break; case 'd': if (!selectedElementId) { e.preventDefault(); duplicateSlide(currentSlideIndex); } break; case 's': e.preventDefault(); setShowSaveDialog(true); break; case '=': case '+': e.preventDefault(); handleZoom(zoomLevel + ZOOM_STEP); break; case '-': e.preventDefault(); handleZoom(zoomLevel - ZOOM_STEP); break; case '0': e.preventDefault(); handleZoom(1); break; } } else if (e.shiftKey && isCtrlOrMeta && key === 'z') { e.preventDefault(); redo(); } }; document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [selectedElementId, currentSlideIndex, slides, copiedSlide, showSaveDialog, undo, redo, zoomLevel, deleteElement, deleteSlide, copySlide, pasteSlide, duplicateSlide, handleZoom]);
    // Context Menu closing
    useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (contextMenu && !(e.target as Element).closest('.context-menu')) setContextMenu(null); }; document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }, [contextMenu]);
    // Global mouse up for slide dragging
    useEffect(() => { const handleGlobalMouseUp = () => { if (isDraggingSlideThumb) { document.body.style.cursor = ''; setIsDraggingSlideThumb(false); setDraggedSlideIndex(null); setDropTargetIndex(null); } }; document.addEventListener('mouseup', handleGlobalMouseUp); return () => document.removeEventListener('mouseup', handleGlobalMouseUp); }, [isDraggingSlideThumb]);
    // Global mouse move/up for element drag/resize
    useEffect(() => { if (interactionState !== 'idle') { document.addEventListener('mousemove', handleGlobalMouseMove); document.addEventListener('mouseup', handleGlobalMouseUp); return () => { document.removeEventListener('mousemove', handleGlobalMouseMove); document.removeEventListener('mouseup', handleGlobalMouseUp); document.body.style.cursor = ''; }; } }, [interactionState, handleGlobalMouseMove, handleGlobalMouseUp]);


    // --- Render ---
    // SỬA LỖI 4: Tính toán vị trí sticky cho sidebar
    // NavBar (h-12 = 3rem) + TopToolbar (h-14 = 3.5rem)
    const toolbarHeight = "calc(3rem + 3.5rem)"; // 6.5rem
    // Nếu TextFormatToolbar hiển thị (h-12 = 3rem), tổng chiều cao là 9.5rem
    const totalStickyTop = showTextToolbar ? "calc(3rem + 3.5rem + 3rem)" : "calc(3rem + 3.5rem)";

    return (
        // SỬA LỖI 1 & 2: Xóa h-screen, thêm pt-12
        <div className="pt-12 bg-gray-100 select-none">
            <TopToolbar
                canUndo={canUndo} onUndo={undo} canRedo={canRedo} onRedo={redo}
                zoomLevel={zoomLevel} onZoomIn={() => handleZoom(zoomLevel + ZOOM_STEP)} onZoomOut={() => handleZoom(zoomLevel - ZOOM_STEP)} onZoomReset={() => handleZoom(1)}
                onExport={exportToPowerPoint} onSave={() => setShowSaveDialog(true)}
                minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM}
            />

            {showTextToolbar && selectedElement && (
                <TextFormatToolbar
                    element={selectedElement}
                    onStyleChange={updateTextStyle}
                    onListToggle={handleListToggle}
                    textAreaRef={activeTextareaRef}
                />
            )}

            {/* SỬA LỖI 4: Xóa flex-1 và overflow-hidden */}
            <div className="flex flex-row">
                <Sidebar
                    activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab}
                    isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
                    onAddElement={addElement} onFileUpload={handleFileUpload}
                    stickyTop={totalStickyTop} // SỬA: Truyền vị trí sticky
                />

                <CanvasArea
                    ref={canvasContainerRef} canvasRef={canvasRef}
                    slide={currentSlide} zoomLevel={zoomLevel}
                    selectedElementId={selectedElementId}
                    interactionState={interactionState}
                    onCanvasMouseDown={handleCanvasMouseDown}
                    onElementMouseDown={handleElementMouseDown}
                    onResizeHandleMouseDown={handleResizeHandleMouseDown}
                    onElementClick={handleElementClick}
                    onTextChange={(id, content) => updateElement(id, { content }, false)}
                    onTextBlur={handleTextEditEnd}
                    activeTextareaRef={activeTextareaRef}
                    onDeleteElement={deleteElement} 
                />
            </div>

            <SlideNavigator
                slides={slides} currentSlideIndex={currentSlideIndex}
                onSlideClick={handleSlideThumbClick} onAddSlide={addSlide}
                onContextMenu={handleSlideThumbContextMenu}
                onSlideMouseDown={handleSlideThumbMouseDown}
                onSlideMouseEnter={handleSlideThumbMouseEnter}
                onSlideMouseLeave={handleSlideThumbContainerMouseLeave}
                onSlideMouseUp={handleSlideThumbMouseUp}
                isDragging={isDraggingSlideThumb} draggedIndex={draggedSlideIndex}
                dropTargetIndex={dropTargetIndex}
            />

            {contextMenu && ( <ContextMenu x={contextMenu.x} y={contextMenu.y} slideIndex={contextMenu.slideIndex} canPaste={!!copiedSlide} onCopy={() => copySlide(contextMenu.slideIndex)} onPaste={() => pasteSlide(contextMenu.slideIndex)} onDuplicate={() => duplicateSlide(contextMenu.slideIndex)} onDelete={() => deleteSlide(contextMenu.slideIndex)} onAddSlide={() => { addSlide(contextMenu.slideIndex); setContextMenu(null); }} onClose={() => setContextMenu(null)} canDelete={slides.length > 1} /> )}
            <SaveDialog isOpen={showSaveDialog} onClose={() => setShowSaveDialog(false)} saveOptions={saveOptions} onSaveOptionsChange={setSaveOptions} onSave={handleSave} isSaving={createSlideMutation.isPending} />
        </div>
    );
}