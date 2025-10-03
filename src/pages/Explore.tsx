import { useState, useMemo } from "react";
import { usePublicSlides } from "src/hooks/useSlides";
import { Loader2, GraduationCap, User, FileWarning, Search, ShoppingCart, Info, Calendar, FileType, X } from "lucide-react";
import { Input } from "src/components/libs/shadcn/input";
import { cn } from "src/utils/cn";

export default function Explore() {
  const { data: slides, isLoading, isError, error } = usePublicSlides();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedSlideId, setExpandedSlideId] = useState<number | null>(null);

  const toggleDetails = (slideId: number) => {
    setExpandedSlideId(prevId => (prevId === slideId ? null : slideId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getFileType = (contentType: string | null) => {
    if (!contentType) return "File";
    if (contentType.includes("pdf")) return "PDF";
    if (contentType.includes("presentation")) return "PPTX";
    return "File";
  };

  const filteredAndSortedSlides = useMemo(() => {
    if (!slides) return [];
    return slides
      .filter(slide => slide.title.toLowerCase().includes(searchTerm.toLowerCase()) || slide.topic?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        switch (sortOrder) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'newest': default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [slides, searchTerm, sortOrder]);

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
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="pb-8 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">Explore All Slides</h1>
          <p className="mt-2 max-w-4xl mx-auto text-lg text-gray-500">Browse our library of slides from talented teachers.</p>
        </div>
        
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input type="text" placeholder="Search by title or topic..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm">
              <option value="newest">Sort by: Newest</option>
              <option value="price-asc">Sort by: Price (Low to High)</option>
              <option value="price-desc">Sort by: Price (High to Low)</option>
            </select>
        </div>

        {filteredAndSortedSlides.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedSlides.map((slide) => (
              <div key={slide.id} className={cn("flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow")}>
                <div className="flex-grow p-6">
                  <p className="text-sm font-medium text-blue-600">{slide.topic || "General"}</p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-800">{slide.title}</h3>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><span>By: {slide.teacher.name}</span></div>
                    <div className="flex items-center gap-2"><GraduationCap size={16} className="text-gray-400" /><span>Grade: {slide.grade || "All Levels"}</span></div>
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /><span>{formatDate(slide.createdAt)}</span></div>
                    <div className="flex items-center gap-2"><FileType size={16} className="text-gray-400" /><span>{getFileType(slide.contentType)}</span></div>
                  </div>
                </div>

                {expandedSlideId === slide.id && (
                  <div className="border-t border-gray-200 bg-white p-6">
                    <h4 className="font-semibold text-gray-800">Contents</h4>
                    {slide.slidePages && slide.slidePages.length > 0 ? (
                      <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600">
                        {slide.slidePages.map(page => <li key={page.id} className="truncate">{page.title || `Page ${page.orderNumber}`}</li>)}
                      </ul>
                    ) : <p className="mt-2 text-sm text-gray-500">No page details available.</p>}
                  </div>
                )}
                
                <div className="flex items-center justify-between bg-gray-50 border-t px-6 py-4">
                  <span className="text-xl font-bold text-gray-800">${slide.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleDetails(slide.id)} className="inline-flex items-center gap-1.5 justify-center rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 transition-colors hover:bg-gray-100">
                      {expandedSlideId === slide.id ? <X size={16} /> : <Info size={16} />}
                      <span>{expandedSlideId === slide.id ? "Hide" : "Details"}</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 justify-center rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <FileWarning className="h-20 w-20 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">No Slides Found</h2>
            <p className="mt-2 text-gray-500">Your search did not match any slides. Try a different term!</p>
          </div>
        )}
      </div>
    </div>
  );
}