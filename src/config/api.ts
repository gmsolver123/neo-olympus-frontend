// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.neoolympusai.com',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://api.neoolympusai.com',
  TIMEOUT: 30000,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
  ],
} as const;

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
  },
  // Conversations
  CONVERSATIONS: {
    LIST: '/api/v1/conversations',
    CREATE: '/api/v1/conversations',
    GET: (id: string) => `/api/v1/conversations/${id}`,
    DELETE: (id: string) => `/api/v1/conversations/${id}`,
    MESSAGES: (id: string) => `/api/v1/conversations/${id}/messages`,
  },
  // Chat
  CHAT: {
    SEND: '/api/v1/chat/send',
    STREAM: '/api/v1/chat/stream',
  },
  // Files - Direct upload to VPS
  FILES: {
    UPLOAD: '/api/v1/files/upload',
    GET: (id: string) => `/api/v1/files/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/files/${id}/download`,
    DELETE: (id: string) => `/api/v1/files/${id}`,
  },
  // Models
  MODELS: {
    LIST: '/api/v1/models',
    GET: (id: string) => `/api/v1/models/${id}`,
  },
  // WebSocket
  WS: {
    CHAT: '/ws/chat',
  },
} as const;
