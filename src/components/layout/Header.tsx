import { Menu, Sparkles, Zap } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface HeaderProps {
  title?: string;
  showMenuButton?: boolean;
}

export function Header({ title, showMenuButton = true }: HeaderProps) {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const getPlanBadge = () => {
    if (!user) return null;
    
    const badges = {
      free: { label: 'Free', color: 'bg-void-700 text-void-300' },
      pro: { label: 'Pro', color: 'bg-olympus-500/20 text-olympus-400 border border-olympus-500/30' },
      enterprise: { label: 'Enterprise', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    };

    const badge = badges[user.plan];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-void-800 
                      bg-void-950/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-void-400 hover:text-void-200 hover:bg-void-800 
                     rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {title && (
          <h1 className="text-lg font-semibold text-void-100 font-display">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {getPlanBadge()}
        
        {user?.plan === 'free' && (
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Sparkles className="w-4 h-4 text-olympus-400" />
            Upgrade
          </Button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void-800/50 
                      border border-void-700">
          <Zap className="w-4 h-4 text-olympus-400" />
          <span className="text-sm text-void-300">
            <span className="font-medium text-void-100">Smart</span> routing
          </span>
        </div>
      </div>
    </header>
  );
}
