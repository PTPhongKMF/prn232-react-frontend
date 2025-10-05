import { Loader2, MoreVertical, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "src/components/libs/shadcn/dialog";
import { Input } from "src/components/libs/shadcn/input";
import { useDeleteQuestionMutation, useUpdateQuestionMutation } from "src/hooks/useQuestion";
import { type QuestionWithDetail, type UpdateQuestion } from "src/types/question/question";
import { cn } from "src/utils/cn";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { type Tag } from "src/types/tag/tag";

interface QuestionItemProps {
  question: QuestionWithDetail;
  isEven: boolean;
  tagList?: Tag[];
}

export default function QuestionItem({ question, isEven, tagList }: QuestionItemProps) {
  const queryClient = useQueryClient();
  const deleteQuestion = useDeleteQuestionMutation();
  const updateQuestion = useUpdateQuestionMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<UpdateQuestion>({
    content: question.content,
    type: question.type,
    answers: question.answers,
    tagIds: question.tags.map((t) => t.id),
  });

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    await deleteQuestion.mutateAsync(question);
    queryClient.invalidateQueries({ queryKey: ["questionbanklist"] });
    setIsOpen(false);
  };

  const validateQuestion = () => {
    if (!editedQuestion.content.trim()) {
      return "Question content cannot be empty";
    }

    const correctAnswersCount = editedQuestion.answers.filter((a) => a.isCorrect).length;

    if (editedQuestion.type === "Multiple" && correctAnswersCount < 2) {
      return "Multiple choice questions must have at least 2 correct answers";
    }

    if (editedQuestion.type === "Single" && correctAnswersCount !== 1) {
      return "Single choice questions must have exactly 1 correct answer";
    }

    if (editedQuestion.answers.some((a) => !a.content.trim())) {
      return "Answer content cannot be empty";
    }

    return null;
  };

  const handleUpdate = async () => {
    const error = validateQuestion();
    if (error) {
      alert(error);
      return;
    }

    await updateQuestion.mutateAsync({
      id: question.id,
      data: editedQuestion,
    });
    queryClient.invalidateQueries({ queryKey: ["questionbanklist"] });
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleAnswerChange = (
    index: number,
    field: keyof (typeof editedQuestion.answers)[0],
    value: string | boolean,
  ) => {
    setEditedQuestion((prev) => ({
      ...prev,
      answers: prev.answers.map((answer, i) => (i === index ? { ...answer, [field]: value } : answer)),
    }));
  };

  const addAnswer = () => {
    setEditedQuestion((prev) => ({
      ...prev,
      answers: [...prev.answers, { content: "", isCorrect: false }],
    }));
  };

  const removeAnswer = (index: number) => {
    setEditedQuestion((prev) => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  return (
    <div
      className={cn(
        "w-full p-4 flex items-start gap-4",
        "transition-colors duration-200",
        isEven ? "bg-gray-50" : "bg-white",
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-medium truncate">{question.content}</p>
      </div>

      <div className="w-24 shrink-0">
        <p className="text-sm text-gray-600 truncate">{question.type}</p>
      </div>

      <div className="w-48 shrink-0 overflow-hidden relative group">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {question.tags.map((tag) => (
            <span key={tag.id} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs whitespace-nowrap">
              {tag.name}
            </span>
          ))}
        </div>
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-8 bg-gradient-to-l to-transparent pointer-events-none",
            isEven ? "from-gray-50" : "from-white",
          )}
        />
      </div>

      <div className="w-32 shrink-0">
        <p className="text-sm text-gray-600">{question.createdAt.toLocaleDateString()}</p>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setIsEditing(false);
        }}
      >
        <DialogTrigger asChild>
          <div className="w-8 shrink-0">
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <MoreVertical className="size-4 text-gray-500" />
            </button>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-slate-100 min-w-[50vw] pt-10 max-h-[85vh] flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2">
            <DialogHeader className="min-h-fit max-h-[3rem] overflow-y-auto mb-2">
              {isEditing ? (
                <Input
                  value={editedQuestion.content}
                  onChange={(e) => setEditedQuestion((prev) => ({ ...prev, content: e.target.value }))}
                  className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                />
              ) : (
                question.content
              )}
            </DialogHeader>

            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span>Type:</span>
                {isEditing ? (
                  <select
                    value={editedQuestion.type}
                    onChange={(e) => setEditedQuestion((prev) => ({ ...prev, type: e.target.value }))}
                    className="rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="Single">Single Choice</option>
                    <option value="Multiple">Multiple Choice</option>
                  </select>
                ) : (
                  <span>{question.type}</span>
                )}
              </div>
              <p>By: {question.teacherName}</p>
              <p>Created At: {question.createdAt.toLocaleDateString()}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tags:</h3>
              {isEditing ? (
                tagList ? (
                  <div className="flex flex-wrap gap-2">
                    {tagList.map((tag) => (
                      <label
                        key={tag.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                          editedQuestion.tagIds.includes(tag.id)
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={editedQuestion.tagIds.includes(tag.id)}
                          onChange={(e) => {
                            setEditedQuestion((prev) => ({
                              ...prev,
                              tagIds: e.target.checked
                                ? [...prev.tagIds, tag.id]
                                : prev.tagIds.filter((id) => id !== tag.id),
                            }));
                          }}
                          className="sr-only"
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Loading tags...</p>
                )
              ) : (
                <div className="flex flex-wrap gap-1">
                  {question.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs truncate max-w-[8rem]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Answers:</h3>
                {isEditing && (
                  <p className="text-sm text-gray-600">
                    {editedQuestion.type === "Single"
                      ? "Select exactly 1 correct answer"
                      : "Select at least 2 correct answers"}{" "}
                    (Current: {editedQuestion.answers.filter((a) => a.isCorrect).length})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {(isEditing ? editedQuestion.answers : question.answers).map((answer, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg",
                      answer.isCorrect ? "bg-green-100 border border-green-200" : "bg-white border border-gray-200",
                    )}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={answer.content}
                          onChange={(e) => handleAnswerChange(index, "content", e.target.value)}
                          className="flex-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        />
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={answer.isCorrect}
                            onChange={(e) => handleAnswerChange(index, "isCorrect", e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">Correct</span>
                        </label>
                        {editedQuestion.answers.length > 2 && (
                          <button
                            onClick={() => removeAnswer(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className={cn("flex-1", answer.isCorrect ? "text-green-800" : "text-gray-700")}>
                        {answer.content}
                      </p>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addAnswer}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <Plus className="size-5 mx-auto" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-4 bg-slate-100">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateQuestion.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {updateQuestion.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!question.deleteable || deleteQuestion.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {deleteQuestion.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
