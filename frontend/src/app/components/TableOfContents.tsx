import { useEffect, useState } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

interface Props {
  items: TocItem[];
}

export function TableOfContents({ items }: Props) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0% -70% 0%", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 88;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const TocList = () => (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              fontFamily: "'Inter', sans-serif",
              fontSize: item.level === 2 ? "0.8125rem" : "0.75rem",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.45)",
              background: isActive ? "rgba(80,70,229,0.12)" : "transparent",
              border: "none",
              borderLeft: `2px solid ${isActive ? "#5046e5" : "transparent"}`,
              borderRadius: "0 6px 6px 0",
              padding: `${item.level === 2 ? "7px" : "5px"} 10px ${item.level === 2 ? "7px" : "5px"} ${item.level === 3 ? "22px" : "10px"}`,
              cursor: "pointer",
              transition: "color 0.15s, background 0.15s, border-color 0.15s",
              lineHeight: 1.4,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.75)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside
        className="hidden xl:block"
        style={{
          position: "sticky",
          top: "88px",
          width: "220px",
          flexShrink: 0,
          alignSelf: "flex-start",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "10px",
            paddingLeft: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <List size={11} />
          On this page
        </p>
        <TocList />
      </aside>

      {/* Mobile collapsible accordion — shown above article on <xl */}
      <div
        className="xl:hidden mb-8"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <List size={14} />
            Table of Contents
          </span>
          <span style={{ transition: "transform 0.2s", transform: mobileOpen ? "rotate(180deg)" : "none", fontSize: "0.75rem" }}>▾</span>
        </button>
        {mobileOpen && (
          <div style={{ padding: "4px 6px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <TocList />
          </div>
        )}
      </div>
    </>
  );
}
