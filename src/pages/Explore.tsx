import { useState, useMemo } from "react";
import { usePublicSlides, useUpdateSlideMutation } from "src/hooks/useSlides";
import { Loader2, GraduationCap, User, FileWarning, Search, ShoppingCart, X, Edit, Save, Info } from "lucide-react";
import { Input } from "src/components/libs/shadcn/input";
import type { SlideWithTeacher, SlideUpdateData } from "src/types/slide/slide";
import { useProfile } from "src/hooks/useAuth";
import { cn } from "src/utils/cn";

export default function Explore() {
  const { data: slides, isLoading, isError, error } = usePublicSlides();
  const { data: currentUser } = useProfile();
  const updateSlideMutation = useUpdateSlideMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedSlideId, setExpandedSlideId] = useState<number | null>(null);
  
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<SlideUpdateData>>({});
  const [editFile, setEditFile] = useState<File | null>(null);

  const handleEditClick = (slide: SlideWithTeacher) => {
    setEditingSlideId(slide.id);
    setExpandedSlideId(slide.id); // Keep it expanded while editing
    setEditFormData({
      id: slide.id,
      title: slide.title,
      topic: slide.topic || "",
      price: slide.price,
      grade: slide.grade || undefined,
      isPublished: slide.isPublished,
      slidePages: slide.slidePages || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingSlideId(null);
    setEditFormData({});
    setEditFile(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'grade') ? Number(value) : value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlideId) return;
    updateSlideMutation.mutate({ slideDto: editFormData as SlideUpdateData, file: editFile }, { 
      onSuccess: () => {
        setEditingSlideId(null);
        setEditFile(null);
      }
    });
  };

  const toggleDetails = (slideId: number) => {
    setExpandedSlideId(prevId => (prevId === slideId ? null : slideId));
    setEditingSlideId(null); // Close edit mode if user toggles details
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
              <div key={slide.id} className={cn("flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-shadow", { "ring-2 ring-blue-500": expandedSlideId === slide.id })}>
                <div className="flex-grow p-6">
                  <p className="text-sm font-medium text-blue-600">{slide.topic || "General"}</p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-800 h-14">{slide.title}</h3>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><User size={16} className="text-gray-400" /><span>By: {slide.teacher.name}</span></div>
                    <div className="flex items-center gap-2"><GraduationCap size={16} className="text-gray-400" /><span>Grade: {slide.grade || "All Levels"}</span></div>
                  </div>
                </div>

                {expandedSlideId === slide.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {editingSlideId === slide.id ? (
                      <form onSubmit={handleSave} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Title</label>
                          <Input name="title" value={editFormData.title} onChange={handleFormChange} />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Topic</label>
                          <Input name="topic" value={editFormData.topic || ""} onChange={handleFormChange} />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                           <button type="button" onClick={handleCancelEdit} className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"><X size={16} /> Cancel</button>
                           <button type="submit" disabled={updateSlideMutation.isPending} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">{updateSlideMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save</button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <h4 className="font-semibold text-gray-800">Contents</h4>
                        {slide.slidePages && slide.slidePages.length > 0 ? (
                          <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-600">
                            {slide.slidePages.map(page => <li key={page.id} className="truncate">{page.title || `Page ${page.orderNumber}`}</li>)}
                          </ul>
                        ) : <p className="mt-2 text-sm text-gray-500">No page details available.</p>}
                        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"><ShoppingCart size={16} />Buy Now</button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
                  <span className="text-xl font-bold text-gray-800">${slide.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => toggleDetails(slide.id)} className="inline-flex items-center gap-2 justify-center rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                      {expandedSlideId === slide.id ? <X size={16} /> : <Info size={16} />}
                      <span>{expandedSlideId === slide.id ? "Hide" : "Details"}</span>
                    </button>
                    {currentUser?.id === slide.teacherId && expandedSlideId === slide.id && editingSlideId !== slide.id && (
                      <button onClick={() => handleEditClick(slide)} className="rounded-md bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"><Edit size={20} /></button>
                    )}
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