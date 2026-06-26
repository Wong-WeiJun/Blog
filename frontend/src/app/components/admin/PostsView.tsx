import type { CSSProperties } from "react";
import { useState } from "react";
import { Pencil, Trash2, AlertTriangle, SearchX, Eye, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsReadAllPosts, postsDeletePost } from "@/client/sdk.gen";
import type { PostResponse } from "@/client/types.gen";
import useCustomToast from "../../../hooks/useCustomToast";

type SortKey = "title" | "view_count" | "published_at" | "status";
type SortDir = "asc" | "desc";

interface Props {
  search: string;
  onEditPost?: (post: PostResponse) => void;
  onNewPost?: () => void;
}

export function PostsView({ search, onEditPost, onNewPost }: Props) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("published_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Fetch all posts (including drafts) — admin sees everything
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-posts", { page, search }],
    queryFn: () =>
      postsReadAllPosts({
        query: { page, limit: 20, search: search || undefined },
      }),
  });

  const posts: PostResponse[] = data?.data?.posts ?? [];
  const total: number = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const deleteMutation = useMutation({
    mutationFn: (postId: string) =>
      postsDeletePost({ path: { post_id: postId } }),
    onSuccess: () => {
      showSuccessToast("Post deleted.");
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => showErrorToast("Failed to delete post."),
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...posts].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "title")       cmp = a.title.localeCompare(b.title);
    if (sortKey === "view_count")  cmp = (a.view_count ?? 0) - (b.view_count ?? 0);
    if (sortKey === "status")      cmp = a.status.localeCompare(b.status);
    if (sortKey === "published_at") {
      const aT = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bT = b.published_at ? new Date(b.published_at).getTime() : 0;
      cmp = aT - bT;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} style={{ opacity: 0.2 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={12} style={{ color: "#a5b4fc" }} />
      : <ChevronDown size={12} style={{ color: "#a5b4fc" }} />;
  };

  const thStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.72rem", fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase", letterSpacing: "0.07em",
    padding: "11px 16px", textAlign: "left",
    whiteSpace: "nowrap", userSelect: "none",
  };
  const tdStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.875rem", color: "rgba(255,255,255,0.75)",
    padding: "14px 16px", verticalAlign: "middle",
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Summary row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          {isLoading ? "Loading…" : `${total} ${total === 1 ? "post" : "posts"}${search ? ` matching "${search}"` : ""}`}
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {([["published", publishedCount], ["draft", draftCount]] as const).map(([s, count]) => (
            <span key={s} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: s === "published" ? "#4ade80" : "#fbbf24", background: s === "published" ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${s === "published" ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "999px", padding: "3px 10px" }}>
              {count} {s}
            </span>
          ))}
          <button
            onClick={onNewPost}
            style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "#fff", background: "#5046e5", border: "none", borderRadius: "7px", padding: "6px 14px", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#5046e5")}
          >
            <Plus size={13} /> New Post
          </button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "12px 16px", margin: 0 }}>
          Failed to load posts. Check your connection and try again.
        </p>
      )}

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {([ ["title", "Title", "auto"], ["tags", "Tags", "120px"], ["status", "Status", "110px"], ["view_count", "Views", "90px"], ["published_at", "Date", "130px"] ] as const).map(([col, label, width]) => {
                  const sortable = col !== "tags";
                  return (
                    <th key={col} style={{ ...thStyle, cursor: sortable ? "pointer" : "default", width }} onClick={() => sortable && handleSort(col as SortKey)}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        {label}
                        {sortable && <SortIcon col={col as SortKey} />}
                      </span>
                    </th>
                  );
                })}
                <th style={{ ...thStyle, width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: "16px" }}>
                        <div style={{ height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s infinite", width: j === 0 ? "200px" : j === 1 ? "60px" : "70px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 24px", textAlign: "center" }}>
                    <SearchX size={36} color="rgba(255,255,255,0.12)" style={{ margin: "0 auto 14px", display: "block" }} />
                    <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.0625rem", color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>No posts found</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                      {search ? "Try a different search term" : "Create your first post to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                sorted.map((post, idx) => {
                  const isDeleting = confirmDeleteId === post.id;
                  const rowBg = isDeleting ? "rgba(239,68,68,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)";
                  const primaryTag = post.tags?.[0];
                  const formattedDate = post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : post.status === "draft" ? "—" : "";

                  return (
                    <tr
                      key={post.id}
                      style={{ borderBottom: idx < sorted.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: rowBg, transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = rowBg; }}
                    >
                      {/* Title */}
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {post.status === "draft" && (
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>DRAFT</span>
                          )}
                          <span style={{ color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px", display: "block" }}>
                            {post.title}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", display: "block", marginTop: "2px" }}>
                          /{post.slug}
                        </span>
                      </td>

                      {/* Tags */}
                      <td style={tdStyle}>
                        {primaryTag ? (
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: primaryTag.color, background: `${primaryTag.color}18`, border: `1px solid ${primaryTag.color}30`, borderRadius: "6px", padding: "3px 9px", whiteSpace: "nowrap" }}>
                            {primaryTag.name}
                          </span>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>—</span>
                        )}
                        {(post.tags?.length ?? 0) > 1 && (
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginLeft: "5px" }}>
                            +{(post.tags?.length ?? 1) - 1}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: post.status === "published" ? "#4ade80" : "#fbbf24", background: post.status === "published" ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${post.status === "published" ? "rgba(74,222,128,0.22)" : "rgba(251,191,36,0.22)"}`, borderRadius: "999px", padding: "3px 10px" }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: post.status === "published" ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
                          {post.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Views */}
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                          <Eye size={12} color="rgba(255,255,255,0.25)" />
                          {(post.view_count ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {isDeleting ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <AlertTriangle size={13} color="#f87171" />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", whiteSpace: "nowrap" }}>Sure?</span>
                            <button
                              onClick={() => deleteMutation.mutate(post.id)}
                              disabled={deleteMutation.isPending}
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#fff", background: "#dc2626", border: "none", borderRadius: "5px", padding: "3px 9px", cursor: "pointer", opacity: deleteMutation.isPending ? 0.6 : 1 }}
                            >
                              {deleteMutation.isPending ? "…" : "Delete"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "5px", padding: "3px 9px", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", gap: "4px" }}>
                            <button
                              title="Edit"
                              onClick={() => onEditPost?.(post)}
                              style={{ padding: "6px", borderRadius: "7px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", transition: "color 0.15s, background 0.15s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#a5b4fc"; e.currentTarget.style.background = "rgba(80,70,229,0.12)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => setConfirmDeleteId(post.id)}
                              style={{ padding: "6px", borderRadius: "7px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", transition: "color 0.15s, background 0.15s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "5px 12px", cursor: page === 1 ? "default" : "pointer" }}
          >
            ← Prev
          </button>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: page === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "5px 12px", cursor: page === totalPages ? "default" : "pointer" }}
          >
            Next →
          </button>
        </div>
      )}

      {sorted.length > 0 && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 }}>
          Showing {sorted.length} of {total} posts
        </p>
      )}
    </div>
  );
}
