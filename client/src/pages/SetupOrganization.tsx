import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { useTheme } from '../context/ThemeContext';
import { createOrganization } from '../api/auth';
import { APIException } from '../api/client';
import { Sun, Moon } from 'lucide-react';

export const SetupOrganization: React.FC = () => {
  const { login } = useAuth();
  const { notify } = useNotify();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Form states
  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultJoinCode, setResultJoinCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createOrganization({
        orgName,
        adminName,
        adminEmail,
        adminPassword,
      });

      notify('Organization created successfully!', 'success');
      setResultJoinCode(response.joinCode);

      // Automatically log in as the newly created Admin
      login(response.token, {
        id: response.employee.id,
        name: response.employee.name,
        email: response.employee.email,
        role: response.employee.role,
        organizationId: response.employee.organizationId,
      });
    } catch (err: unknown) {
      let msg = 'Failed to create organization.';
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
        <div className="flex flex-col items-center mb-6 border-b border-border pb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary font-data-mono text-xl font-bold mb-3 border border-primary/20">
            AF
          </div>
          <h1 className="font-headline-lg text-neutral-text text-xl tracking-wider text-center uppercase">
            Tenant Setup
          </h1>
          <p className="font-data-mono text-xs text-neutral-muted mt-1 text-center uppercase tracking-wider">
            Org_Provisioning_V1.0
          </p>
        </div>

        {resultJoinCode ? (
          <div className="space-y-6 text-center">
            <div className="bg-success/15 border border-success/30 p-6 rounded-none text-center animate-fade-in">
              <span className="material-symbols-outlined text-4xl text-success mb-2">check_circle</span>
              <h2 className="font-headline-md text-success text-lg uppercase tracking-wide">Setup Complete</h2>
              <p className="font-body-md text-xs text-neutral-text/90 mt-2">
                Your organization has been successfully registered. Share the Join Code below with your employees so they can join the organization.
              </p>

              <div className="mt-5 p-4 bg-neutral-bg border border-border select-all font-data-mono text-lg font-bold tracking-widest text-primary">
                {resultJoinCode}
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full btn-primary-industrial font-headline-md text-sm uppercase tracking-wider py-3 flex items-center justify-center gap-2"
              type="button"
            >
              Go to Dashboard
              <span className="material-symbols-outlined text-base">dashboard</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label
                className="font-label-sm text-[10px] text-neutral-muted uppercase flex items-center gap-1.5"
                htmlFor="orgName"
              >
                <span className="material-symbols-outlined text-xs">business</span>
                Organization Name
              </label>
              <input
                className="w-full input-technical font-data-mono text-sm p-2.5 rounded-none focus:border-primary placeholder-neutral-muted/40"
                id="orgName"
                placeholder="TechCorp Solutions"
                required
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label
                className="font-label-sm text-[10px] text-neutral-muted uppercase flex items-center gap-1.5"
                htmlFor="adminName"
              >
                <span className="material-symbols-outlined text-xs">person</span>
                Administrator Name
              </label>
              <input
                className="w-full input-technical font-data-mono text-sm p-2.5 rounded-none focus:border-primary placeholder-neutral-muted/40"
                id="adminName"
                placeholder="Alice Smith"
                required
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label
                className="font-label-sm text-[10px] text-neutral-muted uppercase flex items-center gap-1.5"
                htmlFor="adminEmail"
              >
                <span className="material-symbols-outlined text-xs">email</span>
                Administrator Email
              </label>
              <input
                className="w-full input-technical font-data-mono text-sm p-2.5 rounded-none focus:border-primary placeholder-neutral-muted/40"
                id="adminEmail"
                placeholder="admin@techcorp.com"
                required
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <label
                className="font-label-sm text-[10px] text-neutral-muted uppercase flex items-center gap-1.5"
                htmlFor="adminPassword"
              >
                <span className="material-symbols-outlined text-xs">lock</span>
                Administrator Security Key
              </label>
              <input
                className="w-full input-technical font-data-mono text-sm p-2.5 rounded-none focus:border-primary placeholder-neutral-muted/40"
                id="adminPassword"
                placeholder="••••••••"
                required
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="pt-2">
              <button
                className="w-full btn-primary-industrial font-headline-md text-sm uppercase tracking-wider py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    Deploying Tenant...
                    <div className="w-4 h-4 border-2 border-neutral-bg border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    Initialize Organization
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-secondary-industrial font-label-sm text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                type="button"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Authentication
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};
