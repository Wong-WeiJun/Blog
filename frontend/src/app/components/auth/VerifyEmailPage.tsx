import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useAuth } from "@/lib/auth-context";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/constants";

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

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "36px 36px", backdropFilter: "blur(16px)", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
      {children}
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

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as { detail?: string })?.detail;
    if (typeof detail === "string" && detail.length > 0) {
      return detail;
    }
  }
  return "Something went wrong. Please try again.";
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { verifyEmail, isVerifyingEmail } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verifyEmail(token, {
      onSuccess: () => setSuccess(true),
      onError: (err) => setError(extractErrorMessage(err)),
    });
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <AuthShell>
        <Card>
          <Logo />
          <ErrorBanner message="This verification link is invalid or missing a token." />
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

  if (isVerifyingEmail && !success && !error) {
    return (
      <AuthShell>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 0", textAlign: "center" }}>
            <Loader2 size={36} color="#a5b4fc" style={{ animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Verifying your email...
            </p>
          </div>
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
              <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 8px" }}>Email verified</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Your account is ready. You can now sign in.
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
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: "0 0 6px" }}>Verification failed</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
            We couldn&apos;t verify your email address.
          </p>
        </div>
        {error && <ErrorBanner message={error} />}
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
