// src/components/AI/AIChatWidget.tsx
// Floating chatbot for logged-in users — with conversation history
import { useState, useRef, useEffect, useCallback } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  .ai-fab {
    position:fixed; bottom:28px; right:28px; z-index:999;
    width:54px; height:54px; border-radius:15px; background:#1C2B4A;
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(28,43,74,0.35); transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); color:white;
  }
  .ai-fab:hover { transform:scale(1.08); }
  .ai-fab.open { background:#C8102E; border-radius:13px; }
  .ai-fab-tooltip {
    position:absolute; right:62px; background:#1C2B4A; color:white;
    font-family:'Inter',sans-serif; font-size:12px; font-weight:500;
    padding:6px 12px; border-radius:8px; white-space:nowrap;
    opacity:0; pointer-events:none; transform:translateX(6px); transition:all 0.18s;
  }
  .ai-fab-tooltip::after {
    content:''; position:absolute; right:-5px; top:50%; transform:translateY(-50%);
    border:5px solid transparent; border-right:none; border-left-color:#1C2B4A;
  }
  .ai-fab:hover .ai-fab-tooltip { opacity:1; transform:translateX(0); }
  .ai-fab-badge {
    position:absolute; top:-4px; right:-4px; width:18px; height:18px; border-radius:50%;
    background:#C8102E; border:2px solid white; display:flex; align-items:center;
    justify-content:center; font-size:9px; font-weight:700; color:white; font-family:'Inter',sans-serif;
  }
  .ai-panel {
    position:fixed; bottom:94px; right:28px; z-index:998;
    width:370px; height:580px; background:white; border:1px solid #E8E5DF;
    border-radius:20px; box-shadow:0 16px 64px rgba(0,0,0,0.14);
    display:flex; flex-direction:column; overflow:hidden;
    font-family:'Inter',sans-serif; transform-origin:bottom right;
    transition:all 0.25s cubic-bezier(0.34,1.26,0.64,1);
  }
  .ai-panel.closed { opacity:0; transform:scale(0.85) translateY(16px); pointer-events:none; }
  .ai-panel.open   { opacity:1; transform:scale(1) translateY(0); }
  .aip-header {
    background:linear-gradient(135deg,#1C2B4A 0%,#253560 100%);
    padding:14px 18px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .aip-hl { display:flex; align-items:center; gap:10px; }
  .aip-av {
    width:36px; height:36px; border-radius:10px;
    background:rgba(200,16,46,0.22); border:1px solid rgba(200,16,46,0.38);
    display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0;
  }
  .aip-name { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:white; margin-bottom:2px; }
  .aip-st { display:flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:8.5px; color:rgba(255,255,255,0.42); }
  .aip-std { width:5px; height:5px; border-radius:50%; background:#34D399; box-shadow:0 0 5px rgba(52,211,153,0.6); }
  .aip-hr { display:flex; align-items:center; gap:6px; }
  .aip-tbtn {
    font-family:'DM Mono',monospace; font-size:9px; color:rgba(255,255,255,0.35);
    background:none; border:none; cursor:pointer; letter-spacing:0.06em; text-transform:uppercase; padding:0; transition:color 0.15s;
  }
  .aip-tbtn:hover { color:#FCA5A5; }
  .aip-x {
    width:28px; height:28px; border-radius:7px; background:rgba(255,255,255,0.10);
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    color:rgba(255,255,255,0.65); transition:all 0.15s;
  }
  .aip-x:hover { background:rgba(255,255,255,0.18); color:white; }
  .aip-tabs {
    display:flex; gap:4px; padding:8px 12px; border-bottom:1px solid #F5F4F1;
    overflow-x:auto; flex-shrink:0; scrollbar-width:none;
  }
  .aip-tabs::-webkit-scrollbar { display:none; }
  .aip-tab {
    font-family:'DM Mono',monospace; font-size:9px; padding:4px 10px; border-radius:20px;
    border:1px solid #E8E5DF; background:#FAF9F7; color:#6A6865;
    cursor:pointer; white-space:nowrap; transition:all 0.15s; max-width:110px;
    overflow:hidden; text-overflow:ellipsis; letter-spacing:0.03em;
  }
  .aip-tab.cur { background:#1C2B4A; color:white; border-color:#1C2B4A; }
  .aip-tab.new { background:#C8102E; color:white; border-color:#C8102E; flex-shrink:0; }
  .aip-tab:hover:not(.cur):not(.new) { border-color:#1C2B4A; color:#1C2B4A; }
  .aip-sugg {
    display:flex; gap:6px; padding:7px 13px; border-bottom:1px solid #F5F4F1;
    overflow-x:auto; flex-shrink:0; scrollbar-width:none;
  }
  .aip-sugg::-webkit-scrollbar { display:none; }
  .aip-sb {
    font-family:'DM Mono',monospace; font-size:9px; padding:4px 10px; border-radius:20px;
    border:1px solid #E8E5DF; background:#FAF9F7; color:#6A6865;
    cursor:pointer; white-space:nowrap; transition:all 0.15s;
  }
  .aip-sb:hover { background:#1C2B4A; color:white; border-color:#1C2B4A; }
  .aip-sb:disabled { opacity:0.5; cursor:not-allowed; }
  .aip-msgs { flex:1; overflow-y:auto; padding:14px 13px; display:flex; flex-direction:column; gap:13px; scroll-behavior:smooth; }
  .aip-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:20px; text-align:center; flex:1; }
  .aip-ei { font-size:30px; }
  .aip-et { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#1A1916; }
  .aip-es { font-size:12px; color:#9C9A96; font-weight:300; line-height:1.65; max-width:240px; }
  .aip-msg { display:flex; gap:8px; align-items:flex-start; }
  .aip-msg.user { flex-direction:row-reverse; }
  .aip-mav { width:26px; height:26px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:12px; flex-shrink:0; margin-top:1px; }
  .aip-msg.assistant .aip-mav { background:#1C2B4A; color:white; }
  .aip-msg.user .aip-mav { background:#FFF0F2; color:#C8102E; font-size:10px; font-weight:700; font-family:'Inter',sans-serif; }
  .aip-mb { display:flex; flex-direction:column; gap:3px; max-width:80%; }
  .aip-bbl { padding:10px 13px; font-size:13px; line-height:1.68; border-radius:12px; word-break:break-word; white-space:pre-wrap; }
  .aip-msg.assistant .aip-bbl { background:#F5F4F1; color:#1A1916; border-radius:4px 12px 12px 12px; }
  .aip-msg.user .aip-bbl { background:#1C2B4A; color:white; border-radius:12px 4px 12px 12px; }
  .aip-err { padding:9px 12px; background:#FEF2F2; border:1px solid #FECACA; border-radius:9px; font-size:12px; color:#991B1B; line-height:1.5; }
  .aip-t { font-family:'DM Mono',monospace; font-size:8.5px; color:#9C9A96; padding:0 2px; }
  .aip-msg.user .aip-t { text-align:right; }
  .aip-dot { display:flex; align-items:center; gap:3px; padding:10px 13px; background:#F5F4F1; border-radius:4px 12px 12px 12px; width:fit-content; }
  .aip-d { width:5px; height:5px; border-radius:50%; background:#9C9A96; animation:db 1.2s infinite; }
  .aip-d:nth-child(2){animation-delay:0.2s} .aip-d:nth-child(3){animation-delay:0.4s}
  @keyframes db { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:1} }
  .aip-ia { padding:9px 12px 13px; border-top:1px solid #F5F4F1; flex-shrink:0; background:white; }
  .aip-ib { display:flex; align-items:flex-end; gap:7px; background:#FAF9F7; border:1.5px solid #E8E5DF; border-radius:10px; padding:8px 10px; transition:border-color 0.2s,box-shadow 0.2s; }
  .aip-ib:focus-within { border-color:rgba(28,43,74,0.35); box-shadow:0 0 0 3px rgba(28,43,74,0.06); }
  .aip-ib textarea { flex:1; border:none; outline:none; background:transparent; font-family:'Inter',sans-serif; font-size:13px; color:#1A1916; resize:none; line-height:1.5; max-height:72px; overflow-y:auto; padding:0; }
  .aip-ib textarea::placeholder { color:#9C9A96; }
  .aip-snd { width:31px; height:31px; border-radius:8px; background:#1C2B4A; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:white; flex-shrink:0; transition:all 0.15s; }
  .aip-snd:hover:not(:disabled) { background:#253560; transform:scale(1.06); }
  .aip-snd:disabled { background:#ECEAE5; cursor:not-allowed; }
  .aip-hint { font-family:'DM Mono',monospace; font-size:8.5px; color:#9C9A96; text-align:center; margin-top:7px; }
  @media(max-width:480px){ .ai-panel{width:calc(100vw - 20px);right:10px;bottom:84px;} .ai-fab{bottom:14px;right:14px;} }
  /* ── Sources ── */
  .aip-sources { display:flex; flex-direction:column; gap:3px; margin-top:5px; }
  .aip-src-item {
    display:flex; align-items:center; gap:5px; padding:4px 8px;
    background:#F5F4F1; border-radius:6px; border:1px solid #E8E5DF;
    font-family:'DM Mono',monospace; font-size:9px; color:#6A6865;
    letter-spacing:0.03em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .aip-src-dot { width:5px; height:5px; border-radius:50%; background:#1C2B4A; opacity:0.4; flex-shrink:0; }
  /* ── Feedback buttons ── */
  .aip-feedback { display:flex; align-items:center; gap:4px; margin-top:4px; }
  .aip-fb-btn {
    display:flex; align-items:center; gap:3px;
    padding:3px 8px; border-radius:6px; border:1px solid #E8E5DF;
    background:transparent; cursor:pointer; font-size:11px;
    color:#9C9A96; transition:all 0.15s; font-family:'DM Mono',monospace;
    letter-spacing:0.03em;
  }
  .aip-fb-btn:hover { background:#F5F4F1; color:#1A1916; }
  .aip-fb-btn.up.selected   { background:rgba(22,163,74,0.10); border-color:rgba(22,163,74,0.30); color:#16A34A; }
  .aip-fb-btn.down.selected { background:#FFF0F2; border-color:rgba(200,16,46,0.30); color:#C8102E; }
`;

const SUGG = ['Étapes startup SARL ?', 'Documents RNE ?', 'كيفاش نسجل في CNSS؟', 'CNSS deadlines ?'];
const API  = 'http://127.0.0.1:8000/api/v1';
const fmt  = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const tok  = () => localStorage.getItem('access_token') || '';

interface Msg  { role: 'user' | 'assistant' | 'error'; content: string; time: string; feedback?: 'up' | 'down'; msgIndex?: number; sources?: { title: string; source: string; category: string; score: number }[]; }
interface Conv { id: number; title: string; lang: string; message_count: number; }

export default function AIChatWidget() {
  const [open,   setOpen]   = useState(false);
  const [msgs,   setMsgs]   = useState<Msg[]>([]);
  const [input,  setInput]  = useState('');
  const [busy,   setBusy]   = useState(false);
  const [unread, setUnread] = useState(0);
  const [convId, setConvId] = useState<number | null>(null);
  const [convs,  setConvs]  = useState<Conv[]>([]);
  const endRef  = useRef<HTMLDivElement>(null);
  const txtRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // Listen for Ask AI events from Timeline steps
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message;
      if (!msg) return;
      setOpen(true);
      setTimeout(() => sendRef.current(msg), 200);
    };
    window.addEventListener('legalease:ask-ai', handler);
    return () => window.removeEventListener('legalease:ask-ai', handler);
  }, []);

  // Load conversation list when panel opens
  useEffect(() => {
    if (!open) return;
    fetch(`${API}/ai/conversations`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setConvs)
      .catch(() => {});
  }, [open]);

  const loadConv = async (id: number) => {
    const r = await fetch(`${API}/ai/conversations/${id}`, { headers: { Authorization: `Bearer ${tok()}` } });
    if (!r.ok) return;
    const d = await r.json();
    setConvId(id);
    setMsgs(d.messages.map((m: any) => ({
      role:    m.role,
      content: m.content,
      time:    m.created_at ? new Date(m.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : fmt(),
    })));
  };

  const newConv = () => { setConvId(null); setMsgs([]); };

  const refreshConvs = () => {
    fetch(`${API}/ai/conversations`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.ok ? r.json() : []).then(setConvs).catch(() => {});
  };

  const sendFeedback = async (msg: Msg, rating: 'up' | 'down', idx: number) => {
    // Update UI immediately
    setMsgs(prev => prev.map((m, i) => i === idx ? { ...m, feedback: rating } : m));
    // Find the previous user message as question
    const userMsg = msgs.slice(0, idx).reverse().find(m => m.role === 'user');
    try {
      await fetch('http://127.0.0.1:8000/api/v1/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          rating,
          question:    userMsg?.content || '',
          answer:      msg.content,
          message_index: idx,
          conversation_id: convId,
        }),
      });
    } catch { /* ignore feedback errors silently */ }
  };

  const send = useCallback(async (text: string = input) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    if (txtRef.current) txtRef.current.style.height = 'auto';
    setMsgs(prev => [...prev, { role: 'user', content: q, time: fmt() }]);
    setBusy(true);

    try {
      const resp = await fetch(`${API}/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({ message: q, conversation_id: convId }),
      });
      if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).detail || `Error ${resp.status}`);

      const reader = resp.body!.getReader();
      const dec    = new TextDecoder();
      let   ans    = '';
      setMsgs(prev => [...prev, { role: 'assistant', content: '', time: fmt() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const p = JSON.parse(raw);
            if (p.chunk) {
              ans += p.chunk;
              setMsgs(prev => { const u=[...prev]; u[u.length-1]={role:'assistant',content:ans,time:fmt()}; return u; });
            }
            if (p.conversation_id) { setConvId(p.conversation_id); refreshConvs(); }
            if (p.sources) {
              setMsgs(prev => {
                const u = [...prev];
                u[u.length - 1] = { ...u[u.length - 1], sources: p.sources };
                return u;
              });
            }
          } catch { /* ignore */ }
        }
      }
      if (!open) setUnread(n => n + 1);
    } catch (err: any) {
      setMsgs(prev => [...prev, { role: 'error', content: err.message || 'Connection failed.', time: fmt() }]);
    } finally { setBusy(false); }
  }, [input, busy, convId, open]);

  // Ref to always have latest send without stale closure
  const sendRef = useRef(send);
  useEffect(() => { sendRef.current = send; }, [send]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
  };

  return (
    <>
      <style>{STYLE}</style>

      <div className={`ai-panel ${open ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="aip-header">
          <div className="aip-hl">
            <div className="aip-av">⚖️</div>
            <div>
              <div className="aip-name">LegalEase AI</div>
              <div className="aip-st"><div className="aip-std"/>RAG · Groq · llama-3.3-70b</div>
            </div>
          </div>
          <div className="aip-hr">
            {msgs.length > 0 && <button className="aip-tbtn" onClick={newConv}>New</button>}
            {msgs.length > 0 && <button className="aip-tbtn" onClick={() => setMsgs([])}>Clear</button>}
            <button className="aip-x" onClick={() => setOpen(false)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* History tabs */}
        {convs.length > 0 && (
          <div className="aip-tabs">
            <button className="aip-tab new" onClick={newConv}>+ New</button>
            {convs.slice(0, 4).map(c => (
              <button key={c.id} className={`aip-tab ${convId===c.id?'cur':''}`} onClick={() => loadConv(c.id)} title={c.title}>
                {c.title || 'Untitled'}
              </button>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div className="aip-sugg">
          {SUGG.map((s,i) => <button key={i} className="aip-sb" onClick={() => send(s)} disabled={busy}>{s}</button>)}
        </div>

        {/* Messages */}
        <div className="aip-msgs">
          {msgs.length === 0 ? (
            <div className="aip-empty">
              <div className="aip-ei">⚖️</div>
              <div className="aip-et">Ask about procedures</div>
              <p className="aip-es">Ask me anything about Tunisian startup creation or CNSS — in French, English, or Darija.</p>
            </div>
          ) : msgs.map((m,i) => (
            <div key={i} className={`aip-msg ${m.role==='error'?'assistant':m.role}`}>
              <div className="aip-mav">{m.role==='user'?'U':'⚖️'}</div>
              <div className="aip-mb">
                {m.role==='error' ? <div className="aip-err">⚠️ {m.content}</div> : <div className="aip-bbl">{m.content}</div>}
                {m.role==='assistant' && m.content && (
                  <div className="aip-feedback">
                    <button
                      className={`aip-fb-btn up ${m.feedback==='up'?'selected':''}`}
                      onClick={() => sendFeedback(m, 'up', i)}
                      disabled={!!m.feedback}
                      title="Helpful"
                    >👍</button>
                    <button
                      className={`aip-fb-btn down ${m.feedback==='down'?'selected':''}`}
                      onClick={() => sendFeedback(m, 'down', i)}
                      disabled={!!m.feedback}
                      title="Not helpful"
                    >👎</button>
                  </div>
                )}
                {m.role==='assistant' && m.sources && m.sources.length > 0 && (
                  <div className="aip-sources">
                    {m.sources.map((s: any, si: number) => (
                      <div key={si} className="aip-src-item">
                        <div className="aip-src-dot"/>
                        📄 {s.title || s.source}
                      </div>
                    ))}
                  </div>
                )}
                <div className="aip-t">{m.time}</div>
              </div>
            </div>
          ))}
          {busy && (
            <div className="aip-msg assistant">
              <div className="aip-mav">⚖️</div>
              <div className="aip-mb"><div className="aip-dot"><div className="aip-d"/><div className="aip-d"/><div className="aip-d"/></div></div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div className="aip-ia">
          <div className="aip-ib">
            <textarea ref={txtRef} rows={1} value={input} onChange={onChange} onKeyDown={onKey}
              placeholder="Ask in French, English, or Darija..." disabled={busy}/>
            <button className="aip-snd" onClick={() => send()} disabled={!input.trim()||busy}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
            </button>
          </div>
          <div className="aip-hint">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* FAB */}
      <button className={`ai-fab ${open?'open':''}`} onClick={() => setOpen(v => !v)}>
        <span className="ai-fab-tooltip">Ask AI</span>
        {!open
          ? <svg width="21" height="21" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          : <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        }
        {unread > 0 && !open && <div className="ai-fab-badge">{unread}</div>}
      </button>
    </>
  );
}