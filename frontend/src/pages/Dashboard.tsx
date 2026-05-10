// src/pages/Dashboard.tsx
// Theme: Blanc + Navy professionnel — Rouge tunisien en accent discret uniquement
// Layout: Sidebar fixe + main content avec cover photo en header
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../components/Notifications/NotificationBell';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --navy:    #1C2B4A;
    --navy-l:  #253560;
    --navy-xs: #F0F3F8;
    --red:     #C8102E;
    --red-xs:  #FFF0F2;
    --cream:   #FAF9F7;
    --white:   #FFFFFF;
    --gray1:   #F5F4F1;
    --gray2:   #ECEAE5;
    --gray3:   #9C9A96;
    --gray4:   #6A6865;
    --ink:     #1A1916;
    --border:  #E8E5DF;
    --sh:      0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06);
    --sh-lg:   0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
  }
  .db { display: flex; min-height: 100vh; background: var(--cream); font-family: 'Inter', sans-serif; color: var(--ink); }
  .db-side {
    width: 236px; min-height: 100vh; background: var(--navy);
    display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 40;
  }
  .db-side-logo { padding: 26px 22px 20px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .db-logo-link {
    font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700;
    color: white; text-decoration: none; display: flex; align-items: center; gap: 8px;
  }
  .db-logo-red { color: var(--red); }
  .db-logo-flag {
    display: flex; height: 12px; width: 18px; border-radius: 2px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.20); flex-shrink: 0;
  }
  .dlf-r { flex: 1; background: var(--red); }
  .dlf-w { flex: 1; background: rgba(255,255,255,0.80); }
  .db-logo-tag {
    font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.28); margin-top: 4px;
  }
  .db-nav { padding: 16px 10px; flex: 1; }
  .db-nav-section {
    font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: 0.12em;
    text-transform: uppercase; color: rgba(255,255,255,0.25);
    padding: 0 12px; margin-bottom: 4px; margin-top: 16px;
  }
  .db-nav-item {
    display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 8px;
    font-size: 13px; color: rgba(255,255,255,0.48); cursor: pointer; transition: all 0.15s;
    text-decoration: none; border: none; background: none; width: 100%;
    text-align: left; font-family: 'Inter', sans-serif; letter-spacing: 0.01em; position: relative;
  }
  .db-nav-item:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
  .db-nav-item.active { color: white; background: rgba(255,255,255,0.10); font-weight: 500; }
  .db-nav-item.active::before {
    content: ''; position: absolute; left: 0; width: 3px; height: 28px;
    background: var(--red); border-radius: 0 3px 3px 0;
  }
  .db-nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
  .db-side-bottom { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.07); }
  .db-user-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
    padding: 6px 8px; border-radius: 8px; cursor: pointer; transition: background 0.15s;
    text-decoration: none;
  }
  .db-user-row:hover { background: rgba(255,255,255,0.06); }
  .db-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(200,16,46,0.25); border: 1px solid rgba(200,16,46,0.40);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: rgba(255,180,190,0.95);
    flex-shrink: 0; letter-spacing: 0.04em;
  }
  .db-user-name { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.80); }
  .db-user-role {
    font-family: 'DM Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.28);
    letter-spacing: 0.05em; margin-top: 1px;
  }
  .db-logout {
    width: 100%; display: flex; align-items: center; gap: 7px; padding: 8px 12px;
    border-radius: 7px; border: 1px solid rgba(255,255,255,0.10); background: transparent;
    color: rgba(255,255,255,0.38); font-size: 12px; cursor: pointer; transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .db-logout:hover { color: #FCA5A5; border-color: rgba(252,165,165,0.28); background: rgba(252,165,165,0.05); }
  .db-main { margin-left: 236px; flex: 1; min-height: 100vh; }
  .db-header { position: relative; height: 240px; overflow: hidden; background: var(--navy); }
  .db-header-img {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: center 35%;
    filter: brightness(0.30) saturate(0.60); transition: transform 10s ease;
  }
  .db-header:hover .db-header-img { transform: scale(1.03); }
  .db-header-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(100deg, rgba(28,43,74,0.96) 0%, rgba(28,43,74,0.70) 45%, rgba(28,43,74,0.40) 100%);
  }
  .db-header-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--red); z-index: 3; }
  .db-header-topbar {
    position: absolute; top: 0; left: 0; right: 0; z-index: 5;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 0 40px; height: 56px; border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .db-header-actions { display: flex; align-items: center; gap: 6px; }
  .db-header-btn {
    font-size: 12.5px; color: rgba(255,255,255,0.55); padding: 6px 12px;
    border-radius: 7px; transition: all 0.15s; text-decoration: none;
    display: flex; align-items: center; gap: 5px;
  }
  .db-header-btn:hover { color: white; background: rgba(255,255,255,0.10); }
  .db-header-div { width: 1px; height: 16px; background: rgba(255,255,255,0.15); margin: 0 4px; }
  .db-header-bell { display: flex; align-items: center; }
  .db-header-content { position: absolute; z-index: 4; bottom: 32px; left: 48px; right: 48px; }
  .db-greeting-tag {
    font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(200,16,46,0.70); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .db-greeting-tag::before { content: ''; display: block; width: 16px; height: 1px; background: var(--red); opacity: 0.65; }
  .db-greeting-title {
    font-family: 'Playfair Display', serif; font-size: clamp(26px, 3vw, 40px);
    font-weight: 700; color: white; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 5px;
  }
  .db-greeting-title em { font-style: italic; font-weight: 400; color: rgba(255,200,205,0.90); }
  .db-greeting-date { font-family: 'DM Mono', monospace; font-size: 9.5px; color: rgba(255,255,255,0.32); letter-spacing: 0.10em; text-transform: uppercase; }
  .db-body { padding: 0 40px 60px; }
  .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: -44px; margin-bottom: 28px; position: relative; z-index: 20; }
  .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px 22px 18px; box-shadow: var(--sh-lg); position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.10); }
  .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 12px 12px 0 0; }
  .sc1::after { background: var(--navy); }
  .sc2::after { background: var(--red); }
  .sc3::after { background: #16A34A; }
  .stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .stat-ico { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  .si1 { background: var(--navy-xs); color: var(--navy); }
  .si2 { background: var(--red-xs);  color: var(--red); }
  .si3 { background: rgba(22,163,74,0.09); color: #16A34A; }
  .stat-pill { font-family: 'DM Mono', monospace; font-size: 9px; padding: 2px 8px; border-radius: 20px; letter-spacing: 0.05em; }
  .sp1 { background: var(--navy-xs); color: var(--navy); }
  .sp2 { background: var(--red-xs);  color: var(--red); }
  .sp3 { background: rgba(22,163,74,0.09); color: #16A34A; }
  .stat-val { font-family: 'Playfair Display', serif; font-size: 38px; font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -0.025em; }
  .stat-lbl { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.09em; text-transform: uppercase; color: var(--gray3); margin-top: 4px; }
  .db-cta { background: var(--navy); border-radius: 14px; padding: 26px 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 24px; position: relative; overflow: hidden; }
  .db-cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 85% 50%, rgba(200,16,46,0.12) 0%, transparent 55%); pointer-events: none; }
  .db-cta::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--red); border-radius: 3px 0 0 3px; }
  .cta-text h3 { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: white; letter-spacing: -0.01em; margin-bottom: 4px; }
  .cta-text p { font-size: 13px; color: rgba(255,255,255,0.42); font-weight: 300; line-height: 1.5; max-width: 380px; }
  .btn-cta { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: white; background: var(--red); padding: 10px 20px; border-radius: 8px; text-decoration: none; white-space: nowrap; letter-spacing: 0.02em; transition: all 0.2s; flex-shrink: 0; }
  .btn-cta:hover { background: #A50D25; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,16,46,0.30); }
  .db-search { background: var(--white); border: 1.5px solid var(--border); border-radius: 10px; display: flex; align-items: center; gap: 11px; padding: 12px 18px; margin-bottom: 24px; box-shadow: var(--sh); transition: border-color 0.2s, box-shadow 0.2s; }
  .db-search:focus-within { border-color: rgba(200,16,46,0.40); box-shadow: 0 0 0 3px rgba(200,16,46,0.07), var(--sh); }
  .db-search svg { color: var(--gray3); flex-shrink: 0; }
  .db-search input { flex: 1; border: none; outline: none; font-family: 'Inter', sans-serif; font-size: 13.5px; color: var(--ink); background: transparent; }
  .db-search input::placeholder { color: var(--gray3); }
  .db-search-kbd { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--gray3); padding: 2px 7px; border: 1px solid var(--border); border-radius: 4px; }
  .db-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; }
  .card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--sh); }
  .card-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 12px; border-bottom: 1px solid var(--gray1); }
  .card-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; color: var(--ink); letter-spacing: -0.01em; }
  .card-badge { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--gray3); background: var(--gray1); padding: 2px 8px; border-radius: 20px; letter-spacing: 0.06em; }
  .card-action { font-family: 'DM Mono', monospace; font-size: 9.5px; color: var(--red); text-decoration: none; letter-spacing: 0.06em; transition: opacity 0.15s; }
  .card-action:hover { opacity: 0.70; }
  .faq-item { display: flex; align-items: flex-start; gap: 10px; padding: 11px 20px; border-bottom: 1px solid var(--gray1); cursor: pointer; transition: background 0.15s; }
  .faq-item:last-child { border-bottom: none; }
  .faq-item:hover { background: var(--gray1); }
  .faq-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); opacity: 0.45; flex-shrink: 0; margin-top: 6px; transition: opacity 0.15s; }
  .faq-item:hover .faq-dot { opacity: 0.90; }
  .faq-text { font-size: 12.5px; color: var(--gray4); line-height: 1.5; transition: color 0.15s; }
  .faq-item:hover .faq-text { color: var(--ink); }
  .proc-item { display: flex; align-items: center; justify-content: space-between; padding: 13px 20px; border-bottom: 1px solid var(--gray1); transition: background 0.15s; gap: 12px; }
  .proc-item:last-child { border-bottom: none; }
  .proc-item:hover { background: var(--gray1); }
  .proc-left { display: flex; align-items: center; gap: 12px; }
  .proc-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .pi-s { background: var(--red-xs); }
  .pi-c { background: var(--navy-xs); }
  .proc-name { font-size: 12.5px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
  .proc-meta { font-family: 'DM Mono', monospace; font-size: 8.5px; color: var(--gray3); letter-spacing: 0.05em; text-transform: uppercase; }
  .proc-badge { font-family: 'DM Mono', monospace; font-size: 8.5px; padding: 2px 9px; border-radius: 20px; letter-spacing: 0.05em; white-space: nowrap; }
  .pb-s { background: var(--red-xs);  color: var(--red); }
  .pb-c { background: var(--navy-xs); color: var(--navy); }
  .proc-link { font-size: 11.5px; color: var(--navy); text-decoration: none; font-weight: 500; padding: 5px 11px; border-radius: 6px; border: 1px solid var(--border); transition: all 0.15s; white-space: nowrap; }
  .proc-link:hover { border-color: var(--red); color: var(--red); background: var(--red-xs); }
  @media (max-width: 960px) {
    .db-side { display: none; }
    .db-main { margin-left: 0; }
    .db-body { padding: 0 20px 48px; }
    .db-stats { grid-template-columns: 1fr; margin-top: -20px; }
    .db-grid  { grid-template-columns: 1fr; }
    .db-cta   { flex-direction: column; padding: 22px; }
    .db-header-content { left: 24px; right: 24px; }
    .db-header-topbar  { padding: 0 24px; }
  }
`;

const FAQS = [
  'What are the steps to create a startup?',
  'How to register with CNSS as an employer?',
  'What documents are needed for a startup?',
  'Employee declaration to CNSS',
  'Social obligations for startups in Tunisia',
];

const PROCS = [
  { name: 'Company creation',            cat: 'Startup', date: '2026-02-20', cls: 's', emoji: '🏢' },
  { name: 'CNSS employer registration',  cat: 'CNSS',    date: '2026-02-19', cls: 'c', emoji: '📋' },
  { name: 'Quarterly declaration',       cat: 'CNSS',    date: '2026-02-18', cls: 'c', emoji: '📄' },
];

const COVERS = [
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1600&q=85&auto=format&fit=crop',
];

const NAV = [
  {
    path: '/dashboard', label: 'Dashboard',
    icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  },
  {
    path: '/timeline', label: 'My Procedures',
    icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>,
  },
  {
    path: '/notifications', label: 'Notifications',
    icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  },
  {
    path: '/profile', label: 'My Profile',
    icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  },
  {
  path: '/team', label: 'My Team',
  icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query,  setQuery]  = useState('');
  const [imgIdx, setImgIdx] = useState(0);
  const isAdmin  = (user as any)?.is_admin === true;
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      <style>{STYLE}</style>
      <div className="db">

        {/* ═══ SIDEBAR ═══ */}
        <aside className="db-side">
          {/* Logo */}
          <div className="db-side-logo">
            <Link to="/" className="db-logo-link">
              Legal<span className="db-logo-red">Ease</span>
              <div className="db-logo-flag">
                <div className="dlf-r" /><div className="dlf-w" />
              </div>
            </Link>
            <div className="db-logo-tag">User dashboard</div>
          </div>

          {/* Nav */}
          <nav className="db-nav">
            <div className="db-nav-section">Main</div>
            {NAV.map(n => (
              <Link
                key={n.path}
                to={n.path}
                className={`db-nav-item ${window.location.pathname === n.path ? 'active' : ''}`}
              >
                {n.icon}{n.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="db-nav-section">Admin</div>
                <Link to="/admin" className="db-nav-item">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          {/* User + logout */}
          <div className="db-side-bottom">
            {/* Clickable user row → Profile page */}
            <Link to="/profile" className="db-user-row">
              <div className="db-avatar">{initials}</div>
              <div>
                <div className="db-user-name">{user?.username}</div>
                <div className="db-user-role">{isAdmin ? 'Administrator' : 'User'}</div>
              </div>
            </Link>

            <button className="db-logout" onClick={() => { logout(); navigate('/login'); }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <main className="db-main">

          {/* Header with cover photo */}
          <div className="db-header">
            <img
              className="db-header-img"
              src={COVERS[imgIdx]}
              alt="Legal documents"
              loading="eager"
              onError={() => setImgIdx(i => Math.min(i + 1, COVERS.length - 1))}
            />
            <div className="db-header-overlay" />
            <div className="db-header-accent" />

            {/* Top bar */}
            <div className="db-header-topbar">
              <div className="db-header-actions">
                <Link to="/timeline" className="db-header-btn">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  My Procedures
                </Link>
                <div className="db-header-div" />
                <div className="db-header-bell"><NotificationBell /></div>
              </div>
            </div>

            {/* Greeting */}
            <div className="db-header-content">
              <div className="db-greeting-tag">Welcome back</div>
              <h1 className="db-greeting-title">
                Good day, <em>{user?.username}</em>
              </h1>
              <p className="db-greeting-date">{today.toUpperCase()}</p>
            </div>
          </div>

          {/* Body */}
          <div className="db-body">

            {/* Stat cards */}
            <div className="db-stats">
              <div className="stat-card sc1">
                <div className="stat-top">
                  <div className="stat-ico si1">
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <span className="stat-pill sp1">Available</span>
                </div>
                <div className="stat-val">3</div>
                <div className="stat-lbl">Procedure types</div>
              </div>

              <div className="stat-card sc2">
                <div className="stat-top">
                  <div className="stat-ico si2">
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span className="stat-pill sp2">Guided</span>
                </div>
                <div className="stat-val">24</div>
                <div className="stat-lbl">Steps end-to-end</div>
              </div>

              <div className="stat-card sc3">
                <div className="stat-top">
                  <div className="stat-ico si3">
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                  </div>
                  <span className="stat-pill sp3">Active</span>
                </div>
                <div className="stat-val">0</div>
                <div className="stat-lbl">Notifications pending</div>
              </div>
            </div>

            {/* CTA banner */}
            <div className="db-cta">
              <div className="cta-text">
                <h3>Track your procedures, step by step</h3>
                <p>Follow your startup creation or CNSS registration in real time — documents, deadlines and notes all in one place.</p>
              </div>
              <Link to="/timeline" className="btn-cta">
                Open Timeline
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>

            {/* Search */}
            <div className="db-search">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search procedures, steps, documents..."
              />
              <span className="db-search-kbd">⌘ K</span>
            </div>

            {/* Grid */}
            <div className="db-grid">
              {/* FAQ */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">Common questions</span>
                  <span className="card-badge">{FAQS.length} topics</span>
                </div>
                {FAQS.map((q, i) => (
                  <div key={i} className="faq-item" onClick={() => setQuery(q)}>
                    <div className="faq-dot" />
                    <span className="faq-text">{q}</span>
                  </div>
                ))}
              </div>

              {/* Recent procedures */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">Recent procedures</span>
                  <Link to="/timeline" className="card-action">View all →</Link>
                </div>
                {PROCS.map((p, i) => (
                  <div key={i} className="proc-item">
                    <div className="proc-left">
                      <div className={`proc-icon pi-${p.cls}`}>{p.emoji}</div>
                      <div>
                        <div className="proc-name">{p.name}</div>
                        <div className="proc-meta">{p.cat} · {p.date}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span className={`proc-badge pb-${p.cls}`}>{p.cat}</span>
                      <Link to="/timeline" className="proc-link">View →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}