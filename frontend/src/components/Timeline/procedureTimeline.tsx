import React from 'react';
// src/components/Timeline/ProcedureTimeline.tsx
// Theme: Blanc + Navy + Rouge tunisien — with contextual Ask AI button per step
import { useState } from 'react';
import type { UserProcedure, UserStepProgress, StepStatus } from '../../types/procedure';
import { procedureApi } from '../../services/procedureApi';
import { notificationApi } from '../../services/notificationApi';
import StepDocuments from './StepDocuments';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  :root {
    --navy:#1C2B4A;--red:#C8102E;--red-xs:#FFF0F2;--cream:#FAF9F7;--white:#FFFFFF;
    --gray1:#F5F4F1;--gray2:#ECEAE5;--gray3:#9C9A96;--gray4:#6A6865;--ink:#1A1916;
    --border:#E8E5DF;--green:#16A34A;--blue:#2563EB;--amber:#D97706;
  }
  .tl-wrap { background:var(--white); border:1px solid var(--border); border-radius:18px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.05),0 8px 28px rgba(0,0,0,0.07); font-family:'Inter',sans-serif; }
  .tl-header { padding:24px 28px 20px; border-bottom:1px solid var(--gray1); background:var(--white); }
  .tl-header-top { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; }
  .tl-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; color:var(--ink); letter-spacing:-0.015em; line-height:1.2; margin-bottom:4px; }
  .tl-meta { font-family:'DM Mono',monospace; font-size:10px; color:var(--gray3); letter-spacing:0.06em; text-transform:uppercase; }
  .tl-complete-badge { display:inline-flex; align-items:center; gap:5px; padding:6px 12px; background:rgba(22,163,74,0.10); color:var(--green); border:1px solid rgba(22,163,74,0.20); border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; flex-shrink:0; }
  .tl-pct { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--navy); letter-spacing:-0.02em; flex-shrink:0; }
  .tl-progress-wrap { width:100%; height:6px; background:var(--gray1); border-radius:6px; overflow:hidden; }
  .tl-progress-fill { height:100%; border-radius:6px; background:linear-gradient(90deg,var(--navy) 0%,#3B5BDB 100%); transition:width 0.7s ease; }
  .tl-progress-meta { display:flex; justify-content:space-between; margin-top:6px; font-family:'DM Mono',monospace; font-size:9.5px; color:var(--gray3); letter-spacing:0.05em; }
  .tl-steps { padding:24px 28px; display:flex; flex-direction:column; }
  .step-row { display:flex; gap:16px; }
  .step-left { display:flex; flex-direction:column; align-items:center; }
  .step-dot { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:2; transition:all 0.2s; }
  .sd-completed { background:var(--green); color:white; box-shadow:0 0 0 4px rgba(22,163,74,0.12); }
  .sd-in_progress { background:var(--navy); color:white; box-shadow:0 0 0 4px rgba(28,43,74,0.12); }
  .sd-pending { background:var(--gray1); color:var(--gray3); border:1.5px solid var(--border); }
  .sd-blocked { background:var(--red); color:white; box-shadow:0 0 0 4px rgba(200,16,46,0.12); }
  .step-dot svg { width:15px; height:15px; }
  .step-line { width:2px; flex:1; margin:4px 0; border-radius:2px; min-height:20px; }
  .sl-completed { background:rgba(22,163,74,0.25); }
  .sl-default { background:var(--gray2); }
  .step-card { flex:1; margin-bottom:16px; border-radius:12px; border:1px solid var(--border); background:var(--white); transition:all 0.2s; overflow:hidden; }
  .step-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); }
  .sc-in_progress { border-color:rgba(28,43,74,0.25); background:rgba(28,43,74,0.02); box-shadow:0 2px 12px rgba(28,43,74,0.08); }
  .sc-completed { border-color:rgba(22,163,74,0.18); background:var(--white); }
  .sc-blocked { border-color:rgba(200,16,46,0.22); background:rgba(200,16,46,0.02); }
  .sc-pending { border-color:var(--gray2); background:var(--gray1); opacity:0.70; }
  .step-toggle { width:100%; display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:none; border:none; cursor:pointer; text-align:left; font-family:'Inter',sans-serif; }
  .step-toggle-left { display:flex; align-items:center; gap:10px; flex-wrap:wrap; flex:1; min-width:0; }
  .step-order { font-family:'DM Mono',monospace; font-size:9.5px; color:var(--gray3); letter-spacing:0.08em; width:20px; flex-shrink:0; }
  .step-name { font-size:13.5px; font-weight:500; color:var(--ink); letter-spacing:-0.01em; }
  .step-name.muted { color:var(--gray3); font-weight:400; }
  .step-status-badge { font-family:'DM Mono',monospace; font-size:9px; padding:2px 9px; border-radius:20px; letter-spacing:0.05em; white-space:nowrap; font-weight:500; }
  .ssb-completed { background:rgba(22,163,74,0.10); color:var(--green); }
  .ssb-in_progress { background:rgba(28,43,74,0.09); color:var(--navy); }
  .ssb-pending { background:var(--gray1); color:var(--gray3); }
  .ssb-blocked { background:rgba(200,16,46,0.10); color:var(--red); }
  .step-deadline-badge { display:inline-flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:9px; padding:2px 8px; border-radius:20px; letter-spacing:0.04em; white-space:nowrap; }
  .sdb-overdue { background:rgba(200,16,46,0.10); color:var(--red); }
  .sdb-today { background:rgba(217,119,6,0.10); color:var(--amber); }
  .sdb-soon { background:rgba(217,119,6,0.08); color:var(--amber); }
  .sdb-normal { background:var(--gray1); color:var(--gray3); }
  .step-doc-count { display:inline-flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:9px; color:var(--gray3); background:var(--gray1); padding:2px 8px; border-radius:20px; }
  .step-chevron { color:var(--gray3); flex-shrink:0; transition:transform 0.2s; }
  .step-chevron.open { transform:rotate(180deg); }
  .step-body { padding:0 18px 16px; border-top:1px solid var(--gray1); }
  .step-desc { font-size:13px; color:var(--gray4); line-height:1.70; font-weight:300; padding:14px 0 10px; }
  .sec-label { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--gray3); margin-bottom:8px; margin-top:14px; display:block; }
  .req-doc-item { display:flex; align-items:center; gap:7px; font-size:12.5px; color:var(--gray4); padding:5px 0; border-bottom:1px solid var(--gray1); }
  .req-doc-item:last-child { border-bottom:none; }
  .deadline-row { display:flex; align-items:center; gap:10px; }
  .deadline-input { font-family:'DM Mono',monospace; font-size:12px; border:1.5px solid var(--border); border-radius:8px; padding:8px 12px; color:var(--ink); background:var(--white); outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .deadline-input:focus { border-color:rgba(28,43,74,0.40); box-shadow:0 0 0 3px rgba(28,43,74,0.07); }
  .deadline-clear { font-family:'DM Mono',monospace; font-size:10px; color:var(--gray3); background:none; border:none; cursor:pointer; letter-spacing:0.06em; text-transform:uppercase; transition:color 0.15s; padding:0; }
  .deadline-clear:hover { color:var(--red); }
  .notes-area { width:100%; font-family:'Inter',sans-serif; font-size:13px; font-weight:300; border:1.5px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--ink); background:var(--white); outline:none; resize:none; line-height:1.6; transition:border-color 0.2s,box-shadow 0.2s; }
  .notes-area:focus { border-color:rgba(28,43,74,0.35); box-shadow:0 0 0 3px rgba(28,43,74,0.06); }
  .notes-area:disabled { background:var(--gray1); color:var(--gray3); }
  .notes-area::placeholder { color:var(--gray3); }
  .step-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; align-items:center; }
  .btn-complete { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; background:var(--green); color:white; font-family:'Inter',sans-serif; font-size:12.5px; font-weight:600; border:none; border-radius:8px; cursor:pointer; transition:all 0.15s; }
  .btn-complete:hover:not(:disabled) { background:#15803D; transform:translateY(-1px); box-shadow:0 6px 16px rgba(22,163,74,0.25); }
  .btn-complete:disabled { opacity:0.60; cursor:not-allowed; }
  .btn-block { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; background:var(--white); color:var(--red); font-family:'Inter',sans-serif; font-size:12.5px; font-weight:500; border:1.5px solid rgba(200,16,46,0.25); border-radius:8px; cursor:pointer; transition:all 0.15s; }
  .btn-block:hover:not(:disabled) { background:var(--red-xs); border-color:rgba(200,16,46,0.50); }
  .btn-block:disabled { opacity:0.60; cursor:not-allowed; }
  .btn-resume { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; background:var(--navy); color:white; font-family:'Inter',sans-serif; font-size:12.5px; font-weight:600; border:none; border-radius:8px; cursor:pointer; transition:all 0.15s; }
  .btn-resume:hover:not(:disabled) { background:#253560; transform:translateY(-1px); }
  .btn-resume:disabled { opacity:0.60; cursor:not-allowed; }

  /* ── Ask AI button ── */
  .btn-ask-ai {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; background:var(--white); color:var(--navy);
    font-family:'Inter',sans-serif; font-size:12px; font-weight:500;
    border:1.5px solid rgba(28,43,74,0.20); border-radius:8px;
    cursor:pointer; transition:all 0.15s; margin-left:auto;
  }
  .btn-ask-ai:hover { background:rgba(28,43,74,0.05); border-color:rgba(28,43,74,0.40); transform:translateY(-1px); box-shadow:0 4px 12px rgba(28,43,74,0.12); }

  /* ── AI context popup ── */
  .ai-ctx-popup {
    position:fixed; bottom:160px; right:28px; z-index:1050;
    background:var(--white); border:1px solid var(--border); border-radius:14px;
    padding:16px 18px; width:300px;
    box-shadow:0 8px 32px rgba(0,0,0,0.12);
    animation:popIn 0.2s cubic-bezier(0.34,1.26,0.64,1);
  }
  @keyframes popIn { from{opacity:0;transform:scale(0.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .ai-ctx-title { font-family:'Playfair Display',serif; font-size:13px; font-weight:600; color:var(--ink); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .ai-ctx-questions { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
  .ai-ctx-q { display:flex; align-items:flex-start; gap:7px; padding:8px 12px; border-radius:8px; background:var(--gray1); border:1px solid var(--border); font-size:12px; color:var(--gray4); cursor:pointer; transition:all 0.15s; text-align:left; font-family:'Inter',sans-serif; line-height:1.4; }
  .ai-ctx-q:hover { background:var(--navy); color:white; border-color:var(--navy); }
  .ai-ctx-q-dot { width:5px; height:5px; border-radius:50%; background:var(--navy); flex-shrink:0; margin-top:4px; opacity:0.5; }
  .ai-ctx-q:hover .ai-ctx-q-dot { background:white; opacity:0.7; }
  .ai-ctx-close { width:100%; display:flex; align-items:center; justify-content:center; padding:7px; border-radius:7px; border:1px solid var(--border); background:none; font-family:'DM Mono',monospace; font-size:9.5px; color:var(--gray3); cursor:pointer; letter-spacing:0.06em; text-transform:uppercase; transition:all 0.15s; }
  .ai-ctx-close:hover { background:var(--gray1); color:var(--ink); }

  .completed-info { display:inline-flex; align-items:center; gap:5px; font-family:'DM Mono',monospace; font-size:10px; color:var(--green); letter-spacing:0.05em; margin-top:12px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spin { animation:spin 0.7s linear infinite; }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const deadlineInfo = (due: string) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0)   return { text: `Overdue by ${-diff}d`, cls: 'sdb-overdue' };
  if (diff === 0) return { text: 'Due today',             cls: 'sdb-today'  };
  if (diff <= 3)  return { text: `Due in ${diff}d`,       cls: 'sdb-soon'   };
  return { text: `Due ${d.toLocaleDateString('en-US', { month:'short', day:'numeric' })}`, cls: 'sdb-normal' };
};

const StatusDot = ({ status }: { status: StepStatus }) => {
  const icons: Record<StepStatus, React.ReactNode> = {
    completed:   <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>,
    in_progress: <svg className="spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
    pending:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="8"/></svg>,
    blocked:     <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  };
  return <div className={`step-dot sd-${status}`}>{icons[status]}</div>;
};

const STATUS_LABELS: Record<StepStatus, string> = {
  completed: 'Completed', in_progress: 'In progress', pending: 'Pending', blocked: 'Blocked',
};

/* ─── Build contextual questions for a step ──────────────────────────────── */
const buildQuestions = (step: UserStepProgress['step'], status: StepStatus): string[] => {
  const title = step.title;
  const docs  = step.documents_required
    ? step.documents_required.split(',').map(d => d.trim()).filter(Boolean)
    : [];
  const qs: string[] = [];
  if (status === 'blocked') {
    qs.push(`Je suis bloqué sur "${title}" — que dois-je faire ?`);
    qs.push(`Quels sont les problèmes courants pour "${title}" ?`);
  } else if (status === 'in_progress') {
    qs.push(`Comment compléter "${title}" étape par étape ?`);
    qs.push(`Où exactement aller pour "${title}" ?`);
  } else {
    qs.push(`En quoi consiste "${title}" ?`);
    qs.push(`Combien de temps prend "${title}" en général ?`);
  }
  if (docs.length > 0) qs.push(`Où obtenir ${docs[0]} ?`);
  qs.push(`Que se passe-t-il après "${title}" ?`);
  return qs.slice(0, 4);
};

/* ─── AI Context Popup ───────────────────────────────────────────────────── */
interface AICtxProps {
  step: UserStepProgress['step'];
  status: StepStatus;
  onSelect: (q: string) => void;
  onClose: () => void;
}

const AIContextPopup = ({ step, status, onSelect, onClose }: AICtxProps) => (
  <div className="ai-ctx-popup">
    <div className="ai-ctx-title">⚖️ Ask AI about this step</div>
    <div className="ai-ctx-questions">
      {buildQuestions(step, status).map((q, i) => (
        <button key={i} className="ai-ctx-q" onClick={() => onSelect(q)}>
          <div className="ai-ctx-q-dot"/>
          {q}
        </button>
      ))}
    </div>
    <button className="ai-ctx-close" onClick={onClose}>Close</button>
  </div>
);

/* ─── StepCard ───────────────────────────────────────────────────────────── */
interface StepCardProps {
  progress: UserStepProgress;
  isLast: boolean;
  procedureId: number;
  onUpdate: (stepId: number, status: StepStatus, notes?: string) => Promise<void>;
  onDueDateChange: (progressId: number, stepId: number, dueDate: string | null) => Promise<void>;
  onAskAI: (message: string) => void;
}

const StepCard = ({ progress, isLast, procedureId, onUpdate, onDueDateChange, onAskAI }: StepCardProps) => {
  const [expanded,    setExpanded]    = useState(progress.status === 'in_progress');
  const [notes,       setNotes]       = useState(progress.notes || '');
  const [loading,     setLoading]     = useState(false);
  const [dueSaving,   setDueSaving]   = useState(false);
  const [showAI,      setShowAI]      = useState(false);

  const { status } = progress;
  const isPending   = status === 'pending';
  const isCompleted = status === 'completed';
  const dl   = progress.due_date ? deadlineInfo(progress.due_date) : null;
  const docs = progress.step.documents_required
    ? progress.step.documents_required.split(',').map(d => d.trim()).filter(Boolean)
    : [];

  const handleAction = async (s: StepStatus) => {
    setLoading(true);
    try { await onUpdate(progress.step.id, s, notes || undefined); }
    finally { setLoading(false); }
  };

  const handleDueDate = async (val: string) => {
    setDueSaving(true);
    try { await onDueDateChange(progress.id, progress.step.id, val || null); }
    finally { setDueSaving(false); }
  };

  const buildContext = () => [
    `Étape: ${progress.step.title}`,
    `Statut: ${STATUS_LABELS[status]}`,
    progress.step.description ? `Description: ${progress.step.description}` : '',
    docs.length > 0 ? `Documents requis: ${docs.join(', ')}` : '',
    progress.due_date ? `Échéance: ${progress.due_date.substring(0, 10)}` : '',
  ].filter(Boolean).join('\n');

  const handleAIQuestion = (q: string) => {
    setShowAI(false);
    const enriched = `[Contexte — ${progress.step.title}]\n${buildContext()}\n\nQuestion: ${q}`;
    onAskAI(enriched);
  };

  return (
    <div className="step-row">
      <div className="step-left">
        <StatusDot status={status} />
        {!isLast && <div className={`step-line ${isCompleted ? 'sl-completed' : 'sl-default'}`} />}
      </div>

      <div className={`step-card sc-${status}`}>
        <button className="step-toggle" onClick={() => setExpanded(v => !v)}>
          <div className="step-toggle-left">
            <span className="step-order">{String(progress.step.order).padStart(2, '0')}</span>
            <span className={`step-name ${isPending ? 'muted' : ''}`}>{progress.step.title}</span>
            <span className={`step-status-badge ssb-${status}`}>{STATUS_LABELS[status]}</span>
            {dl && !isCompleted && (
              <span className={`step-deadline-badge ${dl.cls}`}>
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {dl.text}
              </span>
            )}
            {progress.documents.length > 0 && (
              <span className="step-doc-count">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                {progress.documents.length}
              </span>
            )}
          </div>
          <svg className={`step-chevron ${expanded ? 'open' : ''}`} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>

        {expanded && (
          <div className="step-body">
            {progress.step.description && <p className="step-desc">{progress.step.description}</p>}

            {docs.length > 0 && (
              <div>
                <span className="sec-label">Required documents</span>
                {docs.map((doc, i) => (
                  <div key={i} className="req-doc-item">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color:'#2563EB', flexShrink:0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    {doc}
                  </div>
                ))}
              </div>
            )}

            {!isPending && !isCompleted && (
              <div>
                <span className="sec-label">Deadline</span>
                <div className="deadline-row">
                  <input className="deadline-input" type="date"
                    defaultValue={progress.due_date ? progress.due_date.substring(0, 10) : ''}
                    min={new Date().toISOString().substring(0, 10)}
                    onChange={e => handleDueDate(e.target.value)}
                  />
                  {dueSaving && <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color:'#9C9A96' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>}
                  {progress.due_date && !dueSaving && <button className="deadline-clear" onClick={() => handleDueDate('')}>Clear</button>}
                </div>
              </div>
            )}

            <div>
              <span className="sec-label">Uploaded files</span>
              <StepDocuments progressId={progress.id} initialDocuments={progress.documents} disabled={isPending}/>
            </div>

            <div>
              <span className="sec-label">Notes</span>
              <textarea className="notes-area" value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} disabled={isCompleted} placeholder="Add notes for this step..."/>
            </div>

            <div className="step-actions">
              {!isCompleted && !isPending && (
                <>
                  {status === 'in_progress' && (
                    <>
                      <button className="btn-complete" onClick={() => handleAction('completed')} disabled={loading}>
                        {loading
                          ? <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        }
                        Mark as completed
                      </button>
                      <button className="btn-block" onClick={() => handleAction('blocked')} disabled={loading}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        Mark as blocked
                      </button>
                    </>
                  )}
                  {status === 'blocked' && (
                    <button className="btn-resume" onClick={() => handleAction('in_progress')} disabled={loading}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Resume step
                    </button>
                  )}
                </>
              )}

              {/* Ask AI button */}
              <button className="btn-ask-ai" onClick={e => { e.stopPropagation(); setShowAI(v => !v); }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                Ask AI
              </button>
            </div>

            {isCompleted && progress.completed_at && (
              <div className="completed-info">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Completed on {new Date(progress.completed_at).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            )}
          </div>
        )}
      </div>

      {showAI && (
        <AIContextPopup
          step={progress.step}
          status={status}
          onSelect={handleAIQuestion}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
interface ProcedureTimelineProps {
  procedure: UserProcedure;
  onUpdate?: (updated: UserProcedure) => void;
  onAskAI?: (message: string) => void;
}

const ProcedureTimeline = ({ procedure, onUpdate, onAskAI }: ProcedureTimelineProps) => {
  const [local, setLocal] = useState<UserProcedure>(procedure);

  const handleStepUpdate = async (stepId: number, status: StepStatus, notes?: string) => {
    await procedureApi.updateStep(local.id, stepId, status, notes);
    const updated = await procedureApi.getMyProcedure(local.id);
    setLocal(updated); onUpdate?.(updated);
  };

  const handleDueDateChange = async (progressId: number, stepId: number, dueDate: string | null) => {
    await notificationApi.setDueDate(local.id, stepId, dueDate);
    const updated = await procedureApi.getMyProcedure(local.id);
    setLocal(updated); onUpdate?.(updated);
  };

  const handleAskAI = (message: string) => {
    // Dispatch custom event — AIChatWidget listens to open + send the message
    window.dispatchEvent(new CustomEvent('legalease:ask-ai', { detail: { message } }));
    onAskAI?.(message);
  };

  const sorted     = [...local.step_progress].sort((a, b) => a.step.order - b.step.order);
  const pct        = local.completion_percentage ?? 0;
  const isComplete = !!local.completed_at;
  const doneCt     = sorted.filter(p => p.status === 'completed').length;

  return (
    <>
      <style>{STYLE}</style>
      <div className="tl-wrap">
        <div className="tl-header">
          <div className="tl-header-top">
            <div>
              <h2 className="tl-title">{local.title || local.procedure_type.name}</h2>
              <p className="tl-meta">
                Started {new Date(local.started_at).toLocaleDateString('en-US', { day:'numeric', month:'long', year:'numeric' })}
                {local.procedure_type.estimated_days && ` · ~${local.procedure_type.estimated_days} days`}
              </p>
            </div>
            {isComplete
              ? <div className="tl-complete-badge"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Completed</div>
              : <div className="tl-pct">{pct}%</div>
            }
          </div>
          <div className="tl-progress-wrap">
            <div className="tl-progress-fill" style={{ width:`${pct}%` }} />
          </div>
          <div className="tl-progress-meta">
            <span>{doneCt} of {sorted.length} steps completed</span>
            {!isComplete && local.current_step_order && <span>Step {local.current_step_order} in progress</span>}
          </div>
        </div>

        <div className="tl-steps">
          {sorted.map((progress, i) => (
            <StepCard
              key={progress.id}
              progress={progress}
              isLast={i === sorted.length - 1}
              procedureId={local.id}
              onUpdate={handleStepUpdate}
              onDueDateChange={handleDueDateChange}
              onAskAI={handleAskAI}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ProcedureTimeline;