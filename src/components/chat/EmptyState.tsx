import { 
  Zap, 
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
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                        bg-gradient-to-br from-olympus-400 to-olympus-600 
                        shadow-glow-lg mb-4">
            <Zap className="w-8 h-8 text-void-950" />
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text">
            Welcome to Neo Olympus
          </h1>
          <p className="text-lg text-void-400 max-w-xl mx-auto">
            Your intelligent multimodal AI assistant that automatically chooses 
            the best model and approach for every task.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-void-900/40 border border-void-800 
                       hover:border-olympus-500/30 hover:bg-void-900/60
                       transition-all duration-200 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <cap.icon className="w-6 h-6 text-olympus-400 mb-3 
                                 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-void-200 mb-1">{cap.title}</h3>
              <p className="text-sm text-void-500">{cap.description}</p>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <p className="text-sm text-void-500 text-center">Try asking about...</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={handleStartChat}
                className="px-4 py-2 rounded-full bg-void-800/50 border border-void-700
                         text-sm text-void-300 hover:text-void-100 hover:border-olympus-500/30
                         hover:bg-void-800 transition-all duration-200"
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
