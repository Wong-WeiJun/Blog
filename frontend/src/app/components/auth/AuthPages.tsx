import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Check } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { BRAND_NAME, BRAND_DOMAIN } from "../../../lib/constants";

/* ─── shared primitives ─── */

type AuthScreen = "login" | "register" | "reset";

interface NavProps {
  onSwitch: (s: AuthScreen) => void;
}

function Logo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #5046e5, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(80,70,229,0.4)" }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.375rem", fontWeight: 700, color: "#fff" }}>{BRAND_NAME[0]?.toUpperCase() ?? "Y"}</span>
      </div>
      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.01em" }}>{BRAND_DOMAIN}</span>
    </div>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  autoComplete?: string;
  hint?: string;
}

function Field({ label, type = "text", value, onChange, placeholder, error, autoComplete, hint }: InputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: isPassword ? "11px 42px 11px 14px" : "11px 14px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${error ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "9px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9375rem",
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s, box-shadow 0.15s",
            boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.12)" : "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "rgba(248,113,113,0.9)" : "rgba(80,70,229,0.65)";
            e.target.style.boxShadow = error ? "0 0 0 3px rgba(248,113,113,0.15)" : "0 0 0 3px rgba(80,70,229,0.18)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.1)";
            e.target.style.boxShadow = error ? "0 0 0 3px rgba(248,113,113,0.12)" : "none";
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "2px", display: "flex", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

function PrimaryButton({ children, onClick, loading }: { children: ReactNode; onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ width: "100%", padding: "12px", background: loading ? "rgba(80,70,229,0.6)" : "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, border: "none", borderRadius: "10px", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.15s, transform 0.1s" }}
      onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; } }}
    >
      {loading && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />}
      {children}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "9px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "9px", padding: "11px 14px" }}>
      <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: "1px" }} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#f87171", margin: 0, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "36px 36px", backdropFilter: "blur(16px)", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
      {children}
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["rgba(255,255,255,0.1)", "#f87171", "#fbbf24", "#4ade80"];
  const labels = ["", "Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: i < score ? colors[score] : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          {checks.map((c) => (
            <span key={c.label} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: c.ok ? "#4ade80" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "3px", transition: "color 0.2s" }}>
              <Check size={9} />
              {c.label}
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, color: colors[score] }}>{labels[score]}</span>
      </div>
    </div>
  );
}

/* ─── 1. Login ─── */

function LoginPage({ onSwitch }: NavProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const { login, isLoggingIn, loginError } = useAuth();

  const submit = () => {
    setError("");
    if (!email || !password) { setError("Please fill in your email and password."); return; }
    if (!email.includes("@")) { setError("That doesn't look like a valid email address."); return; }
    login(email, password);
  };

  const hasError = !!error || !!loginError;

  return (
    <Card>
      <Logo />

      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 6px", letterSpacing: "-0.015em" }}>Welcome back</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>Sign in to your dashboard</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && <ErrorBanner message={error} />}
        {loginError && (
          <ErrorBanner message="Incorrect email or password" />
        )}

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={hasError} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={hasError} autoComplete="current-password" />

        {/* Remember + Forgot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div /> {/* spacer */}
          <button
            onClick={() => onSwitch("reset")}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#a5b4fc", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#a5b4fc")}
          >
            Forgot password?
          </button>
        </div>

        <PrimaryButton onClick={submit} loading={isLoggingIn}>Sign In</PrimaryButton>
      </div>

      <Divider label="or" />

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textAlign: "center", margin: 0 }}>
        Don&apos;t have an account?{" "}
        <button
          onClick={() => onSwitch("register")}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#a5b4fc", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a5b4fc")}
        >
          Register
        </button>
      </p>
    </Card>
  );
}

/* ─── 2. Register ─── */

