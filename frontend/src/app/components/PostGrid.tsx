import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { getPublishedPosts, type Post } from "../../data/posts";

const tags = ["All", "AWS", "Terraform", "Docker", "CI/CD", "Kubernetes", "Python", "Linux"];

export function PostCard({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{
        background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)",
        border: hovered ? "1px solid rgba(80,70,229,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        textDecoration: "none",
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: post.tagColor, background: `${post.tagColor}18`, border: `1px solid ${post.tagColor}38`, borderRadius: "6px", padding: "3px 9px" }}>
          {post.tag}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
          {post.readTime} read
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", lineHeight: 1.35, color: "#fff", letterSpacing: "-0.01em" }}>
        {post.title}
      </h3>

      {/* Excerpt */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", lineHeight: 1.65, color: "rgba(255,255,255,0.5)", flexGrow: 1 }}>
        {post.excerpt || "Read more"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>{post.date}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "#a5b4fc", display: "flex", alignItems: "center", gap: "4px" }}>
          Read <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ height: "20px", width: "80px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "16px", width: "100%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "16px", width: "75%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "60px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

export function PostGrid() {
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const posts = getPublishedPosts();
  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag || p.tags.includes(activeTag));
  const visible = filtered.slice(0, visibleCount);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + 2);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); setVisibleCount(4); }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: "999px",
              border: activeTag === tag ? "1px solid rgba(80,70,229,0.7)" : "1px solid rgba(255,255,255,0.1)",
              background: activeTag === tag ? "rgba(80,70,229,0.2)" : "transparent",
              color: activeTag === tag ? "#a5b4fc" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {visible.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {loading && [1, 2].map((i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* Load more */}
      {visibleCount < filtered.length && !loading && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.3)", borderRadius: "8px", padding: "10px 28px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.12)")}
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}
