import { Search } from "lucide-react";
import { TypingAnimation } from "src/components/libs/magicui/typing-animation";

export default function QuestionBank() {
  return (
    <div className="pt-16 bg-slate-50 size-full min-h-screen">
      <h2 className="flex justify-center items-center text-5xl font-bold gap-6">
        <Search className="size-10 mt-1" />
        <TypingAnimation duration={50}>Explore all avaiable questions</TypingAnimation>
      </h2>
    </div>
  );
}
