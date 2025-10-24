// src/components/create/SlideThumbnail.tsx
import React from 'react';
import { Layers } from 'lucide-react'; // Sửa: Thêm import Layers
import { cn } from 'src/utils/cn';
import type { Slide } from 'src/types/create';

interface SlideThumbnailProps {
    slide: Slide;
    index: number;
    isCurrent: boolean;
    isDragged: boolean;
    isDropTarget: boolean;
    onClick: (index: number) => void;
    onContextMenu: (e: React.MouseEvent, index: number) => void;
    onMouseDown: (e: React.MouseEvent, index: number) => void;
    onMouseEnter: (index: number) => void;
    onMouseUp: (index: number) => void;
}

export function SlideThumbnail({
    slide, index, isCurrent, isDragged, isDropTarget,
    onClick, onContextMenu, onMouseDown, onMouseEnter, onMouseUp
}: SlideThumbnailProps) {
    return (
        <div
            data-slide-index={index}
            onClick={() => onClick(index)}
            onContextMenu={(e) => onContextMenu(e, index)}
            onMouseDown={(e) => onMouseDown(e, index)}
            onMouseUp={() => onMouseUp(index)}
            onMouseEnter={() => onMouseEnter(index)}
            className={cn(
                "slide-thumbnail w-24 h-[67.5px] flex-shrink-0 bg-white border rounded shadow-sm cursor-pointer transition-all duration-150 relative overflow-hidden group select-none",
                isCurrent ? "border-blue-500 border-2 ring-1 ring-blue-500 ring-offset-1" : "border-gray-300 hover:border-gray-400",
                { "opacity-40 scale-95 cursor-grabbing": isDragged },
                { "outline outline-2 outline-offset-1 outline-blue-400": isDropTarget }
            )}
            style={{ backgroundColor: slide.backgroundColor }}
        >
            <div className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] px-1 rounded-sm font-medium">
                {index + 1}
            </div>
            <div className="w-full h-full flex items-center justify-center text-gray-300 pointer-events-none">
                 {slide.elements.length === 0 && <Layers size={14} />}
                 {/* Sửa: Thêm Layers vào đây */}
            </div>
            {isDragged && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none">
                    <Layers size={24} /> {/* Sửa: Thêm Layers vào đây */}
                </div>
            )}
        </div>
    );
}