import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChatStore } from '../../store/chatStore';
import { Loader2 } from 'lucide-react';

export function MessageList() {
  const { messages, isStreaming, streamingContent, isLoading } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-2 sm:py-4 px-2 sm:px-0">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
            streamingContent={isStreaming && index === messages.length - 1 ? streamingContent : undefined}
          />
        ))}

        {/* Streaming message placeholder */}
        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <MessageBubble
            message={{
              id: 'streaming',
              conversation_id: '',
              role: 'assistant',
              content: [],
              created_at: new Date().toISOString(),
            }}
            isStreaming
            streamingContent={streamingContent}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
