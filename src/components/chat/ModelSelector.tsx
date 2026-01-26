import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, Brain, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface Model {
  id: string;
  name: string;
  provider: string;
  supports_vision: boolean;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: Sparkles,
  xai: Zap,
  anthropic: Brain,
};

const providerColors: Record<string, string> = {
  openai: 'text-green-500',
  xai: 'text-blue-500',
  anthropic: 'text-orange-500',
};

export function ModelSelector({ 
  models, 
  selectedModel, 
  onSelect, 
  disabled = false,
  compact = false 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModelData = models.find(m => m.id === selectedModel);
  const SelectedIcon = selectedModelData 
    ? providerIcons[selectedModelData.provider] || Sparkles 
    : Sparkles;

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const providerOrder = ['openai', 'anthropic', 'xai'];
  const sortedProviders = Object.keys(groupedModels).sort(
    (a, b) => providerOrder.indexOf(a) - providerOrder.indexOf(b)
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "flex items-center gap-1.5 rounded-lg transition-colors",
          compact 
            ? "px-2 py-1 text-xs" 
            : "px-3 py-1.5 text-sm",
          "bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
          "hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)]",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-[var(--color-accent)]"
        )}
      >
        <SelectedIcon className={clsx(
          compact ? "w-3 h-3" : "w-3.5 h-3.5",
          selectedModelData && providerColors[selectedModelData.provider]
        )} />
        <span className="text-[var(--color-text-primary)] truncate max-w-[120px]">
          {selectedModelData?.name || 'Select model'}
        </span>
        <ChevronDown className={clsx(
          compact ? "w-3 h-3" : "w-3.5 h-3.5",
          "text-[var(--color-text-tertiary)] transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {sortedProviders.map((provider, idx) => {
              const Icon = providerIcons[provider] || Sparkles;
              const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
              
              return (
                <div key={provider}>
                  {idx > 0 && (
                    <div className="h-px bg-[var(--color-border)] my-1" />
                  )}
                  <div className="px-3 py-1.5 flex items-center gap-2">
                    <Icon className={clsx("w-3.5 h-3.5", providerColors[provider])} />
                    <span className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      {providerLabel}
                    </span>
                  </div>
                  {groupedModels[provider].map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                      }}
                      className={clsx(
                        "w-full px-3 py-2 flex items-center justify-between",
                        "text-sm text-[var(--color-text-primary)]",
                        "hover:bg-[var(--color-surface-hover)]",
                        selectedModel === model.id && "bg-[var(--color-accent-light)]"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span>{model.name}</span>
                        {model.supports_vision && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
                            Vision
                          </span>
                        )}
                      </span>
                      {selectedModel === model.id && (
                        <Check className="w-4 h-4 text-[var(--color-accent)]" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
