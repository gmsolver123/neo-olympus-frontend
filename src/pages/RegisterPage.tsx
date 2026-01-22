import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { OAuthButtons } from '../components/auth';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle OAuth callback (same logic as login page)
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
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      navigate('/chat');
      addToast({
        type: 'success',
        title: 'Welcome!',
        message: 'Your account has been created.',
      });
    }
  }, [searchParams, navigate, addToast]);

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (!allRequirementsMet) {
      setValidationError('Please meet all password requirements');
      return;
    }

    try {
      await register({ name, email, password });
      addToast({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to Neo Olympus.',
      });
      navigate('/chat');
    } catch (err) {
      // Error is handled by the store
    }
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
              Create your account
            </h1>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              Get started with Neo Olympus
            </p>
          </div>

          {/* Error message */}
          {(error || validationError) && (
            <div className="p-4 rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)]">
              <p className="text-sm text-[var(--color-error)]">{error || validationError}</p>
            </div>
          )}

          {/* OAuth buttons */}
          <OAuthButtons />

          {/* Divider */}
          <div className="divider">or</div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="space-y-3">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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
                autoComplete="new-password"
              />

              {/* Password requirements */}
              {password && (
                <div className="grid grid-cols-2 gap-2 py-2">
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        req.met ? 'text-[var(--color-success)]' : 'text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      {req.met ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-current" />
                      )}
                      {req.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-0.5 w-4 h-4 rounded border-[var(--color-border)] 
                         bg-[var(--color-surface)] text-[var(--color-accent)] 
                         focus:ring-[var(--color-accent)] focus:ring-offset-0"
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-text-secondary)]">
                I agree to the{' '}
                <Link to="/terms" className="text-[var(--color-accent)] hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[var(--color-accent)] hover:underline">
                  Privacy Policy
                </Link>
              </label>
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

          {/* Sign in link */}
          <p className="text-center text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[var(--color-accent)] hover:underline font-medium"
            >
              Sign in
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
