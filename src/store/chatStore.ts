import { create } from 'zustand';
import type { 
  Conversation, 
  Message, 
  MessageContent, 
  UploadedFile 
} from '../types';
import { chatService, type SendMessageRequest } from '../services/chat';
import { 
  mockConversations, 
  mockMessagesByConversation, 
  mockAIResponses 
} from '../mocks';

// Check if we're in demo mode (no backend)
const DEMO_MODE = true; // Set to false when backend is ready

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

// Helper to simulate streaming
const simulateStreaming = async (
  text: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
  }
  onComplete();
};

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
    
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ conversations: mockConversations, isLoading: false });
      return;
    }

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
    
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const conversation = mockConversations.find(c => c.id === id);
      const messages = mockMessagesByConversation[id] || [];
      set({
        currentConversation: conversation || null,
        messages,
        isLoading: false,
      });
      return;
    }

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
    
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        user_id: 'user-1',
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
      };
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        messages: [],
        isLoading: false,
      }));
      return newConversation;
    }

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
    if (DEMO_MODE) {
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== id),
        currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
        messages: state.currentConversation?.id === id ? [] : state.messages,
      }));
      return;
    }

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
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: allContent,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isSending: true,
      isStreaming: true,
      streamingContent: '',
      pendingFiles: [],
      error: null,
    }));

    if (DEMO_MODE) {
      // Simulate AI response with streaming
      const responseText = mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
      
      // Update conversation title if it's a new conversation
      let conversation = currentConversation;
      if (!conversation) {
        const userText = content.find(c => c.type === 'text')?.text || 'New Chat';
        conversation = {
          id: `conv-${Date.now()}`,
          user_id: 'user-1',
          title: userText.slice(0, 50) + (userText.length > 50 ? '...' : ''),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          message_count: 1,
        };
        set((state) => ({
          conversations: [conversation!, ...state.conversations],
          currentConversation: conversation,
        }));
      }

      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stream the response
      await simulateStreaming(
        responseText,
        (chunk) => {
          set((state) => ({
            streamingContent: state.streamingContent + chunk,
          }));
        },
        () => {
          const assistantMessage: Message = {
            id: `msg-${Date.now()}`,
            conversation_id: conversation!.id,
            role: 'assistant',
            content: [{ type: 'text', text: responseText }],
            model_used: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-pro'][Math.floor(Math.random() * 3)],
            tokens_input: Math.floor(Math.random() * 100) + 50,
            tokens_output: Math.floor(Math.random() * 300) + 100,
            latency_ms: Math.floor(Math.random() * 2000) + 500,
            created_at: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isSending: false,
            isStreaming: false,
            streamingContent: '',
            currentConversation: conversation ? {
              ...conversation,
              message_count: (conversation.message_count || 0) + 2,
              updated_at: new Date().toISOString(),
            } : null,
          }));
        }
      );
      return;
    }

    try {
      const request: SendMessageRequest = {
        conversation_id: currentConversation?.id,
        content: allContent,
      };

      const response = await chatService.sendMessage(request);

      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== userMessage.id),
          { ...userMessage, id: response.message.id },
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
        messages: state.messages.filter((m) => m.id !== userMessage.id),
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
