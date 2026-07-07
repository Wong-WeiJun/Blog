import { Link } from "react-router";
import { ArrowRight, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { postsReadPosts } from "@/client/sdk.gen";
import type { PostResponse } from "@/client/types.gen";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FeaturedPost() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts", "featured"],
    queryFn: async () => {
      const res = await postsReadPosts({
        query: { featured: true, limit: 1, page: 1 },
      });
      return (res.data?.posts ?? []) as PostResponse[];
    },
  });

  const post = data?.[0];

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div style={{ height: "280px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />
      </section>
    );
  }

  if (!post) return null;

  const primaryTag = post.tags?.[0];
  const tagName = primaryTag?.name ?? "";
  const tagColor = primaryTag?.color ?? "#6366f1";
  const authorName = post.author?.full_name ?? "Author";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>Featured</span>
        <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
      </div>

      <Link
        to={`/blog/${post.slug}`}
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden", transition: "border-color 0.2s", textDecoration: "none", display: "block" }}
        className="group"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(80,70,229,0.4)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      >
        <div className="flex flex-col lg:flex-row">
          <div
            style={{
              width: "100%",
              minHeight: "260px",
              background: post.cover_image_url
                ? `url(${post.cover_image_url}) center/cover no-repeat`
                : "linear-gradient(135deg, #1a1b3a 0%, #0d1430 60%, #1a1340 100%)",
              flex: "0 0 44%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {!post.cover_image_url && (
              <>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(80,70,229,0.25) 0%, transparent 65%)" }} />
                <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(80,70,229,0.3)", borderRadius: "10px", padding: "20px 24px", backdropFilter: "blur(8px)" }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                      <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", lineHeight: 1.8, color: "rgba(165,180,252,0.8)" }}>
                    <div><span style={{ color: "#6ee7b7" }}>$ </span>terraform apply</div>
                    <div style={{ color: "rgba(255,255,255,0.4)" }}>Plan: 12 to add, 0 to change</div>
                    <div><span style={{ color: "#6ee7b7" }}>Apply complete!</span></div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
            <div className="flex items-center gap-3">
              {tagName && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, borderRadius: "6px", padding: "3px 10px" }}>
                  {tagName}
                </span>
              )}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" }}>{post.read_time} read</span>
            </div>

            <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.4rem, 2.5vw, 1.875rem)", lineHeight: 1.25, color: "#fff", letterSpacing: "-0.015em" }}>
              {post.title}
            </h2>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
              {post.excerpt || "Read this featured article to learn more."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3">
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(80,70,229,0.35)", border: "1px solid rgba(80,70,229,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {post.author?.avatar_url ? (
                    <img src={post.author.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <User size={14} color="#a5b4fc" />
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff" }}>{authorName}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>{formatDate(post.published_at)}</p>
                </div>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#a5b4fc", cursor: "pointer" }}>
                Read more <ArrowRight size={15} className="group-hover:translate-x-[3px] transition-transform duration-150" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
