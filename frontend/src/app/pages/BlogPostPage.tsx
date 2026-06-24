import { useParams, Navigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { postsReadPost } from "@/client/sdk.gen";
import { BlogPost } from "../components/BlogPost";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => postsReadPost({ path: { slug: slug! } }),
    enabled: !!slug,
  });

  if (!slug || isError) {
    return <Navigate to="/404" replace />;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: "rgba(255,255,255,0.3)" }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!data?.data) {
    return <Navigate to="/404" replace />;
  }

  return <BlogPost post={data.data} />;
}
