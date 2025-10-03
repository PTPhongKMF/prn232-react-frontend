import type { SlideWithTeacher } from "src/types/slide/slide";
import { X, GraduationCap, User, Calendar, FileType, ShoppingCart } from "lucide-react";

interface SlideDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideWithTeacher | null;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const getFileType = (contentType: string | null) => {
    if (!contentType) return "File";
    if (contentType.includes("pdf")) return "PDF";
    if (contentType.includes("presentation")) return "PPTX";
    return "File";
};

export default function SlideDetailModal({ isOpen, onClose, slide }: SlideDetailModalProps) {
  if (!isOpen || !slide) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all">
            <div className="bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-blue-600">{slide.topic || "General"}</p>
                  <h3 className="mt-1 text-2xl font-bold leading-6 text-gray-900" id="modal-title">
                    {slide.title}
                  </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><span>By: {slide.teacher.name}</span></div>
                <div className="flex items-center gap-2"><GraduationCap size={16} className="text-gray-400" /><span>Grade: {slide.grade || "All Levels"}</span></div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /><span>Published: {formatDate(slide.createdAt)}</span></div>
                <div className="flex items-center gap-2"><FileType size={16} className="text-gray-400" /><span>File Type: {getFileType(slide.contentType)}</span></div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-800">Contents</h4>
                {slide.slidePages && slide.slidePages.length > 0 ? (
                    <ul className="mt-2 list-disc list-inside text-gray-600 text-sm">
                        {slide.slidePages.map(page => <li key={page.id}>{page.title || `Page ${page.orderNumber}`}</li>)}
                    </ul>
                ) : (
                    <p className="mt-2 text-sm text-gray-500">No page details available.</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">${slide.price.toFixed(2)}</span>
                </div>
              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-green-700 hover:bg-green-700 sm:mt-0 sm:w-auto"
              >
                <ShoppingCart size={16} />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}