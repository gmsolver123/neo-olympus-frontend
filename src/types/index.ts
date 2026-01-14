// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ============================================================================
// Chat & Conversation Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'file';

export interface MessageContent {
  type: ContentType;
  text?: string;
  url?: string;
  filename?: string;
  mime_type?: string;
  thumbnail_url?: string;
  duration?: number; // For audio/video in seconds
  transcription?: string; // For audio/video
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: MessageContent[];
  model_used?: string;
  prompt_used?: string;
  tokens_input?: number;
  tokens_output?: number;
  cost?: number;
  latency_ms?: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model_preference?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview?: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

// ============================================================================
// Model & Router Types
// ============================================================================

export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'xai' | 'meta' | 'deepseek' | 'local';

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  supports_vision: boolean;
  supports_audio: boolean;
  supports_video: boolean;
  max_tokens: number;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  is_free: boolean;
  quality_score: number;
  latency_score: number;
}

export interface RouterDecision {
  selected_model: string;
  selected_prompt: string;
  estimated_tokens: number;
  estimated_cost: number;
  reasoning: string;
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface PresignedUrlRequest {
  filename: string;
  content_type: string;
  size: number;
}

export interface PresignedUrlResponse {
  upload_url: string;
  file_url: string;
  file_id: string;
  expires_in: number;
}

export interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  content_type: string;
  size: number;
  thumbnail_url?: string;
  transcription?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export type WSMessageType = 
  | 'chat_start'
  | 'chat_chunk'
  | 'chat_end'
  | 'error'
  | 'processing_status'
  | 'transcription_progress';

export interface WSMessage {
  type: WSMessageType;
  conversation_id?: string;
  message_id?: string;
  content?: string;
  error?: string;
  progress?: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type: 'settings' | 'new-chat' | 'upload' | 'confirm' | null;
  data?: unknown;
}
