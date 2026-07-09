import type { ReactNode } from "react";
import { Fragment } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, MessageSquare, Tag, BarChart2,
  ExternalLink, UserCircle, FolderGit2, FileUser,
} from "lucide-react";
import { BRAND_NAME, BRAND_DOMAIN } from "../../../lib/constants";
import { useAuth } from "../../../lib/auth-context";

export type AdminView = "overview" | "posts" | "projects" | "comments" | "tags" | "analytics" | "about" | "profile";

const NAV_ITEMS: { id: AdminView; label: string; icon: ReactNode; badge?: number; dividerBefore?: boolean }[] = [
  { id: "overview",   label: "Overview",  icon: <LayoutDashboard size={16} /> },
  { id: "posts",      label: "Posts",     icon: <FileText size={16} />,       badge: 0 },
  { id: "projects",   label: "Projects",  icon: <FolderGit2 size={16} /> },
  { id: "comments",   label: "Comments",  icon: <MessageSquare size={16} />,  badge: 0 },
  { id: "tags",       label: "Tags",      icon: <Tag size={16} /> },
  { id: "analytics",  label: "Analytics", icon: <BarChart2 size={16} /> },
  { id: "about",      label: "About Page", icon: <FileUser size={16} /> },
  { id: "profile",    label: "Profile",   icon: <UserCircle size={16} />,     dividerBefore: true },
];

interface Props {
  activeView: AdminView;
  onNavigate: (v: AdminView) => void;
  collapsed: boolean;
}

export function AdminSidebar({ activeView, onNavigate, collapsed }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || BRAND_NAME;
  const firstLetter = displayName[0]?.toUpperCase() ?? "Y";

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "220px",
        flexShrink: 0,
        background: "#0b0d1f",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 0 0 20px" : "0 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #5046e5, #818cf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>{firstLetter}</span>
        </div>
        {!collapsed && (
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.125rem", color: "#fff", whiteSpace: "nowrap" }}>
            {BRAND_DOMAIN}
          </span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "20px 20px 8px" }}>
          Main Menu
        </p>
      )}
      {collapsed && <div style={{ height: "28px" }} />}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <Fragment key={item.id}>
              {item.dividerBefore && (
                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "6px 4px" }} />
              )}
            <button
              key={`btn-${item.id}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: collapsed ? "10px 12px" : "9px 12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: active ? "rgba(80,70,229,0.18)" : "transparent",
                color: active ? "#a5b4fc" : "rgba(255,255,255,0.5)",
                transition: "background 0.15s, color 0.15s",
                position: "relative",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
            >
              {/* Active indicator bar */}
              {active && (
                <div style={{ position: "absolute", left: 0, top: "6px", bottom: "6px", width: "3px", borderRadius: "0 2px 2px 0", background: "#5046e5" }} />
              )}
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: active ? 600 : 400, flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 600, background: active ? "rgba(80,70,229,0.35)" : "rgba(255,255,255,0.08)", color: active ? "#a5b4fc" : "rgba(255,255,255,0.4)", borderRadius: "999px", padding: "1px 7px" }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <div style={{ position: "absolute", top: "6px", right: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "#5046e5" }} />
              )}
            </button>
            </Fragment>
          );
        })}
      </nav>

      {/* View blog link */}
      {!collapsed && (
        <div style={{ padding: "0 10px 12px" }}>
          <button
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 12px", borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", transition: "color 0.15s, background 0.15s", textAlign: "left" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
          >
            <ExternalLink size={13} />
            View Blog
          </button>
        </div>
      )}

      {/* User profile */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 12px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(80,70,229,0.5), rgba(129,140,248,0.4))", border: "1.5px solid rgba(80,70,229,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "0.875rem", fontWeight: 700, color: "#a5b4fc" }}>{firstLetter}</span>
          )}
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{user?.role === "admin" ? "Blog Owner" : "Writer"}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
