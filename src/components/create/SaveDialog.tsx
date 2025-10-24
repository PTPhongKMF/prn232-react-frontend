import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "src/components/libs/shadcn/dialog";
import { Input } from "src/components/libs/shadcn/input";
import { Button } from "src/components/libs/shadcn/button";
import { Label } from "src/components/libs/shadcn/label"; // Giả sử bạn đã tạo tệp này
import type { SaveOptions } from 'src/types/create';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  saveOptions: SaveOptions;
  onSaveOptionsChange: (newOptions: SaveOptions) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function SaveDialog({ isOpen, onClose, saveOptions, onSaveOptionsChange, onSave, isSaving }: SaveDialogProps) {

  const handleChange = (field: keyof SaveOptions, value: string | number | undefined) => {
    onSaveOptionsChange({ ...saveOptions, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Presentation</DialogTitle>
          {/* SỬA: Component này giờ đã được import */}
          <DialogDescription>
            Enter details for your presentation. It will be saved as a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-sm">Title *</Label>
            <Input
                id="title"
                value={saveOptions.title}
                onChange={e => handleChange('title', e.target.value)}
                className="col-span-3 h-9"
                placeholder="Presentation Title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right text-sm">Topic *</Label>
            <Input
                id="topic"
                value={saveOptions.topic}
                onChange={e => handleChange('topic', e.target.value)}
                className="col-span-3 h-9"
                placeholder="e.g., Algebra Basics"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right text-sm">Price ($)</Label>
            <Input
                id="price"
                type="number"
                value={saveOptions.price}
                onChange={e => handleChange('price', Number(e.target.value) || 0)}
                className="col-span-3 h-9"
                min="0"
                step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right text-sm">Grade</Label>
            <Input
                id="grade"
                type="number"
                value={saveOptions.grade ?? ''}
                onChange={e => handleChange('grade', e.target.value ? Number(e.target.value) : undefined)}
                className="col-span-3 h-9"
                min="1" max="12" placeholder="1-12 (Optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={isSaving || !saveOptions.title || !saveOptions.topic}
          >
            {isSaving ? 'Saving...' : 'Save Presentation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}