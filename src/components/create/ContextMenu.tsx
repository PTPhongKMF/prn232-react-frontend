import { Copy, Clipboard, Trash2, Plus } from 'lucide-react';
import { Button } from "src/components/libs/shadcn/button"; // Đảm bảo đường dẫn này chính xác

interface ContextMenuProps {
    x: number; y: number; slideIndex: number;
    canPaste: boolean; canDelete: boolean;
    onCopy: () => void; onPaste: () => void;
    onDuplicate: () => void; onDelete: () => void;
    onAddSlide: () => void; onClose: () => void;
}

export function ContextMenu({
    x, y, slideIndex, canPaste, canDelete,
    onCopy, onPaste, onDuplicate, onDelete, onAddSlide,
    onClose // Prop này được truyền từ Create.tsx, nhưng logic đóng được xử lý ở Create.tsx
}: ContextMenuProps) {

    return (
        <div
            className="context-menu fixed z-50 bg-white rounded shadow-lg border border-gray-200 py-1 w-40 text-sm animate-in fade-in zoom-in-95"
            style={{ left: x, top: y }}
            onContextMenu={(e) => e.preventDefault()}
            onClick={onClose} // Đóng menu khi click vào bất kỳ mục nào
        >
            <div className="px-2 py-1 text-xs text-gray-500 border-b mb-1">Slide {slideIndex + 1}</div>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onCopy}> <Copy size={14} className="mr-2"/> Copy <span className="ml-auto text-gray-400 text-xs">Ctrl+C</span> </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onPaste} disabled={!canPaste}> <Clipboard size={14} className="mr-2"/> Paste <span className="ml-auto text-gray-400 text-xs">Ctrl+V</span> </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onDuplicate}> <Copy size={14} className="mr-2"/> Duplicate <span className="ml-auto text-gray-400 text-xs">Ctrl+D</span> </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:bg-transparent" onClick={onDelete} disabled={!canDelete}> <Trash2 size={14} className="mr-2"/> Delete <span className="ml-auto text-gray-400 text-xs">Del</span> </Button>
            <div className="border-t my-1 mx-2"></div>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm" onClick={onAddSlide}> <Plus size={14} className="mr-2"/> Add Slide </Button>
        </div>
    );
}