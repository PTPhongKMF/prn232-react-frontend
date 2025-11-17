// ptphongkmf/prn232-react-frontend/prn232-react-frontend-b7892c25088502cf8fc9e7f23a046107485e59c5/src/pages/Exams/Exams.tsx
import { Link } from "react-router"; // Dùng từ react-router
import { usePublicExams } from "src/hooks/useExam";
import { Loader2, FileWarning, BookOpenText, User, ListChecks } from "lucide-react";

export default function Exams() {
  const { data: exams, isLoading, isError, error } = usePublicExams();

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-10rem)] items-center justify-center bg-amber-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100svh-10rem)] flex-col items-center justify-center bg-amber-50 text-center">
        <FileWarning className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load Exams</h2>
        <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="pb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Available Exams</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Choose an exam to test your knowledge.
          </p>
        </div>

        {exams && exams.length > 0 ? (
          <div className="mx-auto max-w-4xl space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-700">{exam.name}</h2>
                  <p className="mt-2 text-sm text-gray-600">{exam.content}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5" title="Author">
                      <User size={14} />
                      <span>{exam.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Questions">
                      <ListChecks size={14} />
                      <span>{exam.questionsCount} questions</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-b-lg bg-gray-50 px-6 py-4">
                  <Link
                    to={`/exams/${exam.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Start Exam
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-24 text-center">
            <BookOpenText className="h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">No Exams Available</h2>
            <p className="mt-2 text-gray-500">
              There are no exams available to take at this moment. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}