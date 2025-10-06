import { Loader2, MessageCircleQuestionMark } from "lucide-react";
import Pagination from "src/components/Pagination";
import CreateQuestionDialog from "src/components/questions/CreateQuestionDialog";
import QuestionFilters from "src/components/questions/QuestionFilters";
import QuestionItem from "src/components/questions/QuestionItem";
import { useEffect, useState } from "react";
import { AnimatedGridPattern } from "src/components/libs/magicui/animated-grid-pattern";
import { TypingAnimation } from "src/components/libs/magicui/typing-animation";
import { useDebounce } from "src/hooks/useDebounce";
import { useCreateQuestionMutation, usePagnitedQuestionWithDetail } from "src/hooks/useQuestion";
import { useTagList } from "src/hooks/useTag";
import { type QuestionRequest } from "src/types/question/question";
import { cn } from "src/utils/cn";
import { useQueryClient } from "@tanstack/react-query";

export default function QuestionBank() {
  const [questionRequest, setQuestionRequest] = useState<QuestionRequest>({
    searchTerm: "",
    tagIds: [],
    sortByDateDescending: true,
    from: null,
    to: null,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const queryClient = useQueryClient();
  const debouncedRequest = useDebounce({ ...questionRequest, pageNumber: undefined }, 500);

  const tagList = useTagList();
  const createQuestion = useCreateQuestionMutation();
  const questionList = usePagnitedQuestionWithDetail(
    { ...debouncedRequest, pageNumber: questionRequest.pageNumber },
    tagList.isSuccess,
  );

  const handleCreateQuestion = async (data: Parameters<typeof createQuestion.mutateAsync>[0]) => {
    await createQuestion.mutateAsync(data);
    queryClient.invalidateQueries({ queryKey: ["questionbanklist"] });
  };

  useEffect(() => {
    if (tagList.isError) console.log(tagList.error);
    if (questionList.isError) console.log(questionList.error);
  }, [tagList.isError, questionList.isError]);

  return (
    <div className="pt-16 relative bg-slate-50 w-full min-h-screen overflow-hidden">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[150%] skew-y-12",
        )}
      />

      <h2 className="flex justify-center items-center text-5xl font-bold gap-6">
        <MessageCircleQuestionMark className="size-10 mt-1" />
        <TypingAnimation duration={50}>Explore all avaiable questions</TypingAnimation>
      </h2>

      <div className="mt-8 px-4 max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-start mb-4">
          <QuestionFilters
            questionRequest={questionRequest}
            onRequestChange={setQuestionRequest}
            tagList={tagList.isSuccess ? tagList.data?.data : undefined}
          />
          <CreateQuestionDialog
            tagList={tagList.isSuccess ? tagList.data?.data : undefined}
            onSubmit={handleCreateQuestion}
            isLoading={createQuestion.isPending}
          />
        </div>
      </div>

      <div className="relative z-10 mt-10 max-w-4xl mx-auto px-4">
        {questionList.isPending ? (
          <div className="flex justify-center items-center w-full min-h-[70vh]">
            <Loader2 className="animate-spin size-10 text-gray-400" />
          </div>
        ) : questionList.isError ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
            <MessageCircleQuestionMark className="size-12 mb-2" />
            <p>Failed to load questions. Please try again later.</p>
          </div>
        ) : questionList.data?.data.results.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
            <MessageCircleQuestionMark className="size-12 mb-2" />
            <p>No questions found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-200 bg-white shadow-sm">
            {questionList.data?.data.results.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                isEven={index % 2 === 0}
                tagList={tagList.isSuccess ? tagList.data?.data : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {questionList.data && questionList.data.data.results.length > 0 && (
        <Pagination
          currentPage={questionRequest.pageNumber}
          totalPages={questionList.data.data.pagnition.totalPages}
          onPageChange={(page) => {
            setQuestionRequest((prev) => ({
              ...prev,
              pageNumber: page,
            }));
          }}
        />
      )}
    </div>
  );
}
