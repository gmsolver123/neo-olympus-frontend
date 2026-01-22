import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, resolvedTheme } = useThemeStore();

  // Simple toggle button
  if (!showLabel) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors ${className}`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-[var(--color-text-secondary)]" />
        ) : (
          <Moon className="w-5 h-5 text-[var(--color-text-secondary)]" />
        )}
      </button>
    );
  }

  // Dropdown with all options
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider px-2">
        Theme
      </span>
      <div className="flex gap-1 p-1 bg-[var(--color-bg-tertiary)] rounded-lg">
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            theme === 'light'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Sun className="w-4 h-4" />
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            theme === 'dark'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Moon className="w-4 h-4" />
          Dark
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            theme === 'system'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Monitor className="w-4 h-4" />
          System
        </button>
      </div>
    </div>
  );
}
