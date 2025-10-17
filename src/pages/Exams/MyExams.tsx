import { useEffect, useState } from "react";
import { kyAspDotnet as api } from "src/services/ApiService";

interface Question {
    id: number;
    content: string;
    type: string;
}

interface Exam {
    id: number;
    name: string;
    content: string;
    questionsCount: number;
    questions: Question[];
}

export default function MyExams() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [questionBank, setQuestionBank] = useState<Question[]>([]);
    const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
    const [editedExamName, setEditedExamName] = useState("");
    const [editedExamContent, setEditedExamContent] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Load exams
    const fetchMyExams = async () => {
        try {
            const token = localStorage.getItem("token") || "";
            const res = await api.get("api/Exams/my-exams", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json() as { data: Exam[] };
            setExams(data.data || []);
        } catch (err) {
            console.error("❌ Error loading exams:", err);
        }
    };

    useEffect(() => {
        fetchMyExams();
    }, []);

    // Open modal
    const handleViewExam = (exam: Exam) => {
        setSelectedExam(exam);
        setIsEditModalOpen(false);
        setIsViewModalOpen(true);
    };

    const handleOpenEditModal = (exam: Exam) => {
        setSelectedExam(exam);
        setEditedExamName(exam.name);
        setEditedExamContent(exam.content);
        setIsViewModalOpen(false);   // 🔒 Tắt modal xem nếu đang bật
        setIsEditModalOpen(true);    // ✅ Bật modal edit
    };

    const handleEditExam = async (exam: Exam) => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwtToken");
        if (!token) {
            alert("❌ You must log in first!");
            return;
        }

        const updatedName = editedExamName || exam.name;
        const updatedContent = editedExamContent || exam.content;

        // Lấy tất cả questionId hiện có của đề thi này
        const currentQuestionIds = exam.questions?.map((q) => q.id) || [];

        try {
            const response = await fetch(`https://localhost:7035/api/Exams/${exam.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: updatedName,
                    content: updatedContent,
                    questionIds: currentQuestionIds,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("❌ Backend response:", text);
                alert("❌ Update failed!");
            } else {
                alert("✅ Update success!");
                setSelectedExam(null);
                setEditedExamName("");
                setEditedExamContent("");
                fetchMyExams();

            }
        } catch (error) {
            console.error("⚠️ Error:", error);
            alert("❌ Something went wrong while updating!");
        }
    };

    // Delete exam
    const handleDeleteExam = async (examId: number) => {
        if (!confirm("Are you sure you want to delete this exam?")) return;
        try {
            const token = localStorage.getItem("token") || "";
            await api.delete(`api/Exams/${examId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ Exam deleted successfully!");
            fetchMyExams();
        } catch (error) {
            console.error("❌ Error deleting exam:", error);
        }
    };

    // Delete question from exam
    const handleDeleteQuestion = async (questionId: number) => {
        if (!selectedExam) return;
        if (!confirm("Delete this question from exam?")) return;

        try {
            const token = localStorage.getItem("token") || "";
            await api.delete(`api/Exams/${selectedExam.id}/questions/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("✅ Question removed!");
            fetchMyExams();
        } catch (error) {
            console.error("❌ Error removing question:", error);
        }
    };

    // Open Question Bank modal
    const openQuestionBank = async () => {
        try {
            const token = localStorage.getItem("token") || "";
            const res = await api.get("api/Questions", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json() as { data: Question[] };
            setQuestionBank(data.data || []);
            setIsQuestionBankOpen(true);
        } catch (err) {
            console.error("❌ Error loading question bank:", err);
        }
    };

    // Add selected questions to exam
    const handleAddSelectedQuestions = async (examId: number) => {
        if (selectedQuestions.length === 0) {
            alert("⚠️ Please select at least one question.");
            return;
        }

        try {
            const token = localStorage.getItem("token") || "";
            await api.post(`api/Exams/${examId}/questions/add-existing`, {
                json: { questionIds: selectedQuestions },
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("✅ Added questions successfully!");
            setIsQuestionBankOpen(false);
            setSelectedQuestions([]);
            fetchMyExams();
        } catch (err) {
            console.error("❌ Error adding selected questions:", err);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
                My Created Exams
            </h2>

            {/* Exam Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border rounded-xl shadow">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="py-2 px-3 border text-center">#</th>
                            <th className="py-2 px-3 border">Exam Name</th>
                            <th className="py-2 px-3 border">Content</th>
                            <th className="py-2 px-3 border text-center">Questions</th>
                            <th className="py-2 px-3 border text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.length > 0 ? (
                            exams.map((exam, idx) => (
                                <tr key={exam.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                    <td className="border px-3 py-2">{exam.name}</td>
                                    <td className="border px-3 py-2">{exam.content}</td>
                                    <td className="border px-3 py-2 text-center">
                                        {exam.questionsCount}
                                    </td>
                                    <td className="border px-3 py-2 text-center flex justify-center gap-2">

                                        <button
                                            onClick={() => handleViewExam(exam)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => handleOpenEditModal(exam)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>


                                        <button
                                            onClick={() => handleDeleteExam(exam.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No exams available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>



            {/* View Exam Modal */}
            {isViewModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-2xl font-semibold text-blue-700">
                                    🧮 {selectedExam.name}
                                </h3>
                                <p className="text-gray-600">
                                    {selectedExam.content} —{" "}
                                    <span className="text-blue-500 font-medium">
                                        {selectedExam.questionsCount} questions
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedExam(null)}
                                className="text-gray-500 hover:text-red-500 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Add from Question Bank */}
                        <div className="mb-3">
                            <button
                                onClick={openQuestionBank}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <span>＋</span> Add from Question Bank
                            </button>
                        </div>

                        {/* Questions Table */}
                        <div className="overflow-y-auto max-h-[400px] border rounded-xl shadow-sm">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr className="text-gray-700">
                                        <th className="py-2 px-3 text-center border">#</th>
                                        <th className="py-2 px-3 border text-left">Question</th>
                                        <th className="py-2 px-3 border text-center">Type</th>
                                        <th className="py-2 px-3 border text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedExam.questions.length > 0 ? (
                                        selectedExam.questions.map((q, idx) => (
                                            <tr key={q.id} className="hover:bg-gray-50">
                                                <td className="border px-3 py-2 text-center">
                                                    {idx + 1}
                                                </td>
                                                <td
                                                    className="border px-3 py-2 truncate max-w-[400px]"
                                                    title={q.content}
                                                >
                                                    {q.content}
                                                </td>
                                                <td className="border px-3 py-2 text-center text-blue-600">
                                                    {q.type}
                                                </td>
                                                <td className="border px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => handleDeleteQuestion(q.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-sm"
                                                    >
                                                        🗑
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center text-gray-500 py-6 italic"
                                            >
                                                No questions available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && selectedExam && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">✏️ Edit Exam</h3>

                        <label className="block mb-2 text-sm font-medium text-gray-700">Exam Name</label>
                        <input
                            type="text"
                            value={editedExamName}
                            onChange={(e) => setEditedExamName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium text-gray-700">Content</label>
                        <textarea
                            value={editedExamContent}
                            onChange={(e) => setEditedExamContent(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleEditExam(selectedExam)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}




            {/* Question Bank Modal */}
            {isQuestionBankOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-5xl p-6 relative">
                        <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                            📚 Select Questions from Bank
                        </h3>

                        <div className="overflow-y-auto max-h-[400px] border rounded-xl shadow-sm">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-3 border text-center">#</th>
                                        <th className="py-2 px-3 border text-left">Question</th>
                                        <th className="py-2 px-3 border text-center">Type</th>
                                        <th className="py-2 px-3 border text-center">Select</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questionBank.map((q, idx) => (
                                        <tr key={q.id} className="hover:bg-gray-50 transition">
                                            <td className="border px-3 py-2 text-center">{idx + 1}</td>
                                            <td
                                                className="border px-3 py-2 truncate max-w-[400px]"
                                                title={q.content}
                                            >
                                                {q.content}
                                            </td>
                                            <td className="border px-3 py-2 text-center">{q.type}</td>
                                            <td className="border px-3 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedQuestions.includes(q.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked)
                                                            setSelectedQuestions([...selectedQuestions, q.id]);
                                                        else
                                                            setSelectedQuestions(
                                                                selectedQuestions.filter((id) => id !== q.id)
                                                            );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end mt-4 gap-3">
                            <button
                                onClick={() => setIsQuestionBankOpen(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAddSelectedQuestions(selectedExam!.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                            >
                                Add Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}