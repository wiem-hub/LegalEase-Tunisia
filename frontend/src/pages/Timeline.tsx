// src/pages/Timeline.tsx
// Theme: Navy + Rouge tunisien — cohérent avec Dashboard/Notifications
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { procedureApi } from '../services/procedureApi';
import type { UserProcedure, ProcedureType } from '../types/procedure';
import ProcedureTimeline from '../components/Timeline/procedureTimeline';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy:#1C2B4A; --navy-l:#253560; --red:#C8102E; --red-xs:#FFF0F2;
    --cream:#FAF9F7; --white:#FFFFFF; --gray1:#F5F4F1; --gray2:#ECEAE5;
    --gray3:#9C9A96; --gray4:#6A6865; --ink:#1A1916; --border:#E8E5DF;
    --green:#16A34A; --sh:0 1px 3px rgba(0,0,0,0.05),0 4px 12px rgba(0,0,0,0.06);
  }

  .tl-root { background:var(--cream); min-height:100vh; font-family:'Inter',sans-serif; color:var(--ink); }

  /* ══ HERO ══ */
  .tl-hero {
    position:relative; height:200px; overflow:hidden; background:var(--navy);
  }
  .tl-hero-img {
    position:absolute; inset:0; width:100%; height:100%;
    object-fit:cover; object-position:center 40%;
    filter:brightness(0.25) saturate(0.5);
    transition:transform 10s ease;
  }
  .tl-hero:hover .tl-hero-img { transform:scale(1.03); }
  .tl-hero-overlay {
    position:absolute; inset:0;
    background:linear-gradient(110deg,rgba(28,43,74,0.97) 0%,rgba(28,43,74,0.80) 50%,rgba(28,43,74,0.55) 100%);
  }
  .tl-hero-accent { position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--red); z-index:3; }
  .tl-hero-content {
    position:absolute; z-index:4; inset:0;
    display:flex; align-items:flex-end; justify-content:space-between;
    padding:0 52px 28px; gap:16px;
  }
  .tl-hero-left {}
  .tl-hero-eyebrow {
    font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:0.20em;
    text-transform:uppercase; color:rgba(200,16,46,0.78); margin-bottom:10px;
    display:flex; align-items:center; gap:10px;
  }
  .tl-hero-eyebrow::before { content:''; display:block; width:16px; height:1.5px; background:var(--red); }
  .tl-hero-title {
    font-family:'Playfair Display',serif; font-size:clamp(26px,3.5vw,40px);
    font-weight:700; color:white; letter-spacing:-0.02em; line-height:1.1;
  }
  .tl-hero-title em { font-style:italic; font-weight:400; color:rgba(255,200,205,0.88); }
  .tl-hero-right { display:flex; gap:8px; align-items:center; flex-shrink:0; }
  .btn-export {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 16px; background:rgba(255,255,255,0.10);
    border:1px solid rgba(255,255,255,0.18); border-radius:8px;
    color:rgba(255,255,255,0.75); font-family:'Inter',sans-serif;
    font-size:12.5px; font-weight:500; cursor:pointer;
    transition:all 0.15s; white-space:nowrap;
  }
  .btn-export:hover { background:rgba(255,255,255,0.18); color:white; }
  .btn-new {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 18px; background:var(--red); border:none;
    border-radius:8px; color:white; font-family:'Inter',sans-serif;
    font-size:12.5px; font-weight:600; cursor:pointer;
    transition:all 0.15s; white-space:nowrap;
  }
  .btn-new:hover { background:#A50D25; transform:translateY(-1px); }

  /* ══ BODY ══ */
  .tl-body { padding:28px 52px 64px; }

  /* ══ GRID ══ */
  .tl-grid { display:grid; grid-template-columns:280px 1fr; gap:20px; align-items:start; }

  /* ══ PROC LIST ══ */
  .tl-list { display:flex; flex-direction:column; gap:10px; }

  .tl-proc-card {
    width:100%; text-align:left;
    background:var(--white); border:1px solid var(--border);
    border-radius:12px; padding:16px 18px;
    cursor:pointer; transition:all 0.18s;
    box-shadow:var(--sh);
    position:relative; overflow:hidden;
  }
  .tl-proc-card::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:3px; background:transparent; border-radius:0;
    transition:background 0.15s;
  }
  .tl-proc-card:hover { border-color:rgba(28,43,74,0.25); box-shadow:0 4px 16px rgba(0,0,0,0.09); }
  .tl-proc-card.active { border-color:rgba(28,43,74,0.30); background:rgba(28,43,74,0.02); }
  .tl-proc-card.active::before { background:var(--navy); }

  .tl-proc-top { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:10px; }
  .tl-proc-name { font-size:13px; font-weight:500; color:var(--ink); line-height:1.4; }
  .tl-proc-pct {
    font-family:'Playfair Display',serif; font-size:18px; font-weight:700;
    color:var(--navy); flex-shrink:0; letter-spacing:-0.02em;
  }
  .tl-proc-pct.done { color:var(--green); }

  .tl-proc-bar { width:100%; height:4px; background:var(--gray2); border-radius:4px; overflow:hidden; margin-bottom:8px; }
  .tl-proc-fill { height:100%; border-radius:4px; background:var(--navy); transition:width 0.6s ease; }
  .tl-proc-fill.done { background:var(--green); }

  .tl-proc-meta { font-family:'DM Mono',monospace; font-size:9px; color:var(--gray3); letter-spacing:0.05em; }

  /* ══ EMPTY STATE ══ */
  .tl-empty {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; padding:80px 24px; text-align:center;
  }
  .tl-empty-icon {
    width:64px; height:64px; border-radius:16px;
    background:rgba(28,43,74,0.07); display:flex; align-items:center;
    justify-content:center; margin-bottom:20px; color:var(--navy);
  }
  .tl-empty-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:var(--ink); margin-bottom:8px; }
  .tl-empty-sub { font-size:13px; color:var(--gray3); font-weight:300; line-height:1.6; max-width:300px; margin-bottom:24px; }
  .btn-empty {
    display:inline-flex; align-items:center; gap:7px;
    padding:11px 24px; background:var(--navy); color:white;
    font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
    border:none; border-radius:9px; cursor:pointer; transition:all 0.15s;
  }
  .btn-empty:hover { background:var(--navy-l); transform:translateY(-1px); }

  /* ══ LOADING ══ */
  .tl-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:12px; color:var(--gray3); }

  /* ══ MODAL ══ */
  .tl-modal-backdrop {
    position:fixed; inset:0; z-index:100;
    background:rgba(28,43,74,0.55);
    backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:20px;
  }
  .tl-modal {
    background:var(--white); border-radius:16px;
    width:100%; max-width:480px; overflow:hidden;
    box-shadow:0 24px 64px rgba(0,0,0,0.18);
    animation:modalIn 0.22s cubic-bezier(0.34,1.26,0.64,1);
  }
  @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .tl-modal-head {
    background:var(--navy); padding:20px 24px;
    display:flex; align-items:center; justify-content:space-between;
    border-left:3px solid var(--red);
  }
  .tl-modal-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:white; }
  .tl-modal-close {
    width:28px; height:28px; border-radius:7px; background:rgba(255,255,255,0.10);
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:rgba(255,255,255,0.65); transition:all 0.15s;
  }
  .tl-modal-close:hover { background:rgba(255,255,255,0.20); color:white; }
  .tl-modal-body { padding:20px 24px; }
  .tl-modal-label {
    font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.12em;
    text-transform:uppercase; color:var(--gray4); margin-bottom:10px; display:block;
  }
  .tl-type-btn {
    width:100%; text-align:left; padding:14px 16px; border-radius:10px;
    border:1.5px solid var(--border); background:var(--white); cursor:pointer;
    transition:all 0.15s; margin-bottom:8px;
  }
  .tl-type-btn:hover { border-color:rgba(28,43,74,0.30); background:var(--gray1); }
  .tl-type-btn.sel { border-color:var(--navy); background:rgba(28,43,74,0.03); }
  .tl-type-name { font-size:13.5px; font-weight:500; color:var(--ink); margin-bottom:3px; }
  .tl-type-desc { font-size:12px; color:var(--gray4); font-weight:300; line-height:1.45; }
  .tl-type-meta {
    font-family:'DM Mono',monospace; font-size:9.5px; color:var(--navy);
    margin-top:5px; letter-spacing:0.04em;
  }
  .tl-modal-input {
    width:100%; border:1.5px solid var(--border); border-radius:9px;
    padding:10px 14px; font-family:'Inter',sans-serif; font-size:13.5px;
    color:var(--ink); outline:none; background:var(--white);
    transition:border-color 0.2s,box-shadow 0.2s;
  }
  .tl-modal-input:focus { border-color:rgba(28,43,74,0.40); box-shadow:0 0 0 3px rgba(28,43,74,0.07); }
  .tl-modal-foot { padding:14px 24px 20px; display:flex; justify-content:flex-end; gap:10px; }
  .btn-cancel {
    padding:9px 18px; background:none; border:1px solid var(--border);
    border-radius:8px; color:var(--gray4); font-family:'Inter',sans-serif;
    font-size:13px; cursor:pointer; transition:all 0.15s;
  }
  .btn-cancel:hover { border-color:rgba(28,43,74,0.25); color:var(--ink); }
  .btn-start {
    display:inline-flex; align-items:center; gap:6px;
    padding:9px 22px; background:var(--navy); color:white;
    font-family:'Inter',sans-serif; font-size:13px; font-weight:600;
    border:none; border-radius:8px; cursor:pointer; transition:all 0.15s;
  }
  .btn-start:hover:not(:disabled) { background:var(--navy-l); }
  .btn-start:disabled { opacity:0.55; cursor:not-allowed; }

  @keyframes spin { to { transform:rotate(360deg); } }

  @media(max-width:960px) {
    .tl-hero-content { padding:0 24px 24px; }
    .tl-body { padding:20px 16px 48px; }
    .tl-grid { grid-template-columns:1fr; }
  }
