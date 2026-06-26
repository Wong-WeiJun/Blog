import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPostsByTag } from "../../data/posts";
import type { Post } from "../../data/posts";
import { SkeletonCard } from "./PostGrid";

function ArchivePostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{
        background: "transparent",
        border: "1px solid #2d2720",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        textDecoration: "none",
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
      }}
      className="post-card-hover"
    >
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600,
          color: post.tagColor,
          background: `${post.tagColor}18`,
          border: `1px solid ${post.tagColor}38`,
          borderRadius: "6px", padding: "3px 9px",
        }}>
          {post.tag}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "rgba(255,255,255,0.3)",
        }}>
          {post.readTime || "—"}
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Fraunces', serif", fontWeight: 700,
        fontSize: "1.0625rem", lineHeight: 1.35,
        color: "#fff", letterSpacing: "-0.01em",
      }}>
        {post.title}
      </h3>

      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
        lineHeight: 1.65, color: "rgba(255,255,255,0.5)", flexGrow: 1,
      }}>
        {post.excerpt || "Read more"}
      </p>

      <div
        className="flex items-center justify-between mt-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "rgba(255,255,255,0.3)",
        }}>
          {post.date}
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem",
          fontWeight: 500, color: "#f0a86b",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          Read <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}

export function TagArchivePage() {
  const { tag } = useParams<{ tag: string }>();
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(
    () => (tag ? getPostsByTag(tag) : []),
    [tag]
  );
  const visible = filtered.slice(0, visibleCount);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((c) => c + 2);
      setLoading(false);
    }, 800);
  };

  const tagColor = filtered[0]?.tagColor ?? "#a5b4fc";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(8,10,26,0.95)",
          backdropFilter: "blur(12px)",
          height: "52px",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          gap: "16px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.45)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.15s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "#fff")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
          }
        >
          <ArrowLeft size={15} />
          Blog
        </Link>
        <div
          style={{
            width: "1px",
            height: "18px",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
          }}
        >
          Tag Archive
        </span>
      </div>

      {/* main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
            paddingBottom: "32px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 10px",
              }}
            >
              Posts tagged in
            </p>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {tag}
            </h1>
          </div>

          {/* Count badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: tagColor,
              background: `${tagColor}18`,
              border: `1px solid ${tagColor}40`,
              borderRadius: "999px",
              padding: "7px 16px",
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {visible.map((post) => (
            <ArchivePostCard key={post.id} post={post} />
          ))}
          {loading &&
            [1, 2].map((i) => <SkeletonCard key={`sk-${i}`} />)}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
            }}
          >
            <p
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 12px",
              }}
            >
              No posts found
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.35)",
                margin: 0,
              }}
            >
              There are no posts tagged with &quot;{tag}&quot; yet.
            </p>
          </div>
        )}

        {/* Load more */}
        {visibleCount < filtered.length && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#a5b4fc",
                background: "rgba(80,70,229,0.12)",
                border: "1px solid rgba(80,70,229,0.3)",
                borderRadius: "8px",
                padding: "10px 28px",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(80,70,229,0.22)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(80,70,229,0.12)")
              }
            >
              Load More Posts
            </button>
          </div>
        )}

        {/* End of list indicator */}
        {visibleCount >= filtered.length && filtered.length > 0 && !loading && (
          <p
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            — {filtered.length} of {filtered.length} posts —
          </p>
        )}
      </main>
    </div>
  );
}
