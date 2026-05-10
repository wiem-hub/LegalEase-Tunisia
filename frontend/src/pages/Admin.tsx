// src/pages/Admin.tsx — Theme: Navy + Rouge tunisien (cohérent avec Dashboard)
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/adminApi';
import type { GlobalStats, AdminUser } from '../services/adminApi';
import { procedureApi } from '../services/procedureApi';
import type { ProcedureType } from '../types/procedure';
import BIAnalytics from '../components/Admin/BIAnalytics';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --navy:#1C2B4A; --navy-l:#253560; --red:#C8102E; --red-xs:#FFF0F2;
    --cream:#FAF9F7; --white:#FFFFFF; --gray1:#F5F4F1; --gray2:#ECEAE5;
    --gray3:#9C9A96; --gray4:#6A6865; --ink:#1A1916; --border:#E8E5DF;
    --green:#16A34A; --err:#DC2626;
    --sh:0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.06);
    --sh-lg:0 8px 32px rgba(0,0,0,0.09),0 2px 6px rgba(0,0,0,0.05);
  }
  .adm{display:flex;min-height:100vh;background:var(--cream);font-family:'Inter',sans-serif;color:var(--ink);}
  /* ── SIDEBAR ── */
  .adm-side{width:236px;min-height:100vh;background:var(--navy);display:flex;flex-direction:column;position:fixed;top:0;left:0;z-index:40;}
  .adm-side-logo{padding:26px 22px 20px;border-bottom:1px solid rgba(255,255,255,0.07);}
  .adm-logo-link{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:white;text-decoration:none;display:flex;align-items:center;gap:8px;}
  .adm-logo-red{color:var(--red);}
  .adm-logo-flag{display:flex;height:12px;width:18px;border-radius:2px;overflow:hidden;border:1px solid rgba(255,255,255,0.20);flex-shrink:0;}
  .dlf-r{flex:1;background:var(--red);}
  .dlf-w{flex:1;background:rgba(255,255,255,0.80);}
  .adm-logo-badge{font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-top:4px;display:flex;align-items:center;gap:5px;}
  .adm-logo-badge::before{content:'';display:block;width:5px;height:5px;border-radius:50%;background:var(--red);opacity:0.7;}
  .adm-nav{padding:16px 10px;flex:1;}
  .adm-nav-section{font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:0 12px;margin-bottom:4px;margin-top:16px;}
  .adm-nav-item{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.48);cursor:pointer;transition:all 0.15s;text-decoration:none;border:none;background:none;width:100%;text-align:left;font-family:'Inter',sans-serif;position:relative;}
  .adm-nav-item:hover{color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.06);}
  .adm-nav-item.active{color:white;background:rgba(255,255,255,0.10);font-weight:500;}
  .adm-nav-item.active::before{content:'';position:absolute;left:0;width:3px;height:28px;background:var(--red);border-radius:0 3px 3px 0;}
  .adm-nav-item svg{width:15px;height:15px;flex-shrink:0;}
  .adm-side-bottom{padding:14px 18px;border-top:1px solid rgba(255,255,255,0.07);}
  .adm-user-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:6px 8px;border-radius:8px;transition:background 0.15s;cursor:pointer;text-decoration:none;}
  .adm-user-row:hover{background:rgba(255,255,255,0.06);}
  .adm-avatar{width:32px;height:32px;border-radius:8px;background:rgba(200,16,46,0.25);border:1px solid rgba(200,16,46,0.40);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:rgba(255,180,190,0.95);flex-shrink:0;}
  .adm-user-name{font-size:12px;font-weight:500;color:rgba(255,255,255,0.80);}
  .adm-user-role{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.28);letter-spacing:0.05em;margin-top:1px;}
  .adm-logout{width:100%;display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:7px;border:1px solid rgba(255,255,255,0.10);background:transparent;color:rgba(255,255,255,0.38);font-size:12px;cursor:pointer;transition:all 0.15s;font-family:'Inter',sans-serif;}
  .adm-logout:hover{color:#FCA5A5;border-color:rgba(252,165,165,0.28);background:rgba(252,165,165,0.05);}
  /* ── MAIN ── */
  .adm-main{margin-left:236px;flex:1;min-height:100vh;}
  .adm-header{background:var(--white);border-bottom:1px solid var(--border);padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20;box-shadow:var(--sh);}
  .adm-header-left{display:flex;flex-direction:column;gap:2px;}
  .adm-page-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--navy);letter-spacing:-0.01em;line-height:1;}
  .adm-page-sub{font-family:'DM Mono',monospace;font-size:9px;color:var(--gray3);letter-spacing:0.10em;text-transform:uppercase;}
  .adm-tabs{display:flex;gap:4px;}
  .adm-tab{font-size:13px;font-weight:400;color:var(--gray4);padding:7px 14px;border-radius:7px;border:1px solid transparent;cursor:pointer;transition:all 0.15s;background:none;font-family:'Inter',sans-serif;}
  .adm-tab:hover{color:var(--navy);background:var(--gray1);}
  .adm-tab.active{color:var(--navy);background:var(--gray1);border-color:var(--border);font-weight:500;box-shadow:inset 2px 0 0 var(--red);}
  .adm-body{padding:32px 48px 60px;}
  /* ── CARDS ── */
  .data-card{background:var(--white);border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--sh);margin-bottom:20px;}
  .data-card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 24px 14px;border-bottom:1px solid var(--gray1);}
  .data-card-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--navy);letter-spacing:-0.01em;}
  .data-card-count{font-family:'DM Mono',monospace;font-size:9px;color:var(--gray3);background:var(--gray1);padding:3px 10px;border-radius:20px;letter-spacing:0.08em;}
  /* ── TABLE ── */
  table{width:100%;border-collapse:collapse;}
  th{font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray3);padding:10px 24px;text-align:left;border-bottom:1px solid var(--gray1);background:var(--gray1);font-weight:400;}
  td{padding:13px 24px;font-size:13px;color:var(--gray4);border-bottom:1px solid var(--gray1);vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:var(--cream);}
  .user-av{width:30px;height:30px;border-radius:8px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:white;flex-shrink:0;}
  .badge{display:inline-flex;align-items:center;gap:4px;font-family:'DM Mono',monospace;font-size:9px;padding:3px 9px;border-radius:20px;font-weight:400;letter-spacing:0.06em;white-space:nowrap;}
  .badge-active{background:rgba(22,163,74,0.10);color:#15803D;}
  .badge-inactive{background:rgba(220,38,38,0.08);color:var(--err);}
  .badge-admin{background:rgba(200,16,46,0.10);color:var(--red);}
  .badge-user{background:var(--gray1);color:var(--gray3);}
  .badge-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
  .btn-tbl{font-family:'DM Mono',monospace;font-size:10px;padding:5px 11px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--gray4);cursor:pointer;transition:all 0.15s;letter-spacing:0.04em;}
  .btn-tbl:hover{border-color:var(--navy);color:var(--navy);background:var(--gray1);}
  .btn-tbl.danger{color:var(--err);border-color:#FECACA;}
  .btn-tbl.danger:hover{background:#FEF2F2;border-color:#FCA5A5;}
  /* ── PROCEDURE CARDS ── */
  .proc-type-card{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--sh);margin-bottom:12px;transition:box-shadow 0.2s;}
  .proc-type-card:hover{box-shadow:var(--sh-lg);}
  .proc-type-header{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;cursor:pointer;gap:12px;transition:background 0.15s;}
  .proc-type-header:hover{background:var(--gray1);}
  .proc-type-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:var(--navy);margin-bottom:2px;}
  .proc-type-desc{font-size:11.5px;color:var(--gray3);font-weight:300;}
  .proc-type-meta{display:flex;align-items:center;gap:10px;}
  .proc-type-tag{font-family:'DM Mono',monospace;font-size:9px;color:var(--gray3);background:var(--gray1);padding:3px 9px;border-radius:20px;letter-spacing:0.06em;}
  .chevron{transition:transform 0.2s;color:var(--gray3);}
  .chevron.open{transform:rotate(180deg);}
  .step-row{display:flex;align-items:center;gap:12px;padding:11px 22px;border-bottom:1px solid var(--gray1);font-size:12.5px;color:var(--gray4);}
  .step-row:last-child{border-bottom:none;}
  .step-order{font-family:'DM Mono',monospace;font-size:9px;color:var(--gray3);width:24px;flex-shrink:0;letter-spacing:0.06em;}
  .step-name{flex:1;font-weight:400;color:var(--ink);}
  /* ── MODAL ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(28,43,74,0.50);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:24px;}
  .modal{background:var(--white);border:1px solid var(--border);border-radius:16px;width:100%;max-width:480px;box-shadow:var(--sh-lg);overflow:hidden;animation:modalIn 0.22s cubic-bezier(0.34,1.26,0.64,1);}
  @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .modal-header{background:var(--navy);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;border-left:3px solid var(--red);}
  .modal-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:white;}
  .modal-close{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,0.10);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.65);transition:all 0.15s;font-size:18px;line-height:1;}
  .modal-close:hover{background:rgba(255,255,255,0.20);color:white;}
  .modal-body{padding:22px 24px;display:flex;flex-direction:column;gap:16px;}
  .modal-footer{padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--gray1);}
  .form-field{display:flex;flex-direction:column;gap:6px;}
  .form-label{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray4);}
  .form-input{background:var(--white);border:1.5px solid var(--border);border-radius:9px;padding:10px 14px;font-family:'Inter',sans-serif;font-size:13px;color:var(--ink);outline:none;transition:border-color 0.2s,box-shadow 0.2s;width:100%;}
  .form-input:focus{border-color:rgba(28,43,74,0.40);box-shadow:0 0 0 3px rgba(28,43,74,0.07);}
  .form-input::placeholder{color:var(--gray3);}
  .btn-primary{display:inline-flex;align-items:center;gap:7px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;padding:9px 20px;border-radius:8px;border:none;background:var(--navy);color:white;cursor:pointer;transition:all 0.15s;}
  .btn-primary:hover:not(:disabled){background:var(--navy-l);transform:translateY(-1px);}
  .btn-primary:disabled{opacity:0.6;cursor:not-allowed;}
  .btn-secondary{display:inline-flex;align-items:center;font-family:'Inter',sans-serif;font-size:13px;font-weight:400;padding:9px 16px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--gray4);cursor:pointer;transition:all 0.15s;}
  .btn-secondary:hover{border-color:var(--navy);color:var(--navy);background:var(--gray1);}
  .btn-add{display:inline-flex;align-items:center;gap:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;padding:8px 18px;border-radius:8px;border:none;background:var(--navy);color:white;cursor:pointer;transition:all 0.15s;}
  .btn-add:hover{background:var(--navy-l);transform:translateY(-1px);}
  .skeleton{background:linear-gradient(90deg,var(--gray1) 25%,var(--gray2) 50%,var(--gray1) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .spin{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:_spin 0.7s linear infinite;}
  @keyframes _spin{to{transform:rotate(360deg)}}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;gap:8px;color:var(--gray3);}
  .empty-state p{font-size:13px;}
  @media(max-width:960px){
    .adm-side{display:none;}.adm-main{margin-left:0;}
    .adm-body{padding:24px 20px;}.adm-header{padding:0 20px;}
  }
`;

type TabKey = 'analytics' | 'users' | 'procedures';

// ── New Type Modal ────────────────────────────────────────────────────────────
const NewTypeModal = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [name,   setName]   = useState('');
  const [desc,   setDesc]   = useState('');
  const [days,   setDays]   = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminApi.createProcedureType({ name, description: desc || undefined, estimated_days: days ? +days : undefined, steps: [] });
      onSave(); onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Procedure Type</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label className="form-label">Name *</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Startup Creation"/>
          </div>
          <div className="form-field">
            <label className="form-label">Description</label>
            <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description..."/>
          </div>
          <div className="form-field">
            <label className="form-label">Estimated days</label>
            <input className="form-input" type="number" value={days} onChange={e => setDays(e.target.value)} placeholder="30"/>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <div className="spin"/>} Create
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Users Tab ─────────────────────────────────────────────────────────────────
const UsersTab = ({ users, onToggleActive, onToggleAdmin }: {
  users: AdminUser[];
  onToggleActive: (u: AdminUser) => void;
  onToggleAdmin:  (u: AdminUser) => void;
}) => (
  <div className="data-card">
    <div className="data-card-header">
      <span className="data-card-title">All Users</span>
      <span className="data-card-count">{users.length} users</span>
    </div>
    {users.length === 0 ? (
      <div className="empty-state"><p>No users found</p></div>
    ) : (
      <table>
        <thead>
          <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Procedures</th><th>Joined</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="user-av">{u.username.slice(0,2).toUpperCase()}</div>
                  <span style={{ color:'var(--navy)', fontWeight:500 }}>{u.username}</span>
                </div>
              </td>
              <td style={{ fontFamily:'DM Mono,monospace', fontSize:11 }}>{u.email}</td>
              <td><span className={`badge ${u.is_admin ? 'badge-admin' : 'badge-user'}`}>{u.is_admin ? '★ Admin' : 'User'}</span></td>
              <td><span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}><div className="badge-dot"/> {u.is_active ? 'Active' : 'Inactive'}</span></td>
              <td style={{ fontFamily:'DM Mono,monospace', fontSize:12, color:'var(--navy)' }}>{u.procedure_count}</td>
              <td style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--gray3)' }}>
                {new Date(u.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
              </td>
              <td>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn-tbl" onClick={() => onToggleActive(u)}>{u.is_active ? 'Disable' : 'Enable'}</button>
                  <button className="btn-tbl" onClick={() => onToggleAdmin(u)}>{u.is_admin ? 'Demote' : 'Make Admin'}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

// ── Procedures Tab ────────────────────────────────────────────────────────────
const ProceduresTab = ({ types, onRefresh }: { types: ProcedureType[]; onRefresh: () => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [expanded,  setExpanded]  = useState<number | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this procedure type? This cannot be undone.')) return;
    setDeleting(id);
    try { await adminApi.deleteProcedureType(id); onRefresh(); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          New type
        </button>
      </div>
      {types.length === 0 ? (
        <div className="data-card"><div className="empty-state"><p>No procedure types yet.</p></div></div>
      ) : (
        types.map(pt => (
          <div key={pt.id} className="proc-type-card">
            <div className="proc-type-header" onClick={() => setExpanded(expanded === pt.id ? null : pt.id)}>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="proc-type-name">{pt.name}</div>
                {pt.description && <div className="proc-type-desc">{pt.description}</div>}
              </div>
              <div className="proc-type-meta">
                <span className="proc-type-tag">{pt.steps.length} steps</span>
                {pt.estimated_days && <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--gray3)', letterSpacing:'.06em' }}>~{pt.estimated_days}d</span>}
                <button className="btn-tbl danger" onClick={e => { e.stopPropagation(); handleDelete(pt.id); }} disabled={deleting === pt.id}>
                  {deleting === pt.id ? <div className="spin" style={{ width:10, height:10, borderWidth:1.5 }}/> : 'Delete'}
                </button>
                <svg className={`chevron ${expanded === pt.id ? 'open' : ''}`} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>
            {expanded === pt.id && (
              <div style={{ borderTop:'1px solid var(--gray1)' }}>
                {[...pt.steps].sort((a,b) => a.order - b.order).map(s => (
                  <div key={s.id} className="step-row">
                    <span className="step-order">{String(s.order).padStart(2,'0')}</span>
                    <span className="step-name">{s.title}</span>
                    {s.estimated_days && <span style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--gray3)' }}>~{s.estimated_days}d</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      {showModal && <NewTypeModal onClose={() => setShowModal(false)} onSave={onRefresh}/>}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,       setTab]       = useState<TabKey>('analytics');
  const [stats,     setStats]     = useState<GlobalStats | null>(null);
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [procTypes, setProcTypes] = useState<ProcedureType[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => { if (user && !(user as any).is_admin) navigate('/dashboard'); }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [s, u, p] = await Promise.all([adminApi.getStats(), adminApi.getUsers(), procedureApi.getTypes()]);
      setStats(s); setUsers(u); setProcTypes(p);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load admin data.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const TABS: { key: TabKey; label: string; sub: string }[] = [
    { key: 'analytics',  label: 'BI Analytics',  sub: 'Charts & insights' },
    { key: 'users',      label: 'Users',          sub: 'Accounts & access' },
    { key: 'procedures', label: 'Procedures',     sub: 'Templates & steps' },
  ];

  const NAV_ICONS: Record<TabKey, React.ReactNode> = {
    analytics:  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    users:      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    procedures: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  };

  const current  = TABS.find(t => t.key === tab)!;
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'A';

  return (
    <>
      <style>{STYLE}</style>
      <div className="adm">

        {/* ── SIDEBAR ── */}
        <aside className="adm-side">
          <div className="adm-side-logo">
            <Link to="/" className="adm-logo-link">
              Legal<span className="adm-logo-red">Ease</span>
              <div className="adm-logo-flag"><div className="dlf-r"/><div className="dlf-w"/></div>
            </Link>
            <div className="adm-logo-badge">Admin Console</div>
          </div>

          <nav className="adm-nav">
            <div className="adm-nav-section">Management</div>
            {TABS.map(t => (
              <button key={t.key} className={`adm-nav-item ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {NAV_ICONS[t.key]} {t.label}
              </button>
            ))}
            <div className="adm-nav-section">Navigation</div>
            <Link to="/dashboard" className="adm-nav-item">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Back to App
            </Link>
          </nav>

          <div className="adm-side-bottom">
            <Link to="/profile" className="adm-user-row">
              <div className="adm-avatar">{initials}</div>
              <div>
                <div className="adm-user-name">{user?.username}</div>
                <div className="adm-user-role">Administrator</div>
              </div>
            </Link>
            <button className="adm-logout" onClick={() => { logout(); navigate('/login'); }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="adm-main">
          <div className="adm-header">
            <div className="adm-header-left">
              <h1 className="adm-page-title">{current.label}</h1>
              <span className="adm-page-sub">{current.sub}</span>
            </div>
            <div className="adm-tabs">
              {TABS.map(t => (
                <button key={t.key} className={`adm-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="adm-body">
            {error && (
              <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, padding:'12px 18px', color:'var(--err)', fontSize:13, marginBottom:24, display:'flex', alignItems:'center', gap:10 }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                  {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:96, borderRadius:14 }}/>)}
                </div>
                <div className="skeleton" style={{ height:280, borderRadius:14 }}/>
              </div>
            ) : (
              <>
                {tab === 'analytics'  && stats && <BIAnalytics stats={stats}/>}
                {tab === 'users'      && (
                  <UsersTab
                    users={users}
                    onToggleActive={async u => {
                      const updated = await adminApi.updateUser(u.id, { is_active: !u.is_active });
                      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                    }}
                    onToggleAdmin={async u => {
                      const updated = await adminApi.updateUser(u.id, { is_admin: !u.is_admin });
                      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
                    }}
                  />
                )}
                {tab === 'procedures' && <ProceduresTab types={procTypes} onRefresh={fetchAll}/>}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}