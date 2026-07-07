import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { AxiosError } from "axios";
import {
  Mail, Github, Linkedin, Copy, Check, Send, ArrowLeft,
  AlertCircle, CheckCircle2, Loader2, Twitter, MessageSquare,
} from "lucide-react";
import { BRAND_EMAIL } from "../../lib/constants";
import { submitContactForm } from "@/lib/contact";
import { validateContactForm } from "@/lib/contact-validation";

/* ── field ── */
function Field({
  id, label, value, onChange, type = "text", placeholder, error, rows,
}: {
  id: string;
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; error?: string; rows?: number;
}) {
  const hasError = !!error;
  const borderColor = hasError ? "rgba(248,113,113,0.65)" : "rgba(255,255,255,0.1)";
  const focusBorder = hasError ? "rgba(248,113,113,0.9)" : "rgba(80,70,229,0.6)";
  const shadow      = hasError ? "0 0 0 3px rgba(248,113,113,0.14)" : "0 0 0 3px rgba(80,70,229,0.16)";

  const base: CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${borderColor}`,
    borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem",
    color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
        {label}
      </label>
      {rows ? (
        <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ ...base, padding: "11px 14px", resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = focusBorder; e.target.style.boxShadow = shadow; }}
          onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
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

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as { detail?: string })?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
    return err.message || "Something went wrong on our end. Please try again in a moment.";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong on our end. Please try again in a moment.";
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
          Thanks for reaching out. I&apos;ll get back to you within 1–2 business days.
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
  const email = BRAND_EMAIL;

  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const links = [
    { icon: <Github size={18} />, label: "GitHub" },
    { icon: <Linkedin size={18} />, label: "LinkedIn" },
    { icon: <Twitter size={18} />, label: "Twitter / X" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
      <div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#5046e5", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
          Get in touch
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.9rem, 4vw, 2.75rem)", color: "#fff", margin: "0 0 16px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Let&apos;s start a<br />conversation
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: "360px" }}>
          Whether it&apos;s a job opportunity, collaboration, feedback on a post, or just saying hi — I read every message and reply to most.
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
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>Coming soon</p>
              </div>
            </span>
          ))}
        </div>
      </div>

      {/* Response time note */}
      <div style={{ display: "flex", gap: "10px", padding: "14px 16px", background: "rgba(80,70,229,0.07)", border: "1px solid rgba(80,70,229,0.2)", borderRadius: "10px" }}>
        <MessageSquare size={16} color="#a5b4fc" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Typical reply time: <strong style={{ color: "#a5b4fc" }}>1–2 business days.</strong> For urgent matters, DM on social media.
        </p>
      </div>
    </div>
  );
}

/* ── contact form ── */
export function ContactForm() {
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "";
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setCaptchaToken("");
    setErrors({});
    setServerError("");
    turnstileRef.current?.reset();
  };

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      setSuccess(true);
      resetForm();
    },
    onError: (err: unknown) => {
      setServerError(extractErrorMessage(err));
      setCaptchaToken("");
      turnstileRef.current?.reset();
    },
  });

  const submit = () => {
    setServerError("");
    const validationErrors = validateContactForm({
      name,
      email,
      subject,
      message,
      captchaToken,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    contactMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      captcha_token: captchaToken,
    });
  };

  const loading = contactMutation.isPending;

  if (success) {
    return (
      <SuccessCard
        onReset={() => {
          setSuccess(false);
          resetForm();
        }}
      />
    );
  }

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
          <Field id="contact-name" label="Name" value={name} onChange={setName} placeholder="Ada Lovelace" error={errors.name} />
          <Field id="contact-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
        </div>

        <Field id="contact-subject" label="Subject" value={subject} onChange={setSubject} placeholder="Internship opportunity / Collaboration / Feedback…" error={errors.subject} />
        <Field id="contact-message" label="Message" value={message} onChange={setMessage} placeholder="Tell me what's on your mind. The more detail the better — I read everything." rows={6} error={errors.message} />

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {turnstileSiteKey ? (
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
              onError={() => setCaptchaToken("")}
              options={{ theme: "dark" }}
            />
          ) : (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#f87171", margin: 0 }}>
              Turnstile is not configured. Set VITE_TURNSTILE_SITE_KEY.
            </p>
          )}
          {errors.captcha && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f87171", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={11} />{errors.captcha}
            </p>
          )}
        </div>

        <button
          onClick={submit}
          disabled={loading || !captchaToken}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", background: loading || !captchaToken ? "rgba(80,70,229,0.6)" : "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, border: "none", borderRadius: "10px", cursor: loading || !captchaToken ? "default" : "pointer", transition: "background 0.15s, transform 0.1s" }}
          onMouseEnter={e => { if (!loading && captchaToken) { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={e => { if (!loading && captchaToken) { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; } }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={15} />}
          {loading ? "Sending…" : "Send Message"}
        </button>
      </div>
    </div>
  );
}

/* ── root ── */
export function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ position: "sticky", top: "64px", zIndex: 40, borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,10,26,0.92)", backdropFilter: "blur(12px)", height: "52px", display: "flex", alignItems: "center", padding: "0 32px", gap: "16px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Blog
        </Link>
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
