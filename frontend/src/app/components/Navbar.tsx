import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Search, X, Menu, Settings, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { BRAND_DOMAIN } from "../../lib/constants";

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = user.name.slice(0, 2).toUpperCase();
  const firstLetter = user.name[0]?.toUpperCase() ?? "U";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", padding: "5px 10px 5px 5px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(80,70,229,0.5)"; e.currentTarget.style.background = "rgba(80,70,229,0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      >
        {/* Avatar */}
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: user.avatarUrl ? "transparent" : (user.role === "admin" ? "linear-gradient(135deg, rgba(80,70,229,0.6), rgba(129,140,248,0.5))" : "linear-gradient(135deg, rgba(110,231,183,0.4), rgba(52,211,153,0.3))"), border: `1.5px solid ${user.role === "admin" ? "rgba(80,70,229,0.6)" : "rgba(110,231,183,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6875rem", fontWeight: 700, color: user.role === "admin" ? "#a5b4fc" : "#6ee7b7" }}>{initials}</span>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.2 }}>{user.name}</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: user.role === "admin" ? "#a5b4fc" : "#6ee7b7", margin: 0, lineHeight: 1.2 }}>{user.role}</p>
        </div>
        <ChevronDown size={13} color="rgba(255,255,255,0.4)" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "210px", background: "#0f1124", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.6)", zIndex: 200 }}>
          {/* User info header */}
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: user.avatarUrl ? "transparent" : (user.role === "admin" ? "linear-gradient(135deg, rgba(80,70,229,0.6), rgba(129,140,248,0.5))" : "linear-gradient(135deg, rgba(110,231,183,0.4), rgba(52,211,153,0.3))"), border: `1.5px solid ${user.role === "admin" ? "rgba(80,70,229,0.6)" : "rgba(110,231,183,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: "0.875rem", fontWeight: 700, color: user.role === "admin" ? "#a5b4fc" : "#6ee7b7" }}>{firstLetter}</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px" }}>
            {user.role === "admin" && (
              <MenuItem icon={<LayoutDashboard size={14} />} label="Admin Dashboard" onClick={() => { setOpen(false); navigate("/admin"); }} />
            )}
            <MenuItem icon={<Settings size={14} />} label="Account Settings" onClick={() => { setOpen(false); navigate("/settings"); }} />
            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
            <MenuItem icon={<LogOut size={14} />} label="Sign out" onClick={() => { setOpen(false); logout(); navigate("/"); }} danger />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%", padding: "8px 10px", borderRadius: "7px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 400, color: danger ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.65)", transition: "background 0.12s, color 0.12s", textAlign: "left" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.color = danger ? "#f87171" : "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = danger ? "rgba(248,113,113,0.8)" : "rgba(255,255,255,0.65)"; }}
    >
      {icon}
      {label}
    </button>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Blog", path: "/" },
    { label: "Projects", path: "/projects" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      className="sticky top-0 z-[100] w-full"
    >
      <div
        style={{ background: "rgba(10,12,26,0.85)", backdropFilter: "blur(12px)" }}
        className="absolute inset-0"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", letterSpacing: "-0.01em", flexShrink: 0, textDecoration: "none" }}
        >
          {BRAND_DOMAIN}
        </Link>

        {/* Center links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.65)", transition: "color 0.15s", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {searchOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "6px 12px" }}>
              <Search size={14} color="rgba(255,255,255,0.5)" />
              <input
                autoFocus
                placeholder="Search posts…"
                style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", width: "160px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchOpen(false);
                  }
                }}
              />
              <button onClick={() => setSearchOpen(false)}>
                <X size={14} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={{ color: "rgba(255,255,255,0.6)", padding: "6px", borderRadius: "6px", background: "transparent", border: "none", cursor: "pointer", display: "flex", transition: "color 0.15s, background 0.15s" }} className="hover:bg-white/10 hover:text-white">
              <Search size={18} />
            </button>
          )}

          {user ? (
            <UserMenu />
          ) : (
            <button
              style={{ background: "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer", transition: "background 0.15s" }}
              onClick={() => navigate("/auth")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4338ca")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#5046e5")}
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: "rgba(255,255,255,0.7)", padding: "6px", background: "none", border: "none", cursor: "pointer" }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden relative" style={{ background: "#0d0f1e", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px 24px" }}>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", fontWeight: 500, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => mobileSearchRef.current?.focus()}
                style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", display: "flex" }}
              >
                <Search size={18} />
              </button>
              <input
                ref={mobileSearchRef}
                placeholder="Search posts…"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "6px 10px", color: "#fff", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", width: "120px", outline: "none" }}
              />
              {user ? (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate("/settings"); }} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 14px", cursor: "pointer" }}>Settings</button>
                  <button onClick={() => { setMenuOpen(false); navigate("/"); }} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#f87171", background: "transparent", border: "none", cursor: "pointer", padding: "7px 0" }}>Sign out</button>
                </>
              ) : (
                <button onClick={() => { setMenuOpen(false); navigate("/auth"); }} style={{ background: "#5046e5", color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, padding: "8px 18px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
