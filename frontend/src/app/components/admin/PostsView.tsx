import { useState } from "react";
import { Pencil, Trash2, AlertTriangle, SearchX, Eye, ChevronUp, ChevronDown } from "lucide-react";

interface Post {
  id: number;
  title: string;
  tag: string;
  tagColor: string;
  status: "published" | "draft";
  views: number;
  date: string;
}

const ALL_POSTS: Post[] = [
  { id: 1, title: "Zero-Downtime Blue-Green Deployments with Terraform and AWS ECS", tag: "Terraform", tagColor: "#8b5cf6", status: "published", views: 2847, date: "Jun 10, 2026" },
  { id: 2, title: "Setting Up a Multi-Region S3 Replication with Lifecycle Policies",  tag: "AWS",       tagColor: "#f97316", status: "published", views: 2110, date: "Jun 8, 2026"  },
  { id: 3, title: "Multi-Stage Docker Builds: Shrinking Node.js Images from 1.2GB to 90MB", tag: "Docker", tagColor: "#06b6d4", status: "published", views: 1893, date: "Jun 5, 2026"  },
  { id: 4, title: "GitHub Actions Matrix Strategies for Parallel Test Pipelines",     tag: "CI/CD",    tagColor: "#22c55e", status: "published", views: 1540, date: "May 29, 2026" },
  { id: 5, title: "Horizontal Pod Autoscaling with Custom Prometheus Metrics",         tag: "Kubernetes", tagColor: "#5046e5", status: "published", views: 1204, date: "May 22, 2026" },
  { id: 6, title: "Managing Terraform State in Teams: S3 Backend + DynamoDB Locking", tag: "Terraform", tagColor: "#8b5cf6", status: "published", views: 980,  date: "May 15, 2026" },
  { id: 7, title: "Systemd Socket Activation: Zero-Downtime Service Reloads",         tag: "Linux",    tagColor: "#f59e0b", status: "published", views: 743,  date: "May 9, 2026"  },
  { id: 8, title: "Draft: KEDA-Based Autoscaling During Canary Deployments",          tag: "Kubernetes", tagColor: "#5046e5", status: "draft",     views: 0,    date: "Jun 12, 2026" },
  { id: 9, title: "Draft: CloudWatch Composite Alarms for Multi-Signal Rollback",     tag: "AWS",      tagColor: "#f97316", status: "draft",     views: 0,    date: "Jun 11, 2026" },
  { id: 10, title: "Draft: Building a Lightweight CI Pipeline with Nix + GitHub Actions", tag: "CI/CD", tagColor: "#22c55e", status: "draft",    views: 0,    date: "Jun 9, 2026"  },
];

type SortKey = "title" | "views" | "date" | "status";
type SortDir = "asc" | "desc";

interface Props {
  search: string;
  onEditPost?: (title: string) => void;
}

export function PostsView({ search, onEditPost }: Props) {
  const [posts, setPosts] = useState<Post[]>(ALL_POSTS);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setConfirmDeleteId(null);
  };

  const filtered = posts
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.status.includes(q);
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title")  cmp = a.title.localeCompare(b.title);
      if (sortKey === "views")  cmp = a.views - b.views;
      if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      if (sortKey === "date")   cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} style={{ opacity: 0.2 }} />;
    return sortDir === "asc" ? <ChevronUp size={12} style={{ color: "#a5b4fc" }} /> : <ChevronDown size={12} style={{ color: "#a5b4fc" }} />;
  };

  const thStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "11px 16px",
    textAlign: "left",
    whiteSpace: "nowrap",
    userSelect: "none",
  };
  const tdStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.75)",
    padding: "14px 16px",
    verticalAlign: "middle",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Table summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          {filtered.length} {filtered.length === 1 ? "post" : "posts"}{search ? ` matching "${search}"` : ""}
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["published", "draft"] as const).map((s) => (
            <span key={s} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: s === "published" ? "#4ade80" : "#fbbf24", background: s === "published" ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${s === "published" ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "999px", padding: "3px 10px" }}>
              {posts.filter((p) => p.status === s).length} {s}
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {(["title", "tag", "status", "views", "date"] as const).map((col) => {
                  const labels: Record<string, string> = { title: "Title", tag: "Tag", status: "Status", views: "Views", date: "Date" };
                  const sortable = col !== "tag";
                  return (
                    <th
                      key={col}
                      style={{ ...thStyle, cursor: sortable ? "pointer" : "default", width: col === "title" ? "auto" : col === "tag" ? "110px" : col === "status" ? "110px" : col === "views" ? "90px" : "130px" }}
                      onClick={() => sortable && handleSort(col as SortKey)}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        {labels[col]}
                        {sortable && <SortIcon col={col as SortKey} />}
                      </span>
                    </th>
                  );
                })}
                <th style={{ ...thStyle, width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 24px", textAlign: "center" }}>
                    <SearchX size={36} color="rgba(255,255,255,0.12)" style={{ margin: "0 auto 14px", display: "block" }} />
                    <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.0625rem", color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>
                      No posts found
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                      Try a different search term or clear the filter
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((post, idx) => {
                  const isDeleting = confirmDeleteId === post.id;
                  const rowBg = isDeleting ? "rgba(239,68,68,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)";
                  return (
                    <tr
                      key={post.id}
                      style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: rowBg, transition: "background 0.15s" }}
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
                      </td>

                      {/* Tag */}
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: post.tagColor, background: `${post.tagColor}18`, border: `1px solid ${post.tagColor}30`, borderRadius: "6px", padding: "3px 9px", whiteSpace: "nowrap" }}>
                          {post.tag}
                        </span>
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
                          {post.views.toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
                        {post.date}
                      </td>

                      {/* Actions */}
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {isDeleting ? (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <AlertTriangle size={13} color="#f87171" />
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", whiteSpace: "nowrap" }}>Sure?</span>
                            <button
                              onClick={() => handleDelete(post.id)}
                              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#fff", background: "#dc2626", border: "none", borderRadius: "5px", padding: "3px 9px", cursor: "pointer" }}
                            >
                              Delete
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
                              onClick={() => onEditPost?.(post.title)}
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

      {/* Pagination hint */}
      {filtered.length > 0 && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 }}>
          Showing {filtered.length} of {posts.length} posts
        </p>
      )}
    </div>
  );
}
