// src/components/create/SlideNavigator.tsx
import React from 'react';
import { Plus } from 'lucide-react'; 
import { Button } from "src/components/libs/shadcn/button"; // Điều chỉnh đường dẫn nếu cần
import { SlideThumbnail } from './SlideThumbnail';
import type { Slide } from 'src/types/create'; // Điều chỉnh đường dẫn nếu cần

interface SlideNavigatorProps {
    slides: Slide[];
    currentSlideIndex: number;
    onSlideClick: (index: number) => void;
    onAddSlide: () => void;
    onContextMenu: (e: React.MouseEvent, index: number) => void;
    onSlideMouseDown: (e: React.MouseEvent, index: number) => void;
    onSlideMouseEnter: (index: number) => void;
    onSlideMouseLeave: () => void;
    onSlideMouseUp: (index: number) => void;
    isDragging: boolean;
    draggedIndex: number | null;
    dropTargetIndex: number | null;
}

export function SlideNavigator({
    slides, currentSlideIndex, onSlideClick, onAddSlide, onContextMenu,
    onSlideMouseDown, onSlideMouseEnter, onSlideMouseLeave, onSlideMouseUp,
    isDragging, draggedIndex, dropTargetIndex
}: SlideNavigatorProps) {
    return (
        <footer
            className="bg-gray-100 border-t border-gray-200 px-4 py-3 flex-shrink-0 z-10 overflow-x-auto"
            onMouseLeave={onSlideMouseLeave} // Xử lý khi rời khỏi container
        >
            <div className="flex items-center gap-3 w-max"> {/* w-max cho phép nội dung quyết định chiều rộng để cuộn */}
                {slides.map((slide, index) => (
                    <SlideThumbnail
                        key={slide.id}
                        slide={slide}
                        index={index}
                        isCurrent={index === currentSlideIndex}
                        isDragged={isDragging && draggedIndex === index}
                        isDropTarget={isDragging && dropTargetIndex === index && draggedIndex !== index}
                        onClick={onSlideClick}
                        onContextMenu={onContextMenu}
                        onMouseDown={onSlideMouseDown}
                        onMouseEnter={onSlideMouseEnter}
                        onMouseUp={onSlideMouseUp}
                    />
                ))}
                <Button
                    variant="outline"
                    className="w-24 h-[67.5px] flex-shrink-0 border-dashed text-gray-500 hover:text-blue-600 hover:border-blue-400 flex-col" // Điều chỉnh kích thước và flex direction
                    onClick={onAddSlide}
                >
                    <Plus size={18} />
                    <span className="text-xs mt-1">Add Slide</span>
                </Button>
            </div>
        </footer>
    );
}