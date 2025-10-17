import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { type UpdateQuestion } from "src/types/question/question";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "src/components/libs/shadcn/dialog";
import { useState } from "react";
import { type Tag } from "src/types/tag/tag";
import { cn } from "src/utils/cn";

interface CreateQuestionDialogProps {
    tagList?: Tag[];
    isLoading?: boolean;
    onSubmit: (data: UpdateQuestion) => Promise<void>;
    trigger?: React.ReactNode;
}

export default function CreateQuestionDialog({ tagList, isLoading, onSubmit, trigger }: CreateQuestionDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<UpdateQuestion>({
        content: "",
        type: "Single",
        answers: [
            { content: "", isCorrect: false },
            { content: "", isCorrect: false },
        ],
        tagIds: [],
    });

    const validateQuestion = () => {
        if (!formData.content.trim()) {
            return "Question content cannot be empty";
        }

        const correctAnswersCount = formData.answers.filter((a) => a.isCorrect).length;

        if (formData.type === "Multiple" && correctAnswersCount < 2) {
            return "Multiple choice questions must have at least 2 correct answers";
        }

        if (formData.type === "Single" && correctAnswersCount !== 1) {
            return "Single choice questions must have exactly 1 correct answer";
        }

        if (formData.answers.some((a) => !a.content.trim())) {
            return "Answer content cannot be empty";
        }

        return null;
    };

    const handleSubmit = async () => {
        const error = validateQuestion();
        if (error) {
            alert(error);
            return;
        }

        await onSubmit(formData);
        setIsOpen(false);
    };

    const addAnswer = () => {
        setFormData((prev) => ({
            ...prev,
            answers: [...prev.answers, { content: "", isCorrect: false }],
        }));
    };

    const removeAnswer = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            answers: prev.answers.filter((_, i) => i !== index),
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                        <Plus className="size-5" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-slate-100 min-w-[50vw] pt-10 max-h-[85vh] flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2">
                    <DialogTitle className="mb-8">
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                            className="w-full rounded-md px-4 py-3 min-h-[120px] text-lg bg-white/80 border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                placeholder:text-gray-400 resize-y transition-all duration-200"
                            placeholder="Enter your question..."
                        />
                    </DialogTitle>

                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <span>Type:</span>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as "Single" | "Multiple" }))}
                                className="rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="Single">Single Choice</option>
                                <option value="Multiple">Multiple Choice</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Tags:</label>
                            {formData.tagIds.length > 0 && (
                                <button
                                    onClick={() => setFormData((prev) => ({ ...prev, tagIds: [] }))}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <Trash2 className="size-4" />
                                    <span className="text-xs">Clear all</span>
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tagList?.map((tag) => (
                                <label
                                    key={tag.id}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors",
                                        formData.tagIds.includes(tag.id)
                                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.tagIds.includes(tag.id)}
                                        onChange={(e) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                tagIds: e.target.checked ? [...prev.tagIds, tag.id] : prev.tagIds.filter((id) => id !== tag.id),
                                            }));
                                        }}
                                        className="sr-only"
                                    />
                                    {tag.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-gray-900">Answers:</h3>
                            <p className="text-sm text-gray-600">
                                {formData.type === "Single" ? "Select exactly 1 correct answer" : "Select at least 2 correct answers"}{" "}
                                (Current: {formData.answers.filter((a) => a.isCorrect).length})
                            </p>
                        </div>
                        <div className="space-y-2">
                            {formData.answers.map((answer, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "p-3 rounded-lg",
                                        answer.isCorrect ? "bg-green-100 border border-green-200" : "bg-white border border-gray-200",
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={answer.content}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    answers: prev.answers.map((a, i) => (i === index ? { ...a, content: e.target.value } : a)),
                                                }))
                                            }
                                            className="flex-1 bg-transparent text-base px-2 py-1 focus:outline-none placeholder:text-gray-400 transition-colors"
                                            placeholder={`Answer ${index + 1}`}
                                        />
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={answer.isCorrect}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        answers: prev.answers.map((a, i) =>
                                                            i === index ? { ...a, isCorrect: e.target.checked } : a,
                                                        ),
                                                    }))
                                                }
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">Correct</span>
                                        </label>
                                        {formData.answers.length > 2 && (
                                            <button
                                                onClick={() => removeAnswer(index)}
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addAnswer}
                                className="w-full cursor-pointer py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                            >
                                <Plus className="size-5 mx-auto" />
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6 flex justify-end gap-2 border-t border-gray-200 pt-4 bg-slate-100">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Create
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}