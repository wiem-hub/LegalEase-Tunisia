// src/components/Admin/BIAnalytics.tsx
// Full BI dashboard — no external chart library needed (pure SVG + CSS)
import type { GlobalStats, TimeSeriesPoint } from '../../services/adminApi';

const STYLE = `
  :root {
    --navy:#1B2D52;--navy-l:#243665;--gold:#B8963E;--gold-l:#D4AF5A;
    --cream:#FAF8F4;--white:#FFFFFF;--gray1:#F5F2EE;--gray2:#EAE6DE;
    --gray3:#9B9589;--gray4:#6B6560;--ink:#1A1714;--border:#E4DFD7;
    --ok:#16A34A;--warn:#D97706;--err:#DC2626;--info:#2563EB;
  }

  .bi { display:flex; flex-direction:column; gap:24px; }

  /* ── KPI row ── */
  .bi-kpi-row {
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:16px;
  }

  .bi-kpi {
    background:var(--white);
    border:1px solid var(--border);
    border-radius:14px;
    padding:22px 24px;
    box-shadow:0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.05);
    position:relative;
    overflow:hidden;
    transition:transform .2s,box-shadow .2s;
  }

  .bi-kpi:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.09); }

  .bi-kpi-bar {
    position:absolute;
    top:0;left:0;right:0;
    height:3px;
    border-radius:14px 14px 0 0;
  }

  .bi-kpi-top {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:14px;
  }

  .bi-kpi-icon {
    width:38px;height:38px;
    border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;
  }

  .bi-kpi-delta {
    font-family:'DM Mono',monospace;
    font-size:10px;
    padding:3px 8px;
    border-radius:20px;
    letter-spacing:.06em;
  }

  .delta-up   { background:rgba(22,163,74,.10);color:#15803D; }
  .delta-warn { background:rgba(217,119,6,.10); color:var(--warn); }
  .delta-navy { background:rgba(27,45,82,.08);  color:var(--navy); }
  .delta-gold { background:rgba(184,150,62,.12);color:var(--gold); }

  .bi-kpi-val {
    font-family:'Playfair Display',serif;
    font-size:36px;font-weight:700;
    color:var(--navy);line-height:1;
    letter-spacing:-.02em;
  }

  .bi-kpi-lbl {
    font-family:'DM Mono',monospace;
    font-size:9px;letter-spacing:.10em;
    text-transform:uppercase;color:var(--gray3);
    margin-top:5px;
  }

  /* ── Two column layout ── */
  .bi-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .bi-row-3 { display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:20px; }

  /* ── Card ── */
  .bi-card {
    background:var(--white);
    border:1px solid var(--border);
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 1px 3px rgba(0,0,0,0.05),0 4px 14px rgba(0,0,0,0.05);
  }

  .bi-card-head {
    display:flex;align-items:center;justify-content:space-between;
    padding:16px 22px 12px;
    border-bottom:1px solid var(--gray1);
  }

  .bi-card-title {
    font-family:'Playfair Display',serif;
    font-size:15px;font-weight:600;
    color:var(--navy);letter-spacing:-.01em;
  }

  .bi-card-sub {
    font-family:'DM Mono',monospace;
    font-size:9px;color:var(--gray3);
    letter-spacing:.08em;text-transform:uppercase;
  }

  .bi-card-body { padding:20px 22px; }

  /* ── BAR CHART (pure CSS/SVG) ── */
  .bar-chart { display:flex; flex-direction:column; gap:10px; }

  .bar-row { display:flex; align-items:center; gap:10px; }

  .bar-label {
    font-family:'DM Mono',monospace;
    font-size:10px;color:var(--gray4);
    letter-spacing:.04em;
    width:56px;flex-shrink:0;
    text-align:right;
  }

  .bar-track {
    flex:1;height:22px;
    background:var(--gray1);
    border-radius:4px;
    overflow:hidden;
    position:relative;
  }

  .bar-fill {
    height:100%;border-radius:4px;
    transition:width .6s ease;
    display:flex;align-items:center;padding-left:8px;
  }

  .bar-val {
    font-family:'DM Mono',monospace;
    font-size:10px;color:white;font-weight:400;
    letter-spacing:.04em;white-space:nowrap;
  }

  /* ── LINE CHART (SVG) ── */
  .line-chart-wrap { position:relative; }

  .line-chart-labels {
    display:flex;justify-content:space-between;
    margin-top:8px;
  }

  .line-chart-label {
    font-family:'DM Mono',monospace;
    font-size:8.5px;color:var(--gray3);
    letter-spacing:.04em;text-align:center;
    flex:1;
  }

  /* ── DONUT (SVG) ── */
  .donut-wrap {
    display:flex;align-items:center;gap:24px;
  }

  .donut-legend { display:flex;flex-direction:column;gap:8px;flex:1; }

  .donut-legend-item {
    display:flex;align-items:center;gap:8px;
    font-size:12.5px;color:var(--gray4);
  }

  .donut-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }

  .donut-val {
    font-family:'DM Mono',monospace;
    font-size:10px;color:var(--gray3);
    margin-left:auto;
  }

  /* ── FUNNEL ── */
  .funnel-wrap { display:flex;flex-direction:column;gap:8px; }

  .funnel-step { display:flex;align-items:center;gap:12px; }

  .funnel-order {
    font-family:'DM Mono',monospace;
    font-size:9px;color:var(--gray3);
    width:20px;text-align:right;flex-shrink:0;
  }

  .funnel-bar-wrap { flex:1;position:relative; }

  .funnel-bg {
    height:28px;background:var(--gray1);
    border-radius:6px;overflow:hidden;position:relative;
  }

  .funnel-done {
    position:absolute;top:0;left:0;height:100%;
    border-radius:6px;
    transition:width .6s ease;
  }

  .funnel-blocked-strip {
    position:absolute;top:0;height:100%;
    background:rgba(220,38,38,.18);
    transition:all .6s ease;
  }

  .funnel-label {
    position:absolute;top:50%;left:10px;
    transform:translateY(-50%);
    font-size:11px;font-weight:500;
    color:var(--navy);white-space:nowrap;
    overflow:hidden;text-overflow:ellipsis;
    max-width:calc(100% - 80px);
  }

  .funnel-pct {
    font-family:'DM Mono',monospace;
    font-size:10px;color:var(--gray4);
    width:36px;text-align:right;flex-shrink:0;
  }

  /* ── USER TABLE ── */
  .user-table { width:100%;border-collapse:collapse; }

  .user-table th {
    font-family:'DM Mono',monospace;
    font-size:8.5px;letter-spacing:.10em;text-transform:uppercase;
    color:var(--gray3);padding:8px 12px;text-align:left;
    background:var(--gray1);border-bottom:1px solid var(--border);
  }

  .user-table td {
    padding:11px 12px;font-size:12.5px;
    color:var(--gray4);border-bottom:1px solid var(--gray1);
  }

  .user-table tr:last-child td { border-bottom:none; }
  .user-table tr:hover td { background:var(--cream); }

  .user-av-sm {
    width:26px;height:26px;border-radius:7px;
    background:linear-gradient(135deg,var(--navy),var(--navy-l));
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:700;color:white;flex-shrink:0;
  }

  /* Badges */
  .bi-badge {
    font-family:'DM Mono',monospace;
    font-size:9px;padding:2px 8px;border-radius:20px;letter-spacing:.06em;
  }

  .b-ok   { background:rgba(22,163,74,.10); color:#15803D; }
  .b-warn { background:rgba(217,119,6,.10);  color:var(--warn); }
  .b-err  { background:rgba(220,38,38,.08);  color:var(--err); }
  .b-info { background:rgba(37,99,235,.08);  color:var(--info); }

  /* Empty */
  .bi-empty {
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:40px;gap:8px;color:var(--gray3);
    font-size:13px;
  }

  @media(max-width:900px){
    .bi-kpi-row { grid-template-columns:repeat(2,1fr); }
    .bi-row     { grid-template-columns:1fr; }
    .bi-row-3   { grid-template-columns:1fr; }
  }
`;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const COLORS = {
  navy:  '#1B2D52',
  gold:  '#B8963E',
  green: '#16A34A',
  blue:  '#2563EB',
  red:   '#DC2626',
  amber: '#D97706',
  gray:  '#9B9589',
};

