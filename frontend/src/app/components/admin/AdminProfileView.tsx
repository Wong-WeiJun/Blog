import type { CSSProperties, ChangeEvent } from "react";
import { useState, useRef } from "react";
import { Camera, Check, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { BRAND_NAME, BRAND_EMAIL, BRAND_HANDLE, BRAND_GITHUB } from "../../../lib/constants";

function Field({
  label, value, onChange, type = "text", placeholder, hint, rows, maxLength, readOnly,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; hint?: string; rows?: number; maxLength?: number; readOnly?: boolean;
}) {
  const baseStyle: CSSProperties = {
    width: "100%", background: readOnly ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: readOnly ? "rgba(255,255,255,0.45)" : "#fff",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
    cursor: readOnly ? "default" : "text",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
        {label}
      </label>
      {rows ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows} maxLength={maxLength} readOnly={readOnly}
          style={{ ...baseStyle, padding: "11px 14px", resize: "vertical" }}
          onFocus={(e) => { if (!readOnly) { e.target.style.borderColor = "rgba(80,70,229,0.65)"; e.target.style.boxShadow = "0 0 0 3px rgba(80,70,229,0.18)"; } }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} readOnly={readOnly}
          style={{ ...baseStyle, padding: "11px 14px" }}
          onFocus={(e) => { if (!readOnly) { e.target.style.borderColor = "rgba(80,70,229,0.65)"; e.target.style.boxShadow = "0 0 0 3px rgba(80,70,229,0.18)"; } }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      )}
      {maxLength && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "right" }}>
          {value.length}/{maxLength}
        </p>
      )}
      {hint && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

function AvatarUpload({ name }: { name: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const firstLetter = name[0]?.toUpperCase() ?? "Y";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div
        style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: preview ? "transparent" : "linear-gradient(135deg, rgba(80,70,229,0.5), rgba(129,140,248,0.35))", border: hover ? "2px solid #5046e5" : "2px solid rgba(80,70,229,0.45)", overflow: "hidden", transition: "border-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {preview
            ? <img src={preview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.75rem", fontWeight: 700, color: "#a5b4fc" }}>{firstLetter}</span>
          }
        </div>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", opacity: hover ? 1 : 0, transition: "opacity 0.2s" }}>
          <Camera size={16} color="#fff" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.55rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>EDIT</span>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#fff", margin: 0 }}>Profile photo</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>JPG, PNG or GIF · Max 2MB</p>
        <div style={{ display: "flex", gap: "7px", marginTop: "2px" }}>
          <button onClick={() => inputRef.current?.click()} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "6px", padding: "4px 11px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.12)")}
          >Upload</button>
          {preview && (
            <button onClick={() => setPreview(null)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 11px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >Remove</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminProfileView() {
  const { user } = useAuth();
  const displayName = user?.name ?? BRAND_NAME;
  const [name, setName]         = useState(displayName);
  const [username, setUsername] = useState(BRAND_HANDLE);
  const [bio, setBio]           = useState("");
  const [website, setWebsite]   = useState(`https://${BRAND_EMAIL.split("@")[1] ?? "yourdomain.dev"}`);
  const [twitter, setTwitter]   = useState("");
  const [github, setGithub]     = useState(BRAND_GITHUB);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);

  const save = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 1000);
  };

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px", padding: "24px 24px",
  };

  const sectionTitle = (t: string) => (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 3px" }}>{t}</h3>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", marginTop: "12px" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Public profile card */}
      <div style={cardStyle}>
        {sectionTitle("Public Profile")}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AvatarUpload name={name} />
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Display name" value={name} onChange={setName} placeholder="Your name" maxLength={48} />
            <Field label="Username" value={username} onChange={setUsername} placeholder="your-handle" hint="yourdomain.dev/@your-handle" maxLength={32} />
          </div>
          <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell readers a bit about yourself…" rows={3} maxLength={200} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Website" value={website} onChange={setWebsite} type="url" placeholder="https://yoursite.com" />
            <Field label="Twitter / X" value={twitter} onChange={setTwitter} placeholder="@handle" />
          </div>
          <Field label="GitHub" value={github} onChange={setGithub} placeholder="github-username" hint="github.com/github-username" />
        </div>
      </div>

      {/* Account info card — read-only */}
      <div style={cardStyle}>
        {sectionTitle("Account Info")}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Email" value={user?.email ?? BRAND_EMAIL} onChange={() => {}} readOnly hint="Contact support to change." />
            <Field label="Role" value={user?.role === "admin" ? "Blog Owner (Admin)" : "Reader"} onChange={() => {}} readOnly />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} color="#4ade80" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#4ade80" }}>Email verified</span>
          </div>
        </div>
      </div>

      {/* Save row */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={save}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 24px", background: saved ? "rgba(74,222,128,0.15)" : "#5046e5", color: saved ? "#4ade80" : "#fff", border: saved ? "1px solid rgba(74,222,128,0.35)" : "none", borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: loading ? "default" : "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { if (!loading && !saved) e.currentTarget.style.background = "#4338ca"; }}
          onMouseLeave={(e) => { if (!loading && !saved) e.currentTarget.style.background = "#5046e5"; }}
        >
          {loading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
          {saved && <Check size={14} />}
          {loading ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
