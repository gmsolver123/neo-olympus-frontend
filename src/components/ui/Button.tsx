import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium
      transition-all duration-150 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      rounded-lg
    `;

    const variants = {
      primary: `
        bg-[var(--color-accent)] text-white
        hover:bg-[var(--color-accent-hover)]
        focus:ring-[var(--color-accent)]
        focus:ring-offset-[var(--color-bg)]
      `,
      secondary: `
        bg-[var(--color-surface)] text-[var(--color-text-primary)]
        hover:bg-[var(--color-surface-hover)]
        focus:ring-[var(--color-accent)]
        focus:ring-offset-[var(--color-bg)]
        border border-[var(--color-border)]
      `,
      ghost: `
        bg-transparent text-[var(--color-text-secondary)]
        hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]
        focus:ring-[var(--color-accent)]
        focus:ring-offset-[var(--color-bg)]
      `,
      danger: `
        bg-[var(--color-error)] text-white
        hover:bg-red-600
        focus:ring-[var(--color-error)]
        focus:ring-offset-[var(--color-bg)]
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
