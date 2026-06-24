// PostGrid.tsx
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { postsReadPosts } from "@/client/sdk.gen"; // exists after pnpm generate-client
import type { PostResponse } from "@/client/types.gen";

// ─── Tag filter list ────────────────────────────────────────────────────────
// TODO Phase 3: replace this hardcoded list with GET /tags once that
// endpoint exists. For now it stays static.
const TAGS = ["All", "AWS", "Terraform", "Docker", "CI/CD", "Kubernetes", "Python", "Linux"];

// ─── PostCard ────────────────────────────────────────────────────────────────
// Two field references changed from the mock version:
//   post.tag       → post.tags[0]?.name    (tags is now an array from the backend)
//   post.tagColor  → post.tags[0]?.color
//   post.readTime  → post.read_time        (snake_case, matches backend response)
//   post.date      → formatDate(post.published_at)
export function PostCard({ post }: { post: PostResponse }) {
  const [hovered, setHovered] = useState(false);

  const primaryTag = post.tags?.[0];
  const tagName  = primaryTag?.name  ?? "";
  const tagColor = primaryTag?.color ?? "#6366f1";

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${post.slug}`}
      style={{
        background: hovered ? "rgba(240,168,107,0.04)" : "transparent",
        border: hovered
          ? "1px solid #4a3f33"
          : "1px solid #2d2720",
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
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600,
          color: tagColor,
          background: `${tagColor}18`,
          border: `1px solid ${tagColor}38`,
          borderRadius: "6px", padding: "3px 9px",
        }}>
          {tagName}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "rgba(255,255,255,0.3)",
        }}>
          {post.read_time} read
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Fraunces', serif", fontWeight: 700,
        fontSize: "1.0625rem", lineHeight: 1.35,
        color: "#fff", letterSpacing: "-0.01em",
      }}>
        {post.title}
      </h3>

      {/* Excerpt */}
      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
        lineHeight: 1.65, color: "rgba(255,255,255,0.5)", flexGrow: 1,
      }}>
        {post.excerpt || "Read more"}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}
      >
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.68rem", color: "rgba(255,255,255,0.3)",
        }}>
          {formattedDate}
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

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
// Unchanged — purely visual, no data dependency.
export function SkeletonCard() {
  return (
    <div style={{
      background: "transparent",
      border: "1px solid #2d2720",
      borderRadius: "12px", padding: "24px",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ height: "20px", width: "80px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "16px", width: "100%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "16px", width: "75%", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "60px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

// ─── PostGrid ─────────────────────────────────────────────────────────────────
export function PostGrid() {
  const [activeTag, setActiveTag]   = useState("All");
  const [page, setPage]             = useState(1);
  const [allPosts, setAllPosts]     = useState<PostResponse[]>([]);

  // useQuery fetches (and re-fetches) whenever page or activeTag changes.
  // TanStack Query handles the loading/error states — no manual setLoading needed.
  const { data, isFetching, isError } = useQuery({
    queryKey: ["posts", { page, activeTag }],
    queryFn: () =>
      postsReadPosts({
        query: {
          page,
          limit: 10,
          tag: activeTag !== "All" ? activeTag : undefined,
        },
      }),
    placeholderData: (prev) => prev, // keeps old results visible while next page loads
  });

  // Accumulate pages into allPosts.
  // When page resets to 1 (tag change), replace instead of appending.
  useEffect(() => {
    if (!data?.data?.posts) return;
    if (page === 1) {
      setAllPosts(data.data.posts);
    } else {
      setAllPosts((prev) => [...prev, ...data.data.posts]);
    }
  }, [data, page]);

  const total        = data?.data?.total ?? 0;
  const hasMore      = allPosts.length < total;

  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setPage(1);         // reset to first page — the useEffect above detects page===1
    setAllPosts([]);    // clear accumulated list immediately so old posts don't flash
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1); // triggers useQuery refetch, useEffect appends results
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagChange(tag)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8125rem", fontWeight: 500,
              padding: "6px 14px", borderRadius: "999px",
              border: activeTag === tag
                ? "1px solid rgba(224,123,57,0.7)"
                : "1px solid rgba(255,255,255,0.1)",
              background: activeTag === tag ? "rgba(224,123,57,0.2)" : "transparent",
              color: activeTag === tag ? "#f0a86b" : "rgba(255,255,255,0.5)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <p style={{ color: "rgba(255,100,100,0.8)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
          Failed to load posts. Please try again.
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {/* Show skeletons during any fetch — initial load or load more */}
        {isFetching && [1, 2].map((i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      {/* Load more */}
      {hasMore && !isFetching && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            style={{
              fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500,
              color: "#f0a86b", background: "rgba(224,123,57,0.12)",
              border: "1px solid rgba(224,123,57,0.3)", borderRadius: "8px",
              padding: "10px 28px", cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(224,123,57,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(224,123,57,0.12)")}
          >
            Load More Posts
          </button>
        </div>
      )}
    </div>
  );
}
