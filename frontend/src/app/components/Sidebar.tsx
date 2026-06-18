import { Link } from "react-router";
import { TrendingUp } from "lucide-react";
import { getPopularPosts, getPublishedPosts, type Post } from "../../data/posts";

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Sidebar() {
  const popularPosts = getPopularPosts(5);
  const tags = getAllTagsFromPosts();
  const archive = getArchiveMonths();

  return (
    <aside className="flex flex-col gap-6">
      {/* Popular Posts */}
      <SidebarSection title="Popular Posts">
        <div className="flex flex-col gap-4">
          {popularPosts.map((post, i) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              style={{ display: "flex", gap: "12px", textDecoration: "none", padding: "4px 0", width: "100%" }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 600, color: "rgba(80,70,229,0.7)", flexShrink: 0, paddingTop: "1px", minWidth: "20px" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, lineHeight: 1.4, color: "rgba(255,255,255,0.75)", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                >
                  {post.title}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
                  {post.date} · {post.readTime}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </SidebarSection>

      {/* Categories */}
      <SidebarSection title="Categories">
        <div className="flex flex-col gap-2">
          {tags.map((cat) => (
            <Link
              key={cat.name}
              to={`/tag/${cat.name}`}
              className="flex items-center justify-between group"
              style={{ padding: "6px 0", textDecoration: "none", width: "100%" }}
            >
              <div className="flex items-center gap-2">
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <span
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                >
                  {cat.name}
                </span>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", borderRadius: "999px", padding: "2px 8px" }}>
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </SidebarSection>

      {/* Archive */}
      <SidebarSection title="Archive">
        <div className="flex flex-col gap-2">
          {archive.map((item) => (
            <div key={item.month} className="flex items-center justify-between" style={{ padding: "5px 0" }}>
              <span
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)", transition: "color 0.15s" }}
              >
                {item.month}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
                {item.count} posts
              </span>
            </div>
          ))}
        </div>
      </SidebarSection>
    </aside>
  );
}

function getAllTagsFromPosts(): { name: string; count: number; color: string }[] {
  const map = new Map<string, { name: string; count: number; color: string }>();
  for (const post of getPublishedPosts()) {
    for (const tag of [post.tag, ...post.tags]) {
      const existing = map.get(tag);
      if (existing) {
        existing.count++;
      } else {
        map.set(tag, { name: tag, count: 1, color: post.tagColor });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function getArchiveMonths(): { month: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of getPublishedPosts()) {
    const parts = post.date.split(" ");
    if (parts.length >= 2) {
      const month = `${parts[0]} ${parts[1]}`;
      map.set(month, (map.get(month) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}