function RegisterPage({ onSwitch }: NavProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const { register, isRegistering } = useAuth();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.includes("@")) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (confirm !== password) e.confirm = "Passwords don't match.";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    register(name, email, password);
    setSuccess(true);
  };

  if (success) {
    return (
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "16px 0 8px", textAlign: "center" }}>
          {/* Animated checkmark circle */}
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeScale 0.4s ease" }}>
            <CheckCircle2 size={36} color="#4ade80" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 8px", letterSpacing: "-0.015em" }}>Account created</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: "0 0 4px", lineHeight: 1.6 }}>
              Your account has been created successfully.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "#a5b4fc", margin: 0 }}>{email}</p>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6, maxWidth: "300px" }}>
            You can now sign in with your credentials.
          </p>
          <button
            onClick={() => onSwitch("login")}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "9px", padding: "10px 24px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.12)")}
          >
            Back to Sign In
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Logo />
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 6px", letterSpacing: "-0.015em" }}>Create an account</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>Join {BRAND_DOMAIN} to comment & bookmark posts</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Field label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" error={!!errors.name} autoComplete="name" />
        {errors.name && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: "-8px 0 0", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} />{errors.name}</p>}

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={!!errors.email} autoComplete="email" />
        {errors.email && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: "-8px 0 0", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} />{errors.email}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" error={!!errors.password} autoComplete="new-password" />
          <PasswordStrength password={password} />
          {errors.password && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} />{errors.password}</p>}
        </div>

        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={!!errors.confirm} autoComplete="new-password" />
        {errors.confirm && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: "-8px 0 0", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} />{errors.confirm}</p>}

        <div style={{ marginTop: "4px" }}>
          <PrimaryButton onClick={submit} loading={isRegistering}>Create Account</PrimaryButton>
        </div>
      </div>

      <Divider label="or" />

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textAlign: "center", margin: 0 }}>
        Already have an account?{" "}
        <button
          onClick={() => onSwitch("login")}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#a5b4fc", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a5b4fc")}
        >
          Sign In
        </button>
      </p>
    </Card>
  );
}

/* ─── 3. Password Reset ─── */

function ResetPage({ onSwitch }: NavProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { recoverPassword, isRecoveringPassword } = useAuth();

  const submit = () => {
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    recoverPassword(email, { onSuccess: () => setSuccess(true) });
  };

  if (success) {
    return (
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "16px 0 8px", textAlign: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(80,70,229,0.15)", border: "2px solid rgba(80,70,229,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={36} color="#a5b4fc" />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 8px", letterSpacing: "-0.015em" }}>Reset link sent</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: "0 0 4px", lineHeight: 1.6 }}>
              If an account exists for
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "#a5b4fc", margin: 0 }}>{email}</p>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.6, maxWidth: "290px" }}>
            you&apos;ll receive a password reset link shortly. Check your spam folder if it doesn&apos;t arrive.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            <button
              onClick={() => onSwitch("login")}
              style={{ width: "100%", padding: "11px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "10px", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5046e5")}
            >
              Back to Sign In
            </button>
            <button
              onClick={() => { setSuccess(false); setEmail(""); }}
              style={{ width: "100%", padding: "11px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              Try a different email
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Logo />
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 6px", letterSpacing: "-0.015em" }}>Reset your password</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && <ErrorBanner message={error} />}
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={!!error} autoComplete="email" />
        <PrimaryButton onClick={submit} loading={isRecoveringPassword}>Send Reset Link</PrimaryButton>
      </div>

      <Divider label="or" />

      <button
        onClick={() => onSwitch("login")}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
      >
        <ArrowLeft size={14} />
        Back to Sign In
      </button>
    </Card>
  );
}

/* ─── Tab switcher for preview ─── */

function TabBar({ active, onSwitch }: { active: AuthScreen; onSwitch: (s: AuthScreen) => void }) {
  const tabs: { id: AuthScreen; label: string }[] = [
    { id: "login",    label: "Login" },
    { id: "register", label: "Register" },
    { id: "reset",    label: "Password Reset" },
  ];
  return (
    <div style={{ position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 100, display: "flex", gap: "4px", background: "rgba(10,12,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "4px", backdropFilter: "blur(12px)" }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSwitch(t.id)}
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: active === t.id ? 600 : 400, color: active === t.id ? "#fff" : "rgba(255,255,255,0.45)", background: active === t.id ? "#5046e5" : "transparent", border: "none", borderRadius: "8px", padding: "7px 16px", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Root export ─── */

export function AuthPages({ initialScreen = "login" }: { initialScreen?: AuthScreen }) {
  const [screen, setScreen] = useState<AuthScreen>(initialScreen);

  const nav: NavProps = { onSwitch: setScreen };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px 40px",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(80,70,229,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Tab switcher */}
      <TabBar active={screen} onSwitch={setScreen} />

      {/* Back to blog */}
      <Link
        to="/"
        style={{ position: "fixed", top: "20px", left: "24px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 0", transition: "color 0.15s", zIndex: 100 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
      >
        <ArrowLeft size={14} />
        Blog
      </Link>

      {/* Card */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {screen === "login"    && <LoginPage    {...nav} />}
        {screen === "register" && <RegisterPage {...nav} />}
        {screen === "reset"    && <ResetPage    {...nav} />}
      </div>

      {/* Keyframe for spin + fadeScale */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeScale { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
