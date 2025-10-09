export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 p-4 rounded-2xl glass border border-gray-200 w-fit">
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
