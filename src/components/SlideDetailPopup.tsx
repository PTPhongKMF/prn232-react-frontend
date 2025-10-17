import { useState } from "react";
import { X, ChevronLeft, ChevronRight, FileImage } from "lucide-react";
import { cn } from "src/utils/cn";
import type { SlideWithTeacher } from "src/types/slide/slide";

interface SlideDetailPopupProps {
    slide: SlideWithTeacher | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function SlideDetailPopup({ slide, isOpen, onClose }: SlideDetailPopupProps) {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    if (!isOpen || !slide) return null;

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < slide.slidePages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };

    const currentPage = slide.slidePages[currentPageIndex];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{slide.title}</h2>
                        <p className="text-sm text-gray-500">by {slide.teacher.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
                    {/* Main Slide Display */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
                        <div className="relative w-full max-w-4xl">
                            {/* Slide Content */}
                            <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
                                {currentPage?.imageUrl ? (
                                    <img
                                        src={currentPage.imageUrl}
                                        alt={`Slide ${currentPageIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FileImage size={64} />
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-6">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPageIndex === 0}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                                        currentPageIndex === 0
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    )}
                                >
                                    <ChevronLeft size={20} />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {currentPageIndex + 1} of {slide.slidePages.length}
                                    </span>
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPageIndex === slide.slidePages.length - 1}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                                        currentPageIndex === slide.slidePages.length - 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                    )}
                                >
                                    Next
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6">
                        {/* Slide Info */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Slide Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Topic:</span>
                                    <span className="font-medium">{slide.topic || "General"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grade:</span>
                                    <span className="font-medium">{slide.grade || "All Levels"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Pages:</span>
                                    <span className="font-medium">{slide.slidePages.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price:</span>
                                    <span className="font-bold text-lg text-blue-600">${slide.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <p className="text-sm text-blue-700 font-medium">
                                To purchase this slide, please visit the Explore page
                            </p>
                        </div>

                        {/* Thumbnail Navigation */}
                        {slide.slidePages.length > 1 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">All Pages</h4>
                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                    {slide.slidePages.map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPageIndex(index)}
                                            className={cn(
                                                "aspect-video rounded border-2 transition-all",
                                                currentPageIndex === index
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            {page.imageUrl ? (
                                                <img
                                                    src={page.imageUrl}
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FileImage size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}