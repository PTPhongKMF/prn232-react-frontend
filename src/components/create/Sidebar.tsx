// src/components/create/Sidebar.tsx
import React from 'react';
import { Shapes, Type, Upload, ChevronLeft, Image as ImageIcon, Square as SquareIcon } from 'lucide-react';
import { cn } from 'src/utils/cn';
import { Button } from "src/components/libs/shadcn/button"; // Đảm bảo đường dẫn này chính xác
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/libs/shadcn/tooltip"; // Đảm bảo đường dẫn này chính xác
import type { SlideElement, SidebarTab } from 'src/types/create'; // Đảm bảo đường dẫn này chính xác

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddElement: (type: SlideElement['type']) => void;
  onFileUpload: (files: FileList | null) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onAddElement, onFileUpload }: SidebarProps) {

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setActiveTab('uploads');
      setIsOpen(true);
      onFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* SỬA: Bỏ 'relative' khỏi div cha này */}
      <div className="flex flex-shrink-0 bg-white border-r border-gray-200 h-full">
        {/* Icon Bar */}
        {/* SỬA: Thêm 'relative' vào Icon Bar */}
        <div className="w-16 bg-gray-800 text-gray-400 flex flex-col items-center py-2 flex-shrink-0 z-10 relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('elements')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'elements'})}><Shapes size={20} /></Button>
            </TooltipTrigger>
            <TooltipContent side="right">Elements</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('text')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'text'})}><Type size={20} /></Button>
            </TooltipTrigger>
            <TooltipContent side="right">Text</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('uploads')} className={cn("w-12 h-12 text-gray-400 hover:text-white hover:bg-gray-700", {'bg-gray-600 text-white': activeTab === 'uploads'})}><Upload size={20} /></Button>
            </TooltipTrigger>
            <TooltipContent side="right">Uploads</TooltipContent>
          </Tooltip>

          {/* SỬA LỖI 2: Di chuyển nút bấm vào TRONG Icon Bar (w-16, relative) */}
          <Button
            variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "absolute top-1/2 -right-3 transform -translate-y-1/2 z-20 w-6 h-10 rounded-r-md rounded-l-none border-l-0 shadow hover:bg-gray-50"
                // Nút này bây giờ được định vị 'absolute' so với Icon Bar (w-16)
                // -right-3 sẽ đẩy nó ra 0.75rem (12px) bên ngoài Icon Bar
            )}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <ChevronLeft size={16} className={cn("transition-transform", { "rotate-180": !isOpen })} />
          </Button>
        </div>

        {/* Content Panel (Div thu gọn) */}
        <div className={cn( "transition-all duration-300 ease-in-out overflow-y-auto border-l border-gray-200", isOpen ? "w-64 p-4" : "w-0 p-0 overflow-hidden" )}>
          <div className={cn("w-64", { 'opacity-0': !isOpen })}>
            {activeTab === 'elements' && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Shapes</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="outline" size="icon-lg" onClick={() => onAddElement('shape')}><SquareIcon size={20} /></Button></TooltipTrigger>
                    <TooltipContent>Add Square</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
            {activeTab === 'text' && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Add Text</h3>
                <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-lg font-bold" onClick={() => onAddElement('text')}>Add Heading</Button>
                <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-base font-semibold" onClick={() => onAddElement('text')}>Add Subheading</Button>
                <Button variant="outline" className="w-full justify-start h-auto py-2 text-left text-sm" onClick={() => onAddElement('text')}>Add body text</Button>
              </div>
            )}
            {activeTab === 'uploads' && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Upload Image</h3>
                <label
                  htmlFor="image-upload-sidebar"
                  className="block cursor-pointer p-4 border-2 border-dashed rounded hover:border-blue-400 hover:bg-blue-50 text-center text-gray-500 hover:text-blue-600"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <ImageIcon size={24} className="mx-auto" />
                  <span className="mt-1 block text-xs">Click or drag image</span>
                  <span className="mt-1 block text-[10px] text-gray-400">PNG, JPG up to 10MB</span>
                </label>
                <input id="image-upload-sidebar" type="file" accept="image/*" className="hidden" onChange={(e) => { onFileUpload(e.target.files); e.target.value = ''; }} />
              </div>
            )}
          </div>
        </div>
        
        {/* Nút bấm đã được di chuyển vào trong Icon Bar */}
      </div>
    </TooltipProvider>
  );
}