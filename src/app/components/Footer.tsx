import { Github, Twitter, Linkedin, Mail, Rss } from "lucide-react";

interface Props { onOpenHome?: () => void; onOpenPost?: () => void; onOpenProjects?: () => void; onOpenAbout?: () => void; onOpenContact?: () => void; onOpen404?: () => void; onOpenLegal?: () => void; }

export function Footer({ onOpenHome, onOpenPost, onOpenProjects, onOpenAbout, onOpenContact, onOpen404, onOpenLegal }: Props) {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "80px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Col 1 — Logo + tagline */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onOpenHome}
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.375rem", color: "#fff", letterSpacing: "-0.01em", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
            >
              wong.dev
            </button>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", lineHeight: 1.65, color: "rgba(255,255,255,0.45)", maxWidth: "260px" }}>
              A developer blog documenting the journey from student to cloud engineer — one deployment at a time.
            </p>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(165,180,252,0.5)", background: "rgba(80,70,229,0.1)", border: "1px solid rgba(80,70,229,0.2)", borderRadius: "6px", padding: "6px 10px", display: "inline-block", marginTop: "4px" }}>
              AWS · Terraform · Docker · K8s · CI/CD
            </code>
          </div>

          {/* Col 2 — Links */}
          <div className="flex flex-col gap-4">
            <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Links
            </h4>
            <nav className="flex flex-col gap-3">
              {["Blog", "Projects", "About", "Contact", "Privacy", "RSS Feed"].map((link) => (
                <button
                  key={link}
                  onClick={
                    link === "Blog" ? onOpenHome
                    : link === "Projects" ? onOpenProjects
                    : link === "About" ? onOpenAbout
                    : link === "Contact" ? onOpenContact
                    : link === "Privacy" ? onOpenLegal
                    : undefined
                  }
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: link === "RSS Feed" ? "default" : "pointer", transition: "color 0.15s", display: "flex", alignItems: "center", gap: link === "RSS Feed" ? "6px" : "0", padding: 0, textAlign: "left" }}
                  onMouseEnter={(e) => {
                    if (link !== "RSS Feed") e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  {link === "RSS Feed" && <Rss size={13} />}
                  {link}
                  {link === "RSS Feed" && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", marginLeft: "4px" }}>
                      (soon)
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Col 3 — Connect */}
          <div className="flex flex-col gap-4">
            <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Github size={15} />, label: "GitHub", handle: "@wongg-dev" },
                { icon: <Twitter size={15} />, label: "Twitter", handle: "@wong_cloud" },
                { icon: <Linkedin size={15} />, label: "LinkedIn", handle: "wong-cloud" },
                { icon: <Mail size={15} />, label: "Email", handle: "hello@wong.dev" },
              ].map((item) => (
                <div
                  key={item.label}
                  title="Coming soon"
                  style={{ display: "flex", alignItems: "center", gap: "10px", opacity: 0.4, pointerEvents: "none" }}
                >
                  <span style={{ color: "rgba(165,180,252,0.6)" }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>
                    {item.handle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "48px", paddingTop: "24px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.3)" }}>
            © 2026 wong.dev · Built with React + Tailwind
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              v1.0.0 · cloud-engineering-in-progress
            </p>
            {onOpen404 && (
              <button onClick={onOpen404} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
              >
                404 demo →
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
