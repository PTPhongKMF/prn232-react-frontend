// src/components/create/CanvasArea.tsx
import React, { forwardRef } from 'react';
import type { Slide, InteractionState } from 'src/types/create'; 
import { CANVAS_WIDTH, CANVAS_HEIGHT } from 'src/types/create'; 
import { ElementComponent } from './ElementComponent';

interface CanvasAreaProps {
  slide: Slide | undefined;
  zoomLevel: number;
  selectedElementId: string | null;
  interactionState: InteractionState;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onElementMouseDown: (e: React.MouseEvent, elementId: string) => void;
  onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void;
  onElementClick: (e: React.MouseEvent, elementId: string) => void;
  onTextChange: (id: string, content: string) => void;
  onTextBlur: (id: string) => void;
  // SỬA LỖI: Chấp nhận kiểu 'null'
  canvasRef: React.RefObject<HTMLDivElement | null>; 
  activeTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onDeleteElement: (elementId: string) => void;
}

export const CanvasArea = forwardRef<HTMLDivElement, CanvasAreaProps>(({
  slide, zoomLevel, selectedElementId, interactionState,
  onCanvasMouseDown, onElementMouseDown, onResizeHandleMouseDown, onElementClick,
  onTextChange, onTextBlur, canvasRef, activeTextareaRef,
  onDeleteElement
}, ref) => {

  return (
    <main
      ref={ref} 
      className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-200 relative"
    >
      <div
        ref={canvasRef} 
        className="relative bg-white shadow-lg overflow-hidden transform origin-center"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          backgroundColor: slide?.backgroundColor || '#ffffff',
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.1s ease-out', 
          minWidth: `${CANVAS_WIDTH}px`,
          minHeight: `${CANVAS_HEIGHT}px`,
        }}
        onMouseDown={onCanvasMouseDown} 
      >
        {slide?.elements.map((element) => {
          const isSelected = selectedElementId === element.id;
          
          return (
            <ElementComponent
                key={element.id}
                element={element}
                isSelected={isSelected}
                interactionState={interactionState} 
                onMouseDown={(e) => onElementMouseDown(e, element.id)}
                onResizeHandleMouseDown={onResizeHandleMouseDown}
                onClick={(e) => onElementClick(e, element.id)}
                onTextChange={onTextChange}
                onTextBlur={onTextBlur}
                displayX={element.x}
                displayY={element.y}
                displayWidth={element.width}
                displayHeight={element.height}
                activeTextareaRef={activeTextareaRef}
                onDeleteElement={onDeleteElement}
             />
          );
        })}
      </div>
    </main>
  );
});

CanvasArea.displayName = 'CanvasArea';