`;

const COVER = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=85&auto=format&fit=crop';

// ── Start Modal ──────────────────────────────────────────────────────────────
interface StartModalProps {
  types: ProcedureType[];
  onClose: () => void;
  onStart: (typeId: number, title?: string) => Promise<void>;
}

const StartModal = ({ types, onClose, onStart }: StartModalProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title,      setTitle]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      await onStart(selectedId, title || undefined);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const selected = types.find(t => t.id === selectedId);

  return (
    <div className="tl-modal-backdrop" onClick={onClose}>
      <div className="tl-modal" onClick={e => e.stopPropagation()}>
        <div className="tl-modal-head">
          <span className="tl-modal-title">Start a new procedure</span>
          <button className="tl-modal-close" onClick={onClose}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="tl-modal-body">
          <label className="tl-modal-label">Select a procedure type</label>
          {types.map(type => (
            <button
              key={type.id}
              className={`tl-type-btn ${selectedId === type.id ? 'sel' : ''}`}
              onClick={() => setSelectedId(type.id)}
            >
              <div className="tl-type-name">{type.name}</div>
              {type.description && <div className="tl-type-desc">{type.description}</div>}
              {type.estimated_days && (
                <div className="tl-type-meta">~{type.estimated_days} days · {type.steps?.length || 0} steps</div>
              )}
            </button>
          ))}

          {selected && (
            <div style={{ marginTop: 16 }}>
              <label className="tl-modal-label">
                Custom name <span style={{ color: 'var(--gray3)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                className="tl-modal-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={selected.name}
              />
            </div>
          )}
        </div>

        <div className="tl-modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-start" onClick={handleSubmit} disabled={!selectedId || loading}>
            {loading && (
              <svg style={{ animation:'spin 0.7s linear infinite' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/>
              </svg>
            )}
            Start procedure
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Timeline page ─────────────────────────────────────────────────────────────
const Timeline = () => {
  const [procedures,      setProcedures]      = useState<UserProcedure[]>([]);
  const [procedureTypes,  setProcedureTypes]  = useState<ProcedureType[]>([]);
  const [selected,        setSelected]        = useState<UserProcedure | null>(null);
  const [showModal,       setShowModal]       = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [procs, types] = await Promise.all([
        procedureApi.getMyProcedures(),
        procedureApi.getTypes(),
      ]);
      setProcedures(procs);
      setProcedureTypes(types);
      if (procs.length > 0 && !selected) setSelected(procs[0]);
    } catch {
      setError('Failed to load procedures. Please try again.');
      toast.error('Failed to load procedures');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (typeId: number, title?: string) => {
    try {
      const newProc = await procedureApi.startProcedure(typeId, title);
      setProcedures(prev => [newProc, ...prev]);
      setSelected(newProc);
      toast.success('Procedure started successfully');
    } catch (err) {
      toast.error('Could not start procedure');
      throw err;
    }
  };

  const handleUpdate = (updated: UserProcedure) => {
    setProcedures(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
    toast.success('Progress updated');
  };

  const handleExportPDF = async () => {
    try {
      const blob = await procedureApi.exportProgressPDF();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'progress_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  if (loading) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="tl-loading">
          <svg style={{ animation:'spin 0.7s linear infinite' }} width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          <span style={{ fontSize:13, color:'var(--gray3)', fontFamily:'Inter,sans-serif' }}>Loading your procedures...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="tl-root">

        {/* ══ HERO ══ */}
        <div className="tl-hero">
          <img className="tl-hero-img" src={COVER} alt="My Procedures" loading="eager"/>
          <div className="tl-hero-overlay"/>
          <div className="tl-hero-accent"/>
          <div className="tl-hero-content">
            <div className="tl-hero-left">
              <div className="tl-hero-eyebrow">Procedures</div>
              <h1 className="tl-hero-title">
                My <em>procedures</em>
              </h1>
            </div>
            <div className="tl-hero-right">
              <button className="btn-export" onClick={handleExportPDF}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4-4-4m4-8v12"/>
                </svg>
                Export PDF
              </button>
              <button className="btn-new" onClick={() => setShowModal(true)}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                New procedure
              </button>
            </div>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="tl-body">

          {error && (
            <div style={{ marginBottom:20, padding:'12px 16px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:10, fontSize:13, color:'#991B1B' }}>
              {error}
            </div>
          )}

          {procedures.length === 0 ? (
            <div className="tl-empty">
              <div className="tl-empty-icon">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div className="tl-empty-title">No procedures yet</div>
              <p className="tl-empty-sub">
                Start your first procedure to track your administrative progress step by step.
              </p>
              <button className="btn-empty" onClick={() => setShowModal(true)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Start your first procedure
              </button>
            </div>
          ) : (
            <div className="tl-grid">

              {/* Left — procedure list */}
              <div className="tl-list">
                {procedures.map(proc => {
                  const pct        = proc.completion_percentage ?? 0;
                  const isSelected = selected?.id === proc.id;
                  const isDone     = !!proc.completed_at;
                  const doneCt     = proc.step_progress.filter(s => s.status === 'completed').length;

                  return (
                    <button
                      key={proc.id}
                      className={`tl-proc-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelected(proc)}
                    >
                      <div className="tl-proc-top">
                        <span className="tl-proc-name">
                          {proc.title || proc.procedure_type.name}
                        </span>
                        <span className={`tl-proc-pct ${isDone ? 'done' : ''}`}>{pct}%</span>
                      </div>
                      <div className="tl-proc-bar">
                        <div
                          className={`tl-proc-fill ${isDone ? 'done' : ''}`}
                          style={{ width:`${pct}%` }}
                        />
                      </div>
                      <div className="tl-proc-meta">
                        {doneCt}/{proc.step_progress.length} steps
                        {isDone && ' · ✓ Completed'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right — timeline detail */}
              <div>
                {selected ? (
                  <ProcedureTimeline
                    key={selected.id}
                    procedure={selected}
                    onUpdate={handleUpdate}
                  />
                ) : (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'200px', color:'var(--gray3)', fontSize:13, fontFamily:'Inter,sans-serif' }}>
                    Select a procedure to view its timeline
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <StartModal
            types={procedureTypes}
            onClose={() => setShowModal(false)}
            onStart={handleStart}
          />
        )}

      </div>
    </>
  );
};

export default Timeline;