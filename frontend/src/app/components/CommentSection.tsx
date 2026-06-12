import { useState } from "react";
import { ThumbsUp, Reply, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

interface Comment {
  id: number;
  author: string;
  isOwner: boolean;
  avatar: string;
  date: string;
  body: string;
  likes: number;
  liked: boolean;
  replies: Comment[];
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "Sarah Chen",
    isOwner: false,
    avatar: "SC",
    date: "Jun 11, 2026",
    body: "This is exactly the write-up I needed. I've been wrestling with the target group drain timeout causing 30-second blips during deploys. Setting `deregistration_delay` to match the ALB idle timeout finally clicked after reading your config.",
    likes: 14,
    liked: false,
    replies: [
      {
        id: 11,
        author: "Wong",
        isOwner: true,
        avatar: "W",
        date: "Jun 11, 2026",
        body: "Glad it helped! The drain timeout is the most common gotcha — I forgot to mention you also want to bump `health_check.healthy_threshold` down to 2 so the new target group goes healthy faster. Will add that to the post.",
        likes: 6,
        liked: false,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: "Marcus Rivera",
    isOwner: false,
    avatar: "MR",
    date: "Jun 10, 2026",
    body: "Question: does this approach work with Fargate Spot capacity? I'm worried about Spot interruptions mid-switch causing a hard cutover instead of a graceful one.",
    likes: 8,
    liked: false,
    replies: [
      {
        id: 21,
        author: "Wong",
        isOwner: true,
        avatar: "W",
        date: "Jun 10, 2026",
        body: "Great question — Spot interruptions send a 2-minute warning via ECS task-state events. You can wire up an EventBridge rule to temporarily pin weight to the old TG, then resume after the replacement task is healthy. I'll write a follow-up on that.",
        likes: 11,
        liked: false,
        replies: [],
      },
      {
        id: 22,
        author: "Priya Nair",
        isOwner: false,
        avatar: "PN",
        date: "Jun 10, 2026",
        body: "Adding to this — we use a mix of On-Demand for the switch window and Spot for steady-state. Capacity provider strategies with `base` on On-Demand handle it cleanly.",
        likes: 5,
        liked: false,
        replies: [],
      },
    ],
  },
];

function AvatarCircle({ initials, isOwner }: { initials: string; isOwner: boolean }) {
  return (
    <div
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: isOwner ? "rgba(80,70,229,0.35)" : "rgba(255,255,255,0.08)",
        border: isOwner ? "1.5px solid rgba(80,70,229,0.6)" : "1.5px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: isOwner ? "#a5b4fc" : "rgba(255,255,255,0.6)",
        letterSpacing: "0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function CommentCard({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [likes, setLikes] = useState(comment.likes);
  const [liked, setLiked] = useState(comment.liked);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const handleLike = () => {
    setLiked((l) => !l);
    setLikes((n) => n + (liked ? -1 : 1));
  };

  return (
    <div style={{ display: "flex", gap: "12px", width: "100%" }}>
      <AvatarCircle initials={comment.avatar} isOwner={comment.isOwner} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>
            {comment.author}
          </span>
          {comment.isOwner && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#a5b4fc", background: "rgba(80,70,229,0.2)", border: "1px solid rgba(80,70,229,0.4)", borderRadius: "999px", padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Author
            </span>
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.3)" }}>
            {comment.date}
          </span>
        </div>

        {/* Body */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.7)", margin: 0 }}>
          {comment.body}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
          <button
            onClick={handleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: liked ? "#a5b4fc" : "rgba(255,255,255,0.4)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "color 0.15s",
            }}
          >
            <ThumbsUp size={13} fill={liked ? "#a5b4fc" : "none"} />
            {likes}
          </button>
          {depth < 2 && (
            <button
              onClick={() => setShowReply((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              <Reply size={13} />
              Reply
            </button>
          )}
          {comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(165,180,252,0.6)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Reply textarea */}
        {showReply && (
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <AvatarCircle initials="Y" isOwner={false} />
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author}…`}
                rows={2}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.875rem",
                  color: "#fff",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button
                style={{
                  alignSelf: "flex-end",
                  background: replyText.trim() ? "#5046e5" : "rgba(255,255,255,0.06)",
                  color: replyText.trim() ? "#fff" : "rgba(255,255,255,0.3)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  cursor: replyText.trim() ? "pointer" : "default",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {showReplies && comment.replies.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              paddingLeft: "16px",
              borderLeft: "1.5px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {comment.replies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setComments((prev) => [
        {
          id: Date.now(),
          author: "You",
          isOwner: false,
          avatar: "Y",
          date: "Just now",
          body: newComment,
          likes: 0,
          liked: false,
          replies: [],
        },
        ...prev,
      ]);
      setNewComment("");
      setSubmitting(false);
    }, 500);
  };

  const isEmpty = comments.length === 0;

  return (
    <section style={{ marginTop: "64px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
        <MessageSquare size={18} color="#a5b4fc" />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.375rem", color: "#fff", margin: 0 }}>
          {comments.length > 0 ? `${comments.length} Comments` : "Discussion"}
        </h2>
      </div>

      {/* New comment box */}
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "32px",
          display: "flex",
          gap: "12px",
        }}
      >
        <AvatarCircle initials="Y" isOwner={false} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts, questions, or corrections…"
            rows={4}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "12px 14px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              color: "#fff",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#fff",
                background: newComment.trim() && !submitting ? "#5046e5" : "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 22px",
                cursor: newComment.trim() && !submitting ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                transition: "background 0.15s",
              }}
            >
              <Send size={14} />
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "rgba(255,255,255,0.015)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "12px",
          }}
        >
          <MessageSquare size={36} color="rgba(255,255,255,0.15)" style={{ margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.1rem", color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>
            No comments yet
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.3)" }}>
            Be the first to share your thoughts or ask a question.
          </p>
        </div>
      )}

      {/* Comment list */}
      {!isEmpty && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <CommentCard comment={comment} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
