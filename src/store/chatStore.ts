import { create } from 'zustand';
import type { 
  Conversation, 
  Message, 
  MessageContent, 
  UploadedFile 
} from '../types';
import { chatService, type SendMessageRequest } from '../services/chat';

interface ChatStore {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isStreaming: boolean;
  streamingContent: string;
  pendingFiles: UploadedFile[];
  error: string | null;

  // Conversation actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  clearCurrentConversation: () => void;

  // Message actions
  sendMessage: (content: MessageContent[]) => Promise<void>;
  addStreamChunk: (chunk: string) => void;
  completeStream: (message: Message) => void;

  // File actions
  addPendingFile: (file: UploadedFile) => void;
  removePendingFile: (fileId: string) => void;
  updatePendingFile: (fileId: string, updates: Partial<UploadedFile>) => void;
  clearPendingFiles: () => void;

  // Error handling
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  isStreaming: false,
  streamingContent: '',
  pendingFiles: [],
  error: null,

  // Conversation actions
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatService.getConversations();
      set({ conversations: response.items, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message || 'Failed to fetch conversations' 
      });
    }
  },

  selectConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await chatService.getConversation(id);
      set({
        currentConversation: conversation,
        messages: conversation.messages,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message || 'Failed to load conversation' 
      });
    }
  },

  createConversation: async (title?: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await chatService.createConversation(title);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
        isLoading: false,
      }));
      return conversation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: (error as Error).message || 'Failed to create conversation' 
      });
      throw error;
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        messages: state.currentConversation?.id === id ? [] : state.messages,
      }));
    } catch (error) {
      set({ error: (error as Error).message || 'Failed to delete conversation' });
    }
  },

  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      messages: [],
      pendingFiles: [],
    });
  },

  // Message actions
  sendMessage: async (content: MessageContent[]) => {
    const { currentConversation, pendingFiles } = get();
    
    // Add file content from pending files
    const fileContent: MessageContent[] = pendingFiles
      .filter((f) => f.status === 'ready')
      .map((f) => ({
        type: f.content_type.startsWith('image/') ? 'image' as const :
              f.content_type.startsWith('audio/') ? 'audio' as const :
              f.content_type.startsWith('video/') ? 'video' as const : 'file' as const,
        url: f.url,
        filename: f.filename,
        mime_type: f.content_type,
      }));

    const allContent = [...fileContent, ...content];

    // Create optimistic user message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: allContent,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
      isSending: true,
      isStreaming: true,
      streamingContent: '',
      pendingFiles: [],
      error: null,
    }));

    try {
      const request: SendMessageRequest = {
        conversation_id: currentConversation?.id,
        content: allContent,
      };

      const response = await chatService.sendMessage(request);

      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== optimisticMessage.id),
          { ...optimisticMessage, id: response.message.id },
        ],
        currentConversation: response.conversation,
        conversations: state.conversations.map((c) =>
          c.id === response.conversation.id ? response.conversation : c
        ),
        isSending: false,
      }));

      // If this was a new conversation, add it to the list
      if (!currentConversation) {
        set((state) => ({
          conversations: [response.conversation, ...state.conversations],
        }));
      }
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== optimisticMessage.id),
        isSending: false,
        isStreaming: false,
        error: (error as Error).message || 'Failed to send message',
      }));
    }
  },

  addStreamChunk: (chunk: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    }));
  },

  completeStream: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
      isStreaming: false,
      streamingContent: '',
    }));
  },

  // File actions
  addPendingFile: (file: UploadedFile) => {
    set((state) => ({
      pendingFiles: [...state.pendingFiles, file],
    }));
  },

  removePendingFile: (fileId: string) => {
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((f) => f.id !== fileId),
    }));
  },

  updatePendingFile: (fileId: string, updates: Partial<UploadedFile>) => {
    set((state) => ({
      pendingFiles: state.pendingFiles.map((f) =>
        f.id === fileId ? { ...f, ...updates } : f
      ),
    }));
  },

  clearPendingFiles: () => {
    set({ pendingFiles: [] });
  },

  clearError: () => set({ error: null }),
}));
