// src/pages/Home.tsx — Hero vidéo background + Crème/Rouge tunisien élégant
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import HomeAIButton from '../components/AI/HomeAIButton';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --red:    #E30A17;
    --red-d:  #B8000C;
    --red-l:  #FF3B46;
    --red-xs: #FFF0F1;
    --red-sm: #FFE0E2;
    --cream:  #FAF8F4;
    --cream2: #F4F1EB;
    --white:  #FFFFFF;
    --ink:    #1A1A18;
    --ink-l:  #2C2C2A;
    --muted:  #6B6B68;
    --faint:  #9A9A96;
    --border: #E6E2DA;
    --sh:     0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.07);
    --sh-lg:  0 12px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  }

  html { scroll-behavior: smooth; }
  .home { background: var(--cream); color: var(--ink); font-family: 'Inter', sans-serif; overflow-x: hidden; }

  /* ══════════════════════════════════════
     NAVBAR — transparente sur le hero
  ══════════════════════════════════════ */
  .nb {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 60px;
    background: transparent;
    transition: background 0.4s, border-color 0.4s, box-shadow 0.4s;
  }

  .nb.scrolled {
    background: rgba(250,248,244,0.95);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 0 rgba(0,0,0,0.04);
  }

  .nb-logo {
    font-family: 'Playfair Display', serif;
    font-size: 21px;
    font-weight: 700;
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s;
  }

  .nb.scrolled .nb-logo { color: var(--ink); }
  .nb-logo-red { color: var(--red); }

  /* Miniature drapeau */
  .nb-flag {
    display: flex;
    border-radius: 3px;
    overflow: hidden;
    height: 13px;
    width: 20px;
    border: 1px solid rgba(255,255,255,0.25);
    flex-shrink: 0;
  }

  .nb.scrolled .nb-flag { border-color: rgba(0,0,0,0.10); }
  .nb-flag-r { flex: 1; background: var(--red); }
  .nb-flag-w { flex: 1; background: white; }

  .nb-links { display: flex; align-items: center; gap: 2px; }

  .nb-link {
    font-size: 13px;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    padding: 7px 14px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nb-link:hover { color: white; background: rgba(255,255,255,0.10); }
  .nb.scrolled .nb-link { color: var(--muted); }
  .nb.scrolled .nb-link:hover { color: var(--ink); background: var(--cream2); }

  .nb-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.25); margin: 0 6px; transition: background 0.3s; }
  .nb.scrolled .nb-sep { background: var(--border); }

  .nb-signin {
    font-size: 13px;
    color: rgba(255,255,255,0.80);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.30);
    transition: all 0.2s;
  }

  .nb-signin:hover { color: white; border-color: rgba(255,255,255,0.60); }
  .nb.scrolled .nb-signin { color: var(--ink); border-color: var(--border); }
  .nb.scrolled .nb-signin:hover { border-color: var(--red); color: var(--red); }

  .nb-cta {
    font-size: 13px;
    font-weight: 600;
    color: white;
    background: var(--red);
    padding: 9px 22px;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .nb-cta:hover {
    background: var(--red-d);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(227,10,23,0.35);
  }

  /* ══════════════════════════════════════
     HERO — VIDÉO BACKGROUND
  ══════════════════════════════════════ */
  .hero {
    position: relative;
    height: 100vh;
    min-height: 640px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
  }

  /* Conteneur vidéo */
  .hero-video-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .hero-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    filter: brightness(0.42) saturate(0.75);
  }

  /* Overlay multi-couche */
  .hero-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(180deg,
        rgba(10,5,5,0.55) 0%,
        rgba(10,5,5,0.25) 40%,
        rgba(10,5,5,0.65) 85%,
        rgba(10,5,5,0.90) 100%
      );
  }

  /* Vignette rouge sur les bords */
  .hero-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: radial-gradient(
      ellipse at center,
      transparent 35%,
      rgba(227,10,23,0.07) 70%,
      rgba(100,0,5,0.25) 100%
    );
  }

  /* Bande drapeau — bas du hero */
  .hero-flag-bar {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    z-index: 4;
    display: flex;
    height: 5px;
  }

  .hfb-r { flex: 1; background: var(--red); }
  .hfb-w { width: 4px; background: rgba(255,255,255,0.55); }

  /* Contenu hero */
  .hero-content {
    position: relative;
    z-index: 3;
    padding: 0 24px;
    max-width: 900px;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    background: rgba(227,10,23,0.15);
    border: 1px solid rgba(227,10,23,0.40);
    border-radius: 100px;
    padding: 8px 18px 8px 12px;
    margin-bottom: 32px;
    opacity: 0;
    animation: fadeUp 0.7s ease 0.1s forwards;
  }

  .hero-badge-flag {
    display: flex;
    border-radius: 3px;
    overflow: hidden;
    height: 14px;
    width: 20px;
    border: 1px solid rgba(255,255,255,0.20);
    flex-shrink: 0;
  }

  .hbf-r { flex: 1; background: var(--red); }
  .hbf-w { flex: 1; background: rgba(255,255,255,0.85); }

  .hero-badge-txt {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.80);
    font-weight: 500;
  }

  .hero-h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(46px, 7vw, 88px);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: white;
    margin-bottom: 24px;
    opacity: 0;
    animation: fadeUp 0.9s ease 0.25s forwards;
  }

  .hero-h1-italic {
    font-style: italic;
    font-weight: 400;
    color: #FF8087;
  }

  .hero-sub {
    font-size: 17px;
    font-weight: 300;
    color: rgba(255,255,255,0.60);
    line-height: 1.80;
    max-width: 600px;
    margin: 0 auto 44px;
    opacity: 0;
    animation: fadeUp 0.9s ease 0.40s forwards;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeUp 0.9s ease 0.55s forwards;
  }

  .btn-hero-primary {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-size: 15px;
    font-weight: 600;
    color: white;
    background: var(--red);
    padding: 15px 32px;
    border-radius: 10px;
    text-decoration: none;
    letter-spacing: 0.01em;
    transition: all 0.2s;
  }

  .btn-hero-primary:hover {
    background: var(--red-d);
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(227,10,23,0.40);
  }

  .btn-hero-outline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    padding: 15px 26px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.28);
    transition: all 0.2s;
  }

  .btn-hero-outline:hover {
    color: white;
    border-color: rgba(255,255,255,0.60);
    background: rgba(255,255,255,0.07);
  }

  /* Scroll indicator */
  .hero-scroll {
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 4;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    opacity: 0;
    animation: fadeUp 1s ease 1.2s forwards;
    cursor: pointer;
  }

  .hero-scroll-line {
    width: 1px;
    height: 40px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.55), transparent);
    animation: scrollPulse 2.2s ease-in-out infinite;
  }

  .hero-scroll-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
  }

  /* ══════════════════════════════════════
     STATS STRIP — sur fond crème
  ══════════════════════════════════════ */
  .stats-strip {
    background: var(--white);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-cell {
    padding: 36px 20px;
    text-align: center;
    border-right: 1px solid var(--border);
    position: relative;
    overflow: hidden;
    transition: background 0.2s;
  }

  .stat-cell:last-child { border-right: none; }
  .stat-cell:hover { background: var(--red-xs); }

  .stat-cell::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 40px; height: 3px;
    background: var(--red);
    border-radius: 0 0 3px 3px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .stat-cell:hover::before { opacity: 1; }

  .stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 48px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-val-red { color: var(--red); }

  .stat-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--faint);
    margin-top: 8px;
  }

  /* ══════════════════════════════════════
     SECTIONS COMMUNES
  ══════════════════════════════════════ */
  .sec {
    max-width: 1160px;
    margin: 0 auto;
    padding: 96px 60px;
  }

  .sec-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 16px;
  }

  .sec-eyebrow::before {
    content: '';
    display: block;
    width: 20px; height: 2px;
    background: var(--red);
    border-radius: 1px;
  }

  .sec-h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 54px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin-bottom: 60px;
    max-width: 540px;
  }

  .sec-h2 em { font-style: italic; font-weight: 400; color: var(--red); }

  /* ══════════════════════════════════════
     HOW IT WORKS — cards avec bordure rouge
  ══════════════════════════════════════ */
  .how-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .how-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 38px 32px;
    position: relative;
    overflow: hidden;
    transition: all 0.22s;
  }

  .how-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--sh-lg);
    border-color: rgba(227,10,23,0.20);
  }

  .how-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--red);
    transform: scaleX(0);
    transition: transform 0.35s ease;
    transform-origin: left;
  }

  .how-card:hover::before { transform: scaleX(1); }

  /* Grand numéro décoratif */
  .how-bg-num {
    position: absolute;
    top: 10px; right: 16px;
    font-family: 'Playfair Display', serif;
    font-size: 96px;
    font-weight: 700;
    color: var(--cream2);
    line-height: 1;
    letter-spacing: -0.05em;
    pointer-events: none;
    transition: color 0.2s;
  }

  .how-card:hover .how-bg-num { color: var(--red-xs); }

  .how-icon-wrap {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: var(--red-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--red);
    margin-bottom: 24px;
    transition: all 0.22s;
    position: relative;
    z-index: 1;
  }

  .how-card:hover .how-icon-wrap {
    background: var(--red);
    color: white;
    box-shadow: 0 8px 24px rgba(227,10,23,0.28);
  }

  .how-title {
    font-family: 'Playfair Display', serif;
    font-size: 21px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
    position: relative;
    z-index: 1;
  }

  .how-desc {
    font-size: 13.5px;
    color: var(--muted);
    line-height: 1.75;
    font-weight: 300;
    position: relative;
    z-index: 1;
  }

  /* ══════════════════════════════════════
     FEATURES — alternées avec illustration
  ══════════════════════════════════════ */
  .feat-section { background: var(--cream2); }

  .feat-pair {
    max-width: 1160px;
    margin: 0 auto;
    padding: 80px 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }

  .feat-pair + .feat-pair {
    border-top: 1px solid var(--border);
    padding-top: 80px;
  }

  .feat-pair.rev { direction: rtl; }
  .feat-pair.rev > * { direction: ltr; }

  .feat-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--red);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .feat-eyebrow::before { content:''; display:block; width:14px; height:2px; background:var(--red); border-radius:1px; }

  .feat-h3 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(26px, 3vw, 40px);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.022em;
    color: var(--ink);
    margin-bottom: 16px;
  }

  .feat-desc {
    font-size: 15px;
    color: var(--muted);
    line-height: 1.80;
    font-weight: 300;
    margin-bottom: 28px;
  }

  .feat-bullets { display: flex; flex-direction: column; gap: 11px; }

  .feat-bullet {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13.5px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.5;
  }

  .feat-bullet-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--red);
    flex-shrink: 0;
    margin-top: 6px;
    opacity: 0.65;
  }

  /* Mock card */
  .mock-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: var(--sh-lg);
  }

  .mc-head {
    background: var(--ink);
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mc-dot { width: 9px; height: 9px; border-radius: 50%; }
  .mc-title {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.40);
    letter-spacing: 0.06em;
    margin-left: 8px;
    flex: 1;
  }

  .mc-body { padding: 18px; }

  /* Timeline mock */
  .tl-mock { display: flex; flex-direction: column; }

  .tl-item {
    display: flex;
    gap: 14px;
    padding-bottom: 16px;
    position: relative;
  }

  .tl-item:last-child { padding-bottom: 0; }

  .tl-left { display: flex; flex-direction: column; align-items: center; gap: 0; }

  .tl-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .tl-dot.done    { background: var(--red); }
  .tl-dot.active  { background: var(--red); opacity: 0.45; box-shadow: 0 0 0 4px rgba(227,10,23,0.12); }
  .tl-dot.pending { background: var(--border); }

  .tl-line {
    width: 1px;
    flex: 1;
    background: var(--border);
    margin: 4px 0;
    min-height: 16px;
  }

  .tl-line.done { background: var(--red); opacity: 0.25; }

  .tl-content {
    flex: 1;
    padding: 8px 14px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--cream);
  }

  .tl-content.done   { background: var(--red-xs); border-color: rgba(227,10,23,0.20); }
  .tl-content.active { background: var(--white);  border-color: rgba(227,10,23,0.40); box-shadow: 0 2px 10px rgba(227,10,23,0.10); }

  .tl-row { display: flex; align-items: center; justify-content: space-between; }

  .tl-name { font-size: 12px; font-weight: 500; color: var(--ink); }
  .tl-name.muted { color: var(--muted); font-weight: 400; }

  .tl-badge {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.06em;
  }

  .tl-badge.done    { background: rgba(227,10,23,0.10); color: var(--red); }
  .tl-badge.active  { background: rgba(227,10,23,0.08); color: var(--red); }
  .tl-badge.pending { background: var(--cream2); color: var(--faint); }

  .tl-date { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--faint); margin-top: 3px; }

  /* Notification mock */
  .notif-mock { display: flex; flex-direction: column; gap: 10px; }

  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 13px 15px;
    border-radius: 11px;
    border: 1px solid var(--border);
    background: var(--cream);
    transition: all 0.2s;
  }

  .notif-item.unread {
    background: var(--red-xs);
    border-color: rgba(227,10,23,0.20);
  }

  .notif-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notif-icon.red   { background: var(--red);   color: white; }
  .notif-icon.light { background: var(--red-xs); color: var(--red); }
  .notif-icon.gray  { background: var(--cream2); color: var(--faint); }

  .notif-title { font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
  .notif-msg   { font-size: 11px; color: var(--muted); line-height: 1.4; font-weight: 300; }
  .notif-time  { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--faint); margin-top: 3px; }
  .notif-unread-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--red);
    flex-shrink: 0;
    margin-top: 4px;
  }

  /* ══════════════════════════════════════
     PROCÉDURES
  ══════════════════════════════════════ */
  .procs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .proc-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px 28px;
    position: relative;
    overflow: hidden;
    transition: all 0.22s;
  }

  .proc-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: var(--red);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
  }

  .proc-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--sh-lg);
    border-color: rgba(227,10,23,0.20);
  }

  .proc-card:hover::after { transform: scaleX(1); }

  .proc-icon { font-size: 36px; margin-bottom: 18px; display: block; }

  .proc-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 10px;
    letter-spacing: -0.01em;
  }

  .proc-desc {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.65;
    font-weight: 300;
    margin-bottom: 22px;
  }

  .proc-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--red);
    letter-spacing: 0.06em;
  }

  .proc-meta-sep {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--red);
    opacity: 0.5;
  }

  /* ══════════════════════════════════════
     CTA
  ══════════════════════════════════════ */
  .cta-section {
    background: var(--ink);
    position: relative;
    overflow: hidden;
  }

  .cta-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 75% 50%, rgba(227,10,23,0.14) 0%, transparent 55%),
      radial-gradient(ellipse at 25% 80%, rgba(227,10,23,0.07) 0%, transparent 45%);
    pointer-events: none;
  }

  /* Drapeau décoratif semi-transparent */
  .cta-deco-flag {
    position: absolute;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 4px;
    opacity: 0.05;
    pointer-events: none;
  }

  .cdf-r { width: 100px; height: 160px; background: var(--red); border-radius: 6px; }
  .cdf-w { width: 100px; height: 160px; background: white;      border-radius: 6px; }

  .cta-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 96px 60px;
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 64px;
  }

  .cta-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(227,10,23,0.55);
    margin-bottom: 20px;
  }

  .cta-h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(34px, 5vw, 62px);
    font-weight: 700;
    color: white;
    line-height: 1.08;
    letter-spacing: -0.028em;
    margin-bottom: 18px;
  }

  .cta-h2 em { font-style: italic; font-weight: 400; color: rgba(255,180,185,0.75); }

  .cta-sub {
    font-size: 15px;
    color: rgba(255,255,255,0.38);
    font-weight: 300;
    line-height: 1.75;
    max-width: 460px;
  }

  .cta-btns { display: flex; flex-direction: column; gap: 10px; flex-shrink: 0; }

  .btn-cta-white {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--red);
    background: white;
    padding: 15px 32px;
    border-radius: 10px;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .btn-cta-white:hover {
    background: var(--red-xs);
    transform: translateY(-1px);
    box-shadow: 0 10px 32px rgba(255,255,255,0.12);
  }

  .btn-cta-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: rgba(255,255,255,0.40);
    text-decoration: none;
    padding: 13px 24px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    white-space: nowrap;
    transition: all 0.2s;
  }

  .btn-cta-ghost:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.28); }

  /* ══════════════════════════════════════
     FOOTER
  ══════════════════════════════════════ */
  .footer {
    background: var(--ink-l);
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 36px 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    color: rgba(255,255,255,0.60);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-logo-red { color: var(--red); }

  .footer-flag {
    display: flex;
    border-radius: 3px;
    overflow: hidden;
    height: 12px;
    width: 18px;
    border: 1px solid rgba(255,255,255,0.10);
  }

  .footer-links { display: flex; gap: 24px; }

  .footer-link {
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer-link:hover { color: rgba(255,255,255,0.60); }

  .footer-copy {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.16);
    letter-spacing: 0.06em;
  }

  /* ══════════════════════════════════════
     ANIMATIONS & REVEAL
  ══════════════════════════════════════ */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes scrollPulse {
    0%,100% { opacity: 1; transform: scaleY(1); }
    50%      { opacity: 0.3; transform: scaleY(0.5); }
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.75s ease, transform 0.75s ease;
  }

  .reveal.visible { opacity: 1; transform: translateY(0); }

  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }

  /* ══════════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════════ */
  @media (max-width: 960px) {
    .nb { padding: 0 20px; }
    .sec { padding: 64px 24px; }
    .how-grid { grid-template-columns: 1fr; }
    .feat-pair { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
    .feat-pair.rev { direction: ltr; }
    .procs-grid { grid-template-columns: 1fr; }
    .cta-inner { grid-template-columns: 1fr; padding: 60px 24px; }
    .cta-btns { flex-direction: row; flex-wrap: wrap; }
    .footer { padding: 32px 24px; flex-direction: column; text-align: center; }
    .stats-strip { grid-template-columns: 1fr; }
    .stat-cell { border-right: none; border-bottom: 1px solid var(--border); }
    .stat-cell:last-child { border-bottom: none; }
  }
`;

/* ── Navbar scroll effect ── */
const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
};

/* ── Reveal hook ── */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.10 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* ── Animated counter ── */
const Counter = ({ to, suffix = '' }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let v = 0;
      const t = setInterval(() => {
        v = Math.min(v + to / 55, to);
        setVal(Math.round(v));
        if (v >= to) clearInterval(t);
      }, 16);
      io.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <div ref={ref} className="stat-val"><span className="stat-val-red">{val}</span>{suffix}</div>;
};

/* ── Data ── */
const TL_STEPS = [
  { label: 'Choose legal structure',           s: 'done',    date: 'Feb 10' },
  { label: 'Notarize Articles of Association', s: 'done',    date: 'Feb 15' },
  { label: 'Register at RNE',                  s: 'active',  date: 'Due Apr 30' },
  { label: 'Obtain Tax ID (MF)',               s: 'pending', date: '' },
  { label: 'Register with CNSS',               s: 'pending', date: '' },
];

const NOTIFS = [
  { title: 'Deadline in 3 days',    msg: '"Register at RNE" is due Apr 30.',    time: '2h ago',  type: 'red',   unread: true  },
  { title: 'Step completed',        msg: 'You completed "Notarize Articles".',   time: '1d ago',  type: 'light', unread: true  },
  { title: 'Procedure started',     msg: 'Startup Creation — 5 steps remaining.', time: '5d ago', type: 'gray',  unread: false },
];

// Vidéos Pexels libres de droits — procédures légales, bureau, documents
const VIDEO_SRC = 'https://www.pexels.com/video/7699428/download/?fps=25&h=720&w=1280';
const VIDEO_POSTER = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&auto=format&fit=crop';

export default function Home() {
  useReveal();
  const scrolled = useScrolled();

  return (
    <>
      <style>{STYLE}</style>
      <div className="home">

        {/* ═══ NAVBAR ═══ */}
        <nav className={`nb ${scrolled ? 'scrolled' : ''}`}>
          <Link to="/" className="nb-logo">
            Legal<span className="nb-logo-red">Ease</span>
            <div className="nb-flag"><div className="nb-flag-r" /><div className="nb-flag-w" /></div>
          </Link>
          <div className="nb-links">
            <a href="#how"        className="nb-link">How it works</a>
            <a href="#features"   className="nb-link">Features</a>
            <a href="#procedures" className="nb-link">Procedures</a>
            <div className="nb-sep" />
            <Link to="/login"  className="nb-signin">Sign in</Link>
            <Link to="/signup" className="nb-cta">
              Get started
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </nav>

        {/* ═══ HERO — VIDÉO ═══ */}
        <section className="hero">
          <div className="hero-video-wrap">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster={VIDEO_POSTER}
            >
              {/* Vidéo Pexels — homme signant des documents légaux (ID 7699428) */}
              <source src={VIDEO_SRC} type="video/mp4" />
              {/* Fallback si la vidéo ne charge pas */}
              <img src={VIDEO_POSTER} alt="Legal documents" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </video>
          </div>

          <div className="hero-overlay" />
          <div className="hero-vignette" />

          {/* Bande drapeau bas */}
          <div className="hero-flag-bar">
            <div className="hfb-r" /><div className="hfb-w" /><div className="hfb-r" />
          </div>

          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-flag"><div className="hbf-r" /><div className="hbf-w" /></div>
              <span className="hero-badge-txt">Tunisia's administrative platform</span>
            </div>

            <h1 className="hero-h1">
              Navigate Tunisia's<br />
              procedures,{' '}
              <span className="hero-h1-italic">with ease.</span>
            </h1>

            <p className="hero-sub">
              Track every step of your startup creation or CNSS registration — documents, deadlines and smart notifications, all in one platform built for Tunisian founders.
            </p>

            <div className="hero-actions">
              <Link to="/signup" className="btn-hero-primary">
                Start for free
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link to="/login" className="btn-hero-outline">Sign in to continue</Link>
              <HomeAIButton variant="dark" />
            </div>
          </div>

          <div className="hero-scroll" onClick={() => document.querySelector('.stats-strip')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="hero-scroll-line" />
            <span className="hero-scroll-lbl">Scroll</span>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <div className="stats-strip reveal">
          <div className="stat-cell">
            <Counter to={3} suffix="+" />
            <div className="stat-lbl">Procedure types</div>
          </div>
          <div className="stat-cell">
            <Counter to={24} />
            <div className="stat-lbl">Steps guided end-to-end</div>
          </div>
          <div className="stat-cell">
            <Counter to={100} suffix="%" />
            <div className="stat-lbl">Free to use</div>
          </div>
        </div>

        {/* ═══ HOW IT WORKS ═══ */}
        <div className="sec" id="how">
          <div className="reveal">
            <div className="sec-eyebrow">Process</div>
            <h2 className="sec-h2">Three steps to <em>clarity</em></h2>
          </div>
          <div className="how-grid">
            {[
              { n:'01', title:'Choose a procedure',  desc:'Select from startup creation, CNSS registration, or quarterly declarations — each with a complete step-by-step guide.',
                icon:<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
              { n:'02', title:'Track your progress', desc:'Mark steps complete, attach documents, set deadlines, and add notes. Your timeline reflects real progress in real time.',
                icon:<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
              { n:'03', title:'Stay on schedule',    desc:'Get notified 3 days before each deadline, on the due date, and if you fall behind — nothing slips through the cracks.',
                icon:<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
            ].map((s, i) => (
              <div key={i} className={`how-card reveal reveal-delay-${i+1}`}>
                <div className="how-bg-num">{s.n}</div>
                <div className="how-icon-wrap">{s.icon}</div>
                <div className="how-title">{s.title}</div>
                <p className="how-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FEATURES ═══ */}
        <section className="feat-section" id="features">

          {/* Feature 1 — Timeline */}
          <div className="feat-pair reveal">
            <div>
              <div className="feat-eyebrow">Timeline</div>
              <h3 className="feat-h3">Your procedures,<br />step by step.</h3>
              <p className="feat-desc">A clear, interactive timeline shows exactly where you are in every procedure — what's done, what's active, and what's next.</p>
              <div className="feat-bullets">
                {['Real-time progress tracking', 'Auto-advance to next step on completion', 'Mark steps blocked when stuck', 'Add personal notes per step'].map((p, i) => (
                  <div key={i} className="feat-bullet"><div className="feat-bullet-dot" />{p}</div>
                ))}
              </div>
            </div>
            <div className="mock-card">
              <div className="mc-head">
                <div className="mc-dot" style={{ background:'#EF4444' }} />
                <div className="mc-dot" style={{ background:'#F59E0B' }} />
                <div className="mc-dot" style={{ background:'#10B981' }} />
                <span className="mc-title">Startup Creation — 62% complete</span>
              </div>
              <div className="mc-body">
                <div className="tl-mock">
                  {TL_STEPS.map((s, i) => (
                    <div key={i} className="tl-item">
                      <div className="tl-left">
                        <div className={`tl-dot ${s.s}`} />
                        {i < TL_STEPS.length - 1 && <div className={`tl-line ${s.s}`} />}
                      </div>
                      <div className={`tl-content ${s.s}`} style={{ marginBottom: i < TL_STEPS.length - 1 ? 0 : 0 }}>
                        <div className="tl-row">
                          <span className={`tl-name ${s.s === 'pending' ? 'muted' : ''}`}>{s.label}</span>
                          <span className={`tl-badge ${s.s}`}>{s.s === 'done' ? 'Done' : s.s === 'active' ? 'Active' : 'Pending'}</span>
                        </div>
                        {s.date && <div className="tl-date">{s.date}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — Notifications */}
          <div className="feat-pair rev reveal">
            <div>
              <div className="feat-eyebrow">Notifications</div>
              <h3 className="feat-h3">Never miss a<br />deadline again.</h3>
              <p className="feat-desc">Smart reminders keep you on track automatically — 3 days before, on the day, and if you miss a deadline.</p>
              <div className="feat-bullets">
                {['Deadline reminder 3 days before', 'Alert on the due date', 'Overdue notification if missed', 'Step completion celebrations'].map((p, i) => (
                  <div key={i} className="feat-bullet"><div className="feat-bullet-dot" />{p}</div>
                ))}
              </div>
            </div>
            <div className="mock-card">
              <div className="mc-head">
                <div className="mc-dot" style={{ background:'#EF4444' }} />
                <div className="mc-dot" style={{ background:'#F59E0B' }} />
                <div className="mc-dot" style={{ background:'#10B981' }} />
                <span className="mc-title">Notifications</span>
              </div>
              <div className="mc-body">
                <div className="notif-mock">
                  {NOTIFS.map((n, i) => (
                    <div key={i} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                      <div className={`notif-icon ${n.type}`}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-msg">{n.msg}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {n.unread && <div className="notif-unread-dot" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* ═══ PROCÉDURES ═══ */}
        <div className="sec" id="procedures">
          <div className="reveal">
            <div className="sec-eyebrow">Coverage</div>
            <h2 className="sec-h2">Procedures we <em>guide</em></h2>
          </div>
          <div className="procs-grid">
            {[
              { icon:'🏢', name:'Startup Creation',       desc:'Full legal process to incorporate in Tunisia — from choosing your structure to the Startup Act label.',          steps:'8 steps', days:'~30 days' },
              { icon:'📋', name:'CNSS Registration',      desc:'Register as employer and declare your employees to the Caisse Nationale de Sécurité Sociale.',                  steps:'5 steps', days:'~10 days' },
              { icon:'📄', name:'Quarterly Declaration',  desc:'Prepare, calculate and submit your quarterly social contribution declaration — every quarter, on time.',         steps:'5 steps', days:'~7 days'  },
            ].map((p, i) => (
              <div key={i} className={`proc-card reveal reveal-delay-${i+1}`}>
                <span className="proc-icon">{p.icon}</span>
                <div className="proc-name">{p.name}</div>
                <p className="proc-desc">{p.desc}</p>
                <div className="proc-meta">
                  <span>{p.steps}</span>
                  <div className="proc-meta-sep" />
                  <span>{p.days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <div className="cta-section reveal">
          <div className="cta-deco-flag">
            <div className="cdf-r" /><div className="cdf-w" />
          </div>
          <div className="cta-inner">
            <div>
              <div className="cta-eyebrow">Get started today</div>
              <h2 className="cta-h2">
                Ready to navigate<br /><em>Tunisia's administration?</em>
              </h2>
              <p className="cta-sub">
                Create a free account and start your first procedure in under 2 minutes. No credit card required.
              </p>
            </div>
            <div className="cta-btns">
              <Link to="/signup" className="btn-cta-white">
                Create a free account
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link to="/login" className="btn-cta-ghost">Already have an account?</Link>
            </div>
          </div>
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="footer">
          <Link to="/" className="footer-logo">
            Legal<span className="footer-logo-red">Ease</span>
            <div className="footer-flag">
              <div style={{ flex:1, background:'#E30A17' }} />
              <div style={{ flex:1, background:'rgba(255,255,255,0.25)' }} />
            </div>
          </Link>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="#" className="footer-link">About</a>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} LegalEase Tunisia — All rights reserved</div>
        </footer>

      </div>
    </>
  );
}