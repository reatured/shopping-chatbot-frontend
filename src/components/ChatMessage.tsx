interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

export const ChatMessage = ({ role, content, image, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  // Convert literal \n to actual newlines
  const formattedContent = content.replace(/\\n/g, '\n');

  return (
    <div className={`flex gap-2 md:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[85%] sm:max-w-[80%] md:max-w-[70%] rounded-2xl p-3 md:p-4
          ${isUser
            ? 'bg-gray-800 text-white border border-gray-700'
            : 'glass border border-gray-200'
          }
        `}
      >
        {image && (
          <div className="mb-2 md:mb-3">
            <img
              src={image}
              alt="Uploaded"
              className="rounded-lg border border-white/20 max-w-[120px] md:max-w-[150px] h-auto"
            />
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text">{formattedContent}</p>
        <p className={`text-xs mt-1.5 md:mt-2 ${isUser ? 'text-white/60' : 'text-gray-500'}`}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
