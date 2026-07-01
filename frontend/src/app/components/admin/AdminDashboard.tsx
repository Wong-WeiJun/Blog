import { useNavigate } from "react-router";
import { useAuth } from "../../../lib/auth-context";
import { AdminSidebar, type AdminView } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { OverviewView } from "./OverviewView";
import { PostsView } from "./PostsView";
import { AdminProfileView } from "./AdminProfileView";
import { PlaceholderView } from "./PlaceholderView";
import { PostEditor } from "./PostEditor";
import { CommentsView } from "./CommentsView";
import { AnalyticsView } from "./AnalyticsView";
import { useState } from "react";
import type { PostResponse } from "@/client/types.gen";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [view, setView]                         = useState<AdminView>("overview");
  const [search, setSearch]                     = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorOpen, setEditorOpen]             = useState(false);
  const [editingPost, setEditingPost]           = useState<PostResponse | null>(null);

  const handleNavigate = (v: AdminView) => { setView(v); setSearch(""); };
  const handleExit     = () => navigate("/");
  const handleLogout   = () => { logout(); navigate("/"); };

  const openNewPost  = () => { setEditingPost(null); setEditorOpen(true); };
  const openEditPost = (post: PostResponse) => { setEditingPost(post); setEditorOpen(true); };
  const closeEditor  = () => { setEditorOpen(false); setEditingPost(null); };
  const handlePublished = () => { closeEditor(); setView("posts"); };

  if (editorOpen) {
    return <PostEditor onBack={closeEditor} onPublished={handlePublished} post={editingPost} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#080a1a", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar activeView={view} onNavigate={handleNavigate} collapsed={sidebarCollapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AdminTopBar
          view={view}
          search={search}
          onSearch={setSearch}
          onNewPost={openNewPost}
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 28px 48px" }}>
          {/* Breadcrumb + exit */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Dashboard</span>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>/</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>{view}</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={handleLogout}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(248,113,113,0.6)", background: "transparent", border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: "5px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(248,113,113,0.6)")}
            >
              Sign out
            </button>
            <button
              onClick={handleExit}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: "5px", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              ← Exit Admin
            </button>
          </div>

          {view === "overview"  && <OverviewView />}
          {view === "posts"     && <PostsView search={search} onEditPost={openEditPost} onNewPost={openNewPost} />}
          {view === "profile"   && <AdminProfileView />}
          {view === "comments"  && <CommentsView />}
          {view === "tags"      && <PlaceholderView label="Tags" />}
          {view === "analytics" && <AnalyticsView />}
        </main>
      </div>
    </div>
  );
}
