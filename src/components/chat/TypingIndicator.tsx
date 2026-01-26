import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  modelName?: string;
}

export function TypingIndicator({ modelName }: TypingIndicatorProps) {
  return (
    <div className="flex gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3">
      {/* Avatar */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-accent)]" />
      </div>

      {/* Typing bubble */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-bl-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            {/* Animated dots */}
            <div className="flex gap-1">
              <span 
                className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce"
                style={{ animationDelay: '0ms', animationDuration: '600ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce"
                style={{ animationDelay: '150ms', animationDuration: '600ms' }}
              />
              <span 
                className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-bounce"
                style={{ animationDelay: '300ms', animationDuration: '600ms' }}
              />
            </div>
            <span className="text-sm text-[var(--color-text-tertiary)]">
              {modelName ? `${modelName} is thinking...` : 'AI is thinking...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
