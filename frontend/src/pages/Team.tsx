// src/pages/Team.tsx
// Team & Collaboration management page
// Theme: Navy + Rouge tunisien
import { useState, useEffect } from 'react';
import api from '../services/api';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --navy:#1C2B4A; --navy-l:#253560; --red:#C8102E; --red-xs:#FFF0F2;
    --cream:#FAF9F7; --white:#FFFFFF; --gray1:#F5F4F1; --gray2:#ECEAE5;
    --gray3:#9C9A96; --gray4:#6A6865; --ink:#1A1916; --border:#E8E5DF;
    --green:#16A34A; --amber:#D97706;
    --sh:0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.06);
  }

  .tm-root { background:var(--cream); min-height:100vh; font-family:'Inter',sans-serif; color:var(--ink); }

  /* ── HERO ── */
  .tm-hero { position:relative; height:200px; overflow:hidden; background:var(--navy); }
  .tm-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 40%; filter:brightness(0.22) saturate(0.4); transition:transform 10s ease; }
  .tm-hero:hover .tm-hero-img { transform:scale(1.03); }
  .tm-hero-overlay { position:absolute; inset:0; background:linear-gradient(110deg,rgba(28,43,74,0.97) 0%,rgba(28,43,74,0.80) 50%,rgba(28,43,74,0.55) 100%); }
  .tm-hero-accent { position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--red); z-index:3; }
  .tm-hero-content { position:absolute; z-index:4; inset:0; display:flex; align-items:flex-end; justify-content:space-between; padding:0 52px 28px; gap:16px; }
  .tm-hero-eyebrow { font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:0.20em; text-transform:uppercase; color:rgba(200,16,46,0.78); margin-bottom:10px; display:flex; align-items:center; gap:10px; }
  .tm-hero-eyebrow::before { content:''; display:block; width:16px; height:1.5px; background:var(--red); }
  .tm-hero-title { font-family:'Playfair Display',serif; font-size:clamp(26px,3.5vw,40px); font-weight:700; color:white; letter-spacing:-0.02em; line-height:1.1; }
  .tm-hero-title em { font-style:italic; font-weight:400; color:rgba(255,200,205,0.88); }

  /* ── BODY ── */
  .tm-body { padding:28px 52px 64px; display:grid; grid-template-columns:340px 1fr; gap:24px; align-items:start; }

  /* ── LEFT: My collaborations ── */
  .tm-card { background:var(--white); border:1px solid var(--border); border-radius:14px; overflow:hidden; box-shadow:var(--sh); }
  .tm-card-head { display:flex; align-items:center; justify-content:space-between; padding:18px 22px 14px; border-bottom:1px solid var(--gray1); }
  .tm-card-title { font-family:'Playfair Display',serif; font-size:15px; font-weight:600; color:var(--ink); }
  .tm-card-badge { font-family:'DM Mono',monospace; font-size:9px; color:var(--gray3); background:var(--gray1); padding:3px 10px; border-radius:20px; letter-spacing:0.08em; }

  /* Procedure selector */
  .tm-proc-item { display:flex; align-items:center; gap:12px; padding:12px 22px; border-bottom:1px solid var(--gray1); cursor:pointer; transition:background 0.15s; }
  .tm-proc-item:last-child { border-bottom:none; }
  .tm-proc-item:hover { background:var(--gray1); }
  .tm-proc-item.active { background:rgba(28,43,74,0.04); border-left:3px solid var(--navy); padding-left:19px; }
  .tm-proc-icon { width:36px; height:36px; border-radius:9px; background:var(--gray1); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .tm-proc-icon.owned { background:rgba(28,43,74,0.08); }
  .tm-proc-info { flex:1; min-width:0; }
  .tm-proc-name { font-size:13px; font-weight:500; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:2px; }
  .tm-proc-meta { font-family:'DM Mono',monospace; font-size:9px; color:var(--gray3); letter-spacing:0.05em; text-transform:uppercase; }
  .tm-owner-badge { font-family:'DM Mono',monospace; font-size:8.5px; padding:2px 8px; border-radius:20px; background:rgba(28,43,74,0.09); color:var(--navy); letter-spacing:0.05em; flex-shrink:0; }
  .tm-collab-badge { font-family:'DM Mono',monospace; font-size:8.5px; padding:2px 8px; border-radius:20px; background:rgba(200,16,46,0.09); color:var(--red); letter-spacing:0.05em; flex-shrink:0; }

  /* ── RIGHT: Team panel ── */
  .tm-panel-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding:60px 24px; text-align:center; }
  .tm-panel-empty-icon { font-size:36px; }
  .tm-panel-empty-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:600; color:var(--ink); }
  .tm-panel-empty-sub { font-size:13px; color:var(--gray3); font-weight:300; max-width:280px; line-height:1.6; }

  /* Invite form */
  .tm-invite-form { padding:20px 22px; border-bottom:1px solid var(--gray1); background:var(--gray1); }
  .tm-invite-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--gray4); margin-bottom:12px; }
  .tm-invite-row { display:flex; gap:8px; }
  .tm-input { flex:1; border:1.5px solid var(--border); border-radius:9px; padding:9px 14px; font-family:'Inter',sans-serif; font-size:13px; color:var(--ink); outline:none; background:var(--white); transition:border-color 0.2s,box-shadow 0.2s; }
  .tm-input:focus { border-color:rgba(28,43,74,0.40); box-shadow:0 0 0 3px rgba(28,43,74,0.07); }
  .tm-input::placeholder { color:var(--gray3); }
  .tm-select { border:1.5px solid var(--border); border-radius:9px; padding:9px 12px; font-family:'DM Mono',monospace; font-size:11px; color:var(--ink); outline:none; background:var(--white); cursor:pointer; letter-spacing:0.04em; transition:border-color 0.2s; }
  .tm-select:focus { border-color:rgba(28,43,74,0.40); }
  .btn-invite { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; background:var(--navy); color:white; font-family:'Inter',sans-serif; font-size:12.5px; font-weight:600; border:none; border-radius:9px; cursor:pointer; transition:all 0.15s; white-space:nowrap; flex-shrink:0; }
  .btn-invite:hover:not(:disabled) { background:var(--navy-l); transform:translateY(-1px); }
  .btn-invite:disabled { opacity:0.55; cursor:not-allowed; }
  .tm-invite-error { font-size:12px; color:var(--red); margin-top:8px; }
  .tm-invite-success { font-size:12px; color:var(--green); margin-top:8px; }

  /* Collaborator list */
  .tm-member { display:flex; align-items:center; gap:14px; padding:16px 22px; border-bottom:1px solid var(--gray1); transition:background 0.15s; }
  .tm-member:last-child { border-bottom:none; }
  .tm-member:hover { background:var(--gray1); }
  .tm-member-av { width:38px; height:38px; border-radius:10px; background:var(--navy); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0; letter-spacing:0.04em; }
  .tm-member-av.owner { background:rgba(200,16,46,0.18); color:var(--red); border:1px solid rgba(200,16,46,0.30); }
  .tm-member-info { flex:1; min-width:0; }
  .tm-member-name { font-size:13px; font-weight:500; color:var(--ink); margin-bottom:3px; }
  .tm-member-email { font-family:'DM Mono',monospace; font-size:9.5px; color:var(--gray3); letter-spacing:0.03em; }
  .tm-member-actions { display:flex; align-items:center; gap:8px; }

  /* Role badge */
  .role-badge { font-family:'DM Mono',monospace; font-size:9px; padding:3px 10px; border-radius:20px; letter-spacing:0.06em; white-space:nowrap; }
  .role-owner     { background:rgba(200,16,46,0.10); color:var(--red); }
  .role-founder   { background:rgba(28,43,74,0.09); color:var(--navy); }
  .role-accountant{ background:rgba(22,163,74,0.09); color:var(--green); }
  .role-lawyer    { background:rgba(217,119,6,0.09); color:var(--amber); }
  .role-viewer    { background:var(--gray1); color:var(--gray3); }

  /* Role selector inline */
  .role-select { font-family:'DM Mono',monospace; font-size:9.5px; border:1px solid var(--border); border-radius:6px; padding:4px 8px; color:var(--ink); background:var(--white); cursor:pointer; outline:none; }

  .btn-remove { font-family:'DM Mono',monospace; font-size:9.5px; padding:4px 10px; border-radius:6px; border:1px solid #FECACA; background:transparent; color:var(--red); cursor:pointer; transition:all 0.15s; }
  .btn-remove:hover { background:var(--red-xs); }

  /* Loading */
  .tm-loading { display:flex; align-items:center; justify-content:center; gap:8px; padding:40px; color:var(--gray3); font-size:13px; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Permissions legend */
  .tm-legend { padding:16px 22px; background:var(--gray1); border-top:1px solid var(--border); }
  .tm-legend-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--gray3); margin-bottom:10px; }
  .tm-legend-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .tm-legend-row { display:flex; align-items:center; gap:8px; font-size:11.5px; color:var(--gray4); }
  .tm-legend-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  @media(max-width:960px) {
    .tm-body { grid-template-columns:1fr; padding:20px 16px 48px; }
    .tm-hero-content { padding:0 24px 24px; }
  }
