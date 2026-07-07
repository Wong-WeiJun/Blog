import { PostGrid } from "../components/PostGrid";

export function BlogPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
      <header style={{ marginBottom: "36px" }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "#f0a86b", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>
          All posts
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#fff", margin: "0 0 10px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          Blog
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: "520px" }}>
          Infrastructure notes, cloud patterns, and lessons from the homelab.
        </p>
      </header>
      <PostGrid />
    </main>
  );
}
