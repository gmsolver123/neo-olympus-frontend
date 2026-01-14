import { ENDPOINTS } from '../config/api';
import type { 
  Conversation, 
  ConversationWithMessages, 
  Message, 
  MessageContent,
  PaginatedResponse 
} from '../types';
import { apiDelete, apiGet, apiPost } from './api';

export interface SendMessageRequest {
  conversation_id?: string;
  content: MessageContent[];
  model_preference?: string;
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

export const chatService = {
  // Conversations
  async getConversations(page = 1, pageSize = 20): Promise<PaginatedResponse<Conversation>> {
    return apiGet<PaginatedResponse<Conversation>>(ENDPOINTS.CONVERSATIONS.LIST, {
      page,
      page_size: pageSize,
    });
  },

  async getConversation(id: string): Promise<ConversationWithMessages> {
    return apiGet<ConversationWithMessages>(ENDPOINTS.CONVERSATIONS.GET(id));
  },

  async createConversation(title?: string): Promise<Conversation> {
    return apiPost<Conversation>(ENDPOINTS.CONVERSATIONS.CREATE, { title });
  },

  async deleteConversation(id: string): Promise<void> {
    return apiDelete(ENDPOINTS.CONVERSATIONS.DELETE(id));
  },

  // Messages
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    return apiPost<SendMessageResponse>(ENDPOINTS.CHAT.SEND, request);
  },

  async getMessages(conversationId: string, page = 1, pageSize = 50): Promise<PaginatedResponse<Message>> {
    return apiGet<PaginatedResponse<Message>>(ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), {
      page,
      page_size: pageSize,
    });
  },
};
