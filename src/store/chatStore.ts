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
// Set VITE_DEMO_MODE=true in .env for demo mode
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  supports_vision: boolean;
}

interface FailedMessage {
  content: MessageContent[];
  timestamp: number;
}

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
  
  // Model selection
  availableModels: AIModel[];
  selectedModel: string;
  
  // Retry state
  failedMessage: FailedMessage | null;
  retryCount: number;

  // Conversation actions
  fetchConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  clearCurrentConversation: () => void;

  // Message actions
  sendMessage: (content: MessageContent[]) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  addStreamChunk: (chunk: string) => void;
  completeStream: (message: Message) => void;

  // Model actions
  fetchModels: () => Promise<void>;
  setSelectedModel: (modelId: string) => void;

  // File actions
  addPendingFile: (file: UploadedFile) => void;
  removePendingFile: (fileId: string) => void;
  updatePendingFile: (fileId: string, updates: Partial<UploadedFile>) => void;
  clearPendingFiles: () => void;

  // Error handling
  clearError: () => void;
  clearFailedMessage: () => void;
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

// Default models for demo mode
const defaultModels: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', supports_vision: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', supports_vision: true },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', supports_vision: true },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', supports_vision: true },
  { id: 'grok-beta', name: 'Grok Beta', provider: 'xai', supports_vision: false },
];

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
  
  // Model selection
  availableModels: defaultModels,
  selectedModel: 'gpt-4o-mini',
  
  // Retry state
  failedMessage: null,
  retryCount: 0,

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
    const { currentConversation, pendingFiles, selectedModel } = get();
    
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
      failedMessage: null,
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
            model_used: selectedModel,
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
            failedMessage: null,
            retryCount: 0,
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
        model_preference: selectedModel,
      };

      const response = await chatService.sendMessage(request);

      // The response contains the assistant message
      // Keep our optimistic user message and add the assistant response
      set((state) => ({
        messages: [
          ...state.messages, // Keep the user message we already added
          response.message,  // Add the assistant response
        ],
        currentConversation: response.conversation,
        conversations: state.conversations.some((c) => c.id === response.conversation.id)
          ? state.conversations.map((c) =>
              c.id === response.conversation.id ? response.conversation : c
            )
          : [response.conversation, ...state.conversations],
        isSending: false,
        isStreaming: false,
        failedMessage: null,
        retryCount: 0,
      }));
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMessage.id),
        isSending: false,
        isStreaming: false,
        error: (error as Error).message || 'Failed to send message',
        failedMessage: { content: allContent, timestamp: Date.now() },
      }));
    }
  },

  retryLastMessage: async () => {
    const { failedMessage, retryCount } = get();
    
    if (!failedMessage) return;
    
    // Max 3 retries
    if (retryCount >= 3) {
      set({ error: 'Maximum retry attempts reached. Please try again later.' });
      return;
    }
    
    set((state) => ({ retryCount: state.retryCount + 1, error: null }));
    
    // Retry sending the message
    await get().sendMessage(failedMessage.content);
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

  // Model actions
  fetchModels: async () => {
    if (DEMO_MODE) {
      // Use default models in demo mode
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.neoolympusai.com'}/api/v1/models`);
      if (response.ok) {
        const data = await response.json();
        if (data.models && data.models.length > 0) {
          set({ availableModels: data.models });
        }
      }
    } catch (error) {
      // Keep default models on error
      console.error('Failed to fetch models:', error);
    }
  },

  setSelectedModel: (modelId: string) => {
    set({ selectedModel: modelId });
  },

  clearError: () => set({ error: null }),
  
  clearFailedMessage: () => set({ failedMessage: null, retryCount: 0 }),
}));
