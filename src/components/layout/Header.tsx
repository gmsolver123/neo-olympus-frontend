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
      free: { label: 'Free', className: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]' },
      pro: { label: 'Pro', className: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]' },
      enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    };

    const badge = badges[user.plan];
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border)] 
                      bg-[var(--color-bg)]">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] 
                     hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        {title && (
          <h1 className="text-base sm:text-lg font-medium text-[var(--color-text-primary)] truncate max-w-[150px] sm:max-w-none">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {getPlanBadge()}
        
        {user?.plan === 'free' && (
          <Button variant="primary" size="sm" className="gap-1.5 hidden sm:inline-flex">
            <Sparkles className="w-4 h-4" />
            Upgrade
          </Button>
        )}

        {/* Show icon-only upgrade on mobile */}
        {user?.plan === 'free' && (
          <Button variant="primary" size="sm" className="p-2 sm:hidden">
            <Sparkles className="w-4 h-4" />
          </Button>
        )}

        {/* Hide on small screens, show on medium+ */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] 
                      border border-[var(--color-border)]">
          <Zap className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">Smart</span> routing
          </span>
        </div>
      </div>
    </header>
  );
}
