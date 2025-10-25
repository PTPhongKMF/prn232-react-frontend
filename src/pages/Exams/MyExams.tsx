import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { kyAspDotnet } from "../../services/ApiService";

interface Exam {
  id: number;
  name?: string;
  content?: string;
  questionCount?: number;
  teacherName?: string;
}

interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  content: string;
  type?: string;
  answers?: Answer[];
}

const MyExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | "">("");
  const [editModalOpen, setEditModalOpen] = useState(false);
const [editExam, setEditExam] = useState<Exam | null>(null);
const [editName, setEditName] = useState("");
const [editContent, setEditContent] = useState("");
  // === Fetch exams ===
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await kyAspDotnet.get("api/Exams/my-exams").json();
      const list = Array.isArray(res) ? res : res?.data || [];
      setExams(list);
    } catch {
      toast.error("⚠️ Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  // === Fetch all questions for dropdown ===
  const fetchAllQuestions = async () => {
  try {
    console.log("📡 Fetching questions from /api/Questions...");
    const res = await kyAspDotnet.get("api/Questions").json();
    const list = Array.isArray(res) ? res : res?.data || [];
    console.log("✅ Question bank loaded:", list);
    setAllQuestions(list);
  } catch (err: any) {
    console.error("❌ Error fetching question bank:", err);
    toast.error("⚠️ Failed to load question bank");
  }
};
// 🟢 Fetch danh sách câu hỏi của 1 exam cụ thể
const fetchExamQuestions = async (examId: number) => {
  try {
    const res = await kyAspDotnet.get(`api/Exams/${examId}/questions`).json();
    setQuestions(Array.isArray(res) ? res : res.data || []);
  } catch (err) {
    console.error("❌ Failed to fetch exam questions:", err);
  }
};


  useEffect(() => {
    fetchExams();
    fetchAllQuestions();
  }, []);

  // === View questions in selected exam ===
  const handleViewExam = async (exam: Exam) => {
    try {
      const res = await kyAspDotnet.get(`api/Exams/${exam.id}/questions`).json();
      const list = Array.isArray(res) ? res : res?.data || [];
      setSelectedExam(exam);
      setQuestions(list);
      setShowModal(true);
    } catch {
      toast.error("⚠️ Failed to load questions");
    }
  };

 // === Add question from bank ===
const handleAddQuestion = async () => {
  if (!selectedExam || !selectedQuestionId) return;

  // 🟠 Validation: không cho thêm nếu >= 45 câu hỏi
  if (questions.length >= 45) {
    toast.warning("⚠️ Cannot add more than 45 questions!");
    return;
  }

  try {
    // 🟢 Gửi đúng định dạng JSON theo Swagger: { questionIds: [id] }
    await kyAspDotnet.post(`api/Exams/${selectedExam.id}/questions/add-existing`, {
      json: { questionIds: [selectedQuestionId] },
    });

    toast.success("✅ Question added successfully!");
    setSelectedQuestionId("");
    fetchExamQuestions(selectedExam.id); // refresh lại danh sách
  } catch (err) {
    console.error("❌ Failed to add question:", err);
    toast.error("⚠️ Failed to add question");
  }
};





  // === Delete question from exam ===
const handleDeleteQuestion = async (questionId: number) => {
     if (!selectedExam) return;

  // 🟠 Validation: nếu đề thi chỉ còn đúng 10 câu thì không cho xóa
  if (questions.length === 10) {
    toast.warning("🚫 Cannot delete — exam must have at least 10 questions!");
    return;
  }

  if (!window.confirm("Are you sure you want to remove this question?")) return;

  try {
    await kyAspDotnet.delete(`api/Exams/${selectedExam.id}/questions/${questionId}`);
    toast.success("🗑️ Question removed successfully!");
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  } catch (err) {
    console.error("❌ Failed to delete question:", err);
    toast.error("⚠️ Failed to delete question");
  }
}

  
  const handleEditExam = (exam: Exam) => {
  setEditExam(exam);
  setEditName(exam.name || "");
  setEditContent(exam.content || "");
  setEditModalOpen(true);
};

// 🟢 Hàm cập nhật exam
const handleUpdateExam = async () => {
  if (!editExam) return;
  if (!editName.trim()) {
    toast.warning("⚠️ Exam name cannot be empty");
    return;
  }

  try {
    // 🟢 Lấy danh sách câu hỏi hiện có trong đề thi (để giữ nguyên)
    const res = await kyAspDotnet.get(`api/Exams/${editExam.id}/questions`).json();
    const list = Array.isArray(res) ? res : res?.data || [];
    const questionIds = list.map((q: any) => q.id);

    // 🟢 Gửi PUT có cả questionIds để backend hợp lệ
    await kyAspDotnet.put(`api/Exams/${editExam.id}`, {
      json: {
        name: editName,
        content: editContent,
        questionIds: questionIds,
      },
    });

    toast.success("✅ Exam updated successfully!");
    setEditModalOpen(false);
    fetchExams();
  } catch (err) {
    console.error("❌ Update error:", err);
    toast.error("⚠️ Failed to update exam");
  }
};

  // === Delete exam ===
  const handleDeleteExam = async (examId: number) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await kyAspDotnet.delete(`api/Exams/${examId}`);
      toast.success("🗑️ Exam deleted successfully!");
      setExams((prev) => prev.filter((e) => e.id !== examId));
    } catch {
      toast.error("⚠️ Failed to delete exam");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-b from-yellow-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-700">
        🧮 My Exams
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading exams...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
          <table className="min-w-full text-sm text-center border-collapse">
            <thead className="bg-amber-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3 border">#</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Content</th>
                <th className="px-4 py-3 border">Questions</th>
                <th className="px-4 py-3 border">Teacher</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => (
                <tr key={exam.id} className="hover:bg-amber-50">
                  <td className="px-4 py-3 border">{i + 1}</td>
                  <td className="px-4 py-3 border text-blue-700 font-medium">
                    {exam.name}
                  </td>
                  <td className="px-4 py-3 border text-gray-600">
                    {exam.content || "—"}
                  </td>
                  <td className="px-4 py-3 border">
                    {exam.questionCount ?? (exam.questions?.length ?? 0)}
                  </td>
                  <td className="px-4 py-3 border">{exam.teacherName}</td>
                  <td className="px-4 py-3 border space-x-2">
                    <button
                      onClick={() => handleViewExam(exam)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                    >
                      View
                    </button>
                    <button
    onClick={() => handleEditExam(exam)}
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
  >
    Edit
  </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Modal for questions === */}
      {showModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-11/12 md:w-2/3 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl text-center font-bold text-amber-700 mb-5">
              {selectedExam.name}
            </h2>

            {/* Add from question bank */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-6">
              <select
                className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-2/3"
                value={selectedQuestionId}
                onChange={(e) =>
                  setSelectedQuestionId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
              >
                <option value="">Select question from Question Bank...</option>
                {allQuestions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.content.length > 60
                      ? q.content.substring(0, 60) + "..."
                      : q.content}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddQuestion}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                ➕ Add Question
              </button>
            </div>

            {/* Question list */}
            {questions.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No questions yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {questions.map((q, i) => (
                  <li key={q.id} className="py-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-800">
                        {i + 1}. {q.content}
                      </p>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑 Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 italic mb-2">
                      Type: {q.type}
                    </p>
                    {q.answers?.length ? (
                      <ul className="ml-5 mt-1 text-sm text-gray-700 list-disc">
                        {q.answers.map((a, j) => (
                          <li
                            key={j}
                            className={`${
                              a.isCorrect
                                ? "text-green-600 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {a.content}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ml-5 text-sm text-gray-400 italic">
                        No answers available.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}           

            
            <div className="text-center mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* === Edit Modal === */}
{editModalOpen && editExam && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
      <h2 className="text-xl font-bold text-center text-amber-700 mb-4">
        ✏️ Edit Exam
      </h2>

      <label className="block text-gray-700 font-medium mb-1">Exam Name</label>
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 mb-3"
      />

      <label className="block text-gray-700 font-medium mb-1">Content</label>
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-2 mb-4"
        rows={3}
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setEditModalOpen(false)}
          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateExam}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default MyExams;
