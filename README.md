# Neo Olympus Frontend

A modern, responsive frontend for the Neo Olympus multimodal AI chat platform. Built with React, TypeScript, and Tailwind CSS.

![Neo Olympus](https://via.placeholder.com/800x400/0f172a/facc15?text=Neo+Olympus)

## Features

- 🧠 **Smart Model Routing** - Automatic selection of the best AI model for each task
- 🖼️ **Image Analysis** - Upload and analyze images with AI
- 🎤 **Voice Input** - Speech-to-text transcription support
- 🎬 **Video Processing** - Extract audio, transcribe, and summarize videos
- 💬 **Real-time Chat** - WebSocket-based streaming responses
- 🎨 **Beautiful Dark UI** - Modern, responsive design with custom theming
- 💰 **Cost Control** - Token usage tracking and optimization

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Fonts**: Outfit, Syne, JetBrains Mono

## Prerequisites

- Node.js 18+
- npm or yarn
- Neo Olympus Backend API running on `http://localhost:8000`

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd neo-olympus-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Feature Flags
VITE_ENABLE_VOICE_INPUT=true
VITE_ENABLE_VIDEO_UPLOAD=true
```

### 4. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── chat/           # Chat-specific components
│   ├── layout/         # Layout components (Sidebar, Header)
│   └── ui/             # Base UI components (Button, Input, Modal)
├── config/             # Configuration files
├── pages/              # Page components
├── router/             # React Router configuration
├── services/           # API service layer
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Key Components

### Chat Interface
- `ChatInput` - Message input with file upload support
- `MessageList` - Scrollable message container
- `MessageBubble` - Individual message display with media support
- `EmptyState` - Welcome screen for new conversations

### Layout
- `MainLayout` - Main application layout with sidebar
- `Sidebar` - Navigation and conversation list
- `Header` - Top navigation bar

### UI Components
- `Button` - Styled button with variants
- `Input` - Form input with validation
- `Modal` - Reusable modal dialog
- `Toast` - Notification system

## State Management

The app uses Zustand for state management with three main stores:

- **authStore** - User authentication state
- **chatStore** - Conversations and messages
- **uiStore** - UI state (sidebar, modals, toasts)

## API Integration

The frontend communicates with the backend via:

- **REST API** - For CRUD operations
- **WebSocket** - For real-time chat streaming
- **Presigned URLs** - For file uploads to S3

## Theming

The app uses a custom dark theme with gold accents:

- **Primary**: Olympus gold (`#eab308`)
- **Background**: Void dark (`#0f172a`)
- **Surface**: Void lighter shades

Custom CSS classes available:
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- `.input`
- `.card`
- `.glass`
- `.gradient-text`
- `.chat-bubble-user`, `.chat-bubble-assistant`

## Deployment

### Build for production

```bash
npm run build
```

The output will be in the `dist/` directory.

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

---

Built with ⚡ by the Neo Olympus Team
