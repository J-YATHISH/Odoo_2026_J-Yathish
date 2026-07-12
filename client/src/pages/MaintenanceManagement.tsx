import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { fetchMaintenanceRequests, createZeroTouchRequest } from '../api/maintenance';
import type { MaintenanceRequest } from '../api/maintenance';
import { BrainCircuit, CheckCircle, Clock } from 'lucide-react';
import { useNotify } from '../context/NotifyContext';

export const MaintenanceManagement: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [issueText, setIssueText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotify();

  const loadData = useCallback(async () => {
    try {
      const data = await fetchMaintenanceRequests();
      setRequests(data);
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Failed to fetch requests', 'danger');
    } finally {
      setLoading(false);
    };
  }, [notify]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleZeroTouchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    setSubmitting(true);
    try {
      await createZeroTouchRequest(issueText);
      notify('AI perfectly categorized your request and alerted the team!', 'success');
      setIssueText('');
      loadData(); // Refresh the table
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Failed to submit zero-touch request', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Maintenance Management">
      <div className="space-y-8">
        
        {/* Zero-Touch Input Section */}
        <div className="border border-[#4FBF9F]/30 bg-[#4FBF9F]/5 p-6 stagger-item">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={20} className="text-[#4FBF9F]" />
            <h2 className="text-sm font-semibold text-neutral-text uppercase tracking-wider">Zero-Touch IT Support</h2>
          </div>
          <p className="text-sm text-neutral-muted mb-4">
            Just type what's broken. Our AI will automatically find the device you own, categorize the issue, and alert the maintenance team instantly. No forms. No dropdowns.
          </p>
          <form onSubmit={handleZeroTouchSubmit} className="flex gap-3">
            <input
              type="text"
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="e.g. My MacBook Pro 2022 screen is glitching..."
              className="flex-1 px-4 py-2 bg-neutral-bg border border-border focus:border-[#4FBF9F] focus:ring-1 focus:ring-[#4FBF9F] outline-none text-neutral-text font-body-md"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !issueText.trim()}
              className="px-6 py-2 bg-[#4FBF9F] hover:bg-[#4FBF9F]/90 text-neutral-bg font-bold font-label-sm uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {submitting ? 'Analyzing Context...' : 'Report Issue'}
            </button>
          </form>
        </div>

        {/* Maintenance Team Dashboard Section */}
        <div className="border border-border bg-neutral-card stagger-item">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-label-sm uppercase tracking-wider text-neutral-text">Maintenance Team Dashboard</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-neutral-bg/50">
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">Asset</th>
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">Employee</th>
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">Issue Description</th>
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">AI Category</th>
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">Priority</th>
                  <th className="p-3 font-label-sm text-[10px] uppercase text-neutral-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-muted">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-muted">No maintenance requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b border-border/50 hover:bg-neutral-bg/30 transition-colors">
                      <td className="p-3">
                        <div className="font-data-mono text-sm font-semibold text-neutral-text">{req.asset?.name}</div>
                        <div className="font-data-mono text-[10px] text-neutral-muted">{req.asset?.tag}</div>
                      </td>
                      <td className="p-3 font-body-md text-sm text-neutral-text">{req.raisedBy?.name}</td>
                      <td className="p-3 font-body-md text-sm text-neutral-text max-w-xs truncate" title={req.issueDescription}>
                        {req.issueDescription}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {req.aiAssessed && (
                            <span title="AI Assessed">
                              <BrainCircuit size={12} className="text-[#4FBF9F]" />
                            </span>
                          )}
                          <span className={`font-data-mono text-[10px] px-2 py-0.5 border ${req.aiAssessed ? 'border-[#4FBF9F]/30 bg-[#4FBF9F]/10 text-[#4FBF9F]' : 'border-border text-neutral-muted'}`}>
                            {req.issueCategory || 'OTHER'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-label-sm text-[10px] uppercase tracking-wider ${req.priority === 'High' ? 'text-[#C25D4E]' : req.priority === 'Medium' ? 'text-[#F0A030]' : 'text-[#5C8FC2]'}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {req.status === 'RESOLVED' ? (
                            <CheckCircle size={14} className="text-success" />
                          ) : (
                            <Clock size={14} className="text-neutral-muted" />
                          )}
                          <span className="font-label-sm text-[10px] uppercase text-neutral-text">{req.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};
