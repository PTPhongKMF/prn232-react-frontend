import { useMutation } from "@tanstack/react-query";
import { kyAspDotnet } from "src/services/ApiService";

export function useAiChatMutation() {
  return useMutation<string, Error, string>({
    mutationFn: async (message: string) => {
      try {
        // ✅ Gửi request và lấy text thuần (không dùng .json() vì stream có newline thật)
        const textResponse = await kyAspDotnet
          .post("api/ai/chat", {
            json: { message },
            timeout: false, // Ollama stream chậm, không nên timeout
          })
          .text();

        // 🧹 Làm sạch chuỗi JSON để tránh lỗi ký tự điều khiển
        const cleaned = textResponse
          .replace(/[\u0000-\u001F]+/g, " ") // loại bỏ control chars (ASCII 0–31)
          .trim();

        // ✅ Parse an toàn (backend trả JSON dạng {"response": "..."} )
        const parsed = JSON.parse(cleaned);

        if (parsed && typeof parsed.response === "string") {
          return parsed.response;
        }

        // fallback nếu không có field response
        return JSON.stringify(parsed);
      } catch (err: any) {
        console.error("🔥 Lỗi parse phản hồi AI:", err);
        return "⚠️ Lỗi khi đọc phản hồi từ AI server.";
      }
    },
  });
}
