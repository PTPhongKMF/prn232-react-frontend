// ptphongkmf/prn232-react-frontend/prn232-react-frontend-b7892c25088502cf8fc9e7f23a046107485e59c5/src/pages/Exams/ExamHistory.tsx
import { useExamHistory } from "src/hooks/useExam";
import { Loader2, FileWarning, History, Calendar, Target, CheckCircle } from "lucide-react";

export default function ExamHistory() {
  const { data: history, isLoading, isError, error } = useExamHistory();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load History</h2>
        <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="pb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Exam History</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Review your past exam results and performance.
          </p>
        </div>

        {history && history.length > 0 ? (
          <div className="mx-auto max-w-4xl space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-white shadow-sm"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-700">{item.examName}</h2>
                  <div className="mt-4 flex flex-col gap-y-2 text-sm text-gray-500 md:flex-row md:gap-x-6">
                    <div className="flex items-center gap-1.5" title="Score">
                      <Target size={14} className="text-green-600" />
                      <span className="font-medium text-gray-700">
                        Score: {item.score} / {JSON.parse(item.content).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Submitted On">
                      <Calendar size={14} />
                      <span>{formatDate(item.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-24 text-center">
            <History className="h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">No History Found</h2>
            <p className="mt-2 text-gray-500">
              You haven't completed any exams yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}