import { useState, useRef, type KeyboardEvent } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image, 
  Film, 
  X,
  Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { fileService } from '../../services/files';
import type { UploadedFile } from '../../types';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    sendMessage, 
    isSending, 
    pendingFiles, 
    addPendingFile, 
    removePendingFile,
    updatePendingFile 
  } = useChatStore();
  const { addToast } = useUIStore();

  const handleSubmit = async () => {
    if ((!message.trim() && pendingFiles.length === 0) || isSending) return;

    try {
      await sendMessage([{ type: 'text', text: message.trim() }]);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to send message',
        message: (error as Error).message,
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!fileService.isAllowedType(file.type)) {
        addToast({
          type: 'error',
          title: 'Invalid file type',
          message: `${file.name} is not a supported file type`,
        });
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const pendingFile: UploadedFile = {
        id: tempId,
        url: '',
        filename: file.name,
        content_type: file.type,
        size: file.size,
        status: 'uploading',
        progress: 0,
      };

      addPendingFile(pendingFile);

      try {
        const uploadedFile = await fileService.uploadFile(file, (progress) => {
          updatePendingFile(tempId, { progress });
        });

        updatePendingFile(tempId, {
          id: uploadedFile.id,
          url: uploadedFile.url,
          status: 'ready',
          progress: 100,
        });
      } catch (error) {
        updatePendingFile(tempId, {
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement audio recording
  };

  return (
    <div className="p-4 border-t border-void-800 bg-void-950/50 backdrop-blur-sm">
      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pendingFiles.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => removePendingFile(file.id)}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* File Upload */}
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="p-2"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            className="w-full px-4 py-3 bg-void-800/50 border border-void-700 rounded-xl
                     text-void-100 placeholder:text-void-500 resize-none
                     focus:outline-none focus:border-olympus-500/50 focus:ring-1 focus:ring-olympus-500/30
                     transition-all duration-200"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
        </div>

        {/* Voice Recording */}
        <Button
          variant={isRecording ? 'danger' : 'ghost'}
          size="sm"
          onClick={toggleRecording}
          className="p-2"
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* Send Button */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={(!message.trim() && pendingFiles.length === 0) || isSending}
          isLoading={isSending}
          className="p-3"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          Recording...
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
}

function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.content_type.startsWith('image/');
  const isVideo = file.content_type.startsWith('video/');

  const getIcon = () => {
    if (isImage) return <Image className="w-4 h-4" />;
    if (isVideo) return <Film className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  return (
    <div
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-void-800/50 border border-void-700',
        file.status === 'error' && 'border-red-500/50'
      )}
    >
      {file.status === 'uploading' ? (
        <Loader2 className="w-4 h-4 animate-spin text-olympus-400" />
      ) : (
        getIcon()
      )}

      <div className="flex flex-col min-w-0">
        <span className="text-sm text-void-200 truncate max-w-[150px]">
          {file.filename}
        </span>
        {file.status === 'uploading' && (
          <div className="w-full h-1 bg-void-700 rounded-full mt-1">
            <div
              className="h-full bg-olympus-500 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
        {file.status === 'error' && (
          <span className="text-xs text-red-400">{file.error}</span>
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-1 text-void-400 hover:text-void-200 hover:bg-void-700 
                 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
