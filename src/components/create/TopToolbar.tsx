import { Save, Undo, Redo, FileDown, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from "src/components/libs/shadcn/button"; // Đảm bảo đường dẫn này chính xác
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/libs/shadcn/tooltip"; // Đảm bảo đường dẫn này chính xác

interface TopToolbarProps {
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExport: () => void;
  onSave: () => void;
  minZoom: number;
  maxZoom: number;
}

export function TopToolbar({
  canUndo, onUndo, canRedo, onRedo, zoomLevel, onZoomIn, onZoomOut, onZoomReset, onExport, onSave, minZoom, maxZoom
}: TopToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 z-20 flex-shrink-0 h-14">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-800">Slide Editor</h1>
          <div className="flex items-center gap-1 border-l pl-3 ml-2">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} aria-label="Undo"><Undo size={18} /></Button></TooltipTrigger><TooltipContent>Undo (Ctrl+Z)</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} aria-label="Redo"><Redo size={18} /></Button></TooltipTrigger><TooltipContent>Redo (Ctrl+Y / Ctrl+Shift+Z)</TooltipContent></Tooltip>
          </div>
          <div className="flex items-center gap-1 border-l pl-3 ml-2">
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomOut} disabled={zoomLevel <= minZoom} aria-label="Zoom Out"><ZoomOut size={18} /></Button></TooltipTrigger><TooltipContent>Zoom Out (Ctrl+-)</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" className="w-16 text-sm" onClick={onZoomReset} disabled={zoomLevel === 1}>{(zoomLevel * 100).toFixed(0)}%</Button></TooltipTrigger><TooltipContent>Reset Zoom (Ctrl+0)</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onZoomIn} disabled={zoomLevel >= maxZoom} aria-label="Zoom In"><ZoomIn size={18} /></Button></TooltipTrigger><TooltipContent>Zoom In (Ctrl++)</TooltipContent></Tooltip>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm" onClick={onExport}><FileDown size={16} className="mr-1.5"/> Export PPTX</Button></TooltipTrigger><TooltipContent>Download as .pptx</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button size="sm" onClick={onSave}><Save size={16} className="mr-1.5"/> Save</Button></TooltipTrigger><TooltipContent>Save to Cloud (Ctrl+S)</TooltipContent></Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}