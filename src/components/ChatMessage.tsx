interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export const ChatMessage = ({ role, content, image, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-2xl p-4
          ${isUser 
            ? 'bg-blue-600/80 backdrop-blur-lg border border-blue-500/20' 
            : 'glass'
          }
        `}
      >
        {image && (
          <div className="mb-3">
            <img
              src={image}
              alt="Uploaded"
              className="rounded-lg border border-white/20 max-w-[150px] h-auto"
            />
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <p className="text-xs text-white/50 mt-2">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
