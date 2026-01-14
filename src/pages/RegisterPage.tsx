import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const passwordRequirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!passwordRequirements.every((req) => req.met)) {
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-void-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-olympus-500/10 via-transparent to-purple-500/5" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-olympus-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                        bg-gradient-to-br from-olympus-400 to-olympus-600 
                        shadow-glow-lg mb-8">
            <Zap className="w-10 h-10 text-void-950" />
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Join Neo Olympus</span>
          </h1>
          
          <p className="text-xl text-void-400 mb-8">
            Start your journey with the most intelligent AI assistant.
          </p>
          
          <div className="space-y-4 text-left">
            {[
              { title: 'Free Tier', desc: 'Access to open-source models at no cost' },
              { title: 'Smart Routing', desc: 'AI automatically selects the best model' },
              { title: 'Multimodal', desc: 'Text, image, audio, and video support' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-void-800/30 border border-void-700">
                <CheckCircle className="w-5 h-5 text-olympus-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-void-200">{item.title}</p>
                  <p className="text-sm text-void-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl 
                          bg-gradient-to-br from-olympus-400 to-olympus-600 
                          shadow-glow mb-4">
              <Zap className="w-7 h-7 text-void-950" />
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text">
              Neo Olympus
            </h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-void-100">
              Create your account
            </h2>
            <p className="text-void-400">
              Get started with your free account today
            </p>
          </div>

          {(error || validationError) && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error || validationError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-3">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-void-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              {/* Password requirements */}
              <div className="grid grid-cols-2 gap-2">
                {passwordRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${
                      req.met ? 'text-green-400' : 'text-void-500'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        req.met ? 'bg-green-400' : 'bg-void-600'
                      }`}
                    />
                    {req.text}
                  </div>
                ))}
              </div>
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-void-600 bg-void-800 
                         text-olympus-500 focus:ring-olympus-500/30"
              />
              <label htmlFor="terms" className="text-sm text-void-400">
                I agree to the{' '}
                <Link to="/terms" className="text-olympus-400 hover:text-olympus-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-olympus-400 hover:text-olympus-300">
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-void-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-olympus-400 hover:text-olympus-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
