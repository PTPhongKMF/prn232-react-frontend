import { useState, useMemo, Fragment } from "react";
import { usePublicSlides } from "src/hooks/useSlides";
import {
  Loader2,
  GraduationCap,
  User,
  FileWarning,
  Search,
  ShoppingCart,
  Check,
  Calendar,
  X,
  BookOpen,
  Info,
  Library,
  FileType, // <-- Import FileType icon
} from "lucide-react";
import { Input } from "../components/libs/shadcn/input";
import { cn } from "../utils/cn";
import { useCart } from "../stores/cartStore";
import type { SlideWithTeacher } from "../types/slide/slide";
import { useProfile } from "../hooks/useAuth";
import { Dialog, Transition } from '@headlessui/react'
import { usePurchaseHistory } from "src/hooks/usePayment";

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

// Helper function to get file type
const getFileType = (contentType: string | null) => {
    if (!contentType) return "File";
    if (contentType.includes("pdf")) return "PDF";
    if (contentType.includes("presentation")) return "PPTX";
    return "File";
};


const SlideDetailModal = ({ slide, isOpen, onClose }: { slide: SlideWithTeacher | null, isOpen: boolean, onClose: () => void }) => {
  if (!slide) return null;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900"
                >
                  {slide.title}
                </Dialog.Title>
                
                {/* ===== MODIFIED SECTION START ===== */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5"><User size={14} /> By {slide.teacher.name}</div>
                    <div className="flex items-center gap-1.5"><GraduationCap size={14} /> Grade {slide.grade || 'All'}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(slide.createdAt)}</div>
                    <div className="flex items-center gap-1.5"><FileType size={14} /> {getFileType(slide.contentType)}</div>
                </div>
                {/* ===== MODIFIED SECTION END ===== */}


                <div className="mt-6">
                    <h4 className="font-semibold text-gray-800">Slide Content</h4>
                     <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border bg-gray-50 p-4">
                        {slide.slidePages && slide.slidePages.length > 0 ? (
                        <ul className="space-y-2">
                            {slide.slidePages.map(page => (
                            <li key={page.id} className="flex items-center gap-3 text-sm text-gray-700">
                                <BookOpen size={16} className="text-blue-500 flex-shrink-0" />
                                <span>{page.title || `Page ${page.orderNumber}`}</span>
                            </li>
                            ))}
                        </ul>
                        ) : <p className="text-sm text-gray-500 italic">No detailed content list available.</p>}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">${slide.price.toFixed(2)}</span>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-3 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>

                 <button
                    type="button"
                    className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}


const SlideCard = ({ slide, currentUser, onAddToCart, onViewDetails, isPurchased }: { slide: SlideWithTeacher, currentUser: any, onAddToCart: (slide: SlideWithTeacher) => void, onViewDetails: (slide: SlideWithTeacher) => void, isPurchased: boolean }) => {
  // ... (no changes in this component)
  const { items: cartItems } = useCart();
  const isInCart = cartItems.some(item => item.id === slide.id);
  const canPurchase = currentUser?.role === 'Student' && currentUser?.id !== slide.teacher.id;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
         <h3 className="text-center text-xl font-bold tracking-tight">{slide.title}</h3>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-600">{slide.topic || "General"}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-1.5" title={`Author: ${slide.teacher.name}`}>
              <User size={14} />
              <span>{slide.teacher.name}</span>
            </div>
            <div className="flex items-center gap-1.5" title={`Grade: ${slide.grade || "All"}`}>
              <GraduationCap size={14} />
              <span>Grade {slide.grade || "All"}</span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <p className="text-2xl font-bold text-gray-900">${slide.price.toFixed(2)}</p>
          <div className="flex items-center gap-2">
            <button
                onClick={() => onViewDetails(slide)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 transition-colors hover:bg-gray-50 active:scale-95"
                aria-label="View details"
            >
                <Info size={20} />
            </button>
            {canPurchase && (
              <button
                onClick={() => onAddToCart(slide)}
                disabled={isInCart || isPurchased}
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-offset-2 ring-offset-white transition-all active:scale-95",
                  {
                    "cursor-not-allowed bg-green-500 ring-green-500": isInCart,
                    "bg-blue-600 ring-blue-600 hover:bg-blue-700": !isInCart && !isPurchased,
                    "cursor-not-allowed bg-gray-400 ring-gray-400": isPurchased,
                  }
                )}
                aria-label={isInCart ? "Added to cart" : isPurchased ? "In Library" : "Add to cart"}
              >
                {isInCart ? <Check size={20} /> : isPurchased ? <Library size={20}/> : <ShoppingCart size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
       <div className="border-t border-gray-100 p-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>Uploaded on {formatDate(slide.createdAt)}</span>
          </div>
        </div>
    </div>
  );
};

export default function Explore() {
  // ... (no changes in this component)
  const { data: slides, isLoading: isLoadingSlides, isError, error } = usePublicSlides();
  const { data: currentUser } = useProfile();
  const { data: purchaseHistory, isLoading: isLoadingHistory } = usePurchaseHistory();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedSlide, setSelectedSlide] = useState<SlideWithTeacher | null>(null);

  const purchasedSlideIds = useMemo(() => {
    if (!purchaseHistory) return new Set<number>();
    return new Set(purchaseHistory.flatMap(receipt => receipt.purchasedItems.map(item => item.slideId)));
  }, [purchaseHistory]);

  const filteredAndSortedSlides = useMemo(() => {
    if (!slides) return [];
    return slides
      .filter(slide =>
        slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (slide.topic && slide.topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
        slide.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortOrder) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'newest':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [slides, searchTerm, sortOrder]);

  const handleAddToCart = (slide: SlideWithTeacher) => {
    addToCart(slide);
  };

  const handleViewDetails = (slide: SlideWithTeacher) => {
      setSelectedSlide(slide);
  }

  const handleCloseModal = () => {
      setSelectedSlide(null);
  }
  
  const isLoading = isLoadingSlides || isLoadingHistory;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 pt-16 text-center">
        <FileWarning className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load Slides</h2>
        <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Explore Marketplace</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Browse our library of high-quality slides from talented teachers.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10 flex flex-col items-center justify-between gap-6 rounded-xl bg-white/60 p-4 shadow-sm backdrop-blur-sm sm:flex-row">
          <div className="relative w-full sm:w-auto sm:flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by title, topic, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-gray-300 pl-11 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-11 w-full rounded-lg border-gray-300 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
          >
            <option value="newest">Sort by Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Slides Grid */}
        {filteredAndSortedSlides.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSlides.map((slide) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                isPurchased={purchasedSlideIds.has(slide.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-24 text-center">
            <Search className="h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">No Slides Found</h2>
            <p className="mt-2 text-gray-500">Your search did not match any slides. Try a different term!</p>
          </div>
        )}
      </div>
      <SlideDetailModal isOpen={!!selectedSlide} onClose={handleCloseModal} slide={selectedSlide}/>
    </div>
  );
}