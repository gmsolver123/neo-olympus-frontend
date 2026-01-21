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
  Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
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
        "p-4 border-t border-void-700/50 bg-void-950/60 backdrop-blur-md relative",
        "transition-all duration-200",
        isDragging && "bg-crystal-500/10 border-crystal-500/50"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-void-950/80 backdrop-blur-sm z-10 rounded-lg border-2 border-dashed border-crystal-500/50">
          <div className="flex flex-col items-center gap-2 text-crystal-400">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Drop files here to upload</span>
            <span className="text-xs text-void-400">Images, documents, audio, video</span>
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

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {/* File Upload */}
        <div className="flex gap-1">
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
            className="p-2"
            title="Attach file (or drag & drop)"
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
            placeholder="Type your message... (Shift+Enter for new line, Ctrl+V to paste images)"
            rows={1}
            className="w-full px-4 py-3 bg-void-800/50 border border-void-700/50 rounded-xl
                     text-void-100 placeholder:text-void-500 resize-none
                     focus:outline-none focus:border-crystal-500/50 focus:ring-1 focus:ring-crystal-500/30
                     transition-all duration-200 backdrop-blur-sm"
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
          'bg-void-800/50 border border-void-700/50',
          file.status === 'error' && 'border-red-500/50'
        )}
      >
        <img
          src={file.localPreviewUrl || file.url}
          alt={file.filename}
          className="w-20 h-20 object-cover"
        />
        
        {/* Upload progress overlay */}
        {file.status === 'uploading' && (
          <div className="absolute inset-0 bg-void-950/70 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 animate-spin text-crystal-400" />
              <span className="text-xs text-void-200">{file.progress}%</span>
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
          className="absolute top-1 right-1 p-1 bg-void-950/80 text-void-300 
                   hover:text-void-100 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Filename tooltip on hover */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-void-950/80 
                      text-xs text-void-300 truncate opacity-0 hover:opacity-100 transition-opacity">
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
        'bg-void-800/50 border border-void-700/50',
        file.status === 'error' && 'border-red-500/50'
      )}
    >
      {file.status === 'uploading' ? (
        <Loader2 className="w-4 h-4 animate-spin text-crystal-400" />
      ) : (
        <div className={clsx(
          "p-1.5 rounded",
          isDocument && "bg-blue-500/20 text-blue-400",
          isVideo && "bg-purple-500/20 text-purple-400",
          isAudio && "bg-green-500/20 text-green-400",
          !isDocument && !isVideo && !isAudio && "bg-void-700/50 text-void-400"
        )}>
          {getIcon()}
        </div>
      )}

      <div className="flex flex-col min-w-0 max-w-[150px]">
        <span className="text-sm text-void-200 truncate">
          {file.filename}
        </span>
        <span className="text-xs text-void-500">
          {fileService.formatFileSize(file.size)}
        </span>
        {file.status === 'uploading' && (
          <div className="w-full h-1 bg-void-700 rounded-full mt-1">
            <div
              className="h-full bg-crystal-500 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
        {file.status === 'error' && (
          <span className="text-xs text-red-400 truncate">{file.error}</span>
        )}
      </div>

      <button
        onClick={onRemove}
        className="p-1 text-void-400 hover:text-void-200 hover:bg-void-700/50 
                 rounded transition-colors ml-auto"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
