import { Bot, User } from "lucide-react";
import { Message } from "@/utils/storage";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;

  return (
    <div className={`flex gap-3 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%]">
        <div className={`rounded-lg p-3 ${
          role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-card text-card-foreground border'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>

      {role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
