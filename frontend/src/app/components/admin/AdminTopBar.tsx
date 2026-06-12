import { Search, Plus, PanelLeftClose, PanelLeftOpen, Bell } from "lucide-react";

const VIEW_TITLES: Record<string, string> = {
  overview:  "Overview",
  posts:     "Posts",
  comments:  "Comment Moderation",
  tags:      "Tags",
  analytics: "Analytics",
  profile:   "Profile",
};

interface Props {
  view: string;
  search: string;
  onSearch: (v: string) => void;
  onNewPost: () => void;
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminTopBar({ view, search, onSearch, onNewPost, collapsed, onToggleSidebar }: Props) {
  return (
    <div
      style={{
        height: "60px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
        flexShrink: 0,
        background: "rgba(10,12,30,0.95)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        style={{ color: "rgba(255,255,255,0.4)", background: "transparent", border: "none", cursor: "pointer", padding: "6px", borderRadius: "7px", display: "flex", transition: "color 0.15s, background 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; }}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Page title */}
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0, flexShrink: 0 }}>
        {VIEW_TITLES[view] ?? "Dashboard"}
      </h1>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "9px", padding: "7px 12px", minWidth: "220px", transition: "border-color 0.15s" }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = "rgba(80,70,229,0.45)")}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
      >
        <Search size={14} color="rgba(255,255,255,0.35)" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", width: "100%" }}
        />
        {search && (
          <button onClick={() => onSearch("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Bell — placeholder */}
      <button
        title="Notifications (coming soon)"
        disabled
        style={{ position: "relative", color: "rgba(255,255,255,0.25)", background: "transparent", border: "none", cursor: "default", padding: "6px", borderRadius: "7px", display: "flex", opacity: 0.5 }}
      >
        <Bell size={18} />
      </button>

      {/* New Post */}
      <button
        onClick={onNewPost}
        style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "9px", padding: "8px 16px", cursor: "pointer", flexShrink: 0, transition: "background 0.15s, transform 0.1s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#4338ca"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#5046e5"; e.currentTarget.style.transform = "none"; }}
      >
        <Plus size={15} />
        New Post
      </button>
    </div>
  );
}
