import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AiChat from "src/pages/AiChat";

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-xl flex flex-col border">
          <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-2xl">
            <h3 className="text-lg font-semibold">AI Assistant 🤖</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <AiChat />
          </div>
        </div>
      )}
    </div>
  );
}
