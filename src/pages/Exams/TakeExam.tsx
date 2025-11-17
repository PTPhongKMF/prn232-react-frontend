// ptphongkmf/prn232-react-frontend/prn232-react-frontend-b7892c25088502cf8fc9e7f23a046107485e59c5/src/pages/Exams/TakeExam.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router"; // Dùng từ react-router
import { useExamQuestions, useSubmitExamMutation, type ExamResult } from "src/hooks/useExam";
import { Loader2, FileWarning, CircleAlert, CircleCheck, CheckSquare, Square, Check } from "lucide-react";
import { cn } from "src/utils/cn";

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  if (!examId) {
    navigate("/exams");
    return null;
  }

  const examIdNum = parseInt(examId);

  const { data: questions, isLoading, isError, error } = useExamQuestions(examIdNum);
  const submitMutation = useSubmitExamMutation(examIdNum);

  // State để lưu câu trả lời: { [questionId]: [answerId1, answerId2, ...] }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const handleAnswerSelect = (questionId: number, answerId: number, questionType: "Single" | "Multiple") => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev };

      if (questionType === "Single") {
        // Chỉ chọn 1
        newAnswers[questionId] = [answerId];
      } else {
        // Cho phép chọn/bỏ chọn nhiều
        const currentSelected = newAnswers[questionId] || [];
        if (currentSelected.includes(answerId)) {
          newAnswers[questionId] = currentSelected.filter((id) => id !== answerId);
        } else {
          newAnswers[questionId] = [...currentSelected, answerId];
        }
      }
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    if (!questions) return;

    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm("You have not answered all questions. Are you sure you want to submit?")) {
        return;
      }
    }

    // Chuyển đổi state (Record) sang payload (Array)
    const submissionPayload = {
      answers: Object.entries(selectedAnswers).map(([qId, aIds]) => ({
        questionId: parseInt(qId),
        answerIds: aIds,
      })),
    };

    submitMutation.mutate(submissionPayload, {
      onSuccess: (data) => {
        setExamResult(data);
      },
      onError: (err) => {
        console.error("Submit failed:", err);
      },
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
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Failed to Load Exam</h2>
        <p className="mt-2 text-red-500">{error?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }

  // Giao diện KẾT QUẢ sau khi nộp
  if (examResult) {
    const percentage = ((examResult.score / examResult.totalQuestions) * 100).toFixed(0);
    return (
      <div className="flex min-h-[calc(100svh-10rem)] items-center justify-center bg-amber-50 px-4 py-24">
        <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
          <CircleCheck className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Exam Submitted!</h2>
          <p className="mt-2 text-gray-600">
            You have completed the exam <span className="font-semibold">{examResult.examName}</span>.
          </p>

          <div className="mt-6 space-y-2 text-lg">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Questions:</span>
              <span className="font-semibold">{examResult.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Correct Answers:</span>
              <span className="font-semibold">{examResult.score}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span className="text-blue-700">Final Score:</span>
              <span className="text-blue-700">{percentage}%</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/exams")}
            className="mt-8 w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Back to Exam List
          </button>
        </div>
      </div>
    );
  }

  // Giao diện LÀM BÀI
  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-bold text-gray-900">Exam</h1>
        <p className="text-center text-gray-500 mb-8">Select the correct answer(s) for each question.</p>

        <div className="space-y-6">
          {questions?.map((q, index) => (
            <div key={q.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <p className="text-lg font-semibold text-gray-800">
                Question {index + 1}: {q.content}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                ({q.type === "Single" ? "Select one answer" : "Select all that apply"})
              </p>
              <div className="space-y-3">
                {q.answers.map((a) => {
                  const isSelected = selectedAnswers[q.id]?.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      onClick={() => handleAnswerSelect(q.id, a.id, q.type)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-md border p-4 transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                          : "border-gray-300 bg-white hover:bg-gray-50",
                      )}
                    >
                      {q.type === "Single" ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-400">
                          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border-2",
                            isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400",
                          )}
                        >
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      )}
                      <span className="flex-1 text-gray-700">{a.content}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {submitMutation.isError && (
          <div className="mt-6 flex items-center gap-2 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-600">
            <CircleAlert size={18} />
            <span>{submitMutation.error.message || "An error occurred during submission."}</span>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Exam"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
