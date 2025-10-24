// src/components/create/ResizeHandles.tsx
import React from 'react';

interface ResizeHandlesProps {
    elementId: string;
    onResizeHandleMouseDown: (e: React.MouseEvent, elementId: string, handle: string) => void;
}

// 8 handle: nw, ne, sw, se, n, s, e, w
const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as const;

export function ResizeHandles({ elementId, onResizeHandleMouseDown }: ResizeHandlesProps) {
    return (
        <>
            {handles.map(handle => (
                <div
                    key={handle}
                    // Thêm data-handle để debug nếu cần
                    data-handle={handle}
                    className={`absolute w-2.5 h-2.5 bg-white border border-blue-600 rounded-sm cursor-${handle}-resize z-20`}
                    style={{
                        // Tính toán vị trí
                        left: handle.includes('w') ? '-5px' : handle.includes('e') ? 'calc(100% - 5px)' : 'calc(50% - 5px)',
                        top: handle.includes('n') ? '-5px' : handle.includes('s') ? 'calc(100% - 5px)' : 'calc(50% - 5px)',
                    }}
                    // Ngăn sự kiện click/drag của element chính
                    onMouseDown={(e) => onResizeHandleMouseDown(e, elementId, handle)}
                />
            ))}
        </>
    );
}