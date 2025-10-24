// src/components/create/TextFormatToolbar.tsx
import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, Minus, Plus, Palette } from 'lucide-react';
import { Button } from "src/components/libs/shadcn/button"; // Đảm bảo đường dẫn này chính xác
import { Input } from "src/components/libs/shadcn/input"; // Đảm bảo đường dẫn này chính xác
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/libs/shadcn/select"; // Đảm bảo đường dẫn này chính xác
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/libs/shadcn/tooltip"; // Đảm bảo đường dẫn này chính xác
import type { SlideElement, SlideElementStyle } from 'src/types/create'; // Đảm bảo đường dẫn này chính xác

interface TextFormatToolbarProps {
  element: SlideElement | undefined;
  onStyleChange: (property: keyof SlideElementStyle, value: any) => void;
  onListToggle: () => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function TextFormatToolbar({ element, onStyleChange, onListToggle, textAreaRef }: TextFormatToolbarProps) {
  if (!element || element.type !== 'text') {
    return null;
  }
  
  const [savedSelection, setSavedSelection] = React.useState<{ start: number, end: number } | null>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onStyleChange('color', e.target.value);
    setTimeout(() => {
        if(textAreaRef.current && savedSelection) {
            textAreaRef.current.focus();
            textAreaRef.current.setSelectionRange(savedSelection.start, savedSelection.end);
            setSavedSelection(null); // Xóa selection đã lưu
        }
    }, 50);
  };
  
  const handleColorMouseDown = () => {
     const el = textAreaRef.current;
     if (el) {
         setSavedSelection({ start: el.selectionStart, end: el.selectionEnd });
     }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center gap-3 z-10 flex-shrink-0 h-12 text-sm overflow-x-auto">
        <Select
          value={element.style?.fontFamily || 'Arial'}
          onValueChange={(value: string) => onStyleChange('fontFamily', value)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs focus:ring-1 focus:ring-blue-500">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontSize', Math.max(8, (element.style?.fontSize || 16) - 1))}><Minus size={14}/></Button></TooltipTrigger><TooltipContent>Decrease Font Size</TooltipContent></Tooltip>
          <Input type="number" value={Math.round(element.style?.fontSize || 16)} onChange={(e) => onStyleChange('fontSize', parseInt(e.target.value) || 16)} className="w-12 h-7 px-1 text-xs text-center focus:ring-1 focus:ring-blue-500" min="8" max="120" step="1" aria-label="Font size"/>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={() => onStyleChange('fontSize', Math.min(120, (element.style?.fontSize || 16) + 1))}><Plus size={14}/></Button></TooltipTrigger><TooltipContent>Increase Font Size</TooltipContent></Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative w-7 h-7">
              <input type="color" value={element.style?.color || '#000000'} onChange={handleColorChange} onMouseDown={handleColorMouseDown} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Font color" />
              <Palette size={16} />
              <div className="absolute bottom-1 left-1 right-1 h-1 rounded-sm border border-gray-300" style={{ backgroundColor: element.style?.color || '#000000' }} />
            </Button>
          </TooltipTrigger>
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
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={onListToggle} data-active={element.content?.includes('• ')} className="data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700" aria-pressed={element.content?.includes('• ')}><List size={16} /></Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}