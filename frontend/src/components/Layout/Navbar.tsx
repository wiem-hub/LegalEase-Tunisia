// src/components/Layout/Navbar.tsx
// Theme: Crème + Navy + Rouge tunisien — cohérent avec Dashboard/Login/Home
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --navy:   #1C2B4A;
    --navy-l: #253560;
    --red:    #C8102E;
    --red-xs: #FFF0F2;
    --cream:  #FAF9F7;
    --white:  #FFFFFF;
    --gray1:  #F5F4F1;
    --gray3:  #9C9A96;
    --gray4:  #6A6865;
    --border: #E8E5DF;
    --ink:    #1A1916;
  }

  .navbar {
    position: sticky; top: 0; z-index: 50;
    height: 64px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 48px;
    background: rgba(250,249,247,0.95);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border); font-family: 'Inter', sans-serif;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
  }

  /* ── Logo ── */
  .nb-logo {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
    color: var(--navy); text-decoration: none;
    display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  }
  .nb-logo-red { color: var(--red); }
  .nb-logo-flag {
    display: flex; height: 12px; width: 18px; border-radius: 2px;
    overflow: hidden; border: 1px solid rgba(0,0,0,0.10); flex-shrink: 0;
  }
  .nb-flag-r { flex: 1; background: var(--red); }
  .nb-flag-w { flex: 1; background: rgba(255,255,255,0.90); }

  /* ── Right side ── */
  .nb-right { display: flex; align-items: center; gap: 2px; }

  /* ── Nav links ── */
  .nb-link {
    font-size: 13px; font-weight: 400; color: var(--gray4); text-decoration: none;
    padding: 7px 12px; border-radius: 7px; transition: all 0.15s;
    white-space: nowrap; display: flex; align-items: center; gap: 5px;
  }
  .nb-link:hover { color: var(--navy); background: var(--gray1); }
  .nb-link.active { color: var(--navy); background: var(--gray1); font-weight: 500; box-shadow: inset 2px 0 0 var(--red); }

  /* ── Admin link ── */
  .nb-admin {
    font-size: 12.5px; font-weight: 500; color: var(--red); text-decoration: none;
    padding: 7px 12px; border-radius: 7px; border: 1px solid rgba(200,16,46,0.22);
    background: var(--red-xs); transition: all 0.15s;
    display: flex; align-items: center; gap: 5px; white-space: nowrap;
  }
  .nb-admin:hover { border-color: rgba(200,16,46,0.45); background: rgba(200,16,46,0.08); }

  /* ── Divider ── */
  .nb-divider { width: 1px; height: 20px; background: var(--border); margin: 0 6px; flex-shrink: 0; }

  /* ── Profile link ── */
  .nb-profile {
    display: flex; align-items: center; gap: 7px; padding: 5px 10px;
    border-radius: 8px; text-decoration: none; transition: all 0.15s;
  }
  .nb-profile:hover { background: var(--gray1); }
  .nb-profile-avatar {
    width: 28px; height: 28px; border-radius: 7px; background: var(--navy); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em; flex-shrink: 0;
  }
  .nb-profile-name { font-size: 12.5px; font-weight: 500; color: var(--ink); }

  /* ── Sign out ── */
  .nb-logout {
    font-size: 12.5px; font-weight: 400; color: var(--gray4); background: none;
    border: 1px solid var(--border); border-radius: 7px; padding: 7px 12px;
    cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .nb-logout:hover { color: var(--red); border-color: rgba(200,16,46,0.30); background: var(--red-xs); }

  /* ── Guest CTAs ── */
  .nb-signin {
    font-size: 13px; font-weight: 400; color: var(--navy); text-decoration: none;
    padding: 7px 14px; border-radius: 7px; border: 1px solid var(--border); transition: all 0.15s;
  }
  .nb-signin:hover { border-color: var(--navy); background: var(--gray1); }

  .nb-cta {
    font-size: 13px; font-weight: 600; color: white; background: var(--navy);
    padding: 8px 20px; border-radius: 8px; text-decoration: none;
    letter-spacing: 0.02em; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .nb-cta:hover { background: var(--navy-l); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(28,43,74,0.22); }

  .nb-bell { display: flex; align-items: center; }

  @media (max-width: 768px) {
    .navbar { padding: 0 16px; }
    .nb-link span { display: none; }
    .nb-profile-name { display: none; }
  }
`;

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const isAdmin  = (user as any)?.is_admin === true;
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  // Pages with their own full-page layout — no global navbar
  const hiddenOn = ['/admin', '/login', '/signup'];
  if (hiddenOn.includes(location.pathname)) return null;

  // Pages with their own embedded navbar (cover/sidebar layout)
  const embeddedOn = ['/', '/dashboard'];
  if (embeddedOn.includes(location.pathname)) return null;

  const active = (path: string) =>
    location.pathname === path ? 'nb-link active' : 'nb-link';

  return (
    <>
      <style>{STYLE}</style>
      <nav className="navbar">

        {/* Logo */}
        <Link to="/" className="nb-logo">
          Legal<span className="nb-logo-red">Ease</span>
          <div className="nb-logo-flag">
            <div className="nb-flag-r" /><div className="nb-flag-w" />
          </div>
        </Link>

        {/* Right side */}
        <div className="nb-right">
          {token ? (
            <>
              <Link to="/dashboard" className={active('/dashboard')}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link to="/timeline" className={active('/timeline')}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
                <span>My Procedures</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="nb-admin">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Admin
                </Link>
              )}

              <div className="nb-divider" />
              <div className="nb-bell"><NotificationBell /></div>

              {/* Profile avec avatar initiales */}
              <Link to="/profile" className="nb-profile">
                <div className="nb-profile-avatar">{initials}</div>
                <span className="nb-profile-name">{user?.username}</span>
              </Link>

              <div className="nb-divider" />

              <button className="nb-logout" onClick={logout}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"  className="nb-signin">Sign in</Link>
              <Link to="/signup" className="nb-cta">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}