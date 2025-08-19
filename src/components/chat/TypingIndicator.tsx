import { avatarStyles } from '@/lib/styles';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 justify-start mt-6">
      <div className={avatarStyles.ai}>
        AI
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            AI is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}