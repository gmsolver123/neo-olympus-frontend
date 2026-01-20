import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { CrystalLogo } from '../components/icons';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginDemo, isLoading, error, clearError } = useAuthStore();
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

  const handleDemoLogin = () => {
    loginDemo();
    addToast({
      type: 'success',
      title: 'Welcome to NeoChat!',
      message: 'You are now in demo mode.',
    });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-void-900/50 items-center justify-center p-12 relative overflow-hidden">
        {/* Geometric grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-crystal-500/20 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-crystal-400/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-2xl 
                        bg-void-950/80 border border-void-700/50
                        shadow-glow-lg mb-8 logo-crystal animate-float">
            <CrystalLogo size={96} />
          </div>
          
          <h1 className="text-5xl font-display font-bold mb-2 tracking-wider">
            <span className="gradient-text-white">NeoChat</span>
          </h1>
          
          <p className="text-sm text-crystal-400/70 font-display tracking-widest mb-6">
            POWERED BY NEO OLYMPUS
          </p>
          
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
                <div className="w-1.5 h-1.5 bg-crystal-400 rounded-full shadow-glow" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle grid on right panel too */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl 
                          bg-void-900/80 border border-void-700/50
                          shadow-glow mb-4 logo-crystal">
              <CrystalLogo size={48} />
            </div>
            <h1 className="text-2xl font-display font-bold gradient-text-white tracking-wider">
              NeoChat
            </h1>
            <p className="text-xs text-crystal-400/60 font-display tracking-widest mt-1">
              BY NEO OLYMPUS
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-void-100 tracking-wide">
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
                  className="hover:text-crystal-400 transition-colors"
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
                           text-crystal-500 focus:ring-crystal-500/30"
                />
                <span className="text-sm text-void-400">Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-crystal-400 hover:text-crystal-300 transition-colors"
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-void-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-void-950 text-void-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleDemoLogin}
              leftIcon={<Sparkles className="w-4 h-4 text-crystal-400" />}
            >
              Try Demo Mode
            </Button>
          </form>

          <p className="text-center text-void-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-crystal-400 hover:text-crystal-300 font-medium transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
