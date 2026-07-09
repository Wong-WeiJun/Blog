import { Link } from "react-router";
import type { ReactNode } from "react";
import {
  Download, Github, Linkedin, ArrowLeft,
  MapPin, Calendar, ChevronRight,
} from "lucide-react";
import type {
  Certification,
  EducationEntry,
  Interest,
  SiteAboutResponse,
  SkillGroup,
} from "@/client/types.gen";
import { BRAND_EMAIL } from "../../lib/constants";
import { getAboutIcon } from "../../lib/about-icons";
import { getDisplayName, DEFAULT_ABOUT_PROFILE } from "../../lib/about-defaults";
import { useAboutProfile } from "../../lib/use-about-profile";
import { ProfileAvatar } from "./ProfileAvatar";

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

function AboutHero({ profile }: { profile: SiteAboutResponse }) {
  const displayName = getDisplayName(profile);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 32px 60px", display: "flex", gap: "56px", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: "clamp(180px, 22vw, 260px)", aspectRatio: "1/1", borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(80,70,229,0.35) 0%, rgba(80,70,229,0.08) 100%)",
          border: "1px solid rgba(80,70,229,0.35)", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(80,70,229,0.3) 0%, transparent 70%)" }} />
          {profile.owner.avatar_url ? (
            <ProfileAvatar
              name={displayName}
              avatarUrl={profile.owner.avatar_url}
              showImageFull
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", borderRadius: 0, border: "none", zIndex: 1 }}
            />
          ) : (
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <ProfileAvatar name={displayName} avatarUrl={profile.owner.avatar_url} size={80} fontSize="2.25rem" />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>./profile.jpg</p>
            </div>
          )}
        </div>
        {profile.open_to_work && (
          <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "999px", padding: "4px 10px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 8px #4ade80" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 600, color: "#4ade80" }}>Open to work</span>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "#a5b4fc", margin: "0 0 8px", letterSpacing: "0.04em" }}>
            Hello, I&apos;m —
          </p>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.25rem)", color: "#fff", margin: 0, lineHeight: 1.05, letterSpacing: "-0.025em" }}>
            {displayName}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", fontWeight: 500, color: "#a5b4fc", margin: "8px 0 0" }}>
            {profile.hero_subtitle}
          </p>
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(255,255,255,0.6)", margin: 0, maxWidth: "520px" }}>
          {profile.hero_bio}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px" }}>
          {profile.resume_url && (
            <a
              href={profile.resume_url}
              download="Resume.pdf"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600,
                color: "rgba(255,255,255,0.9)", background: "rgba(80,70,229,0.2)",
                border: "1px solid rgba(80,70,229,0.4)", borderRadius: "10px",
                padding: "11px 22px", textDecoration: "none", transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(80,70,229,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(80,70,229,0.2)"; }}
            >
              <Download size={16} /> Download Resume
            </a>
          )}

          {[
            profile.github_url ? { icon: <Github size={18} />, label: "GitHub", url: profile.github_url } : null,
            profile.linkedin_url ? { icon: <Linkedin size={18} />, label: "LinkedIn", url: profile.linkedin_url } : null,
          ].filter(Boolean).map((link) => link && (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: "44px", height: "44px", borderRadius: "10px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)", textDecoration: "none", transition: "background 0.2s",
              }}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. About ─── */

function About({ profile }: { profile: SiteAboutResponse }) {
  const displayName = getDisplayName(profile);

  return (
    <Section id="about">
      <SectionLabel>About</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {profile.about_paragraphs.map((para, i) => (
            <p key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.8, color: "rgba(255,255,255,0.62)", margin: 0 }}>
              {para}
            </p>
          ))}
        </div>

        <div>
          <blockquote style={{ margin: 0, padding: "28px 32px", background: "rgba(80,70,229,0.08)", border: "none", borderLeft: "3px solid #5046e5", borderRadius: "0 12px 12px 0" }}>
            <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "clamp(1.1rem, 2vw, 1.375rem)", lineHeight: 1.55, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
              &quot;{profile.pull_quote}&quot;
            </p>
            <footer style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "rgba(165,180,252,0.6)" }}>
              — {displayName}, {profile.pull_quote_attribution}
            </footer>
          </blockquote>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: "#a5b4fc" }}><MapPin size={14} /></span>
              {profile.location}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
              <span style={{ color: "#a5b4fc" }}><Calendar size={14} /></span>
              {profile.availability_text}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 3. Skills ─── */

function SkillGroupCard({ group }: { group: SkillGroup }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${group.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: group.color }}>
          {getAboutIcon(group.icon, 16)}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 700, color: "#fff" }}>{group.category}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {(group.skills ?? []).map((skill) => (
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

function Skills({ profile }: { profile: SiteAboutResponse }) {
  return (
    <Section id="skills" alt>
      <SectionLabel>Skills</SectionLabel>
      <SectionHeading>What I work with</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        {profile.skill_groups.map((g) => <SkillGroupCard key={g.category} group={g} />)}
      </div>
    </Section>
  );
}

/* ─── 4. Certifications ─── */

function Certifications({ profile }: { profile: SiteAboutResponse }) {
  return (
    <Section id="certifications">
      <SectionLabel>Certifications</SectionLabel>
      <SectionHeading>Credentials</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
        {profile.certifications.map((cert: Certification) => (
          <div
            key={cert.name}
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", transition: "border-color 0.2s, transform 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${cert.color}50`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}
          >
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

function Education({ profile }: { profile: SiteAboutResponse }) {
  return (
    <Section id="education" alt>
      <SectionLabel>Education</SectionLabel>
      <SectionHeading>Academic background</SectionHeading>
      <div style={{ position: "relative", paddingLeft: "28px" }}>
        <div style={{ position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px", background: "linear-gradient(to bottom, #5046e5, rgba(80,70,229,0.1))", borderRadius: "999px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
          {profile.education.map((edu: EducationEntry) => (
            <div key={edu.institution} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  {(edu.highlights ?? []).map((h) => (
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

function Interests({ profile }: { profile: SiteAboutResponse }) {
  return (
    <Section id="interests">
      <SectionLabel>Interests</SectionLabel>
      <SectionHeading>Beyond the terminal</SectionHeading>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {profile.interests.map((item: Interest) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", transition: "border-color 0.2s, background 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${item.color}40`; e.currentTarget.style.background = `${item.color}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
          >
            <span style={{ color: item.color, flexShrink: 0 }}>{getAboutIcon(item.icon, 20)}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.7)", lineHeight: 1.3 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 7. Projects ─── */

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
    <div style={{ position: "sticky", top: "116px", zIndex: 40, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.88)", backdropFilter: "blur(12px)", overflowX: "auto" }}>
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
  const { data: profile = DEFAULT_ABOUT_PROFILE, isLoading } = useAboutProfile();

  if (isLoading && !profile) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.4)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ position: "sticky", top: "64px", zIndex: 40, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.95)", backdropFilter: "blur(12px)", height: "52px", display: "flex", alignItems: "center", padding: "0 32px", gap: "16px" }}>
        <Link
          to="/blog"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Blog
        </Link>
        <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>About Me</span>
      </div>

      <AboutHero profile={profile} />
      <StickyNav />
      <About profile={profile} />
      <Skills profile={profile} />
      <Certifications profile={profile} />
      <Education profile={profile} />
      <Interests profile={profile} />
      <Projects />

      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "64px 32px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#fff", margin: "0 0 12px", letterSpacing: "-0.015em" }}>
          {profile.cta_heading}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
          {profile.cta_subtext}
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
