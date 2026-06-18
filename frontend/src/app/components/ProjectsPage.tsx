import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft, Github, ExternalLink, Clock, CheckCircle2, Archive,
  Star, GitFork, Filter
} from "lucide-react";

/* ── status pill ── */
type Status = "Completed" | "In Progress" | "Archived";

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  "Completed":  { color: "#4ade80", bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.28)",  icon: <CheckCircle2 size={11} /> },
  "In Progress":{ color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)",  icon: <Clock size={11} /> },
  "Archived":   { color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.22)", icon: <Archive size={11} /> },
};

function StatusPill({ status }: { status: Status }) {
  const c = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: "999px", padding: "3px 10px" }}>
      {c.icon}{status}
    </span>
  );
}

/* ── tech pill ── */
const TECH_COLORS: Record<string, string> = {
  "Terraform": "#8b5cf6", "AWS": "#f97316", "Python": "#ec4899",
  "FastAPI": "#06b6d4", "Docker": "#06b6d4", "Kubernetes": "#5046e5",
  "PostgreSQL": "#3b82f6", "Redis": "#ef4444", "Go": "#06b6d4",
  "GitHub Actions": "#22c55e", "Prometheus": "#f97316", "Grafana": "#f59e0b",
  "Helm": "#5046e5", "k3s": "#22c55e", "React": "#60a5fa",
  "TypeScript": "#3b82f6", "Bash": "#94a3b8", "Loki": "#8b5cf6",
};

function TechPill({ tech }: { tech: string }) {
  const color = TECH_COLORS[tech] ?? "#6b7280";
  return (
    <span style={{ display: "inline-flex", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: 500, color, background: `${color}14`, border: `1px solid ${color}2e`, borderRadius: "5px", padding: "2px 8px", whiteSpace: "nowrap" }}>
      {tech}
    </span>
  );
}

/* ── project data ── */
interface Project {
  id: number;
  title: string;
  description: string;
  stack: string[];
  status: Status;
  stars: number;
  forks: number;
  github: string | null;
  live: string | null;
  accent: string;
  category: string;
}

/* Empty project list — neutralized placeholder */
const PROJECTS: Project[] = [];

const ALL_CATEGORIES = ["All"];
const ALL_STATUSES: Status[] = ["Completed", "In Progress", "Archived"];

