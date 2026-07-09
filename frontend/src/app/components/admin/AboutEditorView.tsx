import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { aboutUpdateAbout } from "@/client/sdk.gen";
import type {
  Certification,
  EducationEntry,
  Interest,
  SiteAboutResponse,
  SiteAboutUpdate,
  SkillGroup,
} from "@/client/types.gen";
import { ABOUT_ICON_OPTIONS } from "../../../lib/about-icons";
import { DEFAULT_ABOUT_PROFILE } from "../../../lib/about-defaults";
import { useAboutProfile } from "../../../lib/use-about-profile";
import { ProfileAvatar } from "../ProfileAvatar";
import useCustomToast from "../../../hooks/useCustomToast";

type Tab = "homepage" | "hero" | "about" | "skills" | "certs" | "education" | "interests" | "cta" | "avatar";

const TABS: { id: Tab; label: string }[] = [
  { id: "homepage", label: "Homepage Hero" },
  { id: "hero", label: "About Hero" },
  { id: "about", label: "About Section" },
  { id: "skills", label: "Skills" },
  { id: "certs", label: "Certifications" },
  { id: "education", label: "Education" },
  { id: "interests", label: "Interests" },
  { id: "cta", label: "Footer CTA" },
  { id: "avatar", label: "Profile Photo" },
];

