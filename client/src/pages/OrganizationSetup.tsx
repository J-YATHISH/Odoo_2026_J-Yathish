import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { fetchDepartments, fetchEmployees } from '../api/organization';
import type { Department, Employee } from '../api/organization';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, AlertCircle, X, Plus } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  description?: string;
  _count?: { assets: number };
}

interface Role { id: number; name: string; }

type Tab = 'departments' | 'categories' | 'employees';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'border-[#ffb961] text-[#ffb961] bg-[#ffb961]/10',
  ASSET_MANAGER: 'border-[#9acbff] text-[#9acbff] bg-[#9acbff]/10',
  DEPARTMENT_HEAD: 'border-[#72e0be] text-[#72e0be] bg-[#72e0be]/10',
  EMPLOYEE: 'border-[#524435] text-[#d7c3af] bg-transparent',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const active = status === 'ACTIVE';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
      active ? 'bg-[#004e3d] text-[#72e0be] border-[#54c4a4]' : 'bg-[#333538] text-[#d7c3af] border-[#524435]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#72e0be]' : 'bg-[#a08e7b]'}`} />
      {status}
    </span>
  );
};

const getRoleName = (role: any) => {
  if (typeof role === 'string') return role;
  if (role && typeof role === 'object') return role.name || '';
  return '';
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const OrganizationSetup: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<Tab>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/filter state
  const [empSearch, setEmpSearch] = useState('');
  const [empRoleFilter, setEmpRoleFilter] = useState('');
  const [empStatusFilter, setEmpStatusFilter] = useState('');

  // Selected employee panel
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [promotingTo, setPromotingTo] = useState<number | ''>('');
  const [promoting, setPromoting] = useState(false);
  const [promoteMsg, setPromoteMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Create Panels
  const [creatingDept, setCreatingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState<number | ''>('');
  
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depts, cats, emps, roleList] = await Promise.all([
        fetchDepartments(),
        apiFetch<Category[]>('/organization/categories'),
        fetchEmployees(),
        apiFetch<Role[]>('/organization/roles'),
      ]);
      setDepartments(depts as Department[]);
      setCategories(cats);
      setEmployees(emps);
      setRoles(roleList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Handlers ──
  const handlePromote = async () => {
    if (!selectedEmp || !promotingTo) return;
    setPromoting(true);
    setPromoteMsg(null);
    try {
      await apiFetch(`/organization/employees/${selectedEmp.id}/promote`, {
        method: 'PATCH',
        body: JSON.stringify({ roleId: promotingTo }),
      });
      setPromoteMsg({ type: 'ok', text: 'Role updated successfully.' });
      await loadAll();
      const fresh = employees.find(e => e.id === selectedEmp.id);
      if (fresh) setSelectedEmp(fresh);
    } catch (e) {
      setPromoteMsg({ type: 'err', text: e instanceof Error ? e.message : 'Failed.' });
    } finally {
      setPromoting(false);
    }
  };

  const handleCreateDept = async () => {
    if (!newDeptName) return;
    try {
      await apiFetch('/organization/departments', {
        method: 'POST',
        body: JSON.stringify({ 
          name: newDeptName, 
          parentId: newDeptParentId ? Number(newDeptParentId) : undefined 
        }),
      });
      setCreatingDept(false);
      setNewDeptName('');
      setNewDeptParentId('');
      loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create department');
    }
  };

  const handleCreateCat = async () => {
    if (!newCatName) return;
    try {
      await apiFetch('/organization/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName }),
      });
      setCreatingCat(false);
      setNewCatName('');
      loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create category');
    }
  };

  // ── Filtered employees ──
  const filteredEmployees = employees.filter(e => {
    const matchSearch = !empSearch ||
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(empSearch.toLowerCase());
    const matchRole = !empRoleFilter || getRoleName(e.role) === empRoleFilter;
    const matchStatus = !empStatusFilter || e.status === empStatusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // ── Tab buttons config ──
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'departments', label: 'DEPARTMENTS', count: departments.length },
    { key: 'categories', label: 'ASSET_CATEGORIES', count: categories.length },
    { key: 'employees', label: 'EMPLOYEE_DIRECTORY', count: employees.length },
  ];

  return (
    <Layout title="Organization Setup">
      <div className="flex flex-col h-full -m-8">

        {/* ── Page Header + Tabs ─────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-0 border-b border-border bg-neutral-card/40 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={loadAll} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-muted border border-border hover:text-neutral-text hover:bg-neutral-muted/10 transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          <div className="flex gap-6 relative">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`pb-3 border-b-2 font-label-sm text-[11px] uppercase tracking-wider transition-colors ${
                  activeTab === t.key
                    ? 'border-primary text-neutral-text'
                    : 'border-transparent text-neutral-muted hover:text-neutral-text'
                }`}
              >
                {t.label}
                <span className={`ml-2 font-data-mono text-[10px] px-1.5 py-0.5 ${
                  activeTab === t.key ? 'bg-primary/15 text-primary' : 'bg-neutral-muted/15 text-neutral-muted'
                }`}>
                  {loading ? '…' : t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-3 text-danger bg-danger/10 border border-danger/20 p-3 text-xs font-data-mono shrink-0">
            <AlertCircle size={14} />{error}
          </div>
        )}

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex relative">

          {/* ═══════════ DEPARTMENTS TAB ════════════════════════════════ */}
          {activeTab === 'departments' && (
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="flex justify-between items-end mb-4 shrink-0">
                <h2 className="font-headline-md text-sm text-neutral-text uppercase">Departments Directory</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setCreatingDept(true)}
                    className="bg-[#F0A030] text-[#111] px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-sm hover:opacity-90"
                  >
                    <Plus size={14} /> ADD DEPARTMENT
                  </button>
                )}
              </div>
              
              {loading ? <SkeletonRows /> : (
                <div className="border border-border bg-neutral-card overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-neutral-bg">
                        {['DEPT_ID','NAME','HEAD','PARENT_DEPT','STATUS'].map(h => (
                          <th key={h} className="py-2 px-3 font-label-sm text-[10px] text-neutral-muted uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-sm text-neutral-text">
                      {departments.length === 0 ? (
                        <tr><td colSpan={5}><EmptyState label="No departments yet." /></td></tr>
                      ) : departments.map(dept => {
                        const parent = departments.find(d => d.id === dept.parentId);
                        return (
                          <tr key={dept.id} className="border-b border-border hover:bg-neutral-muted/5 transition-colors h-8">
                            <td className="py-1 px-3 font-data-mono text-[12px] text-neutral-muted">
                              DPT-{dept.id.toString().padStart(3,'0')}
                            </td>
                            <td className="py-1 px-3">
                              {dept.parentId && <span className="text-neutral-muted mr-1">↳</span>}
                              {dept.name}
                            </td>
                            <td className="py-1 px-3 text-neutral-muted text-xs">—</td>
                            <td className="py-1 px-3 text-neutral-muted text-xs">{parent?.name ?? '—'}</td>
                            <td className="py-1 px-3"><StatusBadge status={dept.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ CATEGORIES TAB ════════════════════════════════ */}
          {activeTab === 'categories' && (
            <div className="flex-1 overflow-auto p-6 flex flex-col">
              <div className="flex justify-between items-end mb-4 shrink-0">
                <h2 className="font-headline-md text-sm text-neutral-text uppercase">Asset Categories</h2>
                {isAdmin && (
                  <button 
                    onClick={() => setCreatingCat(true)}
                    className="bg-[#F0A030] text-[#111] px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-sm hover:opacity-90"
                  >
                    <Plus size={14} /> ADD CATEGORY
                  </button>
                )}
              </div>

              {loading ? <SkeletonRows /> : (
                <div className="border border-border bg-neutral-card overflow-hidden">
                  <div className="grid grid-cols-[1fr_140px_1fr_100px_80px] gap-0 px-3 py-2 bg-neutral-bg border-b border-border">
                    {['CATEGORY NAME','ID','DESCRIPTION','ASSETS','STATUS'].map(h => (
                      <div key={h} className="font-label-sm text-[10px] text-neutral-muted uppercase tracking-wider">{h}</div>
                    ))}
                  </div>
                  <div className="overflow-auto">
                    {categories.length === 0 ? (
                      <EmptyState label="No categories yet." />
                    ) : categories.map(cat => (
                      <div key={cat.id} className="grid grid-cols-[1fr_140px_1fr_100px_80px] gap-0 px-3 py-2 border-b border-border hover:bg-neutral-muted/5 transition-colors items-center">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-neutral-muted">folder</span>
                          <span className="text-sm text-neutral-text">{cat.name}</span>
                        </div>
                        <div className="font-data-mono text-[11px] text-neutral-muted">
                          CAT-{cat.id.toString().padStart(3,'0')}
                        </div>
                        <div className="text-xs text-neutral-muted truncate pr-4">{cat.description || '—'}</div>
                        <div className="font-data-mono text-sm text-neutral-text">{cat._count?.assets ?? 0}</div>
                        <div><StatusBadge status="ACTIVE" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ EMPLOYEES TAB ════════════════════════════════ */}
          {activeTab === 'employees' && (
            <>
              {/* Main employee table area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Filter strip */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-neutral-card/40 shrink-0">
                  <div className="flex items-center bg-neutral-bg border border-border px-2 min-w-[220px]">
                    <span className="material-symbols-outlined text-neutral-muted text-[14px] mr-1.5">badge</span>
                    <input
                      type="text"
                      placeholder="Search name or email…"
                      value={empSearch}
                      onChange={e => setEmpSearch(e.target.value)}
                      className="bg-transparent text-xs font-data-mono text-neutral-text border-none outline-none placeholder-neutral-muted py-1.5 w-full"
                    />
                  </div>
                  <select
                    value={empRoleFilter}
                    onChange={e => setEmpRoleFilter(e.target.value)}
                    className="bg-neutral-card border border-border text-neutral-text text-xs font-data-mono px-2 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="">ROLE: ALL</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.name}>{r.name.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                  <select
                    value={empStatusFilter}
                    onChange={e => setEmpStatusFilter(e.target.value)}
                    className="bg-neutral-card border border-border text-neutral-text text-xs font-data-mono px-2 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="">STATUS: ALL</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                  {(empSearch || empRoleFilter || empStatusFilter) && (
                    <button
                      onClick={() => { setEmpSearch(''); setEmpRoleFilter(''); setEmpStatusFilter(''); }}
                      className="text-xs text-neutral-muted hover:text-neutral-text flex items-center gap-1 px-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">filter_list_off</span> Clear
                    </button>
                  )}
                  <div className="ml-auto font-data-mono text-[10px] text-neutral-muted">
                    {filteredEmployees.length} / {employees.length} records
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                  {loading ? <div className="p-6"><SkeletonRows /></div> : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-neutral-card sticky top-0 z-10 border-b border-border">
                        <tr>
                          {['EMP ID','PERSONNEL NAME','DEPARTMENT','ROLE / ACCESS','STATUS',''].map((h,i) => (
                            <th key={i} className="py-2 px-3 font-label-sm text-[10px] text-neutral-muted uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredEmployees.length === 0 ? (
                          <tr><td colSpan={6}><EmptyState label="No employees match the filter." /></td></tr>
                        ) : filteredEmployees.map(emp => {
                          const isSelected = selectedEmp?.id === emp.id;
                          const roleName = getRoleName(emp.role);
                          return (
                            <tr
                              key={emp.id}
                              onClick={() => { setSelectedEmp(emp); setPromotingTo(''); setPromoteMsg(null); }}
                              className={`cursor-pointer transition-colors group ${
                                isSelected
                                  ? 'bg-neutral-card border-l-2 border-primary'
                                  : 'hover:bg-neutral-muted/5 border-l-2 border-transparent'
                              }`}
                            >
                              <td className="py-2 px-3 font-data-mono text-[12px] text-neutral-muted">
                                EMP-{emp.id.toString().padStart(4,'0')}
                              </td>
                              <td className="py-2 px-3">
                                <div className="text-sm font-medium text-neutral-text">{emp.name}</div>
                                <div className="text-[11px] text-neutral-muted">{emp.email}</div>
                              </td>
                              <td className="py-2 px-3 text-xs text-neutral-muted uppercase">
                                {(emp as unknown as { department?: { name: string } }).department?.name ?? '—'}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border font-data-mono ${ROLE_COLORS[roleName] ?? 'border-border text-neutral-muted'}`}>
                                  {roleName.replace(/_/g,' ')}
                                </span>
                              </td>
                              <td className="py-2 px-3"><StatusBadge status={emp.status} /></td>
                              <td className="py-2 px-3 text-center">
                                <span className={`material-symbols-outlined text-[14px] text-neutral-muted group-hover:text-primary transition-colors ${isSelected ? 'text-primary' : ''}`}>
                                  chevron_right
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* ── Employee Profile Panel ─────────────────────────────── */}
              {selectedEmp && (
                <aside className="w-80 border-l border-border bg-neutral-card flex flex-col h-full shrink-0">
                  {/* Panel Header */}
                  <div className="p-4 border-b border-border bg-neutral-card/60 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-bg border border-border flex items-center justify-center">
                        <span className="material-symbols-outlined text-neutral-muted text-[20px]">badge</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-neutral-text uppercase tracking-tight">
                          {selectedEmp.name}
                        </div>
                        <div className="font-data-mono text-[10px] text-primary mt-0.5">
                          ID: EMP-{selectedEmp.id.toString().padStart(4,'0')}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedEmp(null)} className="text-neutral-muted hover:text-neutral-text p-1">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Status tiles */}
                  <div className="grid grid-cols-2 gap-2 p-4 border-b border-border shrink-0">
                    <div className="bg-neutral-bg border border-border p-2 text-center">
                      <div className="text-[9px] font-label-sm uppercase text-neutral-muted tracking-wider mb-1">Role</div>
                      <div className={`font-data-mono text-[11px] font-bold ${ROLE_COLORS[getRoleName(selectedEmp.role)]?.split(' ')[1] ?? 'text-neutral-text'}`}>
                        {getRoleName(selectedEmp.role).replace(/_/g,' ')}
                      </div>
                    </div>
                    <div className="bg-neutral-bg border border-border p-2 text-center">
                      <div className="text-[9px] font-label-sm uppercase text-neutral-muted tracking-wider mb-1">Status</div>
                      <div className={`font-data-mono text-[11px] font-bold ${selectedEmp.status === 'ACTIVE' ? 'text-[#72e0be]' : 'text-neutral-muted'}`}>
                        {selectedEmp.status}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <Section label="Technical Assignment">
                      <DetailRow label="Email" value={selectedEmp.email} />
                      <DetailRow
                        label="Department"
                        value={(selectedEmp as unknown as { department?: { name: string } }).department?.name ?? 'Unassigned'}
                      />
                      <DetailRow
                        label="Role"
                        value={getRoleName(selectedEmp.role).replace(/_/g,' ')}
                      />
                    </Section>

                    {/* Role change — ADMIN only */}
                    {isAdmin && (
                      <Section label="Access Control">
                        <div className="space-y-2">
                          <label className="text-[10px] font-label-sm uppercase text-neutral-muted tracking-wider">
                            Change Role
                          </label>
                          <select
                            value={promotingTo}
                            onChange={e => setPromotingTo(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-neutral-bg border border-border text-neutral-text text-xs font-data-mono px-2 py-2 outline-none focus:border-primary"
                          >
                            <option value="">— Select new role —</option>
                            {roles.map(r => (
                              <option key={r.id} value={r.id}>{r.name.replace(/_/g,' ')}</option>
                            ))}
                          </select>
                          {promoteMsg && (
                            <div className={`text-[11px] px-2 py-1 border ${promoteMsg.type === 'ok' ? 'text-[#72e0be] border-[#54c4a4] bg-[#004e3d]/30' : 'text-danger border-danger/30 bg-danger/10'}`}>
                              {promoteMsg.text}
                            </div>
                          )}
                          <button
                            onClick={handlePromote}
                            disabled={!promotingTo || promoting}
                            className="w-full bg-primary text-[#472a00] py-1.5 text-[11px] font-label-sm uppercase tracking-wider font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                          >
                            {promoting ? 'Applying…' : 'Apply Role Change'}
                          </button>
                        </div>
                      </Section>
                    )}
                  </div>
                </aside>
              )}
            </>
          )}

          {/* ═══════════ ADD DEPARTMENT PANEL ════════════════════════════════ */}
          {creatingDept && (
            <aside className="w-80 border-l border-border bg-neutral-card flex flex-col h-full shrink-0 absolute right-0 top-0 shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
              <div className="p-4 border-b border-border bg-neutral-card/60 flex items-start justify-between">
                <h3 className="font-semibold text-sm text-neutral-text uppercase tracking-tight">New Department</h3>
                <button onClick={() => setCreatingDept(false)} className="text-neutral-muted hover:text-neutral-text p-1">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] font-label-sm uppercase text-neutral-muted tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    placeholder="e.g. Quality Assurance"
                    className="w-full bg-neutral-bg border border-border text-neutral-text px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-sm uppercase text-neutral-muted tracking-wider mb-2">Parent Department</label>
                  <select
                    value={newDeptParentId}
                    onChange={e => setNewDeptParentId(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-neutral-bg border border-border text-neutral-text px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">None (Top Level)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-border bg-neutral-bg flex gap-2">
                <button onClick={() => setCreatingDept(false)} className="flex-1 bg-transparent border border-border py-2 text-xs text-neutral-muted hover:text-neutral-text">Cancel</button>
                <button onClick={handleCreateDept} disabled={!newDeptName} className="flex-1 bg-primary text-[#111] py-2 text-xs font-bold disabled:opacity-50">Create</button>
              </div>
            </aside>
          )}

          {/* ═══════════ ADD CATEGORY PANEL ════════════════════════════════ */}
          {creatingCat && (
            <aside className="w-80 border-l border-border bg-neutral-card flex flex-col h-full shrink-0 absolute right-0 top-0 shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
              <div className="p-4 border-b border-border bg-neutral-card/60 flex items-start justify-between">
                <h3 className="font-semibold text-sm text-neutral-text uppercase tracking-tight">New Category</h3>
                <button onClick={() => setCreatingCat(false)} className="text-neutral-muted hover:text-neutral-text p-1">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-4 flex-1">
                <div>
                  <label className="block text-[10px] font-label-sm uppercase text-neutral-muted tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Heavy Machinery"
                    className="w-full bg-neutral-bg border border-border text-neutral-text px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-border bg-neutral-bg flex gap-2">
                <button onClick={() => setCreatingCat(false)} className="flex-1 bg-transparent border border-border py-2 text-xs text-neutral-muted hover:text-neutral-text">Cancel</button>
                <button onClick={handleCreateCat} disabled={!newCatName} className="flex-1 bg-primary text-[#111] py-2 text-xs font-bold disabled:opacity-50">Create</button>
              </div>
            </aside>
          )}

        </div>
      </div>
    </Layout>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <h4 className="font-label-sm text-[10px] text-neutral-muted uppercase tracking-widest border-b border-border pb-1 mb-2">{label}</h4>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between font-data-mono text-[11px]">
    <span className="text-neutral-muted">{label}:</span>
    <span className="text-neutral-text uppercase text-right">{value}</span>
  </div>
);

const SkeletonRows: React.FC = () => (
  <div className="space-y-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-9 bg-neutral-card border border-border animate-pulse" />
    ))}
  </div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="material-symbols-outlined text-neutral-muted/30 text-4xl mb-3">table_rows</span>
    <p className="text-neutral-muted text-sm">{label}</p>
  </div>
);
