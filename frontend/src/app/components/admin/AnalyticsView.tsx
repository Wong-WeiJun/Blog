import type { ReactNode } from "react";
import { useState } from "react";
import { TrendingUp, TrendingDown, MessageSquare, Eye, Clock, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  formatDateRange,
  formatPeriodDelta,
  getAdminStats,
  shortDateLabel,
  type Period,
} from "@/lib/admin-stats";
import type { AdminStatsResponse, DailyCount } from "@/client/types.gen";

interface StatItem {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: ReactNode;
  color: string;
  sub: string;
}

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

function CommentsLineChart({ data }: { data: DailyCount[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const W = 680, H = 220;
  const padL = 44, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  if (data.length === 0) {
    return (
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
        No comment activity in this period.
      </p>
    );
  }

  const counts = data.map((d) => d.count);
  const maxVal = Math.max(...counts, 1);
  const yMax = Math.max(Math.ceil(maxVal / 2) * 2, 2);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(yMax * t));

  const xOf = (i: number) => padL + (i / Math.max(data.length - 1, 1)) * innerW;
  const yOf = (v: number) => padT + innerH - (v / yMax) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xOf(i)},${yOf(d.count)}`).join(" ");
  const areaPath = `${linePath} L${xOf(data.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const hov = hoveredIdx !== null ? data[hoveredIdx] : null;
  const labelEvery = data.length > 14 ? Math.ceil(data.length / 7) : data.length > 7 ? 2 : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", gap: "16px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.6)" }}>
            <span style={{ width: "24px", height: "2px", borderRadius: "1px", background: "#5046e5", display: "inline-block" }} />
            Comments
          </span>
        </div>
        {hov && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
            {shortDateLabel(hov.date)} · <span style={{ color: "#a5b4fc" }}>{hov.count.toLocaleString()} comments</span>
          </div>
        )}
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible" }}>
          <defs>
            <linearGradient id="commentsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5046e5" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#5046e5" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yTicks.map(tick => {
            const y = yOf(tick);
            return (
              <g key={`y-${tick}`}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                <text x={padL - 6} y={y + 4} textAnchor="end" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fill: "rgba(255,255,255,0.3)" }}>{tick}</text>
              </g>
            );
          })}

          {data.map((d, i) => i % labelEvery === 0 && (
            <text key={`x-${i}`} x={xOf(i)} y={H - 4} textAnchor="middle" style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fill: "rgba(255,255,255,0.35)" }}>
              {shortDateLabel(d.date).replace(/, \d{4}$/, "")}
            </text>
          ))}

          <path d={areaPath} fill="url(#commentsGrad)" />
          <path d={linePath} fill="none" stroke="#5046e5" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {data.map((d, i) => {
            const x = xOf(i);
            const yV = yOf(d.count);
            const isHov = hoveredIdx === i;
            return (
              <g key={`pt-${i}`}>
                <rect
                  x={x - (innerW / data.length) / 2}
                  y={padT}
                  width={innerW / data.length}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: "crosshair" }}
                />
                {isHov && <line x1={x} y1={padT} x2={x} y2={padT + innerH} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3 3" />}
                {isHov && <circle cx={x} cy={yV} r={4} fill="#5046e5" stroke="#fff" strokeWidth={1.5} />}
              </g>
            );
          })}
        </svg>

        {hov !== null && hoveredIdx !== null && (
          <div style={{ position: "absolute", top: "0", left: `${(xOf(hoveredIdx) / W) * 100}%`, transform: "translateX(-50%)", background: "#0f1124", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "9px", padding: "10px 14px", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", margin: "0 0 5px" }}>{shortDateLabel(hov.date)}</p>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 700, color: "#a5b4fc", margin: 0 }}>{hov.count.toLocaleString()} comments</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostsBreakdownPanel({ stats }: { stats: AdminStatsResponse }) {
  const items = [
    { label: "Published", count: stats.published_posts, color: "#4ade80" },
    { label: "Drafts", count: stats.draft_posts, color: "#f59e0b" },
    { label: "Featured", count: stats.featured_posts, color: "#a5b4fc" },
  ];
  const total = stats.total_posts || 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 3px" }}>Posts Breakdown</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{stats.total_posts.toLocaleString()} total posts</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map(item => {
          const share = Math.round((item.count / total) * 100);
          return (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{item.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.45)" }}>{item.count.toLocaleString()}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: item.color, minWidth: "28px", textAlign: "right" }}>{share}%</span>
                </div>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${share}%`, background: item.color, borderRadius: "999px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopPostsPanel({ topPosts }: { topPosts: AdminStatsResponse["top_posts"] }) {
  const max = Math.max(...topPosts.map(p => p.view_count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", margin: "0 0 3px" }}>Top Performing Posts</h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>By all-time page views</p>
      </div>

      {topPosts.length === 0 ? (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>No published posts yet.</p>
      ) : (
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
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>{p.view_count.toLocaleString()} views</span>
                </div>
                <button style={{ color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#a5b4fc")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  <ArrowUpRight size={13} />
                </button>
              </div>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", marginLeft: "24px" }}>
                <div style={{ height: "100%", width: `${(p.view_count / max) * 100}%`, background: i === 0 ? "#5046e5" : "rgba(80,70,229,0.4)", borderRadius: "999px", transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PERIODS: Period[] = ["7d", "30d", "90d", "12mo"];

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  "90d": "last 90 days",
  "12mo": "last 12 months",
};

export function AnalyticsView() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats", period],
    queryFn: () => getAdminStats(period),
  });

  const commentDelta = data
    ? formatPeriodDelta(data.comments_in_period, data.comments_prev_period, "vs prior period")
    : { delta: "", up: true };

  const totalViews = data?.total_views ?? 0;
  const periodLabel = PERIOD_LABELS[period];

  const STATS: StatItem[] = [
    {
      label: "Total Views",
      value: isLoading ? "…" : totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : String(totalViews),
      delta: "cumulative",
      up: true,
      icon: <Eye size={16} />,
      color: "#5046e5",
      sub: "all time",
    },
    {
      label: "Comments",
      value: isLoading ? "…" : String(data?.comments_in_period ?? 0),
      delta: isLoading ? "" : commentDelta.delta,
      up: commentDelta.up,
      icon: <MessageSquare size={16} />,
      color: "#06b6d4",
      sub: periodLabel,
    },
    {
      label: "Avg Read Time",
      value: isLoading ? "…" : `${data?.avg_read_time_minutes ?? 0}m`,
      delta: "estimated",
      up: true,
      icon: <Clock size={16} />,
      color: "#f59e0b",
      sub: "across all posts",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 600, color: period === p ? "#a5b4fc" : "rgba(255,255,255,0.4)", background: period === p ? "rgba(80,70,229,0.18)" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
        {STATS.map(s => <StatCard key={s.label} s={s} />)}
      </div>

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px 22px 16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 2px" }}>Comments Over Time</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            {isLoading ? "Loading…" : `${formatDateRange(data?.comments_by_day ?? [])} · hover to inspect`}
          </p>
        </div>
        {isLoading ? (
          <div style={{ height: "220px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
        ) : (
          <CommentsLineChart data={data?.comments_by_day ?? []} />
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px" }}>
          {isLoading || !data ? (
            <div style={{ height: "120px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
          ) : (
            <PostsBreakdownPanel stats={data} />
          )}
        </div>
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "22px" }}>
          {isLoading ? (
            <div style={{ height: "120px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
          ) : (
            <TopPostsPanel topPosts={data?.top_posts ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
