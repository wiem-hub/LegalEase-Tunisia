// src/pages/Notifications.tsx
// Option 2 — Hero cover enveloppes + grands chiffres + liste avec accent rouge
import { useState, useEffect } from 'react';
import api from '../services/api';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:#1C2B4A; --red:#C8102E; --red-xs:#FFF0F2;
    --cream:#FAF9F7; --white:#FFFFFF;
    --gray1:#F5F4F1; --gray2:#ECEAE5; --gray3:#9C9A96;
    --gray4:#6A6865; --ink:#1A1916; --border:#E8E5DF;
    --green:#16A34A; --amber:#D97706;
  }

  .np-root { background: var(--cream); min-height: 100vh; font-family: 'Inter', sans-serif; }

  /* ══ HERO ══ */
  .np-hero {
    position: relative;
    height: 340px;
    overflow: hidden;
    background: var(--navy);
  }

  .np-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 55%;
    filter: brightness(0.45) saturate(0.65);
    transition: transform 12s ease;
  }

  .np-hero:hover .np-hero-img { transform: scale(1.04); }

  .np-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      110deg,
      rgba(28,43,74,0.97) 0%,
      rgba(28,43,74,0.85) 40%,
      rgba(28,43,74,0.60) 100%
    );
  }

  /* Red left accent */
  .np-hero-accent {
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--red); z-index: 3;
  }

  /* Content inside hero */
  .np-hero-content {
    position: absolute; z-index: 4;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 0 52px 40px;
  }

  .np-hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: 0.20em; text-transform: uppercase;
    color: rgba(200,16,46,0.78); margin-bottom: 14px;
    display: flex; align-items: center; gap: 10px;
  }

  .np-hero-eyebrow::before {
    content: ''; display: block;
    width: 18px; height: 1.5px; background: var(--red);
  }

  /* Bottom row: title left, stats right */
  .np-hero-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }

  .np-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 52px);
    font-weight: 700; color: white;
    letter-spacing: -0.025em; line-height: 1.05;
  }

  .np-hero-title em {
    font-style: italic; font-weight: 400;
    color: rgba(255,200,205,0.88);
  }

  /* Stats */
  .np-hero-stats {
    display: flex;
    gap: 36px;
    align-items: flex-end;
    flex-shrink: 0;
  }

  .np-stat { text-align: right; }

  .np-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 52px; font-weight: 700;
    letter-spacing: -0.03em; line-height: 1;
    color: white;
  }

  .np-stat-val.red { color: #F87171; }

  .np-stat-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(255,255,255,0.28); margin-top: 4px;
  }

  .np-stat-sep {
    width: 1px; background: rgba(255,255,255,0.12);
    height: 60px; align-self: flex-end; margin-bottom: 8px;
  }

  /* ══ BODY ══ */
  .np-body { padding: 32px 52px 64px; }

  /* Card */
  .np-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07);
    max-width: 760px;
  }

  .np-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px 14px;
    border-bottom: 1px solid var(--gray1);
  }

  .np-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 600; color: var(--ink);
  }

  .np-mark-all {
    font-family: 'DM Mono', monospace; font-size: 9px; color: var(--red);
    background: none; border: none; cursor: pointer;
    letter-spacing: 0.08em; text-transform: uppercase;
    transition: opacity 0.15s; padding: 0;
  }

  .np-mark-all:hover { opacity: 0.65; }

  /* Notification item */
  .np-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--gray1);
    transition: background 0.15s;
  }

  .np-item:last-child { border-bottom: none; }

  .np-item.unread {
    background: rgba(200,16,46,0.025);
    border-left: 3px solid var(--red);
    padding-left: 21px;
  }

  .np-item:hover { background: var(--gray1); cursor: pointer; }

  .np-item-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0; margin-top: 1px;
  }

  .ic-red   { background: var(--red-xs); }
  .ic-green { background: rgba(22,163,74,0.09); }
  .ic-amber { background: rgba(217,119,6,0.09); }
  .ic-gray  { background: var(--gray1); }

  .np-item-body { flex: 1; min-width: 0; }

  .np-item-msg {
    font-size: 13.5px; color: var(--ink);
    line-height: 1.55; margin-bottom: 5px;
  }

  .np-item-msg.read { color: var(--gray4); font-weight: 300; }

  .np-item-time {
    font-family: 'DM Mono', monospace;
    font-size: 9px; color: var(--gray3); letter-spacing: 0.04em;
  }

  .np-item-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--red); flex-shrink: 0; margin-top: 6px;
  }

  /* Empty */
  .np-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px;
    padding: 60px 24px; text-align: center;
  }

  .np-empty-icon { font-size: 36px; }

  .np-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 600; color: var(--ink);
  }

  .np-empty-sub {
    font-size: 13px; color: var(--gray3); font-weight: 300;
    line-height: 1.6; max-width: 300px;
  }

  /* Loading */
  .np-loading {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; padding: 48px;
    color: var(--gray3); font-size: 13px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .np-hero-content { padding: 0 24px 32px; }
    .np-hero-bottom { flex-direction: column; align-items: flex-start; gap: 20px; }
    .np-hero-stats { gap: 24px; }
    .np-stat { text-align: left; }
    .np-stat-val { font-size: 36px; }
    .np-body { padding: 24px 16px 48px; }
  }
