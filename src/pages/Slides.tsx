import { useState } from "react";
import { useParams } from "react-router";
import { useSlidesByTeacherId, useUpdateSlideStatusMutation, useUpdateSlideMutation, usePublicSlides } from "src/hooks/useSlides";
import { Loader2, DollarSign, GraduationCap, Calendar, FileWarning, FileType, Edit, X, Save, FileText, Tag, UploadCloud, Eye, User } from "lucide-react";
import { cn } from "src/utils/cn";
import { useProfile } from "src/hooks/useAuth";
import type { Slide, SlideUpdateData, SlideWithTeacher } from "src/types/slide/slide";
import { Input } from "src/components/libs/shadcn/input";
import SlideDetailPopup from "src/components/SlideDetailPopup";

export default function Slides() {
    console.log("噫 Slides component is rendering!");

    const { userId } = useParams();
    const { data: currentUser } = useProfile();

    // Debug logging
    console.log("Slides component - userId from params:", userId);
    console.log("Slides component - current user role:", currentUser?.role);

    const teacherId = userId ? Number(userId) : undefined;
    console.log("Slides component - teacherId:", teacherId);

    // Use different hooks based on whether userId is provided
    const {
        data: teacherSlides,
        isLoading: isLoadingTeacherSlides,
        isError: isErrorTeacherSlides,
        error: errorTeacherSlides
    } = useSlidesByTeacherId(teacherId);

    const {
        data: publicSlides,
        isLoading: isLoadingPublicSlides,
        isError: isErrorPublicSlides,
        error: errorPublicSlides
    } = usePublicSlides();

    // Determine which data to use
    const isViewingSpecificUser = !!userId;
    const slides = isViewingSpecificUser ? teacherSlides : publicSlides;
    const isLoading = isViewingSpecificUser ? isLoadingTeacherSlides : isLoadingPublicSlides;
    const isError = isViewingSpecificUser ? isErrorTeacherSlides : isErrorPublicSlides;
    const error = isViewingSpecificUser ? errorTeacherSlides : errorPublicSlides;

    console.log("Slides component - isViewingSpecificUser:", isViewingSpecificUser);
    console.log("Slides component - slides data:", slides);

    const updateSlideStatusMutation = useUpdateSlideStatusMutation();
    const updateSlideMutation = useUpdateSlideMutation();

    const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<SlideUpdateData>>({});
    const [editFile, setEditFile] = useState<File | null>(null);

    // Popup states
    const [selectedSlide, setSelectedSlide] = useState<SlideWithTeacher | null>(null);
    const [showSlideDetail, setShowSlideDetail] = useState(false);

    const handleEditClick = (slide: Slide) => {
        setEditingSlideId(slide.id);
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
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'grade') ? Number(value) : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setEditFile(e.target.files[0]);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlideId) return;

        updateSlideMutation.mutate(
            { slideDto: editFormData as SlideUpdateData, file: editFile },
            {
                onSuccess: () => {
                    handleCancelEdit();
                },
            }
        );
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

    const handleStatusChange = (slide: Slide) => {
        if (currentUser?.id !== slide.teacherId) return;
        updateSlideStatusMutation.mutate({ slideId: slide.id, isPublished: !slide.isPublished });
    };

    const handleViewSlide = (slide: Slide | SlideWithTeacher) => {
        // Convert Slide to SlideWithTeacher if needed
        const slideWithTeacher = 'teacher' in slide
            ? slide as SlideWithTeacher
            : { ...slide, teacher: { id: slide.teacherId, name: 'Unknown Teacher', email: "", role: "" } } as SlideWithTeacher;

        setSelectedSlide(slideWithTeacher);
        setShowSlideDetail(true);
    };

    const closePopups = () => {
        setShowSlideDetail(false);
        setSelectedSlide(null);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (isError) {
        console.error("Slides component - Error loading slides:", error);
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 pt-16 text-center">
                <FileWarning className="h-16 w-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load Slides</h2>
                <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
                <div className="mt-4 text-sm text-gray-600">
                    <p>Teacher ID: {teacherId}</p>
                    <p>User ID from params: {userId}</p>
                </div>
            </div>
        );
    }

    // Debug info
    console.log("Slides component - Current state:", { slides, isLoading, isError, error, teacherId, userId });

    return (
        <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                        {isViewingSpecificUser
                            ? `Slides by User ${teacherId}`
                            : currentUser?.role === 'Student'
                                ? "All Public Slides"
                                : "My Uploaded Slides"
                        }
                    </h1>
                    <p className="mt-2 max-w-4xl text-sm text-gray-500">
                        {isViewingSpecificUser
                            ? `A collection of all slides uploaded by user ${teacherId}.`
                            : currentUser?.role === 'Student'
                                ? "Browse and explore all available public slides from our community."
                                : "A collection of all the slides you have uploaded."
                        }
                    </p>
                    {/* Debug info */}
                    <div className="mt-2 text-xs text-gray-400">
                        <p>Debug: Teacher ID: {teacherId}, User ID: {userId}, Role: {currentUser?.role}, Slides count: {slides?.length || 0}</p>
                        <p>API: {isViewingSpecificUser ? `api/Slides/user/${teacherId}` : 'api/Slides/public'}</p>
                    </div>
                </div>

                {slides && slides.length > 0 ? (
                    <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {slides.map((slide) => (
                            <div key={slide.id} className={cn("flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-all", { "ring-2 ring-blue-500": editingSlideId === slide.id })}>
                                {editingSlideId === slide.id ? (
                                    // EDIT VIEW
                                    <form onSubmit={handleSave} className="flex h-full flex-col">
                                        <div className="flex-grow space-y-4 p-6">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Title</label>
                                                <div className="relative mt-1">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                    <Input name="title" value={editFormData.title} onChange={handleFormChange} className="pl-10" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Topic</label>
                                                <div className="relative mt-1">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                    <Input name="topic" value={editFormData.topic || ""} onChange={handleFormChange} className="pl-10" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Price</label>
                                                    <div className="relative mt-1">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                        <Input name="price" type="number" value={editFormData.price} onChange={handleFormChange} className="pl-10" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Grade</label>
                                                    <div className="relative mt-1">
                                                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                        <Input name="grade" type="number" value={editFormData.grade || ""} onChange={handleFormChange} className="pl-10" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">Replace File</label>
                                                <label htmlFor={`file-edit-${slide.id}`} className="mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                                                    <UploadCloud size={20} className="text-gray-400" />
                                                    <span className="truncate">{editFile ? editFile.name : "Choose new file (optional)"}</span>
                                                </label>
                                                <input id={`file-edit-${slide.id}`} type="file" className="sr-only" onChange={handleFileChange} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 bg-gray-50 px-4 py-3">
                                            <button type="button" onClick={handleCancelEdit} className="inline-flex items-center gap-2 justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                                <X size={16} /> Cancel
                                            </button>
                                            <button type="submit" disabled={updateSlideMutation.isPending} className="inline-flex items-center gap-2 justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-300">
                                                {updateSlideMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    // DISPLAY VIEW
                                    <>
                                        <div className="flex-grow p-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-blue-600">{slide.topic || "General"}</p>
                                                {currentUser?.id === slide.teacherId && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">{slide.isPublished ? "Public" : "Private"}</span>
                                                        <button onClick={() => handleStatusChange(slide as Slide)} disabled={updateSlideStatusMutation.isPending && updateSlideStatusMutation.variables?.slideId === slide.id} className={cn("relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", { "bg-blue-600": slide.isPublished, "bg-gray-200": !slide.isPublished })}>
                                                            <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", { "translate-x-5": slide.isPublished, "translate-x-0": !slide.isPublished })} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="mt-2 text-xl font-semibold text-gray-800">{slide.title}</h3>
                                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-2"><FileType size={16} className="text-gray-400" /><span>Type: {getFileType(slide.contentType)}</span></div>
                                                <div className="flex items-center gap-2"><GraduationCap size={16} className="text-gray-400" /><span>Grade: {slide.grade || "All Levels"}</span></div>
                                                <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /><span>Uploaded: {formatDate(slide.createdAt)}</span></div>
                                                <div className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400" /><span>Price: ${slide.price.toFixed(2)}</span></div>
                                                {/* Show teacher info for public slides */}
                                                {!isViewingSpecificUser && 'teacher' in slide && (
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        <span>By: {(slide as SlideWithTeacher).teacher.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gray-50 px-6 py-4">
                                            <button
                                                onClick={() => handleViewSlide(slide)}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                            >
                                                <Eye size={16} />
                                                View Slide
                                            </button>
                                            {currentUser?.id === slide.teacherId && (
                                                <button
                                                    onClick={() => handleEditClick(slide as Slide)}
                                                    className="rounded-md bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 flex flex-col items-center justify-center text-center">
                        <FileWarning className="h-20 w-20 text-gray-400" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">No Slides Found</h2>
                        <p className="mt-2 text-gray-500">
                            {isViewingSpecificUser
                                ? `User ${teacherId} hasn't uploaded any slides yet.`
                                : currentUser?.role === 'Student'
                                    ? "No public slides are available at the moment."
                                    : "You haven't uploaded any slides yet. Go ahead and upload your first one!"
                            }
                        </p>
                        <div className="mt-4 text-sm text-gray-400">
                            <p>Debug: Teacher ID: {teacherId}, User ID: {userId}</p>
                            <p>Slides data: {slides ? JSON.stringify(slides) : 'null'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Popup Components */}
            <SlideDetailPopup
                slide={selectedSlide}
                isOpen={showSlideDetail}
                onClose={closePopups}
            />
        </div>
    );
}