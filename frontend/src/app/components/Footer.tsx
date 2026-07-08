import { Link } from "react-router";
import { Github, Twitter, Linkedin, Mail, Rss } from "lucide-react";
import { BRAND_DOMAIN, BRAND_HANDLE, BRAND_GITHUB, BRAND_TWITTER, BRAND_EMAIL, COPYRIGHT_YEAR, RSS_FEED_URL } from "../../lib/constants";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "80px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Col 1 — Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.375rem", color: "#fff", letterSpacing: "-0.01em", textDecoration: "none" }}
            >
              {BRAND_DOMAIN}
            </Link>
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
              {[
                { label: "Blog", path: "/blog" },
                { label: "Projects", path: "/projects" },
                { label: "About", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "Privacy", path: "/legal" },
                { label: "RSS Feed", href: RSS_FEED_URL, icon: true },
              ].map((item) => (
                "href" in item ? (
                  <a
                    key={item.label}
                    href={item.href}
                    type="application/rss+xml"
                    rel="alternate"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s", display: "flex", alignItems: "center", gap: "6px" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                  >
                    {item.icon ? <Rss size={13} /> : null}
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.path}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.15s", display: "flex", alignItems: "center", gap: "0" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                  >
                    {item.label}
                  </Link>
                )
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
                // Note: Adjust the template literals below if your constants are already full URLs
                { icon: <Github size={15} />, label: "GitHub", handle: BRAND_GITHUB, url: `https://github.com/${BRAND_GITHUB}` },
                { icon: <Twitter size={15} />, label: "Twitter", handle: BRAND_TWITTER, url: `https://twitter.com/SakaiWJWong` },
                { icon: <Linkedin size={15} />, label: "LinkedIn", handle: BRAND_HANDLE, url: `https://www.linkedin.com/in/wei-jun-wong-507069357/` },
                { icon: <Mail size={15} />, label: "Email", handle: BRAND_EMAIL, url: `mailto:${BRAND_EMAIL}` },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target={item.label === "Email" ? "_self" : "_blank"} // mailto links don't need a new tab
                  rel={item.label === "Email" ? undefined : "noopener noreferrer"}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    textDecoration: "none",
                    opacity: 0.75, // Starting opacity (no longer looks disabled)
                    transition: "all 0.2s ease" 
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateX(4px)"; // Slight slide effect on hover
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.opacity = "0.75";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <span style={{ color: "rgba(165,180,252,0.8)", display: "flex" }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff" }}>
                    {item.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "48px", paddingTop: "24px", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.3)" }}>
            © {COPYRIGHT_YEAR} {BRAND_DOMAIN} · Built with React + Tailwind
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", margin: 0 }}>
              v1.0.0 · cloud-engineering-in-progress
            </p>
            <Link to="/404" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
            >
              404 demo →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