`;

const COVERS = [
  'https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?w=1600&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526623861945-d8a2e83fb87b?w=1600&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1600&q=85&auto=format&fit=crop',
];

interface Notification {
  id: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const getIcon = (type: string) => {
  if (type === 'deadline_approaching' || type === 'overdue') return { cls: 'ic-red',   emoji: '⏰' };
  if (type === 'step_completed')                              return { cls: 'ic-green', emoji: '✅' };
  if (type === 'deadline_today')                             return { cls: 'ic-amber', emoji: '📅' };
  return                                                            { cls: 'ic-gray',  emoji: '🔔' };
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [imgIdx,        setImgIdx]        = useState(0);

  useEffect(() => {
    api.get('/notifications?unread_only=false')
      .then(r => setNotifications(r.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const totalCount  = notifications.length;

  return (
    <>
      <style>{STYLE}</style>
      <div className="np-root">

        {/* ══ HERO ══ */}
        <div className="np-hero">
          <img
            className="np-hero-img"
            src={COVERS[imgIdx]}
            alt="Notifications"
            loading="eager"
            onError={() => setImgIdx(i => Math.min(i + 1, COVERS.length - 1))}
          />
          <div className="np-hero-overlay"/>
          <div className="np-hero-accent"/>

          <div className="np-hero-content">
            <div className="np-hero-eyebrow">Inbox</div>
            <div className="np-hero-bottom">
              <h1 className="np-hero-title">
                Your <em>notifications</em>
              </h1>
              <div className="np-hero-stats">
                <div className="np-stat">
                  <div className={`np-stat-val ${unreadCount > 0 ? 'red' : ''}`}>
                    {loading ? '—' : unreadCount}
                  </div>
                  <div className="np-stat-lbl">Unread</div>
                </div>
                <div className="np-stat-sep"/>
                <div className="np-stat">
                  <div className="np-stat-val">{loading ? '—' : totalCount}</div>
                  <div className="np-stat-lbl">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="np-body">
          <div className="np-card">
            <div className="np-card-head">
              <span className="np-card-title">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up ✓'}
              </span>
              {unreadCount > 0 && (
                <button className="np-mark-all" onClick={markAllRead}>
                  Mark all as read
                </button>
              )}
            </div>

            {loading ? (
              <div className="np-loading">
                <svg style={{ animation:'spin 0.7s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/>
                </svg>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon">📭</div>
                <div className="np-empty-title">Nothing here yet</div>
                <p className="np-empty-sub">
                  Deadline reminders and procedure updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map(n => {
                const icon = getIcon(n.type);
                return (
                  <div
                    key={n.id}
                    className={`np-item ${!n.is_read ? 'unread' : ''}`}
                    onClick={() => !n.is_read && markRead(n.id)}
                  >
                    <div className={`np-item-icon ${icon.cls}`}>{icon.emoji}</div>
                    <div className="np-item-body">
                      <div className={`np-item-msg ${n.is_read ? 'read' : ''}`}>
                        {n.message}
                      </div>
                      <div className="np-item-time">{fmtDate(n.created_at)}</div>
                    </div>
                    {!n.is_read && <div className="np-item-dot"/>}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </>
  );
}