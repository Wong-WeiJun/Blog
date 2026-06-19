import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Users, Eye, Clock, ArrowUpRight } from "lucide-react";
import { mockPosts } from "../../../data/posts";

interface StatItem {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: ReactNode;
  color: string;
  sub: string;
}

/* ── data ── */

const DAILY_VIEWS = [
  { label: "Jun 1",  views: 340,  visitors: 210 },
  { label: "Jun 2",  views: 520,  visitors: 310 },
  { label: "Jun 3",  views: 390,  visitors: 240 },
  { label: "Jun 4",  views: 610,  visitors: 380 },
  { label: "Jun 5",  views: 480,  visitors: 295 },
  { label: "Jun 6",  views: 720,  visitors: 440 },
  { label: "Jun 7",  views: 890,  visitors: 530 },
  { label: "Jun 8",  views: 1050, visitors: 640 },
  { label: "Jun 9",  views: 780,  visitors: 470 },
  { label: "Jun 10", views: 920,  visitors: 560 },
  { label: "Jun 11", views: 1240, visitors: 740 },
  { label: "Jun 12", views: 1100, visitors: 670 },
];

const REFERRERS = [
  { source: "Google Search",   visits: 4820, share: 52, color: "#4ade80",  icon: "G" },
  { source: "Twitter / X",     visits: 1940, share: 21, color: "#60a5fa",  icon: "𝕏" },
  { source: "Hacker News",     visits: 1280, share: 14, color: "#f97316",  icon: "Y" },
  { source: "Direct",          visits: 640,  share:  7, color: "#a5b4fc",  icon: "→" },
  { source: "GitHub",          visits: 460,  share:  5, color: "#94a3b8",  icon: "⌥" },
  { source: "Other",           visits: 85,   share:  1, color: "#475569",  icon: "•" },
];

/* ── stat cards ── */

