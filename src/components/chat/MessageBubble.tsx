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
        'flex gap-3 px-4 py-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-olympus-400 to-olympus-600'
            : 'bg-gradient-to-br from-void-600 to-void-800 border border-void-600'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-void-950" />
        ) : (
          <Bot className="w-4 h-4 text-olympus-400" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={clsx(
          'max-w-[75%] flex flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
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
              'px-4 py-3 rounded-2xl',
              isUser
                ? 'bg-olympus-500/20 border border-olympus-500/30 text-void-100 rounded-br-md'
                : 'bg-void-800/80 border border-void-700 text-void-100 rounded-bl-md'
            )}
          >
            <div className="prose prose-invert prose-sm max-w-none">
              {displayContent || message.content
                .filter((c) => c.type === 'text')
                .map((c) => c.text)
                .join('\n')}
              
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-olympus-400 ml-1 animate-typing" />
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
          <div className="flex items-center gap-2 text-xs text-void-500">
            <span>{message.model_used}</span>
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
      <div className="relative rounded-lg overflow-hidden border border-void-700">
        <img
          src={content.url || content.thumbnail_url}
          alt={content.filename || 'Image'}
          className="max-w-sm max-h-64 object-cover"
        />
        {content.filename && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 
                        bg-gradient-to-t from-void-950/90 to-transparent">
            <span className="text-xs text-void-300">{content.filename}</span>
          </div>
        )}
      </div>
    );
  }

  if (content.type === 'audio') {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg 
                    bg-void-800/50 border border-void-700 min-w-[250px]">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-olympus-500/20 border border-olympus-500/30
                   flex items-center justify-center text-olympus-400 
                   hover:bg-olympus-500/30 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <p className="text-sm text-void-200 truncate">{content.filename || 'Audio'}</p>
          <p className="text-xs text-void-500">
            {content.duration ? `${Math.floor(content.duration / 60)}:${(content.duration % 60).toString().padStart(2, '0')}` : '--:--'}
          </p>
        </div>
        <Volume2 className="w-4 h-4 text-void-500" />
      </div>
    );
  }

  if (content.type === 'video') {
    return (
      <div className="relative rounded-lg overflow-hidden border border-void-700">
        {content.thumbnail_url ? (
          <img
            src={content.thumbnail_url}
            alt={content.filename || 'Video thumbnail'}
            className="max-w-sm max-h-64 object-cover"
          />
        ) : (
          <div className="w-64 h-36 bg-void-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-void-500" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="w-12 h-12 rounded-full bg-void-950/80 border border-void-600
                     flex items-center justify-center text-void-200 
                     hover:bg-void-950/90 transition-colors"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        {content.filename && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 
                        bg-gradient-to-t from-void-950/90 to-transparent">
            <span className="text-xs text-void-300">{content.filename}</span>
          </div>
        )}
      </div>
    );
  }

  // Generic file
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg 
                  bg-void-800/50 border border-void-700">
      <FileText className="w-5 h-5 text-void-400" />
      <span className="text-sm text-void-200">{content.filename || 'File'}</span>
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
      className="p-1.5 text-void-500 hover:text-void-200 hover:bg-void-800 
               rounded-lg transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
