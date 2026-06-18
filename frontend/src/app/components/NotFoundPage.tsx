import { Link } from "react-router";
import { Home, BookOpen } from "lucide-react";
import { BRAND_DOMAIN } from "../../lib/constants";

const TERMINAL_LINES = [
  { prompt: true,  text: `curl https://${BRAND_DOMAIN}/this-page` },
  { prompt: false, text: "< HTTP/2 404" },
  { prompt: false, text: "< content-type: text/html" },
  { prompt: false, text: "" },
  { prompt: true,  text: "terraform plan" },
  { prompt: false, text: "│ Error: Invalid resource address" },
  { prompt: false, text: '\"page.not_found\" does not exist' },
  { prompt: false, text: "" },
  { prompt: true,  text: "kubectl get page/not-found" },
  { prompt: false, text: 'Error from server (NotFound): pages "not-found" not found' },
  { prompt: false, text: "" },
  { prompt: true,  text: "ls -la /routes/this-page" },
  { prompt: false, text: "ls: cannot access '/routes/this-page': No such file or directory" },
  { prompt: false, text: "" },
  { prompt: true,  text: "echo $?" },
  { prompt: false, text: "404" },
];

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Background terminal ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "min(700px, 90vw)", opacity: 0.055, transform: "rotate(-2deg) scale(1.1)", userSelect: "none" }}>
          {TERMINAL_LINES.map((line, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", lineHeight: 1.9, color: line.prompt ? "#a5b4fc" : "rgba(255,255,255,0.7)" }}>
              {line.prompt && <span style={{ color: "#6ee7b7" }}>$ </span>}
              {line.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Ambient glow ── */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(80,70,229,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* ── Centered card ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0", maxWidth: "560px" }}>

        {/* 404 display number */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          {/* Glow behind the number */}
          <div style={{ position: "absolute", inset: "-20px", background: "radial-gradient(ellipse, rgba(80,70,229,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 900,
              fontSize: "clamp(7rem, 22vw, 13rem)",
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #5046e5 0%, #818cf8 40%, rgba(129,140,248,0.35) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              position: "relative",
            }}
          >
            404
          </h1>
        </div>

        {/* Monospace badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.28)", borderRadius: "999px", padding: "5px 14px", marginBottom: "28px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f87171", display: "inline-block" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(165,180,252,0.7)", letterSpacing: "0.04em" }}>
            HTTP 404 · Not Found
          </span>
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2.125rem)",
            color: "#fff",
            margin: "0 0 14px",
            letterSpacing: "-0.02em",
          }}
        >
          Page not found
        </h2>

        {/* Message */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.75, color: "rgba(255,255,255,0.5)", margin: "0 0 40px" }}>
          The page you&apos;re looking for doesn&apos;t exist, was moved, or perhaps never deployed to production.
          The logs have been checked — it&apos;s not there.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "10px", padding: "12px 24px", textDecoration: "none", transition: "background 0.15s, transform 0.1s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; }}
          >
            <Home size={16} /> Go back home
          </Link>
          <Link
            to="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 500, color: "rgba(255,255,255,0.75)", background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "10px", padding: "12px 24px", textDecoration: "none", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.transform = "none"; }}
          >
            <BookOpen size={16} /> Browse posts
          </Link>
        </div>

        {/* Tiny footer note */}
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", marginTop: "48px" }}>
          exit code 404 · {BRAND_DOMAIN}
        </p>
      </div>
    </div>
  );
}
