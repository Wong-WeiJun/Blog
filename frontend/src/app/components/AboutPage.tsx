import { Link } from "react-router";
import type { ReactNode } from "react";
import {
  Download, Github, Linkedin, ArrowLeft,
  Cloud, Server, GitBranch, Terminal, Database, Layers,
  Coffee, BookOpen, Music, Gamepad2, Plane, Camera,
  MapPin, Calendar, ChevronRight,
} from "lucide-react";
import { BRAND_NAME, BRAND_EMAIL } from "../../lib/constants";

/* ─── section wrapper ─── */

function Section({ id, children, alt }: { id?: string; children: ReactNode; alt?: boolean }) {
  return (
    <section
      id={id}
      style={{
        padding: "80px 0",
        background: alt ? "rgba(255,255,255,0.015)" : "transparent",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
        {children}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#5046e5", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#fff", letterSpacing: "-0.02em", margin: "0 0 40px", lineHeight: 1.2 }}>
      {children}
    </h2>
  );
}

/* ─── 1. Hero ─── */

function Hero() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 32px 60px", display: "flex", gap: "56px", alignItems: "center", flexWrap: "wrap" }}>
      {/* Photo */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: "clamp(180px, 22vw, 260px)", aspectRatio: "1/1", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(80,70,229,0.35) 0%, rgba(80,70,229,0.08) 100%)",
          border: "1px solid rgba(80,70,229,0.35)", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(80,70,229,0.3) 0%, transparent 70%)" }} />
          {/* Avatar placeholder */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(80,70,229,0.4)", border: "2px solid rgba(80,70,229,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "2.25rem", fontWeight: 700, color: "#a5b4fc" }}>{BRAND_NAME[0]}</span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>./profile.jpg</p>
          </div>
        </div>
        {/* Status dot */}
        <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "999px", padding: "4px 10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, color: "#4ade80" }}>Open to work</span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#a5b4fc", margin: "0 0 8px", letterSpacing: "0.04em" }}>
            Hello, I&apos;m —
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.25rem)", color: "#fff", margin: 0, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
            {BRAND_NAME}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", fontWeight: 500, color: "#a5b4fc", margin: "8px 0 0" }}>
            Cloud Engineer in Progress · SRE Aspirant
          </p>
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: "520px" }}>
          A developer blog chronicling cloud infrastructure, DevOps practices, and the hard-won lessons learned along the way.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
          <span
            title="Coming soon"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", background: "rgba(80,70,229,0.1)", border: "1px solid rgba(80,70,229,0.15)", borderRadius: "10px", padding: "11px 22px", pointerEvents: "none" }}
          >
            <Download size={16} /> Download R Sum
          </span>
          {[
            { icon: <Github size={18} />, label: "GitHub" },
            { icon: <Linkedin size={18} />, label: "LinkedIn" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              title={`${label} — Coming soon`}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}
            >
              {icon}
            </span>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: "28px", flexWrap: "wrap", marginTop: "8px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { value: "—", label: "Posts published" },
            { value: "—", label: "Monthly readers" },
            { value: "—", label: "Years tinkering" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#a5b4fc", margin: "0 0 2px", lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. About ─── */

function About() {
  return (
    <Section id="about">
      <SectionLabel>About</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {[
            "Hi there! This blog is a personal sandbox for documenting cloud infrastructure, DevOps practices, and software engineering patterns. Every post here started as a real problem faced in a project or a gap in documentation I wished existed.",
            "The focus is on practical, production-ready approaches — not just theory. From Terraform modules and CI/CD pipelines to container orchestration and monitoring, the goal is to share what actually works.",
            "New posts go up whenever there's something worth documenting. Subscribe via RSS or check back periodically for updates.",
          ].map((para, i) => (
            <p key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.62)", margin: 0 }}>
              {para}
            </p>
          ))}
        </div>

        {/* Pull quote */}
        <div>
          <blockquote style={{ margin: 0, padding: "28px 32px", background: "rgba(80,70,229,0.08)", border: "none", borderLeft: "3px solid #5046e5", borderRadius: "0 12px 12px 0" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(1.1rem, 2vw, 1.375rem)", lineHeight: 1.55, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              &quot;The best infrastructure is the kind you forget is there  until the day it quietly saves you at 2 AM.&quot;
            </p>
            <footer style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "rgba(165,180,252,0.6)" }}>
              — {BRAND_NAME}, engineer-in-progress
            </footer>
          </blockquote>

          {/* Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: "#a5b4fc" }}><MapPin size={14} /></span>
              Planet Earth
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: "#a5b4fc" }}><Calendar size={14} /></span>
              Always learning
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 3. Skills ─── */

const SKILL_GROUPS = [
  {
    category: "Cloud",
    icon: <Cloud size={16} />,
    color: "#f97316",
    skills: [
      { name: "AWS", level: 85 },
      { name: "GCP", level: 55 },
      { name: "Terraform", level: 80 },
      { name: "Pulumi", level: 40 },
      { name: "CloudFormation", level: 65 },
    ],
  },
  {
    category: "Backend",
    icon: <Server size={16} />,
    color: "#06b6d4",
    skills: [
      { name: "Python", level: 88 },
      { name: "FastAPI", level: 80 },
      { name: "PostgreSQL", level: 72 },
      { name: "Redis", level: 65 },
      { name: "Go", level: 45 },
    ],
  },
  {
    category: "DevOps",
    icon: <GitBranch size={16} />,
    color: "#22c55e",
    skills: [
      { name: "Docker", level: 90 },
      { name: "Kubernetes", level: 70 },
      { name: "GitHub Actions", level: 85 },
      { name: "Prometheus", level: 68 },
      { name: "Grafana", level: 60 },
    ],
  },
];

function SkillGroup({ group }: { group: typeof SKILL_GROUPS[0] }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${group.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: group.color }}>
          {group.icon}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 700, color: "#fff" }}>{group.category}</span>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {group.skills.map((skill) => (
          <div key={skill.name} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{skill.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>{skill.level}%</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${skill.level}%`, background: `linear-gradient(90deg, ${group.color}99, ${group.color})`, borderRadius: "999px", transition: "width 0.8s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skills() {
  return (
    <Section id="skills" alt>
      <SectionLabel>Skills</SectionLabel>
      <SectionHeading>What I work with</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {SKILL_GROUPS.map((g) => <SkillGroup key={g.category} group={g} />)}
      </div>
    </Section>
  );
}

/* ─── 4. Certifications ─── */

const CERTS = [
  { name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", date: "Mar 2026", badge: "SAA-C03", color: "#f97316", abbr: "SAA" },
  { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "Sep 2025", badge: "CLF-C02", color: "#fbbf24", abbr: "CCP" },
  { name: "Terraform Associate", issuer: "HashiCorp", date: "Jan 2026", badge: "003", color: "#8b5cf6", abbr: "TF" },
  { name: "CKAD", issuer: "CNCF / Linux Foundation", date: "Apr 2026", badge: "CKAD", color: "#06b6d4", abbr: "K8s" },
];

function Certifications() {
  return (
    <Section id="certifications">
      <SectionLabel>Certifications</SectionLabel>
      <SectionHeading>Credentials</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        {CERTS.map((cert) => (
          <div
            key={cert.name}
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", transition: "border-color 0.2s, transform 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${cert.color}50`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}
          >
            {/* Badge */}
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${cert.color}18`, border: `2px solid ${cert.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: cert.color }}>{cert.abbr}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{cert.name}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.775rem", color: "rgba(255,255,255,0.45)" }}>{cert.issuer}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>{cert.date}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", fontWeight: 700, color: cert.color, background: `${cert.color}15`, border: `1px solid ${cert.color}30`, borderRadius: "5px", padding: "2px 7px" }}>
                {cert.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 5. Education ─── */

const EDUCATION = [
  {
    institution: "Your University",
    degree: "B.S. (Hons) Computer Science",
    minor: "Minor in Statistics",
    start: "Aug 2022", end: "May 2026",
    current: true,
    gpa: "—",
    highlights: ["Add your achievements here"],
  },
  {
    institution: "Your Previous School",
    degree: "Diploma / A-Levels / etc.",
    minor: "",
    start: "Apr 2019", end: "Mar 2022",
    current: false,
    gpa: "—",
    highlights: ["Add your highlights here"],
  },
];

function Education() {
  return (
    <Section id="education" alt>
      <SectionLabel>Education</SectionLabel>
      <SectionHeading>Academic background</SectionHeading>
      <div style={{ position: "relative", paddingLeft: "28px" }}>
        {/* Timeline line */}
        <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px", background: "linear-gradient(to bottom, #5046e5, rgba(80,70,229,0.1))", borderRadius: "999px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {EDUCATION.map((edu) => (
            <div key={edu.institution} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Dot */}
              <div style={{ position: "absolute", left: "-28px", top: "4px", width: "16px", height: "16px", borderRadius: "50%", background: edu.current ? "#5046e5" : "#1e2040", border: `2px solid ${edu.current ? "#a5b4fc" : "rgba(255,255,255,0.2)"}`, boxShadow: edu.current ? "0 0 12px rgba(80,70,229,0.5)" : "none" }} />

              <div style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${edu.current ? "rgba(80,70,229,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: 0 }}>{edu.institution}</h3>
                      {edu.current && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "999px", padding: "2px 8px" }}>Current</span>}
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 500, color: "#a5b4fc", margin: "4px 0 0" }}>{edu.degree}</p>
                    {edu.minor && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{edu.minor}</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{edu.start} – {edu.end}</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#a5b4fc", margin: "4px 0 0" }}>GPA {edu.gpa}</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {edu.highlights.map((h) => (
                    <span key={h} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "3px 9px" }}>
                      <ChevronRight size={10} color="rgba(165,180,252,0.5)" />{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 6. Interests ─── */

const INTERESTS = [
  { icon: <Terminal size={20} />, label: "Homelab tinkering", color: "#5046e5" },
  { icon: <BookOpen size={20} />, label: "Technical writing", color: "#06b6d4" },
  { icon: <Coffee size={20} />, label: "Specialty coffee", color: "#f97316" },
  { icon: <Gamepad2 size={20} />, label: "Indie games", color: "#22c55e" },
  { icon: <Music size={20} />, label: "Lo-fi playlists", color: "#8b5cf6" },
  { icon: <Plane size={20} />, label: "Budget travel", color: "#f59e0b" },
  { icon: <Camera size={20} />, label: "Street photography", color: "#ec4899" },
  { icon: <Layers size={20} />, label: "Open source", color: "#4ade80" },
  { icon: <Database size={20} />, label: "Data hoarding", color: "#a5b4fc" },
];

function Interests() {
  return (
    <Section id="interests">
      <SectionLabel>Interests</SectionLabel>
      <SectionHeading>Beyond the terminal</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {INTERESTS.map(({ icon, label, color }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", transition: "border-color 0.2s, background 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
          >
            <span style={{ color, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 7. Projects (about page mini-section) ─── */

function Projects() {
  return (
    <Section id="projects" alt>
      <SectionLabel>Projects</SectionLabel>
      <SectionHeading>Things I&apos;ve shipped</SectionHeading>
      <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "14px" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.125rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
          No projects published yet.
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Check back soon or visit <Link to="/projects" style={{ color: "#a5b4fc", textDecoration: "none" }}>the projects page</Link>.
        </p>
      </div>
    </Section>
  );
}

/* ─── sticky nav ─── */

const NAV_LINKS = [
  { href: "about", label: "About" },
  { href: "skills", label: "Skills" },
  { href: "certifications", label: "Certs" },
  { href: "education", label: "Education" },
  { href: "interests", label: "Interests" },
  { href: "projects", label: "Projects" },
];

function StickyNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.88)", backdropFilter: "blur(12px)", overflowX: "auto" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", gap: "0", height: "48px" }}>
        {NAV_LINKS.map(({ href, label }) => (
          <button
            key={href}
            onClick={() => scrollTo(href)}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", padding: "0 16px", height: "100%", whiteSpace: "nowrap", transition: "color 0.15s", position: "relative" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── root ─── */

export function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Top back bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.95)", backdropFilter: "blur(12px)", height: "52px", display: "flex", alignItems: "center", padding: "0 32px", gap: "16px" }}>
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Blog
        </Link>
        <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>About Me</span>
      </div>

      <Hero />
      <StickyNav />
      <About />
      <Skills />
      <Certifications />
      <Education />
      <Interests />
      <Projects />

      {/* Footer CTA */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "64px 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#fff", margin: "0 0 12px", letterSpacing: "-0.015em" }}>
          Let&apos;s work together
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
          Interested in cloud engineering, SRE, or infrastructure roles.
        </p>
        <a href={`mailto:${BRAND_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", background: "#5046e5", borderRadius: "10px", padding: "12px 28px", textDecoration: "none", transition: "background 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#5046e5")}
        >
          Say hello →
        </a>
      </section>
    </div>
  );
}
