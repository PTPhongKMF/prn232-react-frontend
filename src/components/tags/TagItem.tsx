import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "src/components/libs/shadcn/dialog";
import { Input } from "src/components/libs/shadcn/input";
import { type Tag } from "src/types/tag/tag";

interface TagItemProps {
  tag: Tag;
  onEdit: (id: number, newName: string) => void;
  onDelete: (tag: Tag) => void;
  isEditing?: boolean;
}

export default function TagItem({ tag, onEdit, onDelete, isEditing }: TagItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(tag.name);

  const handleEdit = () => {
    onEdit(tag.id, editedName);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-900">{tag.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditDialogOpen(true)}
            disabled={isEditing}
            className="p-1 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onDelete(tag)}
            disabled={isEditing}
            className="p-1 cursor-pointer text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-50">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder="Enter tag name" />
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsEditDialogOpen(false)}
              className="inline-flex cursor-pointer justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={!editedName.trim() || editedName === tag.name || isEditing}
              className="inline-flex cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
