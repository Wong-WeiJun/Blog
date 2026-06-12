import { TrendingUp } from "lucide-react";

const popularPosts = [
  { title: "Zero-Downtime Blue-Green Deployments with Terraform", date: "Jun 10", readTime: "5 min" },
  { title: "Multi-Stage Docker Builds: From 1.2GB to 90MB", date: "Jun 5", readTime: "5 min" },
  { title: "GitHub Actions Matrix for Parallel Tests", date: "May 29", readTime: "6 min" },
  { title: "HPA with Custom Prometheus Metrics in K8s", date: "May 22", readTime: "9 min" },
  { title: "Managing Terraform State in Teams", date: "May 15", readTime: "6 min" },
];

const categories = [
  { name: "AWS", count: 14, color: "#f97316" },
  { name: "Terraform", count: 9, color: "#8b5cf6" },
  { name: "Docker", count: 11, color: "#06b6d4" },
  { name: "CI/CD", count: 7, color: "#22c55e" },
  { name: "Kubernetes", count: 6, color: "#5046e5" },
  { name: "Linux", count: 8, color: "#f59e0b" },
  { name: "Python", count: 5, color: "#ec4899" },
];

const archive = [
  { month: "June 2026", count: 4 },
  { month: "May 2026", count: 6 },
  { month: "April 2026", count: 5 },
  { month: "March 2026", count: 7 },
  { month: "February 2026", count: 3 },
];

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

interface SidebarProps {
  onSelectTag?: (tag: string) => void;
  onOpenPost?: () => void;
}

export function Sidebar({ onSelectTag, onOpenPost }: SidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      {/* Popular Posts */}
      <SidebarSection title="Popular Posts">
        <div className="flex flex-col gap-4">
          {popularPosts.map((post, i) => (
            <button key={i} onClick={onOpenPost} style={{ display: "flex", gap: "12px", background: "none", border: "none", cursor: "pointer", padding: "4px 0", textAlign: "left", width: "100%" }}>
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
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* Categories */}
      <SidebarSection title="Categories">
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelectTag?.(cat.name)}
              className="flex items-center justify-between group"
              style={{ padding: "6px 0", background: "none", border: "none", cursor: "pointer", width: "100%" }}
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
            </button>
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
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
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
