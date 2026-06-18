import { useParams, Navigate } from "react-router";
import { getPostBySlug } from "../../data/posts";
import { BlogPost } from "../components/BlogPost";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return <BlogPost post={post} />;
}
