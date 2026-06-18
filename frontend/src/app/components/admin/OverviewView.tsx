import { useState, useMemo } from "react";
import { FileText, Eye, MessageSquare, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { mockPosts, INITIAL_COMMENTS } from "../../../data/posts";

function StatCard({ card }: { card: typeof STAT_CARDS[0] }) {
  return (
    <div
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px", flex: 1, minWidth: "160px", transition: "border-color 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>
          {card.label}
        </span>
        <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `${card.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
          {card.icon}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.875rem", color: "#fff", margin: "0 0 4px", lineHeight: 1 }}>
          {card.value}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: card.up ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: "3px", margin: 0 }}>
          {card.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {card.delta}
        </p>
      </div>
    </div>
  );
}

const WEEKLY_DATA = [
  { day: "Mon", views: 420 },
  { day: "Tue", views: 680 },
  { day: "Wed", views: 530 },
  { day: "Thu", views: 910 },
  { day: "Fri", views: 1240 },
  { day: "Sat", views: 780 },
  { day: "Sun", views: 620 },
];

/** Pure SVG/div bar chart — no recharts, no key collisions. */
function WeeklyBarChart() {
  const [tooltip, setTooltip] = useState<{ day: string; views: number; x: number; y: number } | null>(null);
  const maxViews = Math.max(...WEEKLY_DATA.map((d) => d.views));
  const total = WEEKLY_DATA.reduce((s, d) => s + d.views, 0);

  const chartH = 160;
  const barW = 28;
  const gap = 16;
  const paddingLeft = 44;
  const paddingBottom = 28;
  const innerH = chartH - paddingBottom;

  // Y-axis ticks at rounded intervals
  const yMax = Math.ceil(maxViews / 200) * 200;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map(Math.round);

  const totalW = paddingLeft + WEEKLY_DATA.length * (barW + gap) - gap + 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 2px" }}>Weekly Views</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>Jun 6 – Jun 12, 2026</p>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.375rem", color: "#a5b4fc" }}>
          {total.toLocaleString()}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>total</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          width="100%"
          viewBox={`0 0 ${totalW} ${chartH}`}
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((tick) => {
            const y = innerH - (tick / yMax) * innerH;
            const label = tick >= 1000 ? `${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}k` : String(tick);
            return (
              <g key={`ytick-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={totalW}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fill: "rgba(255,255,255,0.3)" }}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {WEEKLY_DATA.map((d, i) => {
            const barH = (d.views / yMax) * innerH;
            const x = paddingLeft + i * (barW + gap);
            const y = innerH - barH;
            const isMax = d.views === maxViews;
            const fill = isMax ? "#5046e5" : "rgba(80,70,229,0.32)";
            const r = 5;

            return (
              <g key={`bar-${d.day}`}>
                {/* Hover hit area */}
                <rect
                  x={x - 4}
                  y={0}
                  width={barW + 8}
                  height={innerH}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setTooltip({ day: d.day, views: d.views, x: x + barW / 2, y })}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Bar with rounded top */}
                <path
                  d={`M${x + r},${y} h${barW - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${barH - r} h-${barW} v-${barH - r} a${r},${r} 0 0 1 ${r},-${r}z`}
                  fill={fill}
                  style={{ transition: "fill 0.15s" }}
                  onMouseEnter={(e) => { (e.currentTarget as SVGPathElement).setAttribute("fill", isMax ? "#6366f1" : "rgba(80,70,229,0.55)"); setTooltip({ day: d.day, views: d.views, x: x + barW / 2, y }); }}
                  onMouseLeave={(e) => { (e.currentTarget as SVGPathElement).setAttribute("fill", fill); setTooltip(null); }}
                />
                {/* X-axis label */}
                <text
                  x={x + barW / 2}
                  y={innerH + 18}
                  textAnchor="middle"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fill: isMax ? "rgba(165,180,252,0.9)" : "rgba(255,255,255,0.4)" }}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip rendered as an HTML overlay */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: `${(tooltip.x / totalW) * 100}%`,
              top: `${(tooltip.y / chartH) * 100}%`,
              transform: "translate(-50%, -110%)",
              background: "#13152e",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 12px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", margin: "0 0 3px" }}>{tooltip.day}</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 700, color: "#a5b4fc", margin: 0 }}>
              {tooltip.views.toLocaleString()} views
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OverviewView() {
  const statData = useMemo(() => {
    const published = mockPosts.filter((p) => p.status === "published");
    const totalViews = published.reduce((s, p) => s + p.views, 0);
    const topPosts = [...published]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    const maxViews = topPosts[0]?.views ?? 1;

    return {
      totalPosts: published.length,
      totalViews,
      commentCount: INITIAL_COMMENTS.length,
      topPosts,
      maxViews,
    };
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Posts",
      value: String(statData.totalPosts),
      delta: "+3 this month",
      up: true,
      icon: <FileText size={18} />,
      color: "#5046e5",
    },
    {
      label: "Total Views",
      value: statData.totalViews >= 1000
        ? `${(statData.totalViews / 1000).toFixed(1)}k`
        : String(statData.totalViews),
      delta: "+12% vs last week",
      up: true,
      icon: <Eye size={18} />,
      color: "#06b6d4",
    },
    {
      label: "Comments",
      value: String(statData.commentCount),
      delta: "+7 this week",
      up: true,
      icon: <MessageSquare size={18} />,
      color: "#22c55e",
    },
    {
      label: "Avg Read Time",
      value: "6.2m",
      delta: "-0.3m vs avg",
      up: false,
      icon: <Clock size={18} />,
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} card={card} />
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Bar chart */}
        <div style={{ flex: "1 1 380px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px 24px" }}>
          <WeeklyBarChart />
        </div>

        {/* Top posts */}
        <div style={{ flex: "1 1 300px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 2px" }}>Top Posts</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>By all-time views</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {statData.topPosts.map((post, i) => (
              <div key={`post-${post.id}`} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 600, color: "rgba(80,70,229,0.7)", flexShrink: 0, paddingTop: "1px", minWidth: "16px" }}>
                      {i + 1}
                    </span>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {post.title}
                    </p>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
                    {post.views.toLocaleString()}
                  </span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden", marginLeft: "24px" }}>
                  <div style={{ height: "100%", width: `${(post.views / statData.maxViews) * 100}%`, background: i === 0 ? "#5046e5" : "rgba(80,70,229,0.45)", borderRadius: "999px", transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
