// src/components/AI/HomeAIButton.tsx
// Public chatbot on the Home page — explains LegalEase Tunisia to visitors
// No login required — uses Groq API via backend public endpoint
import { useState, useRef, useEffect } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

  /* ── Trigger button ── */
  .home-ai-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #1C2B4A;
    background: white;
    padding: 13px 26px;
    border-radius: 10px;
    border: 1.5px solid #E8E5DF;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.01em;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .home-ai-btn:hover {
    border-color: #1C2B4A;
    box-shadow: 0 6px 20px rgba(28,43,74,0.15);
    transform: translateY(-1px);
  }

  .home-ai-btn-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #34D399;
    box-shadow: 0 0 6px rgba(52,211,153,0.6);
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }

  /* ── Overlay backdrop ── */
  .home-ai-overlay {
    position: fixed;
    inset: 0;
    background: rgba(28,43,74,0.45);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  /* ── Modal panel ── */
  .home-ai-modal {
    background: #FFFFFF;
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    height: 580px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
    animation: slideUp 0.25s cubic-bezier(0.34,1.26,0.64,1);
    font-family: 'Inter', sans-serif;
  }

  @keyframes slideUp {
    from { opacity:0; transform:translateY(24px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ── Header ── */
  .ham-header {
    background: linear-gradient(135deg, #1C2B4A 0%, #253560 100%);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .ham-header-left { display: flex; align-items: center; gap: 12px; }

  .ham-logo-wrap {
    width: 40px; height: 40px;
    border-radius: 11px;
    background: rgba(200,16,46,0.20);
    border: 1px solid rgba(200,16,46,0.35);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .ham-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.01em;
    margin-bottom: 2px;
  }

  .ham-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: rgba(255,255,255,0.42);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ham-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: rgba(255,255,255,0.10);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.65);
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .ham-close:hover { background: rgba(255,255,255,0.18); color: white; }

  /* ── Quick questions ── */
  .ham-quick {
    display: flex;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid #F5F4F1;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
  }

  .ham-quick::-webkit-scrollbar { display: none; }

  .ham-quick-btn {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #E8E5DF;
    background: #FAF9F7;
    color: #6A6865;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }

  .ham-quick-btn:hover { background: #1C2B4A; color: white; border-color: #1C2B4A; }

  /* ── Messages ── */
  .ham-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* Welcome state */
  .ham-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    text-align: center;
    flex: 1;
  }

  .ham-welcome-icon { font-size: 36px; }

  .ham-welcome-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: #1A1916;
    letter-spacing: -0.01em;
  }

  .ham-welcome-sub {
    font-size: 13px;
    color: #9C9A96;
    font-weight: 300;
    line-height: 1.65;
    max-width: 300px;
  }

  /* Message bubble */
  .ham-msg { display: flex; gap: 9px; align-items: flex-start; }
  .ham-msg.user { flex-direction: row-reverse; }

  .ham-msg-av {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; margin-top: 1px;
  }

  .ham-msg.assistant .ham-msg-av { background: #1C2B4A; color: white; }
  .ham-msg.user      .ham-msg-av { background: #FFF0F2; color: #C8102E; font-size: 10px; font-weight: 700; font-family:'Inter',sans-serif; }

  .ham-msg-body { display: flex; flex-direction: column; gap: 3px; max-width: 80%; }

  .ham-bubble {
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.68;
    border-radius: 12px;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .ham-msg.assistant .ham-bubble {
    background: #F5F4F1;
    color: #1A1916;
    border-radius: 4px 12px 12px 12px;
  }

  .ham-msg.user .ham-bubble {
    background: #1C2B4A;
    color: white;
    border-radius: 12px 4px 12px 12px;
  }

  .ham-bubble-time {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    color: #9C9A96;
    padding: 0 2px;
  }

  .ham-msg.user .ham-bubble-time { text-align: right; }

  /* Typing */
  .ham-typing {
    display: flex; align-items: center; gap: 4px;
    padding: 11px 14px;
    background: #F5F4F1;
    border-radius: 4px 12px 12px 12px;
    width: fit-content;
  }

  .ham-typing-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #9C9A96;
    animation: typingBounce 1.2s infinite;
  }

  .ham-typing-dot:nth-child(2) { animation-delay:0.2s; }
  .ham-typing-dot:nth-child(3) { animation-delay:0.4s; }

  @keyframes typingBounce {
    0%,60%,100%{transform:translateY(0);opacity:0.4}
    30%{transform:translateY(-4px);opacity:1}
  }

  /* ── CTA to sign up (shown after first answer) ── */
  .ham-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: linear-gradient(135deg, rgba(28,43,74,0.05) 0%, rgba(200,16,46,0.04) 100%);
    border: 1px solid rgba(28,43,74,0.10);
    border-radius: 10px;
    margin-top: 2px;
  }

  .ham-cta-text {
    font-size: 11.5px;
    color: #1C2B4A;
    font-weight: 500;
    line-height: 1.4;
  }

  .ham-cta-text span { display: block; font-size: 10.5px; color: #9C9A96; font-weight: 300; margin-top: 1px; }

  .ham-cta-btn {
    font-size: 11.5px;
    font-weight: 600;
    color: white;
    background: #C8102E;
    padding: 7px 14px;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
    text-decoration: none;
    display: inline-block;
  }

  .ham-cta-btn:hover { background: #A50D25; transform: translateY(-1px); }

  /* ── Input ── */
  .ham-input-area {
    padding: 10px 14px 14px;
    border-top: 1px solid #F5F4F1;
    flex-shrink: 0;
    background: white;
  }

  .ham-input-box {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #FAF9F7;
    border: 1.5px solid #E8E5DF;
    border-radius: 11px;
    padding: 9px 11px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ham-input-box:focus-within {
    border-color: rgba(28,43,74,0.35);
    box-shadow: 0 0 0 3px rgba(28,43,74,0.06);
  }

  .ham-input-box textarea {
    flex: 1; border: none; outline: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 13px; color: #1A1916;
    resize: none; line-height: 1.5;
    max-height: 72px; overflow-y: auto; padding: 0;
  }

  .ham-input-box textarea::placeholder { color: #9C9A96; }

  .ham-send {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: #1C2B4A;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0;
    transition: all 0.15s;
  }

  .ham-send:hover:not(:disabled) { background: #253560; transform:scale(1.05); }
  .ham-send:disabled { background: #ECEAE5; cursor: not-allowed; }

  .ham-input-hint {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px; color: #9C9A96;
    letter-spacing: 0.05em;
    text-align: center; margin-top: 7px;
  }
`;

// System prompt — explains the app to visitors
const SYSTEM_PROMPT = `You are the LegalEase Tunisia assistant. You help visitors understand what LegalEase Tunisia is and how to use it.

## About LegalEase Tunisia:
LegalEase Tunisia is a platform that helps Tunisian entrepreneurs and founders navigate administrative procedures step by step.

## What the platform does:
- Guides users through startup creation in Tunisia (choosing legal structure, RNE registration, tax ID, CNSS, etc.)
- Tracks CNSS (Caisse Nationale de Sécurité Sociale) employer registration
- Helps with quarterly social contribution declarations
- Provides step-by-step timelines with document checklists
- Sends deadline reminders and notifications
- Allows document upload per step
- Available in French, English, and Tunisian Arabic (Darija)

## How to use the platform:
1. Create a free account (Sign Up button)
2. Choose a procedure (Startup Creation, CNSS Registration, etc.)
3. Follow the steps one by one
4. Upload required documents at each step
5. Set deadlines and get automatic reminders

## Your behavior:
- Be welcoming, friendly, and concise
- Answer in the SAME language as the visitor (French, English, or Darija)
- If asked about specific legal advice, remind them this is a guidance tool and official sources should be consulted
- Encourage visitors to sign up to access the full procedure tracking features
- Do NOT answer detailed questions about procedure content — those are for logged-in users
- Keep answers short (3-5 sentences max) — this is a welcome chatbot, not a legal encyclopedia`;

const QUICK_QUESTIONS = [
  "C'est quoi LegalEase ?",
  "How does it work?",
  "كيفاش نبدأ؟",
  "Is it free?",
  "What procedures are covered?",
];

const fmtTime = () =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface HomeAIButtonProps {
  variant?: 'light' | 'dark'; // light = on white bg, dark = on dark/photo bg
}

export default function HomeAIButton({ variant = 'light' }: HomeAIButtonProps) {
  const [open,         setOpen]         = useState(false);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showCta,      setShowCta]      = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Show signup CTA after first assistant answer
  useEffect(() => {
    const hasAnswer = messages.some(m => m.role === 'assistant');
    if (hasAnswer) setShowCta(true);
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const send = async (text: string = input) => {
    const q = text.trim();
    if (!q || loading) return;

    setInput('');
    if (textRef.current) textRef.current.style.height = 'auto';

    const userMsg: Message = { role: 'user', content: q, time: fmtTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch('http://127.0.0.1:8000/api/v1/ai/chat/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history }),
      });

      if (!resp.ok) throw new Error(`Error ${resp.status}`);

      const reader  = resp.body!.getReader();
      const decoder = new TextDecoder();
      let   answer  = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '', time: fmtTime() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;
          try {
            const parsed = JSON.parse(raw);
            if (parsed.chunk) {
              answer += parsed.chunk;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: answer, time: fmtTime() };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        time: fmtTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
  };

  // Button styles vary based on variant (light bg vs dark/photo bg)
  const btnStyle = variant === 'dark'
    ? { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.28)' }
    : {};

  return (
    <>
      <style>{STYLE}</style>

      {/* Trigger button */}
      <button className="home-ai-btn" style={btnStyle} onClick={() => setOpen(true)}>
        <div className="home-ai-btn-dot" />
        Ask AI
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="home-ai-overlay" onClick={() => setOpen(false)}>
          <div className="home-ai-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="ham-header">
              <div className="ham-header-left">
                <div className="ham-logo-wrap">⚖️</div>
                <div>
                  <div className="ham-title">LegalEase AI</div>
                  <div className="ham-subtitle">Ask me anything about the platform</div>
                </div>
              </div>
              <button className="ham-close" onClick={() => setOpen(false)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Quick questions */}
            <div className="ham-quick">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className="ham-quick-btn" onClick={() => send(q)} disabled={loading}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="ham-messages">
              {messages.length === 0 ? (
                <div className="ham-welcome">
                  <div className="ham-welcome-icon">⚖️</div>
                  <div className="ham-welcome-title">Hi! I'm LegalEase AI</div>
                  <p className="ham-welcome-sub">
                    Ask me anything about LegalEase Tunisia — how it works, what procedures it covers, or how to get started.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`ham-msg ${msg.role}`}>
                    <div className="ham-msg-av">
                      {msg.role === 'user' ? 'U' : '⚖️'}
                    </div>
                    <div className="ham-msg-body">
                      <div className="ham-bubble">{msg.content}</div>
                      <div className="ham-bubble-time">{msg.time}</div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing */}
              {loading && (
                <div className="ham-msg assistant">
                  <div className="ham-msg-av">⚖️</div>
                  <div className="ham-msg-body">
                    <div className="ham-typing">
                      <div className="ham-typing-dot" />
                      <div className="ham-typing-dot" />
                      <div className="ham-typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              {/* Signup CTA after first answer */}
              {showCta && !loading && (
                <div className="ham-cta">
                  <div className="ham-cta-text">
                    Ready to track your procedures?
                    <span>Create a free account to get started</span>
                  </div>
                  <a href="/signup" className="ham-cta-btn">Sign up free →</a>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="ham-input-area">
              <div className="ham-input-box">
                <textarea
                  ref={textRef}
                  rows={1}
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about the platform..."
                  disabled={loading}
                />
                <button className="ham-send" onClick={() => send()} disabled={!input.trim() || loading}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                  </svg>
                </button>
              </div>
              <div className="ham-input-hint">Enter to send · Shift+Enter for new line</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export { SYSTEM_PROMPT as HOME_AI_SYSTEM_PROMPT };