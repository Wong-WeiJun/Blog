import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";

const tags = ["All", "AWS", "Terraform", "Docker", "CI/CD", "Kubernetes", "Python", "Linux"];

export const posts = [
  {
    id: 1,
    tag: "AWS",
    title: "Setting Up a Multi-Region S3 Replication with Lifecycle Policies",
    excerpt: "A walkthrough of configuring cross-region replication rules, expiration policies, and intelligent-tiering to cut storage costs by 40%.",
    date: "Jun 8, 2026",
    readTime: "7 min",
    color: "#f97316",
  },
  {
    id: 2,
    tag: "Docker",
    title: "Multi-Stage Builds: Shrinking Node.js Images from 1.2GB to 90MB",
    excerpt: "Using build-stage separation, .dockerignore tuning, and Alpine base images to produce lean production containers.",
    date: "Jun 5, 2026",
    readTime: "5 min",
    color: "#06b6d4",
  },
  {
    id: 3,
    tag: "CI/CD",
    title: "GitHub Actions Matrix Strategies for Parallel Test Pipelines",
    excerpt: "How I cut our integration test wall time from 18 minutes to 4 minutes using matrix builds and artifact caching.",
    date: "May 29, 2026",
    readTime: "6 min",
    color: "#22c55e",
  },
  {
    id: 4,
    tag: "Kubernetes",
    title: "Horizontal Pod Autoscaling with Custom Prometheus Metrics",
    excerpt: "Going beyond CPU-based HPA — wiring up KEDA with a Prometheus adapter to scale on queue depth and request latency.",
    date: "May 22, 2026",
    readTime: "9 min",
    color: "#5046e5",
  },
  {
    id: 5,
    tag: "Terraform",
    title: "Managing Terraform State in Teams: S3 Backend + DynamoDB Locking",
    excerpt: "A production-safe remote state setup with encrypted S3, DynamoDB state locks, and workspace isolation per environment.",
    date: "May 15, 2026",
    readTime: "6 min",
    color: "#8b5cf6",
  },
  {
    id: 6,
    tag: "Linux",
    title: "Systemd Socket Activation: Zero-Downtime Service Reloads",
    excerpt: "Leveraging socket activation and Type=notify to achieve seamless process handoffs without dropping a single connection.",
    date: "May 9, 2026",
    readTime: "8 min",
    color: "#f59e0b",
  },
];

export function PostCard({ post, onOpenPost }: { post: typeof posts[0]; onOpenPost?: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)",
        border: hovered ? "1px solid rgba(80,70,229,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        padding: "24px",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpenPost}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: post.color, background: `${post.color}18`, border: `1px solid ${post.color}38`, borderRadius: "6px", padding: "3px 9px" }}>
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
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>{post.date}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "#a5b4fc", display: "flex", alignItems: "center", gap: "4px" }}>
          Read <ArrowRight size={13} />
        </span>
      </div>
    </article>
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

export function PostGrid({ onOpenPost }: { onOpenPost?: () => void }) {
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const filtered = activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag);
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
          <PostCard key={post.id} post={post} onOpenPost={onOpenPost} />
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
