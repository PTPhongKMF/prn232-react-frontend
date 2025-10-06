import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "src/components/libs/shadcn/dialog";
import { Input } from "src/components/libs/shadcn/input";

interface CreateTagDialogProps {
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateTagDialog({ onSubmit, isLoading }: CreateTagDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    await onSubmit(name);
    setName("");
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
      >
        <Plus className="size-4" />
        <span>Create Tag</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-50">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter tag name" autoFocus />
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex cursor-pointer justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
              className="inline-flex cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
