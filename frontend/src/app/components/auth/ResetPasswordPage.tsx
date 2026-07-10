import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { AxiosError } from "axios";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/app/components/BrandLogo";

function Logo() {
  return <BrandLogo size="lg" layout="stacked" style={{ marginBottom: "32px" }} />;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "36px 36px", backdropFilter: "blur(16px)", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
      {children}
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label htmlFor={id} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
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
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "2px", display: "flex" }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  loading,
}: {
  children: ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{ width: "100%", padding: "12px", background: loading ? "rgba(80,70,229,0.6)" : "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, border: "none", borderRadius: "10px", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
    >
      {loading && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />}
      {children}
    </button>
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

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as { detail?: string })?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
  }
  return "Something went wrong. Please try again.";
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword, isResettingPassword } = useAuth();

  const submit = () => {
    setError("");
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    resetPassword(token, password, {
      onSuccess: () => setSuccess(true),
      onError: (err) => setError(extractErrorMessage(err)),
    });
  };

  if (!token) {
    return (
      <AuthShell>
        <Card>
          <Logo />
          <ErrorBanner message="This reset link is invalid or missing a token." />
          <Link
            to="/auth"
            style={{ display: "block", marginTop: "20px", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#a5b4fc", textDecoration: "none" }}
          >
            Back to Sign In
          </Link>
        </Card>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={36} color="#4ade80" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 8px" }}>Password updated</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                You can now sign in with your new password.
              </p>
            </div>
            <Link
              to="/auth"
              style={{ width: "100%", padding: "12px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", background: "#5046e5", borderRadius: "10px", textDecoration: "none", textAlign: "center" }}
            >
              Go to Sign In
            </Link>
          </div>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Card>
        <Logo />
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 6px" }}>Set a new password</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Choose a strong password for your account.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && <ErrorBanner message={error} />}
          <Field id="reset-password" label="New password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" error={!!error} />
          <Field id="reset-password-confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" autoComplete="new-password" error={!!error} />
          <PrimaryButton onClick={submit} loading={isResettingPassword}>Update Password</PrimaryButton>
        </div>

        <Link
          to="/auth"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "20px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </Card>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
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
      <div style={{ position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(80,70,229,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Link
        to="/"
        style={{ position: "fixed", top: "20px", left: "24px", display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", zIndex: 100 }}
      >
        <ArrowLeft size={14} />
        Blog
      </Link>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {children}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
