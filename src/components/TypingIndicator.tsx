export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 p-4 rounded-2xl glass w-fit">
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
