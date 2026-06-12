import { useState } from "react";
import { CheckCircle, AlertOctagon, Trash2, Reply, ChevronDown, ChevronUp, Search, AlertTriangle } from "lucide-react";

type CommentStatus = "pending" | "approved" | "spam";

interface Comment {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  postTitle: string;
  snippet: string;
  date: string;
  status: CommentStatus;
}

const SEED: Comment[] = [
  { id: 1,  name: "Sarah Chen",     initials: "SC", avatarColor: "#06b6d4", postTitle: "Zero-Downtime Blue-Green Deployments with Terraform", snippet: "This is exactly the write-up I needed. I've been wrestling with the target group drain timeout causing 30-second blips during deploys.",                  date: "Jun 11, 2026", status: "pending"  },
  { id: 2,  name: "Marcus Rivera",  initials: "MR", avatarColor: "#8b5cf6", postTitle: "Zero-Downtime Blue-Green Deployments with Terraform", snippet: "Does this approach work with Fargate Spot capacity? I'm worried about Spot interruptions mid-switch causing a hard cutover.",                             date: "Jun 10, 2026", status: "pending"  },
  { id: 3,  name: "Priya Nair",     initials: "PN", avatarColor: "#f97316", postTitle: "Multi-Stage Docker Builds: Shrinking Node.js Images",  snippet: "Adding to this — we use a mix of On-Demand for the switch window and Spot for steady-state. Capacity provider strategies with base on On-Demand handle it.", date: "Jun 10, 2026", status: "pending"  },
  { id: 4,  name: "Tom Weston",     initials: "TW", avatarColor: "#22c55e", postTitle: "GitHub Actions Matrix Strategies",                     snippet: "I had a similar issue with cache busting between matrix legs. Setting cache-key to include the runner OS fixed it for us.",                              date: "Jun 9, 2026",  status: "approved" },
  { id: 5,  name: "Lin Xiaodan",    initials: "LX", avatarColor: "#a5b4fc", postTitle: "Managing Terraform State in Teams",                    snippet: "Great post! One addition: you should also enable DynamoDB point-in-time recovery on the lock table. Saved us twice from botched runs.",               date: "Jun 8, 2026",  status: "approved" },
  { id: 6,  name: "Ravi Patel",     initials: "RP", avatarColor: "#4ade80", postTitle: "HPA with Custom Prometheus Metrics in K8s",            snippet: "For KEDA users: the `ScaledObject` minReplicaCount should stay at 1 in prod unless you're comfortable with cold-start latency.",                     date: "Jun 7, 2026",  status: "approved" },
  { id: 7,  name: "Amara Diallo",   initials: "AD", avatarColor: "#f59e0b", postTitle: "Systemd Socket Activation",                           snippet: "This saved me hours of head-scratching. The bit about Type=notify and the 30s grace window is not documented clearly anywhere else.",                  date: "Jun 6, 2026",  status: "approved" },
  { id: 8,  name: "SEO Bot 9000",   initials: "SB", avatarColor: "#ef4444", postTitle: "Zero-Downtime Blue-Green Deployments with Terraform", snippet: "Check out our amazing DevOps course for $9.99! Limited time offer. Click here: http://spam-link.example.com/buy-now?ref=blog",                        date: "Jun 5, 2026",  status: "spam"     },
  { id: 9,  name: "Promo King",     initials: "PK", avatarColor: "#ef4444", postTitle: "Multi-Stage Docker Builds: Shrinking Node.js Images",  snippet: "Wow great article!! Buy cheap Docker proxies here: http://cheap-proxies.biz — use code BLOG10 for discount!! 🚀🚀🚀",                                   date: "Jun 4, 2026",  status: "spam"     },
  { id: 10, name: "Nadia Kovacs",   initials: "NK", avatarColor: "#818cf8", postTitle: "Setting Up Multi-Region S3 Replication",              snippet: "Worth mentioning that cross-region replication doesn't replicate existing objects retroactively — you need an S3 Batch job to backfill.",              date: "Jun 12, 2026", status: "pending"  },
  { id: 11, name: "Dev Sharma",     initials: "DS", avatarColor: "#34d399", postTitle: "Managing Terraform State in Teams",                    snippet: "Also consider workspace-level state isolation — we had a prod incident from a misapplied plan that targeted the wrong workspace.",                     date: "Jun 11, 2026", status: "pending"  },
];