/* ── project card ── */
function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? `${project.accent}45` : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.22s, transform 0.18s, box-shadow 0.22s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${project.accent}20` : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover placeholder */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden", background: `linear-gradient(135deg, ${project.accent}22 0%, #080a1a 100%)` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,10,26,0.7) 0%, transparent 55%)" }} />
        {/* Floating status + category badges */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 700, color: project.accent, background: `${project.accent}22`, border: `1px solid ${project.accent}40`, borderRadius: "5px", padding: "2px 8px", backdropFilter: "blur(6px)" }}>
            {project.category}
          </span>
        </div>
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <StatusPill status={project.status} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.1875rem", color: "#fff", margin: 0, letterSpacing: "-0.015em", lineHeight: 1.25 }}>
            {project.title}
          </h3>
          {/* Stars + forks */}
          <div style={{ display: "flex", gap: "10px", flexShrink: 0, marginTop: "2px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>
              <Star size={11} />{project.stars}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
              <GitFork size={11} />{project.forks}
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: 0, flex: 1 }}>
          {project.description}
        </p>

        {/* Tech stack */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {project.stack.map(t => <TechPill key={t} tech={t} />)}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {project.github ? (
            <a href={project.github} target="_blank" rel="noreferrer" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "9px 14px", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <Github size={14} />View Source
            </a>
          ) : (
            <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "9px 14px", pointerEvents: "none" }}>
              <Github size={14} />View Source
            </span>
          )}
          {project.live ? (
            <a href={project.live} target="_blank" rel="noreferrer" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: project.accent, background: `${project.accent}0d`, border: `1px solid ${project.accent}1a`, borderRadius: "8px", padding: "9px 14px", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = `${project.accent}30`; }}
              onMouseLeave={e => { e.currentTarget.style.color = project.accent; e.currentTarget.style.background = `${project.accent}0d`; }}
            >
              <ExternalLink size={14} />Live Demo
            </a>
          ) : (
            <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "9px 14px", pointerEvents: "none" }}>
              <ExternalLink size={14} />No Demo
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── filter bar (disabled when no projects) ── */
function FilterBar({
  activeCategory, activeStatus, onCategory, onStatus, disabled,
}: {
  activeCategory: string; activeStatus: string;
  onCategory: (c: string) => void; onStatus: (s: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", marginBottom: "32px", opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
        <Filter size={13} />Filter
      </span>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {ALL_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => onCategory(cat)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500, padding: "5px 12px", borderRadius: "999px", border: `1px solid ${activeCategory === cat ? "rgba(80,70,229,0.6)" : "rgba(255,255,255,0.1)"}`, background: activeCategory === cat ? "rgba(80,70,229,0.18)" : "transparent", color: activeCategory === cat ? "#a5b4fc" : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {["All", ...ALL_STATUSES].map(s => {
          const active = activeStatus === s;
          const cfg = s !== "All" ? STATUS_CONFIG[s as Status] : null;
          return (
            <button key={s} onClick={() => onStatus(s)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500, padding: "5px 12px", borderRadius: "999px", border: `1px solid ${active ? (cfg?.border ?? "rgba(80,70,229,0.6)") : "rgba(255,255,255,0.1)"}`, background: active ? (cfg?.bg ?? "rgba(80,70,229,0.18)") : "transparent", color: active ? (cfg?.color ?? "#a5b4fc") : "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
              {active && cfg && cfg.icon}
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── stats bar (zero state) ── */
function StatsBar() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", marginBottom: "32px" }}>
      {[
        { label: "Total projects",   value: "0",  color: "#a5b4fc" },
        { label: "Completed",        value: "0",  color: "#4ade80" },
        { label: "In progress",      value: "0",  color: "#fbbf24" },
        { label: "GitHub stars",     value: "0",  color: "#f97316" },
      ].map(({ label, value, color }, i, arr) => (
        <div key={label} style={{ flex: "1 1 120px", padding: "16px 20px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color, margin: "0 0 3px", lineHeight: 1 }}>{value}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", margin: 0 }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── root ── */
export function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus,   setActiveStatus]   = useState("All");

  const filtered = PROJECTS.filter(p => {
    const catOk = activeCategory === "All" || p.category === activeCategory;
    const stOk  = activeStatus   === "All" || p.status   === activeStatus;
    return catOk && stOk;
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.92)", backdropFilter: "blur(12px)", height: "52px", display: "flex", alignItems: "center", padding: "0 32px", gap: "16px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Blog
        </Link>
        <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>Projects</span>
      </div>

      {/* Container */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 32px 96px" }}>

        {/* ── Hero ── */}
        <header style={{ marginBottom: "56px" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#5046e5", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 14px" }}>
            Open-source work
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Things I&apos;ve built<br />and shipped.
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.55)", margin: "0 0 16px", maxWidth: "640px" }}>
            A collection of tools, libraries, and experiments. Each project starts as a gap I kept running into at work or in my homelab, gets documented on the blog, and ends up here when it&apos;s useful enough to share.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.45)", margin: 0, maxWidth: "580px" }}>
            Focus on correctness over cleverness — small surface area, good error messages, and zero magic.
          </p>
        </header>

        {/* ── Stats ── */}
        <StatsBar />

        {/* ── Filters ── */}
        <FilterBar
          activeCategory={activeCategory}
          activeStatus={activeStatus}
          onCategory={setActiveCategory}
          onStatus={setActiveStatus}
          disabled={PROJECTS.length === 0}
        />

        {/* ── Empty state ── */}
        <div style={{ textAlign: "center", padding: "64px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "14px" }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: "0 0 12px" }}>
            No projects published yet.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "rgba(255,255,255,0.3)", margin: 0, maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
            Projects will appear here once they&apos;re documented on the blog and the code is ready to share. Check back soon!
          </p>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ marginTop: "64px", padding: "40px", background: "rgba(80,70,229,0.06)", border: "1px solid rgba(80,70,229,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: "0 0 6px" }}>Have an idea or want to collaborate?</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>Always open to pairing on interesting infrastructure problems.</p>
          </div>
          <Link to="/contact"
            style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "9px", padding: "11px 22px", cursor: "pointer", transition: "background 0.15s", textDecoration: "none", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#4338ca")}
            onMouseLeave={e => (e.currentTarget.style.background = "#5046e5")}
          >
            Get in touch →
          </Link>
        </div>
      </div>
    </div>
  );
}
