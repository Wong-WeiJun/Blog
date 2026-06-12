import { useState, useRef } from "react";
import {
  Mail, Github, Linkedin, Copy, Check, Send, ArrowLeft,
  AlertCircle, CheckCircle2, Loader2, Twitter, MessageSquare,
} from "lucide-react";

interface Props {
  onBack: () => void;
}

/* ── field ── */
function Field({
  label, value, onChange, type = "text", placeholder, error, rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string; rows?: number;
}) {
  const hasError = !!error;
  const borderColor = hasError ? "rgba(248,113,113,0.65)" : "rgba(255,255,255,0.1)";
  const focusBorder = hasError ? "rgba(248,113,113,0.9)" : "rgba(80,70,229,0.6)";
  const shadow      = hasError ? "0 0 0 3px rgba(248,113,113,0.14)" : "0 0 0 3px rgba(80,70,229,0.16)";

  const base: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${borderColor}`,
    borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem",
    color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
        {label}
      </label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ ...base, padding: "11px 14px", resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = focusBorder; e.target.style.boxShadow = shadow; }}
          onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ ...base, padding: "11px 14px" }}
          onFocus={e => { e.target.style.borderColor = focusBorder; e.target.style.boxShadow = shadow; }}
          onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
        />
      )}
      {error && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f87171", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

/* ── hCaptcha placeholder ── */
function HCaptchaPlaceholder({ checked, onCheck }: { checked: boolean; onCheck: () => void }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", padding: "14px 16px", background: "rgba(255,255,255,0.025)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={onCheck}
          style={{ width: "22px", height: "22px", borderRadius: "4px", border: `2px solid ${checked ? "#5046e5" : "rgba(255,255,255,0.25)"}`, background: checked ? "#5046e5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
        >
          {checked && <Check size={13} color="#fff" strokeWidth={3} />}
        </button>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.65)" }}>
          I'm not a robot
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(80,70,229,0.2)", border: "1px solid rgba(80,70,229,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#a5b4fc", fontWeight: 700 }}>hC</span>
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.02em" }}>hCaptcha</span>
      </div>
    </div>
  );
}

/* ── success card ── */
function SuccessCard({ onReset }: { onReset: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "48px 32px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "16px", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle2 size={36} color="#4ade80" />
      </div>
      <div>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 8px", letterSpacing: "-0.015em" }}>
          Message sent!
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.65 }}>
          Thanks for reaching out. I'll get back to you within 1–2 business days.
        </p>
      </div>
      <button
        onClick={onReset}
        style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", padding: "10px 22px", cursor: "pointer", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
      >
        Send another message
      </button>
    </div>
  );
}

/* ── contact info column ── */
function ContactInfo() {
  const [copied, setCopied] = useState(false);
  const email = "hello@wong.dev";

  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    { icon: <Github size={18} />, label: "GitHub", handle: "@wongg-dev" },
    { icon: <Linkedin size={18} />, label: "LinkedIn", handle: "wong-cloud" },
    { icon: <Twitter size={18} />, label: "Twitter / X", handle: "@wong_cloud" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#5046e5", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
          Get in touch
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.75rem)", color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Let's start a<br />conversation
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: "360px" }}>
          Whether it's a job opportunity, collaboration, feedback on a post, or just saying hi — I read every message and reply to most.
        </p>
      </div>

      {/* Email row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Email</p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", padding: "11px 14px", flex: 1 }}>
            <Mail size={15} color="#a5b4fc" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "#fff" }}>{email}</span>
          </div>
          <button
            onClick={copy}
            title={copied ? "Copied!" : "Copy email"}
            style={{ width: "42px", height: "42px", borderRadius: "9px", background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: copied ? "#4ade80" : "rgba(255,255,255,0.5)", transition: "all 0.2s", flexShrink: 0 }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Social links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Elsewhere</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {links.map(l => (
            <span
              key={l.label}
              title="Coming soon"
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "9px", opacity: 0.45, pointerEvents: "none" }}
            >
              <span style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{l.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", margin: 0 }}>{l.label}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>{l.handle}</p>
              </div>
            </span>
          ))}
        </div>
      </div>

      {/* Response time note */}
      <div style={{ display: "flex", gap: "10px", padding: "14px 16px", background: "rgba(80,70,229,0.07)", border: "1px solid rgba(80,70,229,0.2)", borderRadius: "10px" }}>
        <MessageSquare size={16} color="#a5b4fc" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Typical reply time: <strong style={{ color: "#a5b4fc" }}>1–2 business days.</strong> For urgent matters, DM me on Twitter.
        </p>
      </div>
    </div>
  );
}

/* ── contact form ── */
function ContactForm() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())          e.name    = "Please enter your name.";
    if (!email.includes("@"))  e.email   = "Enter a valid email address.";
    if (!subject.trim())       e.subject = "Please enter a subject.";
    if (message.trim().length < 20) e.message = "Message must be at least 20 characters.";
    if (!captcha)              e.captcha = "Please confirm you're not a robot.";
    return e;
  };

  const submit = () => {
    setServerError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    // Simulate: 20% chance of server error for demo
    setTimeout(() => {
      setLoading(false);
      if (Math.random() < 0.15) {
        setServerError("Something went wrong on our end. Please try again in a moment.");
      } else {
        setSuccess(true);
      }
    }, 1400);
  };

  if (success) return <SuccessCard onReset={() => { setSuccess(false); setName(""); setEmail(""); setSubject(""); setMessage(""); setCaptcha(false); }} />;

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "32px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {serverError && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "9px", padding: "12px 14px" }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#f87171", margin: 0, lineHeight: 1.5 }}>{serverError}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" error={errors.name} />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
        </div>

        <Field label="Subject" value={subject} onChange={setSubject} placeholder="Internship opportunity / Collaboration / Feedback…" error={errors.subject} />
        <Field label="Message" value={message} onChange={setMessage} placeholder="Tell me what's on your mind. The more detail the better — I read everything." rows={6} error={errors.message} />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <HCaptchaPlaceholder checked={captcha} onCheck={() => setCaptcha(c => !c)} />
          {errors.captcha && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f87171", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={11} />{errors.captcha}
            </p>
          )}
        </div>

        <button
          onClick={submit}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", background: loading ? "rgba(80,70,229,0.6)" : "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, border: "none", borderRadius: "10px", cursor: loading ? "default" : "pointer", transition: "background 0.15s, transform 0.1s" }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; } }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} />}
          {loading ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );
}

/* ── root ── */
export function ContactPage({ onBack }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.92)", backdropFilter: "blur(12px)", height: "52px", display: "flex", alignItems: "center", padding: "0 32px", gap: "16px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Blog
        </button>
        <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>Contact</span>
      </div>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(80,70,229,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Body */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1060px", margin: "0 auto", padding: "72px 32px 96px", display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "64px", alignItems: "start" }}>
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}
