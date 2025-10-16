import { useState, useEffect } from "react";
import { useAiChatMutation } from "src/hooks/useAI";

export default function AiChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>(() => {
    const saved = localStorage.getItem("aiChatMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const chatMutation = useAiChatMutation();

  // Lưu tin nhắn mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("aiChatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, `🧑 ${userMessage}`]);
    setInput("");

    chatMutation.mutate(userMessage, {
      onSuccess: (aiText) => {
        setMessages((prev) => [...prev, `🤖 ${aiText}`]);
      },
      onError: () => {
        setMessages((prev) => [...prev, "⚠️ Lỗi khi gửi tin nhắn đến server."]);
      },
    });
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Vùng hiển thị tin nhắn */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 p-2 rounded-lg max-w-[80%] break-words ${
              msg.startsWith("🧑")
                ? "bg-blue-500 text-white ml-auto"
                : msg.startsWith("🤖")
                  ? "bg-gray-200 text-gray-900"
                  : "bg-yellow-100 text-gray-800"
            }`}
          >
            {msg}
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="my-2 p-2 rounded-lg bg-gray-300 text-gray-700 inline-block">🤖 AI đang trả lời...</div>
        )}
      </div>

      {/* Ô nhập và nút gửi */}
      <div className="flex border-t p-2">
        <input
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={chatMutation.isPending}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          disabled={chatMutation.isPending}
        >
          {chatMutation.isPending ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}