function StatCard({ s }: { s: StatItem }) {
  return (
    <div style={{ flex: 1, minWidth: "180px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px", transition: "border-color 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
          {s.icon}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.75rem", color: "#fff", margin: "0 0 5px", lineHeight: 1 }}>{s.value}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: s.up ? "#4ade80" : "#f87171" }}>
            {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{s.delta}
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>{s.sub}</span>
        </div>
      </div>
    </div>
  );
}

/* ── line chart ── */

function LineChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showVisitors, setShowVisitors] = useState(true);

  const W = 680, H = 220;
  const padL = 44, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = Math.max(...DAILY_VIEWS.map(d => d.views));
  const yMax   = Math.ceil(maxVal / 200) * 200;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(yMax * t));

  const xOf = (i: number) => padL + (i / (DAILY_VIEWS.length - 1)) * innerW;
  const yOf = (v: number) => padT + innerH - (v / yMax) * innerH;

  const viewsPath = DAILY_VIEWS.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.views)}`).join(" ");
  const visPath   = DAILY_VIEWS.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.visitors)}`).join(" ");

  // Filled area under views line
  const areaPath  = `${viewsPath} L${xOf(DAILY_VIEWS.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const hov = hoveredIdx !== null ? DAILY_VIEWS[hoveredIdx] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "Page Views", color: "#5046e5", solid: true },
            { label: "Unique Visitors", color: "#06b6d4", solid: false },
          ].map(({ label, color }) => (
            <button
              key={label}
              onClick={() => label === "Unique Visitors" && setShowVisitors(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: (label === "Unique Visitors" && !showVisitors) ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: label === "Unique Visitors" ? "pointer" : "default", padding: 0, transition: "color 0.15s" }}
            >
              <span style={{ width: "24px", height: "2px", borderRadius: "1px", background: color, display: "inline-block", opacity: (label === "Unique Visitors" && !showVisitors) ? 0.3 : 1 }} />
              {label}
            </button>
          ))}
        </div>
        {hov && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
            {hov.label} · <span style={{ color: "#a5b4fc" }}>{hov.views.toLocaleString()} views</span>
            {showVisitors && <span style={{ color: "#67e8f9" }}> · {hov.visitors.toLocaleString()} visitors</span>}
          </div>
        )}
      </div>

      {/* SVG */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5046e5" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#5046e5" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map(tick => {
            const y = yOf(tick);
            const label = tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : String(tick);
            return (
              <g key={`y-${tick}`}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={padL - 6} y={y + 4} textAnchor="end" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fill: "rgba(255,255,255,0.3)" }}>{label}</text>
              </g>
            );
          })}

          {/* X labels (every other) */}
          {DAILY_VIEWS.map((d, i) => i % 2 === 0 && (
            <text key={`x-${i}`} x={xOf(i)} y={H - 4} textAnchor="middle" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fill: "rgba(255,255,255,0.35)" }}>
              {d.label.replace("Jun ", "")}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#viewsGrad)" />

          {/* Views line */}
          <path d={viewsPath} fill="none" stroke="#5046e5" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Visitors line */}
          {showVisitors && (
            <path d={visPath} fill="none" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Hover hit areas + dots */}
          {DAILY_VIEWS.map((d, i) => {
            const x = xOf(i);
            const yV = yOf(d.views);
            const isHov = hoveredIdx === i;
            return (
              <g key={`pt-${i}`}>
                {/* Wide hit zone */}
                <rect
                  x={x - (innerW / DAILY_VIEWS.length) / 2}
                  y={padT}
                  width={innerW / DAILY_VIEWS.length}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: "crosshair" }}
                />
                {/* Vertical rule */}
                {isHov && <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3 3" />}
                {/* Views dot */}
                {isHov && <circle cx={x} cy={yV} r={4} fill="#5046e5" stroke="#fff" strokeWidth={1.5} />}
                {/* Visitors dot */}
                {isHov && showVisitors && <circle cx={x} cy={yOf(d.visitors)} r={3.5} fill="#06b6d4" stroke="#fff" strokeWidth={1.5} />}
              </g>
            );
          })}
        </svg>

        {/* HTML tooltip */}
        {hov !== null && hoveredIdx !== null && (
          <div style={{ position: "absolute", top: "0", left: `${(xOf(hoveredIdx) / W) * 100}%`, transform: "translateX(-50%)", background: "#0f1124", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "9px", padding: "10px 14px", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", margin: "0 0 5px" }}>{hov.label}</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 700, color: "#a5b4fc", margin: "0 0 3px" }}>{hov.views.toLocaleString()} views</p>
            {showVisitors && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#67e8f9", margin: 0 }}>{hov.visitors.toLocaleString()} visitors</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── top referrers ── */

function ReferrersPanel() {
  const total = REFERRERS.reduce((a, r) => a + r.visits, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 3px" }}>Top Referrers</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{total.toLocaleString()} total referral visits</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {REFERRERS.map(r => (
          <div key={r.source} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "6px", background: `${r.color}20`, border: `1px solid ${r.color}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 800, color: r.color }}>
                  {r.icon}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.source}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>{r.visits.toLocaleString()}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: r.color, minWidth: "28px", textAlign: "right" }}>{r.share}%</span>
              </div>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${r.share}%`, background: r.color, borderRadius: "999px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── top posts panel ── */

function TopPostsPanel() {
  const topPosts = useMemo(() => {
    return [...mockPosts]
      .filter(p => p.status === "published")
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((p, i) => ({ ...p, delta: [18, 5, -3, 11, 2][i] ?? 0 }));
  }, []);
  const max = Math.max(...topPosts.map(p => p.views), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 3px" }}>Top Performing Posts</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>By total page views, last 30 days</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {topPosts.map((p, i) => (
          <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", fontWeight: 700, color: i === 0 ? "#a5b4fc" : "rgba(80,70,229,0.6)", flexShrink: 0, paddingTop: "1px", minWidth: "16px" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: "0 0 2px", lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>{p.views.toLocaleString()} views</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "2px", fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, color: p.delta >= 0 ? "#4ade80" : "#f87171" }}>
                    {p.delta >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                    {p.delta >= 0 ? "+" : ""}{p.delta}%
                  </span>
                </div>
              </div>
              <button style={{ color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a5b4fc")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                <ArrowUpRight size={13} />
              </button>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", marginLeft: "24px" }}>
              <div style={{ height: "100%", width: `${(p.views / max) * 100}%`, background: i === 0 ? "#5046e5" : "rgba(80,70,229,0.4)", borderRadius: "999px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── period selector ── */

const PERIODS = ["7d", "30d", "90d", "12mo"] as const;
type Period = typeof PERIODS[number];

/* ── root ── */

export function AnalyticsView() {
  const [period, setPeriod] = useState<Period>("30d");

  const totalViews = useMemo(() =>
    mockPosts.filter(p => p.status === "published").reduce((s, p) => s + p.views, 0),
    []
  );

  const STATS = [
    { label: "Total Views",     value: totalViews >= 1000 ? `${Math.floor(totalViews / 1000)},${(totalViews % 1000).toString().padStart(3, "0")}` : String(totalViews), delta: "+12.4%", up: true,  icon: <Eye size={16} />,   color: "#5046e5", sub: "last 30 days" },
    { label: "Unique Visitors", value: "11,082", delta: "+8.9%",  up: true,  icon: <Users size={16} />, color: "#06b6d4", sub: "last 30 days" },
    { label: "Avg Read Time",   value: "5m 48s", delta: "-0.3m",  up: false, icon: <Clock size={16} />, color: "#f59e0b", sub: "across all posts" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Period selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 600, color: period === p ? "#a5b4fc" : "rgba(255,255,255,0.4)", background: period === p ? "rgba(80,70,229,0.18)" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {STATS.map(s => <StatCard key={s.label} s={s} />)}
      </div>

      {/* Line chart */}
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px 22px 16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 2px" }}>Page Views Over Time</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>Jun 1 – Jun 12, 2026 · hover to inspect</p>
        </div>
        <LineChart />
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px" }}>
          <ReferrersPanel />
        </div>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px" }}>
          <TopPostsPanel />
        </div>
      </div>

      {/* Footer note */}
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Analytics data is illustrative · real integration via Plausible or PostHog
      </p>
    </div>
  );
}