`;

const COVER = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=85&auto=format&fit=crop';

const ROLE_COLORS: Record<string, string> = {
  owner: 'role-owner', founder: 'role-founder',
  accountant: 'role-accountant', lawyer: 'role-lawyer', viewer: 'role-viewer',
};

const ROLE_PERMS = [
  { role: 'Founder',    color: '#1C2B4A', edit: true,  upload: true  },
  { role: 'Accountant', color: '#16A34A', edit: false, upload: true  },
  { role: 'Lawyer',     color: '#D97706', edit: false, upload: false },
  { role: 'Viewer',     color: '#9C9A96', edit: false, upload: false },
];

interface Procedure { id: number; title: string; procedure_type: { name: string }; user_id: number; }
interface Collab { id: number; user_id: number; username: string; email: string; role: string; role_label: string; procedure_id: number; }
interface MyCollab { collaboration_id: number; procedure_id: number; procedure_title: string; role: string; role_label: string; owner_username: string; }

export default function Team() {
  const [myProcedures,    setMyProcedures]    = useState<Procedure[]>([]);
  const [myCollabs,       setMyCollabs]       = useState<MyCollab[]>([]);
  const [selectedProc,    setSelectedProc]    = useState<Procedure | null>(null);
  const [collaborators,   setCollaborators]   = useState<Collab[]>([]);
  const [loadingProcs,    setLoadingProcs]    = useState(true);
  const [loadingCollabs,  setLoadingCollabs]  = useState(false);
  const [inviteUsername,  setInviteUsername]  = useState('');
  const [inviteRole,      setInviteRole]      = useState('founder');
  const [inviting,        setInviting]        = useState(false);
  const [inviteMsg,       setInviteMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [currentUserId,   setCurrentUserId]   = useState<number | null>(null);

  useEffect(() => {
    api.get('/auth/me').then(r => {
      const uid = r.data.id;
      setCurrentUserId(uid);
      Promise.all([
        api.get('/procedures/my'),
        api.get('/team/my-collaborations'),
      ]).then(([procsR, collabsR]) => {
        const procs   = Array.isArray(procsR.data)   ? procsR.data   : [];
        const collabs = Array.isArray(collabsR.data) ? collabsR.data : [];
        // Inject user_id from current user into each procedure
        const procsWithUserId = procs.map((p: any) => ({ ...p, user_id: uid }));
        setMyProcedures(procsWithUserId);
        setMyCollabs(collabs);
      }).catch(console.error)
        .finally(() => setLoadingProcs(false));
    }).catch(() => setLoadingProcs(false));
  }, []);

  const loadCollaborators = async (proc: Procedure) => {
    setSelectedProc(proc);
    setLoadingCollabs(true);
    setInviteMsg(null);
    try {
      const r = await api.get(`/team/procedures/${proc.id}/collaborators`);
      setCollaborators(r.data || []);
    } catch { setCollaborators([]); }
    finally { setLoadingCollabs(false); }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim() || !selectedProc) return;
    setInviting(true); setInviteMsg(null);
    try {
      await api.post('/team/invite', {
        username:     inviteUsername.trim(),
        role:         inviteRole,
        procedure_id: selectedProc.id,
      });
      setInviteMsg({ text: `@${inviteUsername} added successfully!`, ok: true });
      setInviteUsername('');
      await loadCollaborators(selectedProc);
    } catch (err: any) {
      setInviteMsg({ text: err.response?.data?.detail || 'Failed to invite user', ok: false });
    } finally { setInviting(false); }
  };

  const handleRemove = async (collabId: number) => {
    if (!selectedProc) return;
    try {
      await api.delete(`/team/${collabId}`);
      setCollaborators(prev => prev.filter(c => c.id !== collabId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove collaborator');
    }
  };

  const handleRoleChange = async (collabId: number, role: string) => {
    try {
      await api.patch(`/team/${collabId}/role`, { role });
      setCollaborators(prev => prev.map(c => c.id === collabId ? { ...c, role, role_label: role } : c));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const isOwner = selectedProc ? selectedProc.user_id === currentUserId : false;

  // All procedures (owned + collaborated)
  const allProcedures = [
    ...myProcedures.map(p => ({ ...p, isOwned: true })),
    ...myCollabs.map(c => ({
      id:             c.procedure_id,
      title:          c.procedure_title,
      procedure_type: { name: c.role_label },
      user_id:        -1,
      isOwned:        false,
      collabRole:     c.role_label,
    })),
  ];

  return (
    <>
      <style>{STYLE}</style>
      <div className="tm-root">

        {/* Hero */}
        <div className="tm-hero">
          <img className="tm-hero-img" src={COVER} alt="Team" loading="eager"/>
          <div className="tm-hero-overlay"/>
          <div className="tm-hero-accent"/>
          <div className="tm-hero-content">
            <div>
              <div className="tm-hero-eyebrow">Collaboration</div>
              <h1 className="tm-hero-title">My <em>team</em></h1>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="tm-body">

          {/* Left — procedure list */}
          <div className="tm-card">
            <div className="tm-card-head">
              <span className="tm-card-title">Procedures</span>
              <span className="tm-card-badge">{allProcedures.length}</span>
            </div>

            {loadingProcs ? (
              <div className="tm-loading">
                <svg style={{ animation:'spin 0.7s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                Loading...
              </div>
            ) : allProcedures.length === 0 ? (
              <div style={{ padding:'32px 22px', textAlign:'center' }}>
                <p style={{ fontSize:13, color:'var(--gray3)', lineHeight:1.6 }}>No procedures yet. Start a procedure in the Timeline page first.</p>
              </div>
            ) : (
              allProcedures.map(proc => (
                <div
                  key={`${proc.id}-${(proc as any).isOwned}`}
                  className={`tm-proc-item ${selectedProc?.id === proc.id ? 'active' : ''}`}
                  onClick={() => loadCollaborators(proc as Procedure)}
                >
                  <div className={`tm-proc-icon ${(proc as any).isOwned ? 'owned' : ''}`}>
                    {(proc as any).isOwned ? '📋' : '🤝'}
                  </div>
                  <div className="tm-proc-info">
                    <div className="tm-proc-name">{proc.title || proc.procedure_type.name}</div>
                    <div className="tm-proc-meta">{proc.procedure_type.name}</div>
                  </div>
                  {(proc as any).isOwned
                    ? <span className="tm-owner-badge">Owner</span>
                    : <span className="tm-collab-badge">{(proc as any).collabRole}</span>
                  }
                </div>
              ))
            )}
          </div>

          {/* Right — team panel */}
          {!selectedProc ? (
            <div className="tm-card">
              <div className="tm-panel-empty">
                <div className="tm-panel-empty-icon">👥</div>
                <div className="tm-panel-empty-title">Select a procedure</div>
                <p className="tm-panel-empty-sub">Choose a procedure on the left to manage its team members and roles.</p>
              </div>
            </div>
          ) : (
            <div className="tm-card">
              <div className="tm-card-head">
                <span className="tm-card-title">{selectedProc.title || selectedProc.procedure_type?.name}</span>
                <span className="tm-card-badge">{collaborators.length} member{collaborators.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Invite form — only for owner */}
              {isOwner && (
                <div className="tm-invite-form">
                  <div className="tm-invite-title">Invite a team member</div>
                  <div className="tm-invite-row">
                    <input
                      className="tm-input"
                      placeholder="Username (e.g. wiem)"
                      value={inviteUsername}
                      onChange={e => setInviteUsername(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    />
                    <select className="tm-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                      <option value="founder">Founder</option>
                      <option value="accountant">Accountant</option>
                      <option value="lawyer">Lawyer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button className="btn-invite" onClick={handleInvite} disabled={!inviteUsername.trim() || inviting}>
                      {inviting
                        ? <svg style={{ animation:'spin 0.7s linear infinite' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                        : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                      }
                      Invite
                    </button>
                  </div>
                  {inviteMsg && (
                    <div className={inviteMsg.ok ? 'tm-invite-success' : 'tm-invite-error'}>
                      {inviteMsg.ok ? '✓ ' : '✗ '}{inviteMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* Collaborator list */}
              {loadingCollabs ? (
                <div className="tm-loading">
                  <svg style={{ animation:'spin 0.7s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                  Loading team...
                </div>
              ) : (
                collaborators.map(c => (
                  <div key={c.id} className="tm-member">
                    <div className={`tm-member-av ${c.role === 'owner' ? 'owner' : ''}`}>
                      {c.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="tm-member-info">
                      <div className="tm-member-name">@{c.username}</div>
                      <div className="tm-member-email">{c.email}</div>
                    </div>
                    <div className="tm-member-actions">
                      {c.role === 'owner' ? (
                        <span className={`role-badge ${ROLE_COLORS['owner']}`}>Owner</span>
                      ) : isOwner ? (
                        <select
                          className="role-select"
                          value={c.role}
                          onChange={e => handleRoleChange(c.id, e.target.value)}
                        >
                          <option value="founder">Founder</option>
                          <option value="accountant">Accountant</option>
                          <option value="lawyer">Lawyer</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${ROLE_COLORS[c.role] || 'role-viewer'}`}>
                          {c.role_label}
                        </span>
                      )}
                      {c.role !== 'owner' && (isOwner || c.user_id === currentUserId) && (
                        <button className="btn-remove" onClick={() => handleRemove(c.id)}>
                          {c.user_id === currentUserId ? 'Leave' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Permissions legend */}
              <div className="tm-legend">
                <div className="tm-legend-title">Role permissions</div>
                <div className="tm-legend-grid">
                  {ROLE_PERMS.map(r => (
                    <div key={r.role} className="tm-legend-row">
                      <div className="tm-legend-dot" style={{ background: r.color }}/>
                      <span style={{ fontWeight:500, color:'var(--ink)', minWidth:80 }}>{r.role}</span>
                      <span>{r.edit ? '✏️ Edit' : r.upload ? '📎 Upload' : '👁 View'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}