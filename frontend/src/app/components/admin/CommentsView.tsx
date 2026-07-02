import type { ReactNode } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { postsReadAllPosts } from "@/client/sdk.gen";
import { getPostComments, deleteComment, type Comment } from "@/lib/comments";

/* --- helpers --- */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* --- types --- */
interface FlatComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  postTitle: string;
  postSlug: string;
  body: string;
  date: string;
  likes: number;
}

/* --- UI bits --- */
function Avatar({
  initials,
  color,
}: {
  initials: string;
  color: string;
}) {
  return (
    <div
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: `${color}28`,
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.65rem",
          fontWeight: 700,
          color,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "7px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color ?? "rgba(255,255,255,0.4)",
        transition: "background 0.13s, color 0.13s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color ?? "#fff";
        e.currentTarget.style.background = color
          ? `${color}18`
          : "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = color ?? "rgba(255,255,255,0.4)";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {icon}
    </button>
  );
}

/* --- flatten comment tree --- */
function flattenComments(
  comments: Comment[],
  postTitle: string,
  postSlug: string,
): FlatComment[] {
  const result: FlatComment[] = [];
  const walk = (c: Comment) => {
    result.push({
      id: c.id,
      authorName: c.author?.full_name || "Anonymous",
      authorAvatar: getInitials(c.author?.full_name ?? "A"),
      postTitle,
      postSlug,
      body: c.body,
      date: formatDate(c.created_at),
      likes: c.likes_count ?? 0,
    });
    c.replies?.forEach(walk);
  };
  comments.forEach(walk);
  return result;
}

type SortKey = "name" | "date";
type SortDir = "asc" | "desc";

export function CommentsView() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* fetch all posts (admin endpoint) */
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["adminPosts"],
    queryFn: () => postsReadAllPosts({ throwOnError: true }),
  });

  /* fetch comments for every post */
  const postIds =
    postsData?.data?.posts.map((p) => p.id) ?? [];

  const { data: commentChunks, isLoading: commentsLoading } = useQuery({
    queryKey: ["adminComments", postIds],
    queryFn: async () => {
      const chunks: { postId: string; postTitle: string; postSlug: string; comments: Comment[] }[] = [];
      for (const post of postsData?.data?.posts ?? []) {
        try {
          const comments = await getPostComments(post.id);
          chunks.push({
            postId: post.id,
            postTitle: post.title,
            postSlug: post.slug,
            comments,
          });
        } catch {
          // skip posts we cannot load comments for
        }
      }
      return chunks;
    },
    enabled: postIds.length > 0,
  });

  /* flattened comments */
  const flatComments: FlatComment[] =
    commentChunks?.flatMap((c) =>
      flattenComments(c.comments, c.postTitle, c.postSlug),
    ) ?? [];

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = flatComments
    .filter(
      (c) =>
        !search ||
        c.authorName.toLowerCase().includes(search.toLowerCase()) ||
        c.postTitle.toLowerCase().includes(search.toLowerCase()) ||
        c.body.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? a.authorName.localeCompare(b.authorName)
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["adminComments"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const isLoading = postsLoading || commentsLoading;

  const thStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "10px 14px",
    textAlign: "left",
    whiteSpace: "nowrap",
    userSelect: "none",
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={11} style={{ color: "#a5b4fc" }} />
      ) : (
        <ChevronDown size={11} style={{ color: "#a5b4fc" }} />
      )
    ) : (
      <ChevronUp size={11} style={{ opacity: 0.2 }} />
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* search row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "8px",
            padding: "7px 12px",
            minWidth: "200px",
          }}
          onFocusCapture={(e) =>
            (e.currentTarget.style.borderColor = "rgba(80,70,229,0.45)")
          }
          onBlurCapture={(e) =>
            (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")
          }
        >
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments..."
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8125rem",
              color: "#fff",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("name")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Commenter <SortIcon col="name" />
                  </span>
                </th>
                <th style={{ ...thStyle }}>Post</th>
                <th style={{ ...thStyle }}>Comment</th>
                <th
                  style={{ ...thStyle, cursor: "pointer" }}
                  onClick={() => handleSort("date")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Date <SortIcon col="date" />
                  </span>
                </th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "52px 24px", textAlign: "center" }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.875rem",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      Loading comments...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: "52px 24px", textAlign: "center" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.3)",
                        margin: "0 0 6px",
                      }}
                    >
                      {search
                        ? "No comments match your search"
                        : "No comments yet"}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.8125rem",
                          color: "#a5b4fc",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const isDeleting = deleteId === c.id;
                  const isLast = idx === filtered.length - 1;
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: !isLast
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                        background: "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.025)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Commenter */}
                      <td style={{ padding: "13px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                          }}
                        >
                          <Avatar
                            initials={c.authorAvatar}
                            color="#a5b4fc"
                          />
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: "#fff",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.authorName}
                          </span>
                        </div>
                      </td>

                      {/* Post title */}
                      <td
                        style={{
                          padding: "13px 14px",
                          maxWidth: "200px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.78rem",
                            color: "rgba(255,255,255,0.5)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {c.postTitle}
                        </span>
                      </td>

                      {/* Snippet */}
                      <td
                        style={{
                          padding: "13px 14px",
                          maxWidth: "280px",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.8125rem",
                            color: "rgba(255,255,255,0.6)",
                            margin: 0,
                            lineHeight: 1.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {c.body}
                        </p>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "13px 14px" }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.35)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.date}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 14px" }}>
                        {isDeleting ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.72rem",
                                color: "#f87171",
                              }}
                            >
                              Delete?
                            </span>
                            <button
                              onClick={() =>
                                deleteMutation.mutate(c.id, {
                                  onSettled: () =>
                                    setDeleteId((prev) =>
                                      prev === c.id ? null : prev,
                                    ),
                                })
                              }
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                color: "#fff",
                                background: "#dc2626",
                                border: "none",
                                borderRadius: "4px",
                                padding: "2px 7px",
                                cursor: "pointer",
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "0.68rem",
                                color: "rgba(255,255,255,0.5)",
                                background: "rgba(255,255,255,0.06)",
                                border: "none",
                                borderRadius: "4px",
                                padding: "2px 7px",
                                cursor: "pointer",
                              }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: "2px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <ActionButton
                              icon={<Trash2 size={15} />}
                              label="Delete"
                              color="#f87171"
                              onClick={() => setDeleteId(c.id)}
                            />
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

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "0.72rem",
          color: "rgba(255,255,255,0.25)",
          textAlign: "center",
        }}
      >
        {filtered.length} comment{filtered.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
