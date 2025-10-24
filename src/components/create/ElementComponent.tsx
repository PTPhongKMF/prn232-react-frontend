// src/components/create/ElementComponent.tsx
import React from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react'; // Sửa: import Trash2
import { cn } from 'src/utils/cn';
import type { SlideElement, InteractionState } from 'src/types/create';
import { ResizeHandles } from './ResizeHandles';
import { Button } from "src/components/libs/shadcn/button"; // Sửa: import Button

interface ElementComponentProps {
  element: SlideElement;
  isSelected: boolean;
  interactionState: InteractionState;
  onMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void;
  onClick: (e: React.MouseEvent, elementId: string) => void;
  onTextChange: (id: string, content: string) => void;
  onTextBlur: (id: string) => void;
  displayX: number;
  displayY: number;
  displayWidth: number;
  displayHeight: number;
  activeTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  // SỬA: Thêm prop onDeleteElement
  onDeleteElement: (elementId: string) => void;
}

export function ElementComponent({
    element, isSelected, interactionState, onMouseDown, onResizeHandleMouseDown, onClick,
    onTextChange, onTextBlur, displayX, displayY, displayWidth, displayHeight, activeTextareaRef,
    onDeleteElement // SỬA: Nhận prop
}: ElementComponentProps) {

  const isDraggingThis = interactionState === 'draggingElement' && isSelected;
  const isResizingThis = interactionState === 'resizingElement' && isSelected;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onTextChange(element.id, e.target.value);
  };

  const handleTextBlur = () => {
      onTextBlur(element.id);
  };

  return (
    <div
      className={cn(
        "absolute cursor-grab",
        { "cursor-grabbing": isDraggingThis },
        { "select-none": isDraggingThis || isResizingThis }
      )}
      style={{
        left: `${displayX}px`, top: `${displayY}px`, width: `${displayWidth}px`, height: `${displayHeight}px`,
        border: isSelected ? '1px solid #3b82f6' : 'none',
        outline: isSelected ? '1px solid rgba(255,255,255,0.7)' : 'none',
        zIndex: isSelected ? 10 : 1,
        transition: 'none',
        boxShadow: isSelected ? '0 0 0 1px rgba(59, 130, 246, 0.5)' : 'none',
        boxSizing: 'border-box',
      }}
      onClick={(e) => onClick(e, element.id)}
      onMouseDown={(e) => onMouseDown(e, element.id)}
    >
      {/* Element Content */}
      <div
        className="w-full h-full overflow-hidden relative"
        style={{
          ...element.style,
          borderRadius: typeof element.style.borderRadius === 'number' ? `${element.style.borderRadius}px` : element.style.borderRadius,
          borderWidth: element.style.borderWidth ? `${element.style.borderWidth}px` : undefined,
          boxSizing: 'border-box',
        }}
      >
        {element.type === 'text' && (
          element.isEditing ? (
            <textarea
              ref={activeTextareaRef}
              value={element.content || ''}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
              data-element-id={element.id}
              className="absolute inset-0 w-full h-full resize-none border-none outline-none bg-transparent p-1 box-border m-0 leading-tight focus:ring-0"
              style={{
                fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit',
                fontWeight: element.style.fontWeight, fontStyle: element.style.fontStyle,
                textDecoration: element.style.textDecoration, textAlign: element.style.textAlign,
                whiteSpace: 'pre-wrap', wordWrap: 'break-word', lineHeight: '1.2',
              }}
              autoFocus
              spellCheck="false"
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full p-1 box-border whitespace-pre-wrap break-words"
              style={{
                fontWeight: element.style.fontWeight, fontStyle: element.style.fontStyle,
                textDecoration: element.style.textDecoration, textAlign: element.style.textAlign,
                lineHeight: '1.2',
              }}
            >
              {element.content || <span className="text-gray-400 italic pointer-events-none"></span>}
            </div>
          )
        )}
        {element.type === 'image' && (
          element.content ?
            <img src={element.content} alt="" className="w-full h-full object-contain block" draggable="false" />
          : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"> <ImageIcon size={24} /> </div>
        )}
        {element.type === 'shape' && (
          <div className="w-full h-full" style={{ backgroundColor: element.style.backgroundColor || '#ccc' }}></div>
        )}
      </div>

      {/* Resize Handles */}
      {isSelected && (
        <ResizeHandles elementId={element.id} onResizeHandleMouseDown={onResizeHandleMouseDown} />
      )}

      {/* SỬA: Bỏ comment nút xóa và sử dụng prop onDeleteElement */}
      {isSelected && (
        <Button
          variant="destructive" size="icon-xs"
          className="absolute -top-2 -right-2 z-20 rounded-full"
          // Sửa: Ngăn sự kiện click lan ra ngoài VÀ gọi hàm xóa
          onClick={(e) => { e.stopPropagation(); onDeleteElement(element.id); }}
          onMouseDown={(e) => e.stopPropagation()} // Ngăn bắt đầu drag element
          title="Delete element"
        >
          <Trash2 size={10} />
        </Button>
      )}
    </div>
  );
}