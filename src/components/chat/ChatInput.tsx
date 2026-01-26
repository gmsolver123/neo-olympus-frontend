import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type DragEvent } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image, 
  Film, 
  X,
  Loader2,
  FileText,
  Upload,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { ModelSelector } from './ModelSelector';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { fileService } from '../../services/files';
import type { UploadedFile } from '../../types';
import { API_CONFIG } from '../../config/api';

export function ChatInput() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { 
    sendMessage, 
    isSending, 
    pendingFiles, 
    addPendingFile, 
    removePendingFile,
    updatePendingFile,
    availableModels,
    selectedModel,
    setSelectedModel,
    fetchModels,
    failedMessage,
    retryLastMessage,
    clearFailedMessage,
    retryCount,
    error
  } = useChatStore();
  const { addToast } = useUIStore();

  // Fetch available models on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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

  const processFiles = useCallback(async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      if (!fileService.isAllowedType(file.type)) {
        addToast({
          type: 'error',
          title: 'Invalid file type',
          message: `${file.name} is not a supported file type`,
        });
        continue;
      }

      if (file.size > API_CONFIG.MAX_FILE_SIZE) {
        addToast({
          type: 'error',
          title: 'File too large',
          message: `${file.name} exceeds the ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        });
        continue;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create local preview URL for images
      let localPreviewUrl: string | undefined;
      if (file.type.startsWith('image/')) {
        localPreviewUrl = URL.createObjectURL(file);
      }

      const pendingFile: UploadedFile = {
        id: tempId,
        url: '',
        filename: file.name,
        content_type: file.type,
        size: file.size,
        status: 'uploading',
        progress: 0,
        localPreviewUrl,
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
  }, [addPendingFile, updatePendingFile, addToast]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    await processFiles(files);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the drop zone entirely
    const relatedTarget = e.relatedTarget as Node | null;
    if (!dropZoneRef.current?.contains(relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [processFiles]);

  // Handle paste events for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await processFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement audio recording
  };

  return (
    <div 
      ref={dropZoneRef}
      className={clsx(
        "p-3 sm:p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] relative safe-area-bottom",
        "transition-all duration-200",
        isDragging && "bg-[var(--color-accent-light)] border-[var(--color-accent)]"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]/80 z-10 rounded-lg border-2 border-dashed border-[var(--color-accent)]">
          <div className="flex flex-col items-center gap-2 text-[var(--color-accent)]">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Drop files here to upload</span>
            <span className="text-xs text-[var(--color-text-tertiary)]">Images, documents, audio, video</span>
          </div>
        </div>
      )}

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pendingFiles.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              onRemove={() => {
                // Revoke local preview URL when removing
                if (file.localPreviewUrl) {
                  URL.revokeObjectURL(file.localPreviewUrl);
                }
                removePendingFile(file.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Error/Retry Banner */}
      {failedMessage && (
        <div className="mb-3 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Message failed to send.{retryCount > 0 && ` (Attempt ${retryCount}/3)`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFailedMessage}
              className="text-xs"
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={retryLastMessage}
              disabled={isSending || retryCount >= 3}
              className="text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Model Selector Row */}
      <div className="flex items-center gap-2 mb-2">
        <ModelSelector
          models={availableModels}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
          disabled={isSending}
          compact
        />
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept={fileService.getAcceptedTypes()}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 flex-shrink-0"
          title="Attach file (or drag & drop)"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-3 sm:px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl
                     text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] resize-none
                     focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]
                     transition-all duration-200 text-sm sm:text-base"
            style={{ minHeight: '40px', maxHeight: '200px' }}
          />
        </div>

        {/* Voice Recording - hide on very small screens */}
        <Button
          variant={isRecording ? 'danger' : 'ghost'}
          size="sm"
          onClick={toggleRecording}
          className="p-2 hidden sm:flex flex-shrink-0"
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
          className="p-2.5 sm:p-3 flex-shrink-0"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mt-2 text-[var(--color-error)] text-sm animate-pulse">
          <div className="w-2 h-2 bg-[var(--color-error)] rounded-full" />
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
  const isAudio = file.content_type.startsWith('audio/');
  const isDocument = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
  ].includes(file.content_type);

  const getIcon = () => {
    if (isImage) return <Image className="w-4 h-4" />;
    if (isVideo) return <Film className="w-4 h-4" />;
    if (isDocument) return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  // For images, show a thumbnail preview
  if (isImage && (file.localPreviewUrl || file.url)) {
    return (
      <div
        className={clsx(
          'relative rounded-lg overflow-hidden',
          'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
          file.status === 'error' && 'border-[var(--color-error)]'
        )}
      >
        <img
          src={file.localPreviewUrl || file.url}
          alt={file.filename}
          className="w-20 h-20 object-cover"
        />
        
        {/* Upload progress overlay */}
        {file.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span className="text-xs text-white">{file.progress}%</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {file.status === 'error' && (
          <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
            <span className="text-xs text-red-300 px-1 text-center">{file.error}</span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-1 bg-black/60 text-white 
                   hover:bg-black/80 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Filename tooltip on hover */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 
                      text-xs text-white truncate opacity-0 hover:opacity-100 transition-opacity">
          {file.filename}
        </div>
      </div>
    );
  }

  // For non-image files, show icon + name
  return (
    <div
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg',
        'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
        file.status === 'error' && 'border-[var(--color-error)]'
      )}
    >
      {file.status === 'uploading' ? (
        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
      ) : (
        <div className={clsx(
          "p-1.5 rounded",
          isDocument && "bg-blue-500/20 text-blue-500",
          isVideo && "bg-purple-500/20 text-purple-500",
          isAudio && "bg-green-500/20 text-green-500",
          !isDocument && !isVideo && !isAudio && "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
        )}>
          {getIcon()}
        </div>
      )}

      <div className="flex flex-col min-w-0 max-w-[150px]">
        <span className="text-sm text-[var(--color-text-primary)] truncate">
          {file.filename}
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {fileService.formatFileSize(file.size)}
        </span>
        {file.status === 'uploading' && (
          <div className="w-full h-1 bg-[var(--color-border)] rounded-full mt-1">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
        {file.status === 'error' && (
          <span className="text-xs text-[var(--color-error)] truncate">{file.error}</span>
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] 
                 hover:bg-[var(--color-surface-hover)] rounded transition-colors ml-auto"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
