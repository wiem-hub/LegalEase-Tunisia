// src/components/Auth/Signup.tsx
// Theme: Crème + Rouge tunisien — Cover: Sidi Bou Said / Carthage
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:    #E30A17;
    --red-d:  #B8000C;
    --red-xs: #FFF0F1;
    --cream:  #FAF8F4;
    --cream2: #F4F1EB;
    --white:  #FFFFFF;
    --ink:    #1A1A18;
    --muted:  #6B6B68;
    --faint:  #9A9A96;
    --border: #E6E2DA;
    --err:    #DC2626;
    --ok:     #16A34A;
  }

  .auth-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
  }

  /* ══ LEFT — photo cover ══ */
  .auth-cover {
    position: relative;
    overflow: hidden;
    background: #030A12;
  }

  .auth-cover-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 40%;
    filter: brightness(0.38) saturate(0.70);
    transition: transform 12s ease;
  }

  .auth-cover:hover .auth-cover-img { transform: scale(1.04); }

  .auth-cover-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(145deg, rgba(5,10,20,0.92) 0%, rgba(20,8,12,0.65) 55%, rgba(5,10,20,0.82) 100%);
  }

  /* Subtle red glow — bottom right */
  .auth-cover-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 85% 85%, rgba(227,10,23,0.15) 0%, transparent 50%);
  }

  /* Tunisian flag strip — left edge */
  .auth-cover-flag {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    display: flex;
    flex-direction: column;
    z-index: 5;
  }

  .acf-r { flex: 1; background: var(--red); }
  .acf-w { height: 5px; background: rgba(255,255,255,0.50); }

  /* Cover content */
  .auth-cover-content {
    position: relative;
    z-index: 4;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px 48px;
  }

  .auth-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .auth-logo-red { color: var(--red); }

  .auth-logo-flag {
    display: flex;
    border-radius: 3px;
    overflow: hidden;
    height: 14px;
    width: 21px;
    border: 1px solid rgba(255,255,255,0.25);
    flex-shrink: 0;
  }

  .alf-r { flex: 1; background: var(--red); }
  .alf-w { flex: 1; background: rgba(255,255,255,0.85); }

  .auth-cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 40px 0;
  }

  .auth-cover-tag {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: rgba(227,10,23,0.75);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .auth-cover-tag::before {
    content: '';
    display: block;
    width: 22px; height: 2px;
    background: var(--red);
    border-radius: 1px;
  }

  .auth-cover-h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 3.5vw, 48px);
    font-weight: 700;
    color: white;
    line-height: 1.08;
    letter-spacing: -0.022em;
    margin-bottom: 20px;
  }

  .auth-cover-h2 em {
    font-style: italic;
    font-weight: 400;
    color: rgba(255,160,165,0.90);
  }

  .auth-cover-p {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    line-height: 1.75;
    font-weight: 300;
    max-width: 340px;
    margin-bottom: 36px;
  }

  /* Mini timeline preview */
  .auth-preview { display: flex; flex-direction: column; gap: 8px; }

  .ap-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 9px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
  }

  .ap-item.done   { border-color: rgba(227,10,23,0.28); background: rgba(227,10,23,0.06); }
  .ap-item.active { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); }

  .ap-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .ap-dot.done    { background: var(--red); }
  .ap-dot.active  { background: white; opacity: 0.6; box-shadow: 0 0 6px rgba(255,255,255,0.4); }
  .ap-dot.pending { background: rgba(255,255,255,0.18); }

  .ap-label { flex: 1; font-size: 11.5px; color: rgba(255,255,255,0.40); font-weight: 300; }
  .ap-label.done { color: rgba(255,255,255,0.75); }

  .ap-badge {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.06em;
  }

  .ap-badge.done    { background: rgba(227,10,23,0.18); color: rgba(255,160,165,0.90); }
  .ap-badge.active  { background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.65); }
  .ap-badge.pending { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.25); }

  .auth-cover-footer {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.16);
    text-transform: uppercase;
  }

  /* ══ RIGHT — form panel ══ */
  .auth-form-panel {
    background: var(--cream);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 52px;
    position: relative;
    overflow-y: auto;
  }

  .auth-form-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(227,10,23,0.035) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  .auth-form-wrap {
    width: 100%;
    max-width: 400px;
    position: relative;
    z-index: 1;
  }

  .auth-back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12.5px;
    color: var(--faint);
    text-decoration: none;
    margin-bottom: 32px;
    transition: color 0.15s;
  }

  .auth-back:hover { color: var(--ink); }

  .auth-h1 {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.022em;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .auth-sub {
    font-size: 13.5px;
    color: var(--faint);
    margin-bottom: 32px;
    font-weight: 300;
    line-height: 1.5;
  }

  .auth-sub a { color: var(--red); text-decoration: none; font-weight: 500; }
  .auth-sub a:hover { text-decoration: underline; }

  /* Fields */
  .auth-field { margin-bottom: 16px; }

  .auth-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .auth-input {
    width: 100%;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .auth-input::placeholder { color: var(--faint); }

  .auth-input:focus {
    border-color: var(--red);
    box-shadow: 0 0 0 3px rgba(227,10,23,0.09);
  }

  .auth-input.field-err { border-color: #FECACA; box-shadow: 0 0 0 3px rgba(220,38,38,0.06); }

  /* Password strength */
  .strength-wrap { margin-top: 7px; }

  .strength-track {
    height: 3px;
    background: var(--cream2);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .strength-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease, background 0.4s ease;
  }

  .strength-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Error */
  .auth-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FEF2F2;
    border: 1.5px solid #FECACA;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 18px;
    font-size: 13px;
    color: var(--err);
    line-height: 1.5;
  }

  .auth-error svg { flex-shrink: 0; margin-top: 1px; }

  /* Submit */
  .auth-submit {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: var(--red);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 14px 24px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    letter-spacing: 0.02em;
    transition: all 0.2s;
    margin-top: 8px;
  }

  .auth-submit:hover:not(:disabled) {
    background: var(--red-d);
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(227,10,23,0.28);
  }

  .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* Terms */
  .auth-terms {
    font-size: 11.5px;
    color: var(--faint);
    text-align: center;
    margin-top: 16px;
    line-height: 1.65;
    font-weight: 300;
  }

  .auth-terms a { color: var(--red); text-decoration: none; }
  .auth-terms a:hover { text-decoration: underline; }

  /* Spinner */
  .auth-spin {
    width: 17px; height: 17px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 800px) {
    .auth-page { grid-template-columns: 1fr; }
    .auth-cover { display: none; }
    .auth-form-panel { padding: 48px 24px; }
  }
`;

/* ── Password strength ── */
const getStrength = (p: string): { pct: number; color: string; label: string } => {
  if (!p) return { pct: 0, color: 'transparent', label: '' };
  let s = 0;
  if (p.length >= 8)           s++;
  if (p.length >= 12)          s++;
  if (/[A-Z]/.test(p))        s++;
  if (/[0-9]/.test(p))        s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { pct: 20,  color: '#EF4444', label: 'Weak' };
  if (s <= 2) return { pct: 45,  color: '#F59E0B', label: 'Fair' };
  if (s <= 3) return { pct: 70,  color: '#3B82F6', label: 'Good' };
  return            { pct: 100, color: '#16A34A', label: 'Strong' };
};

/* Mini timeline preview steps */
const PREVIEW = [
  { label: 'Choose legal structure',           s: 'done'    },
  { label: 'Notarize Articles of Association', s: 'done'    },
  { label: 'Register at RNE',                  s: 'active'  },
  { label: 'Obtain Tax ID (MF)',               s: 'pending' },
];

// Cover — Documents, stylo, bureau professionnel
const COVERS = [
  'https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1400&q=85&auto=format&fit=crop', // Contrat + stylo sur bureau
  'https://images.unsplash.com/photo-1554224155-8d04421f0706?w=1400&q=85&auto=format&fit=crop', // Paperwork + calculator
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=85&auto=format&fit=crop', // Signature contrat
];

export default function Signup() {
  const [email,    setEmail]    = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [imgIdx,   setImgIdx]   = useState(0);
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await signup(email, username, password);
      navigate('/login');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) setError(detail.map((d: any) => d.msg).join(', '));
      else setError(detail || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="auth-page">

        {/* ══ LEFT — cover ══ */}
        <div className="auth-cover">
          <img
            className="auth-cover-img"
            src={COVERS[imgIdx]}
            alt="Sidi Bou Said, Tunisia"
            loading="eager"
            onError={() => setImgIdx(i => Math.min(i + 1, COVERS.length - 1))}
          />
          <div className="auth-cover-overlay" />
          <div className="auth-cover-glow" />

          <div className="auth-cover-flag">
            <div className="acf-r" /><div className="acf-w" /><div className="acf-r" />
          </div>

          <div className="auth-cover-content">
            <Link to="/" className="auth-logo">
              Legal<span className="auth-logo-red">Ease</span>
              <div className="auth-logo-flag">
                <div className="alf-r" /><div className="alf-w" />
              </div>
            </Link>

            <div className="auth-cover-body">
              <div className="auth-cover-tag">Get started today</div>
              <h2 className="auth-cover-h2">
                Track every step,<br /><em>miss nothing.</em>
              </h2>
              <p className="auth-cover-p">
                Create your account and start your first procedure in under 2 minutes. No paperwork needed to begin.
              </p>

              {/* Mini timeline preview */}
              <div className="auth-preview">
                {PREVIEW.map((p, i) => (
                  <div key={i} className={`ap-item ${p.s}`}>
                    <div className={`ap-dot ${p.s}`} />
                    <span className={`ap-label ${p.s === 'done' ? 'done' : ''}`}>{p.label}</span>
                    <span className={`ap-badge ${p.s}`}>
                      {p.s === 'done' ? 'Done' : p.s === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="auth-cover-footer">© {new Date().getFullYear()} LegalEase Tunisia</div>
          </div>
        </div>

        {/* ══ RIGHT — form ══ */}
        <div className="auth-form-panel">
          <div className="auth-form-wrap">

            <Link to="/" className="auth-back">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to home
            </Link>

            <h1 className="auth-h1">Create account</h1>
            <p className="auth-sub">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>

            {error && (
              <div className="auth-error">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <input
                  className="auth-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {/* Username */}
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  className="auth-input"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="your_username"
                  minLength={3}
                  maxLength={50}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>

              {/* Password + strength */}
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  className={`auth-input ${password && password.length < 8 ? 'field-err' : ''}`}
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {password && (
                  <div className="strength-wrap">
                    <div className="strength-track">
                      <div
                        className="strength-fill"
                        style={{ width: `${strength.pct}%`, background: strength.color }}
                      />
                    </div>
                    <span className="strength-lbl" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? <div className="auth-spin" />
                  : <>
                      Create my account
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </>
                }
              </button>
            </form>

            <p className="auth-terms">
              By creating an account you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

          </div>
        </div>

      </div>
    </>
  );
}