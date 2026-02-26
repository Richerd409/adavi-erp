import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { AlertCircle, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-primary">ERP Solution</h1>
          <p className="text-sm text-text-muted mt-2">Sign in to your account</p>
        </div>

        <div className="bg-surface border border-muted rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            {!useMagicLink && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {useMagicLink ? 'Send Magic Link' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={() => setUseMagicLink(!useMagicLink)}
              className="text-xs text-primary hover:underline transition-all"
            >
              {useMagicLink ? 'Back to password login' : 'Sign in with Magic Link'}
            </button>

            {import.meta.env.DEV && (
              <div className="pt-6 border-t border-muted grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
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
                  onClick={bypassAuth}
                >
                  Bypass Auth
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted/50 uppercase tracking-widest">
          Powering Adavi Designer Suite
        </p>
      </div>
    </div>
  );
};

export default Login;
