import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in.',
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
            <span className="gradient-text">Neo Olympus</span>
          </h1>
          
          <p className="text-xl text-void-400 mb-8">
            The intelligent multimodal AI platform that adapts to your needs.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              'Smart model routing',
              'Image & video analysis',
              'Voice transcription',
              'Cost optimization',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-void-300">
                <div className="w-1.5 h-1.5 bg-olympus-400 rounded-full" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
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
              Welcome back
            </h2>
            <p className="text-void-400">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-void-600 bg-void-800 
                           text-olympus-500 focus:ring-olympus-500/30"
                />
                <span className="text-sm text-void-400">Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-olympus-400 hover:text-olympus-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-void-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-olympus-400 hover:text-olympus-300 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
