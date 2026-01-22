import { useState } from 'react';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown,
  Play,
  Pause,
  FileText,
  Volume2
} from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, MessageContent } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
}

export function MessageBubble({ message, isStreaming, streamingContent }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const textContent = message.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');

    await navigator.clipboard.writeText(textContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const displayContent = isStreaming ? streamingContent : null;

  return (
    <div
      className={clsx(
        'flex gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-[var(--color-accent)]'
            : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-accent)]" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={clsx(
          'flex flex-col gap-2 min-w-0',
          isUser 
            ? 'max-w-[85%] sm:max-w-[75%] items-end' 
            : 'flex-1 items-start'
        )}
      >
        {/* Media Content */}
        {message.content
          .filter((c) => c.type !== 'text')
          .map((content, idx) => (
            <MediaContent key={idx} content={content} />
          ))}

        {/* Text Content */}
        {(message.content.some((c) => c.type === 'text') || displayContent) && (
          <div
            className={clsx(
              'px-3 py-2 sm:px-4 sm:py-3 rounded-2xl',
              isUser
                ? 'bg-[var(--color-accent)] text-white rounded-br-md'
                : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-md'
            )}
          >
            <div className={clsx(
              "prose prose-sm max-w-none break-words",
              isUser 
                ? "prose-invert prose-p:text-white prose-strong:text-white prose-em:text-white/90" 
                : "prose-p:text-[var(--color-text-primary)] prose-strong:text-[var(--color-text-primary)] prose-em:text-[var(--color-text-secondary)]",
              "prose-p:my-1 sm:prose-p:my-2 prose-p:leading-relaxed",
              "prose-code:text-[var(--color-accent)] prose-code:bg-[var(--color-bg-tertiary)] prose-code:px-1 sm:prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-code:break-all",
              "prose-pre:bg-[var(--color-bg-tertiary)] prose-pre:border prose-pre:border-[var(--color-border)] prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm",
              "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5",
              "prose-headings:text-[var(--color-text-primary)] prose-headings:font-semibold",
              "prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline prose-a:break-all",
              "prose-blockquote:border-[var(--color-accent)] prose-blockquote:text-[var(--color-text-secondary)]",
              "[&>*]:text-sm sm:[&>*]:text-base"
            )}>
              {isUser ? (
                displayContent || message.content
                  .filter((c) => c.type === 'text')
                  .map((c) => c.text)
                  .join('\n')
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {displayContent || message.content
                    .filter((c) => c.type === 'text')
                    .map((c) => c.text)
                    .join('\n')}
                </ReactMarkdown>
              )}
              
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-[var(--color-accent)] ml-1 animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* Message Actions */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton
              icon={isCopied ? Check : Copy}
              onClick={handleCopy}
              label="Copy"
            />
            <ActionButton icon={RefreshCw} onClick={() => {}} label="Regenerate" />
            <ActionButton icon={ThumbsUp} onClick={() => {}} label="Good response" />
            <ActionButton icon={ThumbsDown} onClick={() => {}} label="Bad response" />
          </div>
        )}

        {/* Message Metadata */}
        {!isUser && message.model_used && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <span className="text-[var(--color-accent)]">{message.model_used}</span>
            {message.tokens_output && (
              <>
                <span>•</span>
                <span>{message.tokens_output} tokens</span>
              </>
            )}
            {message.latency_ms && (
              <>
                <span>•</span>
                <span>{message.latency_ms}ms</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MediaContentProps {
  content: MessageContent;
}

function MediaContent({ content }: MediaContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (content.type === 'image') {
    return (
      <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)]">
        <img
          src={content.url || content.thumbnail_url}
          alt={content.filename || 'Image'}
          className="max-w-full sm:max-w-sm max-h-48 sm:max-h-64 object-cover"
        />
        {content.filename && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 
                        bg-gradient-to-t from-black/80 to-transparent">
            <span className="text-xs text-white">{content.filename}</span>
          </div>
        )}
      </div>
    );
  }

  if (content.type === 'audio') {
    return (
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
                    bg-[var(--color-bg-secondary)] border border-[var(--color-border)] min-w-[200px] sm:min-w-[250px]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-[var(--color-accent-light)]
                   flex items-center justify-center text-[var(--color-accent)] 
                   hover:bg-[var(--color-accent)] hover:text-white transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <p className="text-sm text-[var(--color-text-primary)] truncate">{content.filename || 'Audio'}</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : '--:--'}
          </p>
        </div>
        <Volume2 className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </div>
    );
  }

  if (content.type === 'video') {
    return (
      <div className="relative rounded-lg overflow-hidden border border-[var(--color-border)]">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.filename || 'Video thumbnail'}
            className="max-w-full sm:max-w-sm max-h-48 sm:max-h-64 object-cover"
          />
        ) : (
          <div className="w-full sm:w-64 h-32 sm:h-36 bg-[var(--color-bg-tertiary)] flex items-center justify-center">
            <FileText className="w-8 h-8 text-[var(--color-text-tertiary)]" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="w-12 h-12 rounded-full bg-black/60
                     flex items-center justify-center text-white 
                     hover:bg-black/80 transition-colors"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        {content.filename && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 
                        bg-gradient-to-t from-black/80 to-transparent">
            <span className="text-xs text-white">{content.filename}</span>
          </div>
        )}
      </div>
    );
  }

  // Generic file
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg 
                  bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
      <FileText className="w-5 h-5 text-[var(--color-text-tertiary)]" />
      <span className="text-sm text-[var(--color-text-primary)]">{content.filename || 'File'}</span>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  label: string;
}

function ActionButton({ icon: Icon, onClick, label }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] 
               hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
