import { useState } from "react";
import { useCreateSlideMutation } from "src/hooks/useSlides";
import { Input } from "src/components/libs/shadcn/input";
import { Loader2Icon, UploadCloud, FileText, Tag, DollarSign, GraduationCap, File, X, CircleCheck, CircleAlert } from "lucide-react";
import type { SlideCreateData } from "src/types/slide/slide";
import { cn } from "src/utils/cn";

export default function Upload() {
  const [slideData, setSlideData] = useState<Omit<SlideCreateData, "slidePages">>({
    title: "",
    topic: "",
    price: 0,
    grade: undefined,
    isPublished: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createSlideMutation = useCreateSlideMutation();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    // The backend expects slidePages, so we send an empty array for now.
    const fullSlideData = { ...slideData, slidePages: [] };
    createSlideMutation.mutate({ slideDto: fullSlideData, file });
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-amber-50 bg-cover px-4 py-24">
      <div className="w-full max-w-2xl rounded-xl bg-white/80 shadow-lg backdrop-blur-sm">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800">Upload a New Slide</h2>
          <p className="mt-1 text-gray-500">Fill in the details and upload your slide presentation file.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 px-8 md:grid-cols-2">
            {/* Form Fields */}
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="e.g., Introduction to Algebra"
                  value={slideData.title}
                  onChange={(e) => setSlideData({ ...slideData, title: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Topic</label>
              <div className="relative mt-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="e.g., Mathematics"
                  value={slideData.topic || ""}
                  onChange={(e) => setSlideData({ ...slideData, topic: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Price</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={slideData.price}
                  onChange={(e) => setSlideData({ ...slideData, price: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <div className="relative mt-1">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="number"
                  placeholder="e.g., 7"
                  value={slideData.grade || ""}
                  min="1"
                  max="12"
                  onChange={(e) => setSlideData({ ...slideData, grade: e.target.value ? Number(e.target.value) : undefined })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="px-8 mt-8">
            <label className="text-sm font-medium text-gray-700">Presentation File</label>
            <div
              onDragOver={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              onDrop={handleDrop}
              className={cn(
                "mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors",
                { "border-blue-500 bg-blue-50": isDragging }
              )}
            >
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PPTX, PDF, etc. up to 50MB</p>
              </div>
            </div>
          </div>
          
          {file && (
            <div className="mt-4 px-8">
              <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <File className="h-6 w-6 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">{file.name}</span>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-600">
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Published Checkbox */}
          <div className="flex items-center gap-2 mt-6 px-8">
              <input
                id="isPublished"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                checked={slideData.isPublished}
                onChange={(e) => setSlideData({ ...slideData, isPublished: e.target.checked })}
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Make this slide public</label>
          </div>
          
          {/* Form Footer */}
          <div className="mt-8 flex items-center justify-between rounded-b-xl bg-gray-50 px-8 py-4">
             {/* Feedback Messages */}
            <div className="text-sm font-semibold">
              {createSlideMutation.isError && (
                <div className="flex items-center gap-2 text-red-600">
                  <CircleAlert size={18} />
                  <span>{createSlideMutation.error.message || "Upload failed"}</span>
                </div>
              )}
              {createSlideMutation.isSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CircleCheck size={18} />
                  <span>Slide uploaded successfully!</span>
                </div>
              )}
            </div>
            <button
              disabled={createSlideMutation.isPending || !file || !slideData.title}
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {createSlideMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                "Upload Slide"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}