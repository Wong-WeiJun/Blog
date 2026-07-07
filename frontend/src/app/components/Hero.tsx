import { Link } from "react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { tagsGetTags } from "@/client/sdk.gen";
import type { TagWithCountResponse } from "@/client/types.gen";
import { BRAND_NAME } from "../../lib/constants";

export function Hero() {
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await tagsGetTags();
      return (res.data ?? []) as TagWithCountResponse[];
    },
  });

  const tagPills = tags.filter((t) => t.post_count > 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 w-fit" style={{ background: "rgba(80,70,229,0.15)", border: "1px solid rgba(80,70,229,0.35)", borderRadius: "999px", padding: "6px 14px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#5046e5", display: "inline-block", boxShadow: "0 0 8px #5046e5" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 500, color: "#a5b4fc", letterSpacing: "0.01em" }}>
              Building cool things in the cloud
            </span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.4rem, 5vw, 3.6rem)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "#fff" }}>
            {BRAND_NAME}.{" "}
            <span style={{ color: "#a5b4fc" }}>Cloud Engineer</span>
            <br />
            in progress.
          </h1>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.0625rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", maxWidth: "520px" }}>
            Building resilient infrastructure, automating deployments, and documenting the journey — one cloud pattern at a time.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <Link
              to="/blog"
              style={{ background: "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, padding: "12px 24px", borderRadius: "10px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "background 0.15s, transform 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; }}
            >
              <BookOpen size={16} />
              Read the Blog
            </Link>

            <Link
              to="/about"
              style={{ background: "transparent", color: "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 500, padding: "12px 24px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", transition: "border-color 0.15s, color 0.15s, transform 0.1s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.transform = "none"; }}
            >
              About Me
              <ArrowRight size={16} />
            </Link>
          </div>

          {tagPills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tagPills.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog?tag=${encodeURIComponent(tag.name)}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 500, color: tag.color, background: `${tag.color}14`, border: `1px solid ${tag.color}30`, borderRadius: "6px", padding: "4px 10px", textDecoration: "none", transition: "opacity 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <div
            style={{ width: "clamp(220px, 28vw, 320px)", aspectRatio: "1/1", borderRadius: "20px", background: "linear-gradient(135deg, rgba(80,70,229,0.3) 0%, rgba(80,70,229,0.08) 100%)", border: "1px solid rgba(80,70,229,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(80,70,229,0.25) 0%, transparent 70%)" }} />
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(80,70,229,0.35)", border: "2px solid rgba(80,70,229,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#a5b4fc" }}>{BRAND_NAME[0]?.toUpperCase() ?? "Y"}</span>
            </div>
            <div style={{ zIndex: 1, textAlign: "center" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{BRAND_NAME}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>cloud-engineer@progress</p>
            </div>
            <div style={{ position: "absolute", bottom: "16px", right: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(165,180,252,0.6)" }}>./avatar.jpg</div>
          </div>
        </div>
      </div>
    </section>
  );
}
