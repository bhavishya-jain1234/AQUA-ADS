import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { supabase } from '../lib/supabaseClient';
import { spawnWaterRipple } from '../effects/waterButtonRipple';

function getLoginErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any;
  const apiError = anyErr?.response?.data?.error;
  if (typeof apiError === 'string' && apiError.trim()) return apiError;

  // Axios "Network Error" / no response (backend down, wrong base URL, CORS/proxy issues).
  const message: string | undefined = typeof anyErr?.message === 'string' ? anyErr.message : undefined;
  if (!anyErr?.response && message) {
    if (message.includes("Failed to construct 'URL'")) {
      const api = import.meta.env.VITE_API_BASE_URL;
      const supa = import.meta.env.VITE_SUPABASE_URL;
      return `URL Error: Check Vercel Env Vars. VITE_API_BASE_URL='${api}', VITE_SUPABASE_URL='${supa}'`;
    }

    const lower = message.toLowerCase();
    if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('ecconnrefused') || lower.includes('connect')) {
      const base = (import.meta.env.VITE_API_BASE_URL?.trim() || '/api').replace(/\/$/, '');
      return `Cannot reach backend API (${base}). Start the backend (port 5000) or set VITE_API_BASE_URL.`;
    }
    return message;
  }

  return fallback;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const modeFromUrl = ((searchParams.get('mode') || 'user').toLowerCase() === 'admin' ? 'admin' : 'user') as 'user' | 'admin';
  const [mode, setMode] = useState<'user' | 'admin'>(modeFromUrl);

  // User (ID-based) login form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Admin login form
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  /** True while checking Supabase / syncing token with backend (not the same as OAuth redirect). */
  const [checkingSession, setCheckingSession] = useState(true);
  /** True only after user clicks “Continue with Google” until redirect. */
  const [oauthRedirecting, setOauthRedirecting] = useState(false);
  const [error, setError] = useState('');
  const backendSyncInFlight = useRef(false);

  useEffect(() => {
    // If URL changes externally (e.g. /login?mode=admin), reflect that in the UI.
    if (modeFromUrl !== mode) setMode(modeFromUrl);
    setError('');
    setOauthRedirecting(false);
    setCheckingSession(modeFromUrl === 'user');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeFromUrl]);

  useEffect(() => {
    if (mode !== 'user') return;

    let cancelled = false;
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;

    const clearSafetyTimer = () => {
      if (safetyTimer !== undefined) {
        window.clearTimeout(safetyTimer);
        safetyTimer = undefined;
      }
    };

    const syncBackendIfNeeded = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!session?.user?.email) {
        if (!cancelled) {
          clearSafetyTimer();
          setCheckingSession(false);
        }
        return;
      }

      if (backendSyncInFlight.current) return;
      backendSyncInFlight.current = true;
      if (!cancelled) setCheckingSession(true);
      setError('');

      const email = session.user.email;
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';

      try {
        const { data: loginData } = await apiClient.post('/auth/login', { email, name });
        if (cancelled) return;
        if (loginData.token) {
          localStorage.setItem('aqua_token', loginData.token);
          clearSafetyTimer();
          navigate('/dashboard', { replace: true });
          return;
        }
        setError('Login failed after Google sign-in.');
      } catch (backendError: unknown) {
        if (cancelled) return;
        setError(getLoginErrorMessage(backendError, 'Backend login failed.'));
      } finally {
        backendSyncInFlight.current = false;
        if (!cancelled) {
          clearSafetyTimer();
          setCheckingSession(false);
        }
      }
    };

    // Always resolve loading from getSession first. Relying only on onAuthStateChange can leave the UI
    // stuck on "Checking session…" (e.g. only TOKEN_REFRESHED fires, or events reorder).
    void (async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError) {
        clearSafetyTimer();
        if (sessionError.message.includes("Failed to construct 'URL'")) {
          const supa = import.meta.env.VITE_SUPABASE_URL;
          setError(`Supabase URL Error: Check Vercel Env Vars. VITE_SUPABASE_URL='${supa}'`);
        } else {
          setError(sessionError.message);
        }
        setCheckingSession(false);
        return;
      }
      await syncBackendIfNeeded(data.session);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      queueMicrotask(() => {
        if (cancelled) return;
        if (event === 'SIGNED_OUT') {
          clearSafetyTimer();
          setCheckingSession(false);
          return;
        }
        if (event === 'SIGNED_IN') {
          void syncBackendIfNeeded(session);
        }
      });
    });

    safetyTimer = window.setTimeout(() => {
      if (cancelled) return;
      setError((prev) => prev || 'Could not finish sign-in check. Is the backend running? Try refreshing.');
      setCheckingSession(false);
    }, 15000);

    return () => {
      cancelled = true;
      clearSafetyTimer();
      listener.subscription.unsubscribe();
    };
  }, [navigate, mode]);

  const handleUserEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCheckingSession(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, name });
      if (data?.token) {
        localStorage.setItem('aqua_token', data.token);
        navigate('/dashboard', { replace: true });
        return;
      }
      setError('Login failed. Please try again.');
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err, 'Login failed.'));
    } finally {
      setCheckingSession(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCheckingSession(true);
    try {
      const { data } = await apiClient.post('/admin/login', { username: adminId, password: adminPassword });
      if (data?.token) {
        localStorage.setItem('aqua_admin_token', data.token);
        navigate('/admin', { replace: true });
        return;
      }
      setError('Admin login failed. Please try again.');
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err, 'Admin login failed.'));
    } finally {
      setCheckingSession(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setOauthRedirecting(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setError(error.message);
      setOauthRedirecting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 justify-center text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-[-20%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 glass-panel p-7 w-full max-w-sm">
        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-gray-400 mb-6">
          {mode === 'admin' ? 'Admin access — sign in with your Admin ID.' : 'User access — sign in with your ID or Google.'}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onMouseDown={spawnWaterRipple}
            onClick={() => {
              setMode('user');
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('mode', 'user');
                return next;
              }, { replace: true });
            }}
            className={[
              'water-btn',
              'py-3 rounded-xl font-bold text-sm transition-all',
              mode === 'user' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15',
            ].join(' ')}
          >
            User Login
          </button>
          <button
            type="button"
            onMouseDown={spawnWaterRipple}
            onClick={() => {
              setMode('admin');
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('mode', 'admin');
                return next;
              }, { replace: true });
            }}
            className={[
              'water-btn',
              'py-3 rounded-xl font-bold text-sm transition-all',
              mode === 'admin' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15',
            ].join(' ')}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-sm flex justify-center items-center">
            {error}
          </div>
        )}

        {mode === 'admin' ? (
          <form onSubmit={handleAdminLogin} className="space-y-3 text-left">
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Admin ID"
              className="w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              onMouseDown={spawnWaterRipple}
              disabled={checkingSession}
              className="water-btn w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50"
            >
              {checkingSession ? 'Signing in...' : 'Login as Admin'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleUserEmailLogin} className="space-y-3 text-left">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email (User ID)"
                className="w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                onMouseDown={spawnWaterRipple}
                disabled={checkingSession}
                className="water-btn w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-50"
              >
                {checkingSession ? 'Signing in...' : 'Login with ID'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              onMouseDown={spawnWaterRipple}
              onClick={handleGoogleLogin}
              disabled={checkingSession || oauthRedirecting}
              className="water-btn w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {oauthRedirecting ? (
                <span className="animate-pulse">Redirecting to Google...</span>
              ) : checkingSession ? (
                <span className="animate-pulse text-gray-600">Checking session…</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
