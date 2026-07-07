import { useState, type ComponentPropsWithoutRef } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, Clock, ArrowLeft, Bookmark, Twitter, Link2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { ReadingProgress } from "./ReadingProgress";
import { CodeBlock, InlineCode } from "./CodeBlock";
import { CommentSection } from "./CommentSection";
import type { PostResponse } from "../../client/types.gen";

export function BlogPost({ post }: { post: PostResponse }) {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ReadingProgress />

      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate("/blog")}
          style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <ArrowLeft size={15} />
          Back to Blog
        </button>
      </div>

      {/* Article header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Tag pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {(post.tags ?? []).slice(0, 4).map((tag) => (
            <Link
              key={tag.name}
              to={`/tag/${tag.name}`}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color: tag.color, background: `${tag.color}18`, border: `1px solid ${tag.color}38`, borderRadius: "6px", padding: "4px 11px", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${tag.color}30`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `${tag.color}18`)}
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 3rem)", lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", margin: "0 0 18px" }}
        >
          {post.title}
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 28px", maxWidth: "680px" }}>
          {post.excerpt || "Read this article to learn more."}
        </p>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            
            {/* Conditional Avatar Rendering */}
            {post.author?.avatar_url ? (
              <img 
                src={post.author.avatar_url} 
                alt={post.author.full_name || "Author"} 
                style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(80,70,229,0.5)", objectFit: "cover" }} 
              />
            ) : (
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(80,70,229,0.35)", border: "2px solid rgba(80,70,229,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 700, color: "#a5b4fc" }}>
                  {/* Fallback to Author Name initial, then Post Slug initial, then 'A' */}
                  {(post.author?.full_name?.[0] || post.slug[0] || 'A').toUpperCase()}
                </span>
              </div>
            )}

            <div>
              {/* Dynamic Author Name */}
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                {post.author?.full_name || "Anonymous"}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                {post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Clock size={12} />{post.read_time}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
              <Eye size={12} />{(post.view_count ?? 0).toLocaleString()} views
            </div>
            {/* Share buttons */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                title="Share on Twitter (coming soon)"
                disabled
                style={{ padding: "7px", borderRadius: "7px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", cursor: "default", color: "rgba(255,255,255,0.25)", opacity: 0.5 }}
              >
                <Twitter size={14} />
              </button>
              <button
                title={copied ? "Copied!" : "Copy link"}
                onClick={handleCopyLink}
                style={{ padding: "7px", borderRadius: "7px", background: copied ? "rgba(80,70,229,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(80,70,229,0.4)" : "rgba(255,255,255,0.09)"}`, cursor: "pointer", color: copied ? "#a5b4fc" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
              >
                <Link2 size={14} />
              </button>
              <button
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
                onClick={() => setBookmarked((b) => !b)}
                style={{ padding: "7px", borderRadius: "7px", background: bookmarked ? "rgba(80,70,229,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${bookmarked ? "rgba(80,70,229,0.4)" : "rgba(255,255,255,0.09)"}`, cursor: "pointer", color: bookmarked ? "#a5b4fc" : "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
              >
                <Bookmark size={14} fill={bookmarked ? "#a5b4fc" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {post.cover_image_url ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12" style={{ width: "100%" }}>
          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", position: "relative" }}>
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      ) : (
        <div
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
          style={{ width: "100%" }}
        >
          <div
            style={{ borderRadius: "16px", overflow: "hidden", background: "linear-gradient(135deg, #0d0f24 0%, #0a1230 50%, #130d28 100%)", minHeight: "320px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 35% 50%, rgba(80,70,229,0.22) 0%, transparent 60%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 75% 30%, rgba(99,102,241,0.15) 0%, transparent 55%)" }} />
            <div style={{ position: "relative", zIndex: 1, background: "rgba(5,5,15,0.7)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "14px", padding: "22px 28px", backdropFilter: "blur(10px)", minWidth: "min(580px, 90vw)" }}>
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => <div key={c} style={{ width: "11px", height: "11px", borderRadius: "50%", background: c }} />)}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", marginLeft: "8px" }}>deploy.sh</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", lineHeight: 2, color: "rgba(255,255,255,0.7)" }}>
                <div><span style={{ color: "#6ee7b7" }}>$ </span><span style={{ color: "rgba(165,180,252,0.8)" }}>terraform</span> apply <span style={{ color: "#fcd34d" }}>-var</span>=&quot;blue_weight=0&quot; <span style={{ color: "#fcd34d" }}>-var</span>=&quot;green_weight=100&quot;</div>
                <div style={{ color: "rgba(255,255,255,0.35)" }}>  Plan: 1 to add, 2 to change, 0 to destroy.</div>
                <div><span style={{ color: "#6ee7b7" }}>✔</span> aws_lb_listener_rule.weighted: Modifications complete</div>
                <div><span style={{ color: "#6ee7b7" }}>✔</span> aws_cloudwatch_metric_alarm.p99_latency: Created</div>
                <div style={{ marginTop: "4px" }}><span style={{ color: "#6ee7b7" }}>Apply complete!</span> <span style={{ color: "rgba(255,255,255,0.4)" }}>Resources: 1 added, 2 changed, 0 destroyed.</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-center" style={{ gap: "96px" }}>
          <article style={{ flex: "0 1 72ch", minWidth: 0, maxWidth: "72ch", order: -1 }}>
            {post.content ? (
              <div className="prose-blog">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ className, children }: ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                      const isBlock = className?.startsWith("language-");
                      if (isBlock) {
                        return (
                          <CodeBlock
                            language={(className ?? "").replace("language-", "")}
                            code={String(children).replace(/\n$/, "")}
                          />
                        );
                      }
                      return <InlineCode>{children}</InlineCode>;
                    },
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                This post has no content yet.
              </p>
            )}

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "48px" }} />

            {/* Comments */}
            <CommentSection postId={post.id} />
          </article>

        </div>
      </div>
    </>
  );
}
