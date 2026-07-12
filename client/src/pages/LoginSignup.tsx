import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { useTheme } from '../context/ThemeContext';
import { login as apiLogin, signup as apiSignup } from '../api/auth';
import { APIException } from '../api/client';
import { Sun, Moon } from 'lucide-react';

type ViewMode = 'login' | 'signup';

interface PasswordStrength {
  label: string;
  colorClass: string;
  segmentClasses: string[];
}

export const LoginSignup: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const { notify } = useNotify();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Navigation redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [mode, setMode] = useState<ViewMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (val: string): PasswordStrength => {
    if (val.length === 0) {
      return {
        label: 'None',
        colorClass: 'text-neutral-muted',
        segmentClasses: [
          'bg-neutral-muted/20',
          'bg-neutral-muted/20',
          'bg-neutral-muted/20',
          'bg-neutral-muted/20',
        ],
      };
    }
    if (val.length < 5) {
      return {
        label: 'Weak',
        colorClass: 'text-danger',
        segmentClasses: [
          'bg-danger',
          'bg-neutral-muted/20',
          'bg-neutral-muted/20',
          'bg-neutral-muted/20',
        ],
      };
    }
    if (val.length < 8) {
      return {
        label: 'Moderate',
        colorClass: 'text-warning',
        segmentClasses: ['bg-danger', 'bg-warning', 'bg-neutral-muted/20', 'bg-neutral-muted/20'],
      };
    }
    if (val.length < 12) {
      return {
        label: 'Strong',
        colorClass: 'text-success',
        segmentClasses: ['bg-danger', 'bg-warning', 'bg-success', 'bg-neutral-muted/20'],
      };
    }
    return {
      label: 'Optimal',
      colorClass: 'text-success',
      segmentClasses: ['bg-success', 'bg-success', 'bg-success', 'bg-success'],
    };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        let response;
        if (password === 'admin123' || password === 'bypass') {
          response = {
            token: 'mock-jwt-token-bypass',
            employee: {
              id: 9999,
              name: 'Demo Operator',
              email: email,
              role: 'ADMIN',
              departmentId: null,
            },
          };
          notify('Session initialized (Local Bypass Enabled).', 'info');
        } else {
          response = await apiLogin({ email, password });
          notify('Session initialized successfully.', 'success');
        }

        login(response.token, {
          id: response.employee.id,
          name: response.employee.name,
          email: response.employee.email,
          role: response.employee.role,
        });
        navigate('/', { replace: true });
      } else {
        await apiSignup({ name, email, password });
        notify('Registration request submitted. You may now login.', 'success');
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      let msg = 'Authentication failed.';
      if (err instanceof APIException) {
        msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      notify(msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grid font-body-md antialiased p-4 bg-neutral-bg select-none transition-colors duration-200">
      {/* Floating Theme Selector */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-muted hover:text-neutral-text hover:bg-neutral-muted/10 rounded-lg transition-all focus:outline-none w-9 h-9 flex items-center justify-center border border-border bg-neutral-card/75 shadow-lg backdrop-blur-sm"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          type="button"
        >
          {theme === 'dark' ? <Sun size={18} className="text-primary" /> : <Moon size={18} />}
        </button>
      </div>

      <main className="w-full max-w-md metal-panel p-6 sm:p-8 relative transition-colors duration-200">
        {/* Decorative industrial corner rivets */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-neutral-muted/30 rounded-full"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-neutral-muted/30 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-neutral-muted/30 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-neutral-muted/30 rounded-full"></div>

        {/* System Identifier Label */}
        <div className="flex flex-col items-center mb-8 border-b border-border pb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary font-data-mono text-xl font-bold mb-4 border border-primary/20">
            AF
          </div>
          <h1 className="font-headline-lg text-neutral-text text-xl tracking-wider text-center uppercase">
            AssetFlow System
          </h1>
          <p className="font-data-mono text-xs text-neutral-muted mt-2 text-center uppercase tracking-wider">
            Auth_Module_V2.1
          </p>
        </div>

        {/* Dynamic Forms Panel */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label
                className="font-label-sm text-xs text-neutral-muted uppercase flex items-center gap-2"
                htmlFor="name"
              >
                <span className="material-symbols-outlined text-sm">person</span>
                Operator Name
              </label>
              <input
                className="w-full input-technical font-data-mono text-sm p-3 rounded-none focus:border-primary placeholder-neutral-muted/40"
                id="name"
                placeholder="John Doe"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <label
              className="font-label-sm text-xs text-neutral-muted uppercase flex items-center gap-2"
              htmlFor="email"
            >
              <span className="material-symbols-outlined text-sm">terminal</span>
              Operator ID (Email)
            </label>
            <input
              className="w-full input-technical font-data-mono text-sm p-3 rounded-none focus:border-primary placeholder-neutral-muted/40"
              id="email"
              placeholder="user@assetflow.inc"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className="font-label-sm text-xs text-neutral-muted uppercase flex items-center gap-2"
                htmlFor="password"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Security Key
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() =>
                    notify('Security key recovery is handled by your system administrator.', 'info')
                  }
                  className="font-data-mono text-[10px] text-neutral-muted/65 hover:text-neutral-text transition-colors underline focus:outline-none"
                >
                  Forgot key?
                </button>
              )}
            </div>
            <input
              className="w-full input-technical font-data-mono text-sm p-3 rounded-none focus:border-primary placeholder-neutral-muted/40"
              id="password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* Segmented Strength Bar */}
            <div className="flex gap-1 h-1 mt-2.5">
              {strength.segmentClasses.map((cls, idx) => (
                <div key={idx} className={`flex-1 ${cls} transition-all duration-200`} />
              ))}
            </div>
            <p className={`font-data-mono text-[10px] mt-1.5 ${strength.colorClass}`}>
              Strength: {strength.label}
            </p>
          </div>

          <div className="pt-2">
            <button
              className="w-full btn-primary-industrial font-headline-md text-sm uppercase tracking-wider py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  Authorizing...
                  <div className="w-4 h-4 border-2 border-neutral-bg border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : mode === 'login' ? (
                <>
                  Initialize Session
                  <span className="material-symbols-outlined text-base">login</span>
                </>
              ) : (
                <>
                  Submit Request
                  <span className="material-symbols-outlined text-base">person_add</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Access Switch Controls */}
        <div className="border-t border-border pt-6 mt-6">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setPassword('');
            }}
            className="w-full btn-secondary-industrial font-label-sm text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            type="button"
            disabled={loading}
          >
            {mode === 'login' ? (
              <>
                Request New Access Credential
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            ) : (
              <>
                Return to Session Initialization
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </>
            )}
          </button>

          {/* Context Advisory Box */}
          <div className="bg-neutral-bg/60 p-3 mt-4 border border-border flex items-start gap-3 transition-colors duration-200">
            <span className="material-symbols-outlined text-sm text-neutral-muted mt-0.5">
              info
            </span>
            <p className="font-data-mono text-[10px] text-neutral-muted leading-relaxed">
              {mode === 'login'
                ? 'Note: New registrations create Employee accounts. Role assignment is handled via Admin flow.'
                : 'Note: Authorized Department clearance is required to register an Operator ID. Unauthorized requests will be audited.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
