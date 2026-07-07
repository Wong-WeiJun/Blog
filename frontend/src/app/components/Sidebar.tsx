import type { ReactNode } from "react";
import { useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { postsReadPosts, tagsGetTags } from "@/client/sdk.gen";
import type { PostResponse, TagWithCountResponse } from "@/client/types.gen";

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "20px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1rem", color: "#fff", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildArchive(posts: PostResponse[]) {
  const counts = new Map<string, { month: string; sortKey: string; count: number }>();
  for (const post of posts) {
    if (!post.published_at) continue;
    const d = new Date(post.published_at);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const month = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const existing = counts.get(sortKey);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(sortKey, { month, sortKey, count: 1 });
    }
  }
  return Array.from(counts.values())
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .map(({ month, count }) => ({ month, count }));
}

export function Sidebar() {
  const { data: popularPosts = [] } = useQuery({
    queryKey: ["posts", "popular"],
    queryFn: async () => {
      const res = await postsReadPosts({
        query: { limit: 5, page: 1, sort_by: "view_count" },
      });
      return (res.data?.posts ?? []) as PostResponse[];
    },
  });

  const { data: archivePosts = [] } = useQuery({
    queryKey: ["posts", "archive"],
    queryFn: async () => {
      const res = await postsReadPosts({ query: { limit: 100, page: 1 } });
      return (res.data?.posts ?? []) as PostResponse[];
    },
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await tagsGetTags();
      return (res.data ?? []) as TagWithCountResponse[];
    },
  });

  const archive = useMemo(() => buildArchive(archivePosts), [archivePosts]);
  const categories = tags.filter((t) => t.post_count > 0);

  return (
    <aside className="flex flex-col gap-6">
      {popularPosts.length > 0 && (
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
                    {formatDate(post.published_at)} · {post.read_time}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </SidebarSection>
      )}

      {categories.length > 0 && (
        <SidebarSection title="Categories">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/blog?tag=${encodeURIComponent(cat.name)}`}
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
                  {cat.post_count}
                </span>
              </Link>
            ))}
          </div>
        </SidebarSection>
      )}

      {archive.length > 0 && (
        <SidebarSection title="Archive">
          <div className="flex flex-col gap-2">
            {archive.map((item) => (
              <div key={item.month} className="flex items-center justify-between" style={{ padding: "5px 0" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)" }}>
                  {item.month}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
                  {item.count} {item.count === 1 ? "post" : "posts"}
                </span>
              </div>
            ))}
          </div>
        </SidebarSection>
      )}
    </aside>
  );
}