function Field({
  label, value, onChange, type = "text", placeholder, hint, rows, maxLength,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; hint?: string; rows?: number; maxLength?: number;
}) {
  const baseStyle: CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "#fff",
    outline: "none", boxSizing: "border-box", padding: "11px 14px",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>{label}</label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLength} style={{ ...baseStyle, resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={baseStyle} />
      )}
      {hint && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

function profileToForm(p: SiteAboutResponse): SiteAboutUpdate {
  return {
    homepage_tagline: p.homepage_tagline,
    homepage_headline: p.homepage_headline,
    homepage_headline_accent: p.homepage_headline_accent,
    homepage_bio: p.homepage_bio,
    hero_subtitle: p.hero_subtitle,
    hero_bio: p.hero_bio,
    open_to_work: p.open_to_work,
    resume_url: p.resume_url,
    github_url: p.github_url,
    linkedin_url: p.linkedin_url,
    about_paragraphs: [...p.about_paragraphs],
    pull_quote: p.pull_quote,
    pull_quote_attribution: p.pull_quote_attribution,
    location: p.location,
    availability_text: p.availability_text,
    cta_heading: p.cta_heading,
    cta_subtext: p.cta_subtext,
    skill_groups: p.skill_groups.map((g) => ({ ...g, skills: (g.skills ?? []).map((s) => ({ ...s })) })),
    certifications: p.certifications.map((c) => ({ ...c })),
    education: p.education.map((e) => ({ ...e, highlights: [...(e.highlights ?? [])] })),
    interests: p.interests.map((i) => ({ ...i })),
  };
}

interface Props {
  onNavigateToProfile?: () => void;
}

export function AboutEditorView({ onNavigateToProfile }: Props) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { data: profile = DEFAULT_ABOUT_PROFILE, isLoading } = useAboutProfile();
  const [tab, setTab] = useState<Tab>("homepage");
  const [form, setForm] = useState<SiteAboutUpdate>(() => profileToForm(DEFAULT_ABOUT_PROFILE));
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(profileToForm(profile));
      setDirty(false);
    }
  }, [profile.updated_at]);

  const update = <K extends keyof SiteAboutUpdate>(key: K, value: SiteAboutUpdate[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await aboutUpdateAbout({ body: form });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      showSuccessToast("About page saved.");
      setDirty(false);
    },
    onError: () => showErrorToast("Failed to save about page."),
  });

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px", padding: "24px",
  };

  if (isLoading && !form.homepage_tagline) {
    return <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p>;
  }

  const skillGroups = (form.skill_groups ?? []) as SkillGroup[];
  const certifications = (form.certifications ?? []) as Certification[];
  const education = (form.education ?? []) as EducationEntry[];
  const interests = (form.interests ?? []) as Interest[];
  const paragraphs = form.about_paragraphs ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500,
              padding: "6px 14px", borderRadius: "8px", cursor: "pointer", border: "1px solid",
              borderColor: tab === id ? "rgba(80,70,229,0.5)" : "rgba(255,255,255,0.1)",
              background: tab === id ? "rgba(80,70,229,0.2)" : "transparent",
              color: tab === id ? "#a5b4fc" : "rgba(255,255,255,0.5)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={cardStyle}>
        {tab === "homepage" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Tagline badge" value={form.homepage_tagline ?? ""} onChange={(v) => update("homepage_tagline", v)} />
            <Field label="Headline highlight" value={form.homepage_headline ?? ""} onChange={(v) => update("homepage_headline", v)} hint="Shown in accent color after your name" />
            <Field label="Headline suffix" value={form.homepage_headline_accent ?? ""} onChange={(v) => update("homepage_headline_accent", v)} />
            <Field label="Bio" value={form.homepage_bio ?? ""} onChange={(v) => update("homepage_bio", v)} rows={3} />
          </div>
        )}

        {tab === "hero" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Subtitle" value={form.hero_subtitle ?? ""} onChange={(v) => update("hero_subtitle", v)} />
            <Field label="Bio" value={form.hero_bio ?? ""} onChange={(v) => update("hero_bio", v)} rows={3} />
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
              <input type="checkbox" checked={form.open_to_work ?? false} onChange={(e) => update("open_to_work", e.target.checked)} />
              Show &quot;Open to work&quot; badge
            </label>
            <Field label="Resume URL" value={form.resume_url ?? ""} onChange={(v) => update("resume_url", v || null)} placeholder="/Resume.pdf" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="GitHub URL" value={form.github_url ?? ""} onChange={(v) => update("github_url", v || null)} />
              <Field label="LinkedIn URL" value={form.linkedin_url ?? ""} onChange={(v) => update("linkedin_url", v || null)} />
            </div>
          </div>
        )}

        {tab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>Paragraphs</span>
                <button onClick={() => update("about_paragraphs", [...paragraphs, ""])} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#a5b4fc", background: "none", border: "none", cursor: "pointer" }}>
                  <Plus size={12} /> Add
                </button>
              </div>
              {paragraphs.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <textarea value={p} onChange={(e) => { const next = [...paragraphs]; next[i] = e.target.value; update("about_paragraphs", next); }} rows={3} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#fff", padding: "10px", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }} />
                  <button onClick={() => update("about_paragraphs", paragraphs.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <Field label="Pull quote" value={form.pull_quote ?? ""} onChange={(v) => update("pull_quote", v)} rows={2} />
            <Field label="Quote attribution suffix" value={form.pull_quote_attribution ?? ""} onChange={(v) => update("pull_quote_attribution", v)} hint="Appears after your name" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Field label="Location" value={form.location ?? ""} onChange={(v) => update("location", v)} />
              <Field label="Availability" value={form.availability_text ?? ""} onChange={(v) => update("availability_text", v)} />
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <button onClick={() => update("skill_groups", [...skillGroups, { category: "New Group", icon: "cloud", color: "#5046e5", skills: [] }])} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} /> Add skill group
            </button>
            {skillGroups.map((group, gi) => {
              const skills = group.skills ?? [];
              return (
              <div key={gi} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#fff" }}>Group {gi + 1}</span>
                  <button onClick={() => update("skill_groups", skillGroups.filter((_, i) => i !== gi))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <Field label="Category" value={group.category} onChange={(v) => { const next = [...skillGroups]; next[gi] = { ...group, category: v }; update("skill_groups", next); }} />
                  <div>
                    <label style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>Icon</label>
                    <select value={group.icon} onChange={(e) => { const next = [...skillGroups]; next[gi] = { ...group, icon: e.target.value }; update("skill_groups", next); }} style={{ width: "100%", marginTop: "6px", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#fff" }}>
                      {ABOUT_ICON_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                  </div>
                  <Field label="Color" value={group.color} onChange={(v) => { const next = [...skillGroups]; next[gi] = { ...group, color: v }; update("skill_groups", next); }} />
                </div>
                {skills.map((skill, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "1fr 120px 32px", gap: "8px", alignItems: "end" }}>
                    <Field label="Skill" value={skill.name} onChange={(v) => { const next = [...skillGroups]; const nextSkills = [...skills]; nextSkills[si] = { ...skill, name: v }; next[gi] = { ...group, skills: nextSkills }; update("skill_groups", next); }} />
                    <div>
                      <label style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>Level ({skill.level}%)</label>
                      <input type="range" min={0} max={100} value={skill.level} onChange={(e) => { const next = [...skillGroups]; const nextSkills = [...skills]; nextSkills[si] = { ...skill, level: Number(e.target.value) }; next[gi] = { ...group, skills: nextSkills }; update("skill_groups", next); }} style={{ width: "100%", marginTop: "8px" }} />
                    </div>
                    <button onClick={() => { const next = [...skillGroups]; next[gi] = { ...group, skills: skills.filter((_, i) => i !== si) }; update("skill_groups", next); }} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", marginBottom: "8px" }}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => { const next = [...skillGroups]; next[gi] = { ...group, skills: [...skills, { name: "New skill", level: 50 }] }; update("skill_groups", next); }} style={{ alignSelf: "flex-start", fontSize: "0.75rem", color: "#a5b4fc", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Plus size={12} /> Add skill</button>
              </div>
            );})}
          </div>
        )}

        {tab === "certs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => update("certifications", [...certifications, { name: "", issuer: "", date: "", badge: "", color: "#5046e5", abbr: "" }])} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} /> Add certification
            </button>
            {certifications.map((cert, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Field label="Name" value={cert.name} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, name: v }; update("certifications", next); }} />
                <Field label="Issuer" value={cert.issuer} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, issuer: v }; update("certifications", next); }} />
                <Field label="Date" value={cert.date} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, date: v }; update("certifications", next); }} />
                <Field label="Badge code" value={cert.badge} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, badge: v }; update("certifications", next); }} />
                <Field label="Abbreviation" value={cert.abbr} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, abbr: v }; update("certifications", next); }} />
                <Field label="Color" value={cert.color} onChange={(v) => { const next = [...certifications]; next[i] = { ...cert, color: v }; update("certifications", next); }} />
                <button onClick={() => update("certifications", certifications.filter((_, j) => j !== i))} style={{ gridColumn: "1 / -1", justifySelf: "flex-start", background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}><Trash2 size={12} /> Remove</button>
              </div>
            ))}
          </div>
        )}

        {tab === "education" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => update("education", [...education, { institution: "", degree: "", minor: "", start: "", end: "", current: false, gpa: "—", highlights: [] }])} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} /> Add education entry
            </button>
            {education.map((edu, i) => (
              <div key={i} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Field label="Institution" value={edu.institution} onChange={(v) => { const next = [...education]; next[i] = { ...edu, institution: v }; update("education", next); }} />
                  <Field label="Degree" value={edu.degree} onChange={(v) => { const next = [...education]; next[i] = { ...edu, degree: v }; update("education", next); }} />
                  <Field label="Minor" value={edu.minor ?? ""} onChange={(v) => { const next = [...education]; next[i] = { ...edu, minor: v }; update("education", next); }} />
                  <Field label="GPA" value={edu.gpa ?? ""} onChange={(v) => { const next = [...education]; next[i] = { ...edu, gpa: v }; update("education", next); }} />
                  <Field label="Start" value={edu.start} onChange={(v) => { const next = [...education]; next[i] = { ...edu, start: v }; update("education", next); }} />
                  <Field label="End" value={edu.end} onChange={(v) => { const next = [...education]; next[i] = { ...edu, end: v }; update("education", next); }} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={edu.current} onChange={(e) => { const next = [...education]; next[i] = { ...edu, current: e.target.checked }; update("education", next); }} />
                  Current
                </label>
                <Field label="Highlights (comma-separated)" value={(edu.highlights ?? []).join(", ")} onChange={(v) => { const next = [...education]; next[i] = { ...edu, highlights: v.split(",").map((s) => s.trim()).filter(Boolean) }; update("education", next); }} />
                <button onClick={() => update("education", education.filter((_, j) => j !== i))} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem" }}><Trash2 size={12} /> Remove</button>
              </div>
            ))}
          </div>
        )}

        {tab === "interests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={() => update("interests", [...interests, { icon: "terminal", label: "", color: "#5046e5" }])} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} /> Add interest
            </button>
            {interests.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 32px", gap: "12px", alignItems: "end" }}>
                <Field label="Label" value={item.label} onChange={(v) => { const next = [...interests]; next[i] = { ...item, label: v }; update("interests", next); }} />
                <div>
                  <label style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}>Icon</label>
                  <select value={item.icon} onChange={(e) => { const next = [...interests]; next[i] = { ...item, icon: e.target.value }; update("interests", next); }} style={{ width: "100%", marginTop: "6px", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", color: "#fff" }}>
                    {ABOUT_ICON_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                  </select>
                </div>
                <Field label="Color" value={item.color} onChange={(v) => { const next = [...interests]; next[i] = { ...item, color: v }; update("interests", next); }} />
                <button onClick={() => update("interests", interests.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", marginBottom: "8px" }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}

        {tab === "cta" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Field label="Heading" value={form.cta_heading ?? ""} onChange={(v) => update("cta_heading", v)} />
            <Field label="Subtext" value={form.cta_subtext ?? ""} onChange={(v) => update("cta_subtext", v)} rows={2} />
          </div>
        )}

        {tab === "avatar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
            <ProfileAvatar name={profile.owner.full_name} avatarUrl={profile.owner.avatar_url} size={96} fontSize="2.5rem" />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: "480px" }}>
              Your profile photo is managed in the Profile settings. Changes sync automatically to the homepage Hero and About page.
            </p>
            {onNavigateToProfile && (
              <button
                onClick={onNavigateToProfile}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "8px", padding: "8px 14px", cursor: "pointer" }}
              >
                Go to Profile <ExternalLink size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
        {dirty && <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>Unsaved changes</span>}
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !dirty}
          style={{
            display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 24px",
            background: saveMutation.isSuccess && !dirty ? "rgba(74,222,128,0.15)" : "#5046e5",
            color: saveMutation.isSuccess && !dirty ? "#4ade80" : "#fff",
            border: saveMutation.isSuccess && !dirty ? "1px solid rgba(74,222,128,0.35)" : "none",
            borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600,
            cursor: saveMutation.isPending || !dirty ? "default" : "pointer", opacity: !dirty ? 0.5 : 1,
          }}
        >
          {saveMutation.isPending && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
          {saveMutation.isSuccess && !dirty && <Check size={14} />}
          {saveMutation.isPending ? "Saving…" : saveMutation.isSuccess && !dirty ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
