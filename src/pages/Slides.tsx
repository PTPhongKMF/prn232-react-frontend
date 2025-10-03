import { useParams } from "react-router";
import { useSlidesByTeacherId } from "src/hooks/useSlides";
import { Loader2 } from "lucide-react";
import { backendUrl } from "src/services/ApiService";

export default function Slides() {
  const { userId } = useParams();
  const { data: slides, isLoading, isError, error } = useSlidesByTeacherId(Number(userId));

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 pt-16">
        <p className="text-red-500">Error: {error?.message || "Failed to load slides."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-amber-50 px-4 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Uploaded Slides</h1>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            A collection of slides uploaded by this user.
          </p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {slides?.map((slide) => (
            <div key={slide.id} className="overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">{slide.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{slide.topic}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Grade: {slide.grade || "N/A"}</span>
                  <span className="text-lg font-bold text-blue-600">${slide.price.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3">
                {slide.fileUrl && (
                  <a
                    href={`${backendUrl.slice(0, -1)}${slide.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500"
                  >
                    View Slide
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}