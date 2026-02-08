export const TypingIndicator = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-primary-accent dark:bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary-accent dark:bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary-accent dark:bg-dark-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
};
