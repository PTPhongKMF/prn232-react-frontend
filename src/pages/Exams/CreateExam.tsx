import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { kyAspDotnet } from "../../services/ApiService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

interface Question {
  id: number;
  content: string;
  type: string;
  grade: string;
  difficulty: string;
}

export default function CreateExam() {
  const [examName, setExamName] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const navigate = useNavigate();

  // 🟢 Load danh sách câu hỏi
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await kyAspDotnet.get("api/Questions").json<any>();

// Nếu API trả về object { data: [...] }
if (Array.isArray(res)) {
  setQuestions(res);
} else if (Array.isArray(res.data)) {
  setQuestions(res.data);
} else {
  console.error("⚠️ Unexpected question response:", res);
  setQuestions([]);
}

      } catch (err) {
        toast.error("Failed to load question bank");
        console.error(err);
      }
    };
    fetchQuestions();
  }, []);

  const toggleQuestion = (id: number) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleCreateExam = async () => {
  // ✅ Validation trước khi gửi request
  if (!examName.trim()) {
    toast.error("⚠️ Exam name is required");
    return;
  }

  if (examName.trim().length < 3) {
    toast.error("Exam name must be at least 3 characters long");
    return;
  }

  if (!content.trim()) {
    toast.warning("⚠️ Description is recommended to help students understand the exam");
  }

  if (selectedQuestions.length < 10) {
    toast.error("⚠️ Please select at least 10 questions");
    return;
  }

  if (selectedQuestions.length >45) {
    toast.error("⚠️ Please select less 45 questions");
    return;
  }

  try {
    // 🟢 Step 1: tạo exam
    const examRes = await kyAspDotnet
      .post("api/Exams", {
        json: { name: examName, content, questionIds: selectedQuestions },
      })
      .json<any>();

    const examId = examRes?.id ?? examRes?.data?.id;
    if (!examId) {
      console.error("❌ Exam ID not found:", examRes);
      toast.error("❌ Failed to retrieve exam ID from server");
      return;
    }

    toast.success("✅ Exam created successfully!");

    // 🟡 Step 2: thêm câu hỏi đã chọn
    await kyAspDotnet.post(`api/Exams/${examId}/questions/add-existing`, {
      json: { questionIds: selectedQuestions },
    });
    toast.success("✅ Questions added to exam!");

    // 🧹 Reset form
    setExamName("");
    setContent("");
    setSelectedQuestions([]);

    navigate("/my-exams");
  } catch (err: any) {
    console.error("❌ Error creating exam:", err);
    toast.error("🚫 Failed to create exam. Please try again.");
  }
};


  return (
   <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Create New Exam
      </h2>
        <div>
          <label className="font-medium">Exam Name</label>
          <Input
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="Enter exam name"
          />
        </div>

        <div>
          <label className="font-medium">Description</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter exam description"
          />
        </div>

        {/* 🧩 Select Questions */}
<div>
  <h3 className="font-semibold text-lg mb-3 text-center text-gray-800">
    Select Questions
  </h3>

  

  {/* 🧱 Danh sách câu hỏi dạng grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
    {questions.length === 0 ? (
      <p className="text-gray-500 text-sm text-center col-span-2">
        No questions available.
      </p>
    ) : (
      questions
        .filter((q) => !q.hidden)
        .map((q) => {
          const selected = selectedQuestions.includes(q.id);
          return (
            <div
              key={q.id}
              onClick={() => toggleQuestion(q.id)}
              className={`cursor-pointer border rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md ${
                selected
                  ? "bg-blue-50 border-blue-400 ring-1 ring-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium text-gray-800 truncate pr-2">
                  {q.content}
                </p>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleQuestion(q.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
              <div className="text-xs text-gray-500">
                <span className="inline-block mr-2 px-2 py-1 bg-gray-100 rounded-md">
                  {q.type}
                </span>
                <span className="inline-block mr-2 px-2 py-1 bg-green-100 rounded-md">
                  {q.grade}
                </span>
                <span className="inline-block px-2 py-1 bg-yellow-100 rounded-md">
                  {q.difficulty}
                </span>
              </div>
            </div>
          );
        })
    )}
  </div>
</div>

          
        

        <Button onClick={handleCreateExam} className="w-full mt-3">
          Create Exam
        </Button>
      </div>

  );

}
