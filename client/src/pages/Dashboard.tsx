import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { checkHealth } from '../api/health';
import type { HealthResponse } from '../api/health';
import { APIException } from '../api/client';
import { Server, Database, AlertCircle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = () => {
    setLoading(true);
    setError(null);
    checkHealth()
      .then((res) => {
        setHealth(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof APIException) {
          setError(`${err.message} (Status: ${err.status})`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred connecting to the backend.');
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Connection status section (real call verification) */}
        <div className="bg-neutral-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wider text-neutral-muted uppercase">
              System Integration Connectivity Status
            </h3>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-2 text-neutral-muted hover:text-neutral-text hover:bg-slate-850 rounded-lg transition-all focus:outline-none disabled:opacity-50"
              title="Refresh connection status"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2.5 text-sm text-neutral-muted">
              <RefreshCw size={16} className="animate-spin text-primary" />
              <span>Verifying backend and database connection...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-danger bg-danger/10 border border-danger/20 p-4 rounded-xl text-sm">
              <AlertCircle size={18} />
              <div>
                <span className="font-semibold">Backend Unreachable:</span> {error}
              </div>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Backend API status */}
              <div className="flex items-center gap-4 bg-slate-900/30 border border-border p-4 rounded-xl">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Server size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-muted block">
                    API Server Status
                  </span>
                  <span className="text-sm font-semibold text-neutral-text">
                    {health.status === 'ok' ? 'ONLINE (HTTP 200)' : health.status}
                  </span>
                </div>
              </div>

              {/* DB Status */}
              <div className="flex items-center gap-4 bg-slate-900/30 border border-border p-4 rounded-xl">
                <div
                  className={`p-3 rounded-xl ${
                    health.db === 'connected' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}
                >
                  <Database size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-muted block">
                    Database State
                  </span>
                  <span className="text-sm font-semibold text-neutral-text">
                    {health.db.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-4 bg-slate-900/30 border border-border p-4 rounded-xl">
                <div className="p-3 bg-slate-800 text-neutral-muted rounded-xl">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-muted block">
                    Last Health Ping
                  </span>
                  <span className="text-xs font-mono text-neutral-text">
                    {new Date(health.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Coming in dashboard build message */}
        <div className="flex flex-col items-center justify-center min-h-[30vh] text-center border border-dashed border-border rounded-2xl p-12 bg-neutral-card/20">
          <p className="text-neutral-muted text-sm font-medium tracking-wide">
            Coming in Dashboard build.
          </p>
        </div>
      </div>
    </Layout>
  );
};
