import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AlertCircle, Sparkles, Scissors } from 'lucide-react';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, bypassAuth, signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);

  useEffect(() => {
    if (user) {
      const state = location.state as LocationState;
      const from = state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (useMagicLink) {
        const { error } = await signInWithOtp(email);
        if (error) throw error;
        setMessage('Check your email for the magic link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface border border-white/10 shadow-glass mb-4 group">
            <Scissors className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">Adavi</h1>
          <p className="text-sm text-text-muted tracking-widest uppercase text-[10px]">Boutique Tailoring ERP</p>
        </div>

        <div className="glass-card p-8 sm:p-10 shadow-2xl border-white/5 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-medium text-white">Welcome Back</h2>
            <p className="text-sm text-text-muted mt-1">Enter your credentials to access the atelier.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-black/20 border-white/10 focus:border-primary/50 text-base py-3"
              />

              {!useMagicLink && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 focus:border-primary/50 text-base py-3"
                />
              )}
            </div>

            {error && (
              <div className="p-4 bg-error/5 border border-error/10 text-error text-xs rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {message && (
              <div className="p-4 bg-primary/5 border border-primary/10 text-primary text-xs rounded-xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{message}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium shadow-neon hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300"
              loading={loading}
            >
              {useMagicLink ? 'Send Magic Link' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-4 items-center">
            <button
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-xs text-text-muted hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5"
            >
              {useMagicLink ? 'Use password instead' : 'Or sign in with a magic link'}
            </button>

            {import.meta.env.DEV && (
              <div className="w-full pt-6 mt-2 border-t border-white/5 grid grid-cols-2 gap-3 opacity-50 hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9"
                  onClick={() => {
                    setEmail('gabrielricherd7@gmail.com');
                    setPassword('admin123');
                    setUseMagicLink(false);
                  }}
                >
                  Demo Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-9"
                  onClick={bypassAuth}
                >
                  Bypass
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted/30 uppercase tracking-[0.2em] font-light">
          Powered by Adavi Suite v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
