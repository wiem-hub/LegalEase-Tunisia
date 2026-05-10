// src/pages/Profile.tsx
// Theme: Blanc + Navy + Rouge tunisien — cohérent avec Dashboard/Login
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');

  :root {
    --navy:   #1C2B4A;
    --red:    #C8102E;
    --red-xs: #FFF0F2;
    --cream:  #FAF9F7;
    --white:  #FFFFFF;
    --gray1:  #F5F4F1;
    --gray2:  #ECEAE5;
    --gray3:  #9C9A96;
    --gray4:  #6A6865;
    --ink:    #1A1916;
    --border: #E8E5DF;
    --green:  #16A34A;
  }

  .pf-page {
    background: var(--cream);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    color: var(--ink);
    padding: 40px 52px 64px;
  }

  /* ── Page header ── */
  .pf-header {
    margin-bottom: 32px;
  }

  .pf-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pf-eyebrow::before {
    content: '';
    display: block;
    width: 16px; height: 2px;
    background: var(--red);
    border-radius: 1px;
  }

  .pf-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  /* ── Grid layout ── */
  .pf-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 22px;
    align-items: start;
  }

  /* ── Card ── */
  .pf-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06);
  }

  .pf-card-head {
    padding: 18px 22px 14px;
    border-bottom: 1px solid var(--gray1);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pf-card-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: var(--red-xs);
    color: var(--red);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .pf-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .pf-card-body { padding: 20px 22px; }

  /* ── Avatar card ── */
  .pf-avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 22px 22px;
  }

  .pf-avatar-ring {
    position: relative;
    width: 88px; height: 88px;
    margin-bottom: 16px;
  }

  .pf-avatar-img {
    width: 88px; height: 88px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--white);
    box-shadow: 0 0 0 2px var(--navy);
  }

  .pf-avatar-placeholder {
    width: 88px; height: 88px;
    border-radius: 50%;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: white;
    border: 3px solid var(--white);
    box-shadow: 0 0 0 2px var(--navy);
  }

  .pf-avatar-btn {
    position: absolute;
    bottom: 0; right: 0;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--red);
    border: 2px solid white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
  }

  .pf-avatar-btn:hover { background: #A50D25; }

  .pf-username {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
    margin-bottom: 3px;
  }

  .pf-email-tag {
    font-size: 12px;
    color: var(--gray3);
    margin-bottom: 12px;
    font-weight: 300;
  }

  .pf-member-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    color: var(--gray3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: var(--gray1);
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 16px;
  }

  .pf-save-avatar {
    font-size: 12px;
    font-weight: 600;
    color: white;
    background: var(--red);
    border: none;
    border-radius: 8px;
    padding: 8px 18px;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }

  .pf-save-avatar:hover { background: #A50D25; transform: translateY(-1px); }
  .pf-save-avatar:disabled { opacity: 0.60; cursor: not-allowed; transform: none; }

  /* ── Stats ── */
  .pf-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 22px 22px;
  }

  .pf-stat {
    background: var(--gray1);
    border-radius: 10px;
    padding: 12px 14px;
    text-align: center;
  }

  .pf-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 3px;
  }

  .pf-stat-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    color: var(--gray3);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── Form fields ── */
  .pf-field { margin-bottom: 16px; }

  .pf-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gray4);
    margin-bottom: 7px;
  }

  .pf-input {
    width: 100%;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 9px;
    padding: 11px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .pf-input:focus {
    border-color: rgba(28,43,74,0.40);
    box-shadow: 0 0 0 3px rgba(28,43,74,0.07);
  }

  .pf-input::placeholder { color: var(--gray3); }
  .pf-input:disabled { background: var(--gray1); color: var(--gray3); }

  /* Language selector */
  .pf-lang-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .pf-lang-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 12px 8px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: var(--gray1);
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }

  .pf-lang-btn:hover { border-color: var(--navy); background: var(--white); }

  .pf-lang-btn.selected {
    border-color: var(--navy);
    background: var(--navy);
  }

  .pf-lang-btn.selected .pf-lang-name { color: white; }
  .pf-lang-btn.selected .pf-lang-sub  { color: rgba(255,255,255,0.55); }

  .pf-lang-flag { font-size: 20px; }

  .pf-lang-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink);
    transition: color 0.15s;
  }

  .pf-lang-sub {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    color: var(--gray3);
    letter-spacing: 0.04em;
    transition: color 0.15s;
  }

  /* Password strength */
  .pf-strength-track {
    height: 3px;
    background: var(--gray2);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 7px;
  }

  .pf-strength-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s, background 0.4s;
  }

  .pf-strength-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-top: 4px;
    display: block;
  }

  /* Divider */
  .pf-divider {
    height: 1px;
    background: var(--gray1);
    margin: 18px 0;
  }

  /* Action row */
  .pf-actions { display: flex; align-items: center; gap: 10px; margin-top: 18px; }

  .btn-save {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 22px;
    background: var(--navy);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.01em;
  }

  .btn-save:hover { background: #253560; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(28,43,74,0.22); }
  .btn-save:disabled { opacity: 0.60; cursor: not-allowed; transform: none; }

  /* Toast */
  .pf-toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 28px rgba(0,0,0,0.14);
    animation: toastIn 0.25s cubic-bezier(0.34,1.26,0.64,1);
    white-space: nowrap;
  }

  .pf-toast.success { background: var(--green); color: white; }
  .pf-toast.error   { background: var(--red);   color: white; }

  @keyframes toastIn {
    from { opacity:0; transform:translateX(-50%) translateY(12px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }

  @media (max-width: 900px) {
    .pf-page { padding: 28px 20px 48px; }
    .pf-grid { grid-template-columns: 1fr; }
  }
`;

const LANGUAGES = [
  { code: 'fr',     flag: '🇫🇷', name: 'Français',  sub: 'French'  },
  { code: 'en',     flag: '🇬🇧', name: 'English',   sub: 'English' },
  { code: 'darija', flag: '🇹🇳', name: 'دارجة',     sub: 'Darija'  },
];

const getStrength = (p: string) => {
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

interface UserProfile {
  id: number;
  email: string;
  username: string;
  created_at: string;
  is_active: boolean;
  avatar_url?: string | null;
  preferred_lang?: string | null;
}

export default function Profile() {
  const { token } = useAuth();
  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [email,       setEmail]       = useState('');
  const [username,    setUsername]    = useState('');
  const [lang,        setLang]        = useState('fr');
  const [oldPwd,      setOldPwd]      = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);
  const [avatarPrev,  setAvatarPrev]  = useState<string | null>(null);
  const [uploading,   setUploading]   = useState(false);
  const [savingInfo,  setSavingInfo]  = useState(false);
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const strength = getStrength(newPwd);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load profile
  useEffect(() => {
    api.get('/auth/me').then(res => {
      setProfile(res.data);
      setEmail(res.data.email);
      setUsername(res.data.username);
      setLang(res.data.preferred_lang || 'fr');
      if (res.data.avatar_url) {
        setAvatarPrev(`${res.data.avatar_url}?t=${Date.now()}`);
      }
    }).catch(console.error);
  }, [token]);

  // Save profile info + language
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await api.put('/auth/me', { email, username, preferred_lang: lang });
      const res = await api.get('/auth/me');
      setProfile(res.data);
      // Save preferred lang to localStorage for chatbot to use immediately
      localStorage.setItem('preferred_lang', lang);
      showToast('Profile updated successfully');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Update failed', 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  // Change password
  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8) { showToast('New password must be at least 8 characters', 'error'); return; }
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', { old_password: oldPwd, new_password: newPwd });
      setOldPwd(''); setNewPwd('');
      showToast('Password changed successfully');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Password change failed', 'error');
    } finally {
      setSavingPwd(false); }
  };

  // Avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPrev(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', avatarFile);
    try {
      await api.post('/upload/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get('/auth/me');
      setProfile(res.data);
      if (res.data.avatar_url) setAvatarPrev(`${res.data.avatar_url}?t=${Date.now()}`);
      setAvatarFile(null);
      showToast('Avatar updated successfully');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Avatar upload failed', 'error');
    } finally { setUploading(false); }
  };

  if (!profile) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'Inter,sans-serif', color:'#9C9A96', fontSize:13 }}>
      Loading profile...
    </div>
  );

  const joinDate  = new Date(profile.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' });
  const initials  = profile.username.slice(0, 2).toUpperCase();

  return (
    <>
      <style>{STYLE}</style>
      <div className="pf-page">

        {/* Page header */}
        <div className="pf-header">
          <div className="pf-eyebrow">Account</div>
          <h1 className="pf-title">My Profile</h1>
        </div>

        <div className="pf-grid">

          {/* ── Left — Avatar + stats ── */}
          <div>
            <div className="pf-card">
              <div className="pf-avatar-wrap">
                {/* Avatar */}
                <div className="pf-avatar-ring">
                  {avatarPrev
                    ? <img src={avatarPrev} alt="Avatar" className="pf-avatar-img" key={avatarPrev}/>
                    : <div className="pf-avatar-placeholder">{initials}</div>
                  }
                  <label htmlFor="avatar-upload" className="pf-avatar-btn" title="Change avatar">
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>
                </div>

                <div className="pf-username">{profile.username}</div>
                <div className="pf-email-tag">{profile.email}</div>
                <div className="pf-member-badge">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Since {joinDate}
                </div>

                {avatarFile && (
                  <button className="pf-save-avatar" onClick={handleAvatarUpload} disabled={uploading}>
                    {uploading
                      ? <svg style={{ animation:'spin 0.7s linear infinite' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                      : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    }
                    {uploading ? 'Uploading...' : 'Save avatar'}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="pf-stats">
                <div className="pf-stat">
                  <div className="pf-stat-val">{profile.is_active ? '✓' : '✗'}</div>
                  <div className="pf-stat-lbl">Status</div>
                </div>
                <div className="pf-stat">
                  <div className="pf-stat-val" style={{ fontSize:14, paddingTop:4 }}>
                    {LANGUAGES.find(l => l.code === lang)?.flag || '🌐'}
                  </div>
                  <div className="pf-stat-lbl">AI Language</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right — Forms ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Profile info */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-icon">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span className="pf-card-title">Personal information</span>
              </div>
              <div className="pf-card-body">
                <form onSubmit={handleSaveInfo}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div className="pf-field">
                      <label className="pf-label">Username</label>
                      <input className="pf-input" type="text" value={username}
                        onChange={e => setUsername(e.target.value)} required minLength={3}/>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Email address</label>
                      <input className="pf-input" type="email" value={email}
                        onChange={e => setEmail(e.target.value)} required/>
                    </div>
                  </div>

                  {/* Language preference */}
                  <div className="pf-field">
                    <label className="pf-label">Preferred language for AI chatbot</label>
                    <div className="pf-lang-grid">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.code}
                          type="button"
                          className={`pf-lang-btn ${lang === l.code ? 'selected' : ''}`}
                          onClick={() => setLang(l.code)}
                        >
                          <span className="pf-lang-flag">{l.flag}</span>
                          <span className="pf-lang-name">{l.name}</span>
                          <span className="pf-lang-sub">{l.sub}</span>
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize:11.5, color:'var(--gray3)', marginTop:8, fontWeight:300, lineHeight:1.5 }}>
                      The AI chatbot will automatically respond in this language.
                    </p>
                  </div>

                  <div className="pf-actions">
                    <button type="submit" className="btn-save" disabled={savingInfo}>
                      {savingInfo
                        ? <svg style={{ animation:'spin 0.7s linear infinite' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                        : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      }
                      {savingInfo ? 'Saving...' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Password */}
            <div className="pf-card">
              <div className="pf-card-head">
                <div className="pf-card-icon">
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <span className="pf-card-title">Change password</span>
              </div>
              <div className="pf-card-body">
                <form onSubmit={handleChangePwd}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div className="pf-field">
                      <label className="pf-label">Current password</label>
                      <input className="pf-input" type="password" value={oldPwd}
                        onChange={e => setOldPwd(e.target.value)} required
                        placeholder="••••••••" autoComplete="current-password"/>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">New password</label>
                      <input className="pf-input" type="password" value={newPwd}
                        onChange={e => setNewPwd(e.target.value)} required
                        placeholder="Min. 8 characters" minLength={8} autoComplete="new-password"/>
                      {newPwd && (
                        <div>
                          <div className="pf-strength-track">
                            <div className="pf-strength-fill" style={{ width:`${strength.pct}%`, background:strength.color }}/>
                          </div>
                          <span className="pf-strength-lbl" style={{ color:strength.color }}>{strength.label}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pf-actions">
                    <button type="submit" className="btn-save" disabled={savingPwd}>
                      {savingPwd
                        ? <svg style={{ animation:'spin 0.7s linear infinite' }} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9"/></svg>
                        : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      }
                      {savingPwd ? 'Updating...' : 'Update password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`pf-toast ${toast.type}`}>
            {toast.type === 'success'
              ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
            {toast.msg}
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}