type SortKey = "name" | "date";
type SortDir = "asc" | "desc";

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `${color}28`, border: `1.5px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, color }}>{initials}</span>
    </div>
  );
}

function ActionButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color?: string; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{ width: "30px", height: "30px", borderRadius: "7px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: color ?? "rgba(255,255,255,0.4)", transition: "background 0.13s, color 0.13s" }}
      onMouseEnter={e => { e.currentTarget.style.color = color ?? "#fff"; e.currentTarget.style.background = color ? `${color}18` : "rgba(255,255,255,0.07)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = color ?? "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
    </button>
  );
}

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <AlertTriangle size={12} color="#f87171" />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f87171" }}>Delete?</span>
      <button onClick={onConfirm} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 700, color: "#fff", background: "#dc2626", border: "none", borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>Yes</button>
      <button onClick={onCancel} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>No</button>
    </div>
  );
}

function ReplyDrawer({ comment, onClose }: { comment: Comment; onClose: () => void }) {
  const [text, setText] = useState("");
  return (
    <tr>
      <td colSpan={5} style={{ padding: "0 16px 12px 60px", background: "rgba(80,70,229,0.04)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px 16px", background: "rgba(80,70,229,0.06)", border: "1px solid rgba(80,70,229,0.2)", borderRadius: "9px" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(165,180,252,0.7)", margin: 0 }}>
            Replying to <strong style={{ color: "#a5b4fc" }}>{comment.name}</strong>
          </p>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder="Write your reply…"
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            onFocus={e => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", background: text.trim() ? "#5046e5" : "rgba(80,70,229,0.3)", border: "none", borderRadius: "7px", padding: "7px 16px", cursor: text.trim() ? "pointer" : "default", transition: "background 0.15s" }}
            >
              Send Reply
            </button>
            <button onClick={onClose} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "7px 12px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function CommentsView() {
  const [comments, setComments]       = useState<Comment[]>(SEED);
  const [tab, setTab]                 = useState<CommentStatus>("pending");
  const [search, setSearch]           = useState("");
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [replyId, setReplyId]         = useState<number | null>(null);
  const [sortKey, setSortKey]         = useState<SortKey>("date");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");

  const approve = (id: number) => setComments(p => p.map(c => c.id === id ? { ...c, status: "approved" } : c));
  const spam    = (id: number) => setComments(p => p.map(c => c.id === id ? { ...c, status: "spam" }    : c));
  const remove  = (id: number) => { setComments(p => p.filter(c => c.id !== id)); setDeleteId(null); };
  const restore = (id: number) => setComments(p => p.map(c => c.id === id ? { ...c, status: "pending" } : c));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = comments
    .filter(c => c.status === tab)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.postTitle.toLowerCase().includes(search.toLowerCase()) || c.snippet.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const cmp = sortKey === "name" ? a.name.localeCompare(b.name) : new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

  const counts: Record<CommentStatus, number> = {
    pending:  comments.filter(c => c.status === "pending").length,
    approved: comments.filter(c => c.status === "approved").length,
    spam:     comments.filter(c => c.status === "spam").length,
  };

  const thStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 700,
    color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em",
    padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap", userSelect: "none",
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    sortKey === col
      ? (sortDir === "asc" ? <ChevronUp size={11} style={{ color: "#a5b4fc" }} /> : <ChevronDown size={11} style={{ color: "#a5b4fc" }} />)
      : <ChevronUp size={11} style={{ opacity: 0.2 }} />
  );

  const TABS: { key: CommentStatus; label: string }[] = [
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "spam",     label: "Spam"     },
  ];

  const tabColors: Record<CommentStatus, string> = { pending: "#fbbf24", approved: "#4ade80", spam: "#f87171" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tabs + search row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setReplyId(null); setDeleteId(null); }}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: tab === key ? 600 : 400, color: tab === key ? "#fff" : "rgba(255,255,255,0.45)", background: tab === key ? "rgba(255,255,255,0.06)" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
              {label}
              {counts[key] > 0 && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", fontWeight: 700, color: tab === key ? tabColors[key] : "rgba(255,255,255,0.3)", background: tab === key ? `${tabColors[key]}18` : "rgba(255,255,255,0.06)", borderRadius: "999px", padding: "1px 7px" }}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "7px 12px", minWidth: "200px" }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(80,70,229,0.45)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
        >
          <Search size={13} color="rgba(255,255,255,0.3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comments…" style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#fff", width: "100%" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("name")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>Commenter <SortIcon col="name" /></span>
                </th>
                <th style={{ ...thStyle }}>Post</th>
                <th style={{ ...thStyle }}>Comment</th>
                <th style={{ ...thStyle, cursor: "pointer" }} onClick={() => handleSort("date")}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>Date <SortIcon col="date" /></span>
                </th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "52px 24px", textAlign: "center" }}>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.3)", margin: "0 0 6px" }}>
                      {search ? "No comments match your search" : `No ${tab} comments`}
                    </p>
                    {search && (
                      <button onClick={() => setSearch("")} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "#a5b4fc", background: "none", border: "none", cursor: "pointer" }}>
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.flatMap((c, idx) => {
                  const isReplying = replyId === c.id;
                  const isDeleting = deleteId === c.id;
                  const isLast     = idx === filtered.length - 1;

                  const row = (
                    <tr
                      key={`row-${c.id}`}
                      style={{ borderBottom: (!isLast || isReplying) ? "1px solid rgba(255,255,255,0.05)" : "none", background: isReplying ? "rgba(80,70,229,0.04)" : "transparent", transition: "background 0.15s" }}
                      onMouseEnter={e => { if (!isReplying) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                      onMouseLeave={e => { if (!isReplying) e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Commenter */}
                      <td style={{ padding: "13px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <Avatar initials={c.initials} color={c.avatarColor} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>{c.name}</span>
                        </div>
                      </td>

                      {/* Post title */}
                      <td style={{ padding: "13px 14px", maxWidth: "200px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {c.postTitle}
                        </span>
                      </td>

                      {/* Snippet */}
                      <td style={{ padding: "13px 14px", maxWidth: "280px" }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {c.snippet}
                        </p>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "13px 14px" }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{c.date}</span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "13px 14px" }}>
                        {isDeleting ? (
                          <DeleteConfirm onConfirm={() => remove(c.id)} onCancel={() => setDeleteId(null)} />
                        ) : (
                          <div style={{ display: "flex", gap: "2px", justifyContent: "flex-end" }}>
                            {tab === "pending" && (
                              <ActionButton icon={<CheckCircle size={15} />} label="Approve" color="#4ade80" onClick={() => approve(c.id)} />
                            )}
                            {tab === "approved" && (
                              <ActionButton icon={<AlertOctagon size={15} />} label="Mark as spam" color="#f87171" onClick={() => spam(c.id)} />
                            )}
                            {tab === "spam" && (
                              <ActionButton icon={<CheckCircle size={15} />} label="Restore (mark approved)" color="#4ade80" onClick={() => restore(c.id)} />
                            )}
                            {tab !== "spam" && (
                              <ActionButton icon={<Reply size={15} />} label="Reply" color="#a5b4fc" onClick={() => setReplyId(replyId === c.id ? null : c.id)} />
                            )}
                            {tab === "pending" && (
                              <ActionButton icon={<AlertOctagon size={15} />} label="Mark as spam" color="#f97316" onClick={() => spam(c.id)} />
                            )}
                            <ActionButton icon={<Trash2 size={15} />} label="Delete" color="#f87171" onClick={() => setDeleteId(c.id)} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );

                  if (isReplying) {
                    return [row, <ReplyDrawer key={`reply-${c.id}`} comment={c} onClose={() => setReplyId(null)} />];
                  }
                  return [row];
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
        {filtered.length} of {counts[tab]} {tab} comment{counts[tab] !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