// Donut chart in SVG
const Donut = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="bi-empty"><p>No data yet</p></div>;

  const R = 52; const CX = 60; const CY = 60; const stroke = 18;
  let cumPct = 0;

  const slices = data.map(d => {
    const pct = d.value / total;
    const startAngle = cumPct * 2 * Math.PI - Math.PI / 2;
    cumPct += pct;
    const endAngle = cumPct * 2 * Math.PI - Math.PI / 2;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    const x2 = CX + R * Math.cos(endAngle);
    const y2 = CY + R * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, pct, path: `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` };
  });

  return (
    <div className="donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} opacity={0.88} />
        ))}
        <circle cx={CX} cy={CY} r={R - stroke} fill="white" />
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="18" fontWeight="700"
              fill="#1B2D52" fontFamily="Playfair Display,serif">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="8" fill="#9B9589"
              fontFamily="DM Mono,monospace" letterSpacing="1">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="donut-val">{s.value} ({Math.round(s.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Line chart in SVG
const LineChart = ({ data, color = '#B8963E' }: { data: TimeSeriesPoint[]; color?: string }) => {
  if (!data.length) return <div className="bi-empty"><p>No data yet</p></div>;
  const W = 400; const H = 90; const PAD = 8;
  const max = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1 || 1)) * (W - PAD * 2),
    y: H - PAD - (d.value / max) * (H - PAD * 2),
    ...d,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div className="line-chart-wrap">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`lg_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#lg_${color.replace('#','')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
      </svg>
      <div className="line-chart-labels">
        {data.map((d, i) => (
          <span key={i} className="line-chart-label">{d.label.split(' ')[0]}</span>
        ))}
      </div>
    </div>
  );
};

/* ── Main component ──────────────────────────────────────────────────────── */

interface BIAnalyticsProps {
  stats: GlobalStats;
}

export default function BIAnalytics({ stats }: BIAnalyticsProps) {
  const sd = stats.status_distribution;
  const totalSteps = sd.completed + sd.in_progress + sd.pending + sd.blocked;

  // Status donut data
  const statusData = [
    { label: 'Completed',   value: sd.completed,   color: COLORS.green },
    { label: 'In Progress', value: sd.in_progress, color: COLORS.blue  },
    { label: 'Pending',     value: sd.pending,     color: COLORS.gray  },
    { label: 'Blocked',     value: sd.blocked,     color: COLORS.red   },
  ].filter(d => d.value > 0);

  // Doc type donut data
  const docColors = [COLORS.navy, COLORS.gold, COLORS.blue, COLORS.amber];
  const docData = stats.document_type_stats.map((d, i) => ({
    label: d.label, value: d.count, color: docColors[i % docColors.length],
  }));

  // Max for bar chart scaling
  const maxProcType = Math.max(...stats.procedure_type_stats.map(p => p.total_started), 1);
  const maxFunnel   = Math.max(...stats.step_funnels.map(f => f.total), 1);

  return (
    <>
      <style>{STYLE}</style>
      <div className="bi">

        {/* ── KPI row ── */}
        <div className="bi-kpi-row">
          <div className="bi-kpi">
            <div className="bi-kpi-bar" style={{ background: `linear-gradient(90deg,${COLORS.navy},${COLORS.blue})` }} />
            <div className="bi-kpi-top">
              <div className="bi-kpi-icon" style={{ background: 'rgba(27,45,82,.08)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1B2D52" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="bi-kpi-delta delta-navy">{stats.active_users} active</span>
            </div>
            <div className="bi-kpi-val">{stats.total_users}</div>
            <div className="bi-kpi-lbl">Total users</div>
          </div>

          <div className="bi-kpi">
            <div className="bi-kpi-bar" style={{ background: `linear-gradient(90deg,${COLORS.gold},${COLORS.amber})` }} />
            <div className="bi-kpi-top">
              <div className="bi-kpi-icon" style={{ background: 'rgba(184,150,62,.10)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#B8963E" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="bi-kpi-delta delta-gold">{stats.completed_procedures} done</span>
            </div>
            <div className="bi-kpi-val">{stats.total_procedures}</div>
            <div className="bi-kpi-lbl">Procedures started</div>
          </div>

          <div className="bi-kpi">
            <div className="bi-kpi-bar" style={{ background: `linear-gradient(90deg,${COLORS.green},#34D399)` }} />
            <div className="bi-kpi-top">
              <div className="bi-kpi-icon" style={{ background: 'rgba(22,163,74,.10)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="bi-kpi-delta delta-up">{stats.completion_rate}%</span>
            </div>
            <div className="bi-kpi-val">{stats.completed_procedures}</div>
            <div className="bi-kpi-lbl">Procedures completed</div>
          </div>

          <div className="bi-kpi">
            <div className="bi-kpi-bar" style={{ background: `linear-gradient(90deg,${COLORS.blue},#60A5FA)` }} />
            <div className="bi-kpi-top">
              <div className="bi-kpi-icon" style={{ background: 'rgba(37,99,235,.08)' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2563EB" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              {stats.avg_days_to_complete && (
                <span className="bi-kpi-delta delta-navy">~{stats.avg_days_to_complete}d avg</span>
              )}
            </div>
            <div className="bi-kpi-val">{stats.total_documents_uploaded}</div>
            <div className="bi-kpi-lbl">Documents uploaded</div>
          </div>
        </div>

        {/* ── Time series ── */}
        <div className="bi-row">
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">User Signups</div>
                <div className="bi-card-sub">Last 6 months</div>
              </div>
            </div>
            <div className="bi-card-body">
              <LineChart data={stats.users_over_time} color={COLORS.navy} />
            </div>
          </div>

          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">Procedures Started</div>
                <div className="bi-card-sub">Last 6 months</div>
              </div>
            </div>
            <div className="bi-card-body">
              <LineChart data={stats.procedures_over_time} color={COLORS.gold} />
            </div>
          </div>
        </div>

        {/* ── Status donut + Doc types + Procedure bar ── */}
        <div className="bi-row-3">
          {/* Step status distribution */}
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">Step Status Distribution</div>
                <div className="bi-card-sub">{totalSteps} total steps</div>
              </div>
            </div>
            <div className="bi-card-body">
              {totalSteps === 0
                ? <div className="bi-empty"><p>No steps yet</p></div>
                : <Donut data={statusData} />
              }
            </div>
          </div>

          {/* Document types */}
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">Document Types</div>
                <div className="bi-card-sub">{stats.total_documents_uploaded} files</div>
              </div>
            </div>
            <div className="bi-card-body">
              {docData.length === 0
                ? <div className="bi-empty"><p>No documents yet</p></div>
                : <Donut data={docData} />
              }
            </div>
          </div>

          {/* Procedure type bar chart */}
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">By Procedure Type</div>
                <div className="bi-card-sub">Starts vs completions</div>
              </div>
            </div>
            <div className="bi-card-body">
              {stats.procedure_type_stats.length === 0
                ? <div className="bi-empty"><p>No data yet</p></div>
                : (
                  <div className="bar-chart">
                    {stats.procedure_type_stats.map((pt, i) => {
                      const startPct = (pt.total_started / maxProcType) * 100;
                      const donePct  = pt.total_started > 0
                        ? (pt.total_completed / pt.total_started) * 100 : 0;
                      return (
                        <div key={i}>
                          <div style={{ fontSize:11, fontWeight:500, color:'var(--navy)', marginBottom:4 }}>
                            {pt.name}
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Started</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width:`${startPct}%`, background: COLORS.navy }}>
                                <span className="bar-val">{pt.total_started}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">Done</span>
                            <div className="bar-track">
                              <div className="bar-fill" style={{ width:`${donePct}%`, background: COLORS.green }}>
                                <span className="bar-val">{pt.total_completed}</span>
                              </div>
                            </div>
                          </div>
                          {i < stats.procedure_type_stats.length - 1 && (
                            <div style={{ height:1, background:'var(--gray1)', margin:'10px 0' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>
        </div>

        {/* ── Step funnel ── */}
        <div className="bi-card">
          <div className="bi-card-head">
            <div>
              <div className="bi-card-title">Step Completion Funnel</div>
              <div className="bi-card-sub">Completion rate per step — all procedure types combined</div>
            </div>
            {stats.step_funnels.length > 0 && (
              <div style={{ display:'flex', gap:12 }}>
                {[
                  { label:'Completed', color: COLORS.green },
                  { label:'Blocked',   color: COLORS.red   },
                ].map((l, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--gray4)' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:l.color, opacity:.7 }} />
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bi-card-body">
            {stats.step_funnels.length === 0
              ? <div className="bi-empty"><p>No step data yet</p></div>
              : (
                <div className="funnel-wrap">
                  {stats.step_funnels.map((step, i) => {
                    const donePct    = maxFunnel > 0 ? (step.completed  / maxFunnel) * 100 : 0;
                    const blockedPct = maxFunnel > 0 ? (step.blocked    / maxFunnel) * 100 : 0;
                    const blockedLeft= maxFunnel > 0 ? (step.completed  / maxFunnel) * 100 : 0;
                    return (
                      <div key={i} className="funnel-step">
                        <span className="funnel-order">{String(step.step_order).padStart(2,'0')}</span>
                        <div className="funnel-bar-wrap">
                          <div className="funnel-bg">
                            <div className="funnel-done"
                              style={{ width:`${donePct}%`, background:`${COLORS.green}CC` }} />
                            {step.blocked > 0 && (
                              <div className="funnel-blocked-strip"
                                style={{ left:`${blockedLeft}%`, width:`${blockedPct}%` }} />
                            )}
                            <span className="funnel-label">{step.step_title}</span>
                          </div>
                        </div>
                        <span className="funnel-pct">{step.completion_rate}%</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* ── Most blocked + Top users ── */}
        <div className="bi-row">
          {/* Most blocked steps */}
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">Most Blocked Steps</div>
                <div className="bi-card-sub">Steps where users get stuck</div>
              </div>
            </div>
            <div className="bi-card-body" style={{ padding:0 }}>
              {stats.most_blocked_steps.length === 0
                ? <div className="bi-empty"><p>No blocked steps 🎉</p></div>
                : stats.most_blocked_steps.map((s, i) => {
                    const blockRate = s.total > 0 ? Math.round((s.blocked / s.total) * 100) : 0;
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 22px', borderBottom: i < stats.most_blocked_steps.length - 1 ? '1px solid var(--gray1)' : 'none' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12.5, fontWeight:500, color:'var(--navy)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.step_title}</div>
                          <div style={{ fontFamily:'DM Mono,monospace', fontSize:9, color:'var(--gray3)', letterSpacing:'.06em', textTransform:'uppercase' }}>{s.procedure_type}</div>
                        </div>
                        <div style={{ width:100, height:5, background:'var(--gray2)', borderRadius:5, overflow:'hidden', flexShrink:0 }}>
                          <div style={{ height:'100%', background: blockRate > 30 ? COLORS.red : COLORS.amber, width:`${blockRate}%`, borderRadius:5, transition:'width .5s ease' }} />
                        </div>
                        <span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color: blockRate > 30 ? COLORS.red : COLORS.amber, minWidth:28, textAlign:'right' }}>{s.blocked}</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Top users */}
          <div className="bi-card">
            <div className="bi-card-head">
              <div>
                <div className="bi-card-title">Most Active Users</div>
                <div className="bi-card-sub">By steps completed + docs uploaded</div>
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              {stats.top_users.length === 0
                ? <div className="bi-empty"><p>No activity yet</p></div>
                : (
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Procedures</th>
                        <th>Steps done</th>
                        <th>Docs</th>
                        <th>Last active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.top_users.map((u, i) => {
                        const compRate = u.procedure_count > 0
                          ? Math.round((u.completed_count / u.procedure_count) * 100) : 0;
                        return (
                          <tr key={i}>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div className="user-av-sm">{u.username.slice(0,2).toUpperCase()}</div>
                                <span style={{ color:'var(--navy)', fontWeight:500 }}>{u.username}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span>{u.procedure_count}</span>
                                {compRate > 0 && (
                                  <span className={`bi-badge ${compRate === 100 ? 'b-ok' : compRate > 50 ? 'b-info' : 'b-warn'}`}>
                                    {compRate}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'var(--navy)' }}>
                              {u.total_steps_done}
                            </td>
                            <td style={{ fontFamily:'DM Mono,monospace', fontSize:11 }}>
                              {u.total_docs_uploaded}
                            </td>
                            <td style={{ fontFamily:'DM Mono,monospace', fontSize:10, color:'var(--gray3)' }}>
                              {u.last_active
                                ? new Date(u.last_active).toLocaleDateString('en-US', { month:'short', day:'numeric' })
                                : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>
        </div>

      </div>
    </>
  );
}