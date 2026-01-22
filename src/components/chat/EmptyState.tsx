import { 
  Image, 
  Mic, 
  Film, 
  Sparkles,
  Brain,
  Gauge,
  Wallet
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';

export function EmptyState() {
  const navigate = useNavigate();
  const { createConversation } = useChatStore();

  const handleStartChat = async () => {
    const conversation = await createConversation();
    navigate(`/chat/${conversation.id}`);
  };

  const capabilities = [
    {
      icon: Brain,
      title: 'Smart Routing',
      description: 'Automatically selects the best AI model for each task',
    },
    {
      icon: Image,
      title: 'Image Analysis',
      description: 'Upload images for Q&A, descriptions, and insights',
    },
    {
      icon: Mic,
      title: 'Voice Input',
      description: 'Speak naturally with speech-to-text transcription',
    },
    {
      icon: Film,
      title: 'Video Processing',
      description: 'Extract audio, transcribe, and summarize videos',
    },
    {
      icon: Gauge,
      title: 'Cost Control',
      description: 'Optimize token usage and track spending',
    },
    {
      icon: Wallet,
      title: 'Flexible Plans',
      description: 'Free tier with open-source models available',
    },
  ];

  const suggestions = [
    { emoji: '📝', text: 'Help me write a professional email' },
    { emoji: '🎨', text: 'Analyze this image and describe what you see' },
    { emoji: '🎬', text: 'Summarize this video for me' },
    { emoji: '💻', text: 'Explain this code and suggest improvements' },
    { emoji: '📊', text: 'Help me analyze this data' },
    { emoji: '🌍', text: 'Translate this text to multiple languages' },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full space-y-6 sm:space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl 
                        bg-[var(--color-accent)] mb-2 sm:mb-4">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-[var(--color-text-primary)]">
            Welcome to Neo Olympus
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto px-2">
            Your intelligent multimodal AI assistant that automatically chooses 
            the best model and approach for every task.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] 
                       hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]
                       transition-all duration-200 group"
            >
              <cap.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-accent)] mb-2 sm:mb-3 
                                 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="font-medium text-[var(--color-text-primary)] mb-1 text-sm sm:text-base">{cap.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)]">{cap.description}</p>
            </div>
          ))}
        </div>

        {/* Suggestions - Hide on very small screens, show fewer on mobile */}
        <div className="space-y-3 hidden sm:block">
          <p className="text-sm text-[var(--color-text-tertiary)] text-center">Try asking about...</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={handleStartChat}
                className="px-3 sm:px-4 py-2 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
                         text-xs sm:text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]
                         hover:bg-[var(--color-surface-hover)] transition-all duration-200"
              >
                {suggestion.emoji} {suggestion.text}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartChat}
            leftIcon={<Sparkles className="w-5 h-5" />}
          >
            Start a new conversation
          </Button>
        </div>
      </div>
    </div>
  );
}
