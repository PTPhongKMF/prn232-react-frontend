import { useState, Fragment } from "react";
import { X, ChevronLeft, ChevronRight, FileImage, Download, FileSpreadsheet } from "lucide-react";
import { cn } from "src/utils/cn";
import type { SlideWithTeacher } from "src/types/slide/slide";
import { Dialog, Transition } from '@headlessui/react';
import { backendUrl } from "src/services/ApiService";

interface SlideDetailPopupProps {
  slide: SlideWithTeacher | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideDetailPopup({ slide, isOpen, onClose }: SlideDetailPopupProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  if (!isOpen || !slide) return null;

  const isPdf = slide.contentType?.includes("pdf");
  const isPptx = slide.contentType?.includes("presentation");
  const fileUrl = slide.fileUrl ? `${backendUrl.slice(0, -1)}${slide.fileUrl}` : null;


  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (slide.slidePages && currentPageIndex < slide.slidePages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const currentPage = slide.slidePages ? slide.slidePages[currentPageIndex] : null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900"
                >
                  {slide.title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    by {slide.teacher?.name || 'Unknown Author'}
                  </p>
                </div>

                <div className="mt-4">
                    <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center">
                         {isPptx && fileUrl ? (
                            <div className="flex flex-col items-center justify-center text-center p-8">
                                <FileSpreadsheet size={64} className="text-gray-400" />
                                <p className="mt-4 text-lg font-semibold text-gray-700">PowerPoint Presentation</p>
                                <p className="mt-1 text-sm text-gray-500">Live preview is not available for this file type.</p>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                >
                                    <Download size={16} />
                                    Download PPTX
                                </a>
                            </div>
                         ) : isPdf && fileUrl ? (
                           <iframe src={fileUrl} className="w-full h-full" title={slide.title} />
                         ) : currentPage?.imageUrl ? (
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
                    {!isPdf && !isPptx && (
                      <div className="flex items-center justify-between mt-4">
                          <button onClick={handlePrevPage} disabled={currentPageIndex === 0} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                              <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-sm text-gray-500">{slide.slidePages.length > 0 ? `${currentPageIndex + 1} / ${slide.slidePages.length}`: '0 / 0'}</span>
                          <button onClick={handleNextPage} disabled={currentPageIndex >= slide.slidePages.length - 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                              <ChevronRight className="w-5 h-5" />
                          </button>
                      </div>
                    )}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}