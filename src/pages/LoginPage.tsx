import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { OAuthButtons } from '../components/auth';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginDemo, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      addToast({
        type: 'error',
        title: 'Authentication failed',
        message: oauthError,
      });
    } else if (token && refreshToken) {
      // OAuth successful - tokens are in URL
      // Store tokens and redirect
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/chat');
      addToast({
        type: 'success',
        title: 'Welcome!',
        message: 'You have successfully signed in.',
      });
    }
  }, [searchParams, navigate, addToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully signed in.',
      });
      navigate('/chat');
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    addToast({
      type: 'success',
      title: 'Welcome!',
      message: 'You are now in demo mode.',
    });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* Header with theme toggle */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent)] mb-4">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Welcome back
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Sign in to Neo Olympus
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]">
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          {/* OAuth buttons */}
          <OAuthButtons />

          {/* Divider */}
          <div className="divider">or</div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
                autoComplete="current-password"
              />
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[var(--color-accent)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Continue
            </Button>
          </form>

          {/* Demo mode */}
          <div className="text-center">
            <button
              onClick={handleDemoLogin}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Try demo mode →
            </button>
          </div>

          {/* Sign up link */}
          <p className="text-center text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-sm text-[var(--color-text-tertiary)]">
        <a href="#" className="hover:underline">Terms of Use</a>
        {' · '}
        <a href="#" className="hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
}
