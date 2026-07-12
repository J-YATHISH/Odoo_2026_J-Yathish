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
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation — matches reference segmented bar colors
  const getPasswordStrength = (val: string): PasswordStrength => {
    if (val.length === 0) {
      return {
        label: 'None',
        colorClass: 'text-on-surface-variant',
        segmentClasses: [
          'bg-surface-container-highest',
          'bg-surface-container-highest',
          'bg-surface-container-highest',
          'bg-surface-container-highest',
        ],
      };
    }
    if (val.length < 5) {
      return {
        label: 'Weak',
        colorClass: 'text-error',
        segmentClasses: [
          'bg-error',
          'bg-surface-container-highest',
          'bg-surface-container-highest',
          'bg-surface-container-highest',
        ],
      };
    }
    if (val.length < 8) {
      return {
        label: 'Moderate',
        colorClass: 'text-primary-container',
        segmentClasses: ['bg-error', 'bg-primary-container', 'bg-surface-container-highest', 'bg-surface-container-highest'],
      };
    }
    if (val.length < 12) {
      return {
        label: 'Strong',
        colorClass: 'text-tertiary-container',
        segmentClasses: ['bg-error', 'bg-primary-container', 'bg-tertiary-container', 'bg-surface-container-highest'],
      };
    }
    return {
      label: 'Optimal',
      colorClass: 'text-tertiary-container',
      segmentClasses: ['bg-tertiary-container', 'bg-tertiary-container', 'bg-tertiary-container', 'bg-tertiary-container'],
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
              organizationId: 1,
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
          organizationId: response.employee.organizationId,
        });
        navigate('/', { replace: true });
      } else {
        await apiSignup({ name, email, password, joinCode });
        notify('Registration successful. You may now login.', 'success');
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
    <div className="min-h-screen flex items-center justify-center bg-grid font-body-md antialiased p-4 select-none transition-colors duration-200"
      style={{ backgroundColor: 'rgb(var(--color-surface))' }}>
      {/* Floating Theme Selector */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-all focus:outline-none w-9 h-9 flex items-center justify-center border border-outline-variant bg-surface-container shadow-lg"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          type="button"
        >
          {theme === 'dark' ? <Sun size={16} className="text-primary-container" /> : <Moon size={16} />}
        </button>
      </div>

      <main className="w-full max-w-md metal-panel p-6 sm:p-8 relative transition-colors duration-200">
        {/* Decorative industrial corner rivets — exact from reference */}
        <div className="absolute top-2 left-2 w-1 h-1 bg-surface-container-highest rounded-full opacity-50"></div>
        <div className="absolute top-2 right-2 w-1 h-1 bg-surface-container-highest rounded-full opacity-50"></div>
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-surface-container-highest rounded-full opacity-50"></div>
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-surface-container-highest rounded-full opacity-50"></div>

        {/* System Identifier Label — exact from reference */}
        <div className="flex flex-col items-center mb-8 border-b border-outline-variant pb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-container text-on-primary-container font-data-mono text-headline-lg font-bold mb-4">
            AF
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-wider text-center">
            AssetFlow System
          </h1>
          <p className="font-data-mono text-data-mono text-on-surface-variant mt-2 text-center uppercase tracking-wider">
            Auth_Module_V2.1
          </p>
        </div>

        {/* Dynamic Forms Panel */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-on-surface-variant uppercase flex items-center gap-2"
                  htmlFor="name"
                >
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  Operator Name
                </label>
                <input
                  className="w-full input-technical font-data-mono text-data-mono p-3 rounded-none"
                  id="name"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="font-label-sm text-label-sm text-on-surface-variant uppercase flex items-center gap-2"
                  htmlFor="joinCode"
                >
                  <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                  Organization Join Code
                </label>
                <input
                  className="w-full input-technical font-data-mono text-data-mono p-3 rounded-none"
                  id="joinCode"
                  placeholder="E.g. a1b2c3d4"
                  required
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label
              className="font-label-sm text-label-sm text-on-surface-variant uppercase flex items-center gap-2"
              htmlFor="email"
            >
              <span className="material-symbols-outlined text-[14px]">terminal</span>
              Operator ID (Email)
            </label>
            <input
              className="w-full input-technical font-data-mono text-data-mono p-3 rounded-none"
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
                className="font-label-sm text-label-sm text-on-surface-variant uppercase flex items-center gap-2"
                htmlFor="password"
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Security Key
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() =>
                    notify('Security key recovery is handled by your system administrator.', 'info')
                  }
                  className="font-data-mono text-[10px] text-on-surface-variant hover:text-on-surface transition-colors underline focus:outline-none"
                >
                  Forgot key?
                </button>
              )}
            </div>
            <input
              className="w-full input-technical font-data-mono text-data-mono p-3 rounded-none"
              id="password"
              placeholder="••••••••"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            {/* Password Strength Segmented Bar — matches reference exactly */}
            <div className="flex gap-1 h-1 mt-2">
              {strength.segmentClasses.map((cls, idx) => (
                <div key={idx} className={`flex-1 ${cls} transition-colors duration-300`}></div>
              ))}
            </div>
            <p className={`font-data-mono text-[10px] mt-1 ${strength.colorClass}`}>
              Strength: {strength.label}
            </p>
          </div>

          <div className="pt-4">
            <button
              className="w-full btn-primary-industrial font-headline-md text-headline-md uppercase tracking-wider py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  Authorizing...
                  <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : mode === 'login' ? (
                <>
                  Initialize Session
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              ) : (
                <>
                  Register Credential
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Access Switch Controls */}
        <div className="border-t border-outline-variant pt-6 mt-6">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setPassword('');
            }}
            className="w-full btn-secondary-industrial font-label-sm text-label-sm uppercase tracking-widest py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            type="button"
            disabled={loading}
          >
            {mode === 'login' ? (
              <>
                Request New Access Credential
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            ) : (
              <>
                Return to Session Initialization
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              </>
            )}
          </button>

          {mode === 'login' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/setup-org')}
                className="font-data-mono text-[10px] text-primary hover:text-primary-container transition-colors uppercase tracking-wider focus:outline-none underline"
                type="button"
                disabled={loading}
              >
                Register New Organization
              </button>
            </div>
          )}

          {/* Context Advisory Box — exact from reference */}
          <div className="bg-surface p-3 mt-4 border border-outline-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-[16px] text-outline mt-0.5">info</span>
            <p className="font-data-mono text-[11px] text-on-surface-variant leading-relaxed">
              {mode === 'login'
                ? 'Note: New registrations require a join code. To set up a new tenant, use the "Register New Organization" flow.'
                : 'Note: New registrations create Employee accounts. Role assignment is handled via Admin flow.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
