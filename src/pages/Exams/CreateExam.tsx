import React, { useEffect, useState } from "react";
import { kyAspDotnet as ApiService } from "../../services/ApiService";
import Select, { type MultiValue } from "react-select";


interface Question {
    id: number;
    content: string;
}

interface ExamRequest {
    name: string;
    content: string;
    questionIds: number[];
}

interface SelectOption {
    value: number;
    label: string;
}

const CreateExam: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [formData, setFormData] = useState<ExamRequest>({
        name: "",
        content: "",
        questionIds: [],
    });
    const [status, setStatus] = useState<string>("");


    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await ApiService.get("api/Questions");
                const result = await response.json() as { data: Question[] };
                if (result?.data) {
                    setQuestions(result.data);
                } else if (Array.isArray(result)) {
                    setQuestions(result);
                }
            } catch (error) {
                console.error("❌ Failed to fetch questions:", error);
                setStatus("⚠️ Unable to load questions.");
            }
        };
        fetchQuestions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.content || formData.questionIds.length === 0) {
            setStatus("⚠️ Please fill all fields and select questions.");
            return;
        }


        try {
            const response = await ApiService.post("api/Exams", {
                json: formData,
            });

            if (response.ok) {
                setStatus("✅ Exam created successfully!");
                setFormData({ name: "", content: "", questionIds: [] });
            } else {
                setStatus("❌ Failed to create exam. Please check your role or data.");
            }
        } catch (error) {
            console.error("❌ Error creating exam:", error);
            setStatus("❌ Failed to connect to server.");
        }
    };

    // ✅ Options cho react-select
    const questionOptions: SelectOption[] = questions.map((q) => ({
        value: q.id,
        label: q.content,
    }));

    return (
        <div className="flex justify-center mt-12">
            <form
                onSubmit={handleSubmit}
                className="w-96 p-8 bg-white rounded-2xl shadow-lg"
            >
                <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">
                    Create Exam
                </h2>

                {/* Exam Name */}
                <label className="font-semibold">Exam Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter exam name"
                    className="w-full border p-2 rounded mb-4"
                />

                {/* Content */}
                <label className="font-semibold">Content</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Enter exam content"
                    className="w-full border p-2 rounded mb-4"
                />

                {/* Select Questions */}
                <label className="font-semibold">Select Questions</label>
                <Select
                    isMulti
                    options={questionOptions}
                    value={questionOptions.filter((q) =>
                        formData.questionIds.includes(q.value)
                    )}
                    onChange={(selected) =>
                        setFormData((prev) => ({
                            ...prev,
                            questionIds: (selected as MultiValue<SelectOption>).map((s) => s.value),
                        }))
                    }
                    className="mb-4"
                    placeholder="Choose questions..."
                />

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-all"
                >
                    Create Exam
                </button>

                {status && (
                    <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
                )}
            </form>
        </div>
    );
};

export default CreateExam;