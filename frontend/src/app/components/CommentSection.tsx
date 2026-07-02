import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ThumbsUp,
  Reply,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Trash2,
  LogIn,
} from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import {
  getPostComments,
  createPostComment,
  replyToComment,
  toggleCommentLike,
  deleteComment,
  type Comment as ApiComment,
} from "@/lib/comments";

/* --- helpers --- */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* --- UI bits --- */

function AvatarCircle({
  initials,
  avatarUrl,
  isOwner,
}: {
  initials: string;
  avatarUrl?: string | null;
  isOwner: boolean;
}) {
  return (
    <div
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        background: avatarUrl
          ? "transparent"
          : isOwner
            ? "rgba(80,70,229,0.35)"
            : "rgba(255,255,255,0.08)",
        border: isOwner
          ? "1.5px solid rgba(80,70,229,0.6)"
          : "1.5px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: isOwner ? "#a5b4fc" : "rgba(255,255,255,0.6)",
        letterSpacing: "0.02em",
        overflow: "hidden",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  );
}

/* --- single comment row --- */

function CommentCard({
  comment,
  depth = 0,
  postId,
}: {
  comment: ApiComment;
  depth?: number;
  postId: string;
}) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwn = user?.id === comment.author?.id;
  const isLogged = !!user;

  /* mutations */
  const likeMutation = useMutation({
    mutationFn: () => toggleCommentLike(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (body: string) => replyToComment(comment.id, body),
    onSuccess: () => {
      setReplyText("");
      setShowReply(false);
      setShowReplies(true);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleLike = () => {
    if (!isLogged) return;
    likeMutation.mutate();
  };

  const handleReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText.trim());
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate(undefined, {
      onSettled: () => setIsDeleting(false),
    });
  };

  return (
    <div style={{ display: "flex", gap: "12px", width: "100%" }}>
      <AvatarCircle
        initials={getInitials(comment.author?.full_name ?? "User")}
        avatarUrl={comment.author?.avatar_url}
        isOwner={isOwn}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {comment.author?.full_name || "Anonymous"}
          </span>
          {isOwn && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#a5b4fc",
                background: "rgba(80,70,229,0.2)",
                border: "1px solid rgba(80,70,229,0.4)",
                borderRadius: "999px",
                padding: "2px 8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Author
            </span>
          )}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {formatDate(comment.created_at)}
          </span>
        </div>

        {/* body */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.7)",
            margin: 0,
          }}
        >
          {comment.body}
        </p>

        {/* actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={handleLike}
            disabled={!isLogged || likeMutation.isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              color: comment.user_liked
                ? "#a5b4fc"
                : "rgba(255,255,255,0.4)",
              background: "transparent",
              border: "none",
              cursor: isLogged ? "pointer" : "default",
              padding: 0,
              transition: "color 0.15s",
              opacity: likeMutation.isPending ? 0.6 : 1,
            }}
          >
            <ThumbsUp
              size={13}
              fill={comment.user_liked ? "#a5b4fc" : "none"}
            />
            {comment.likes_count}
          </button>

          {depth < 2 && isLogged && (
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#fff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
              }
            >
              <Reply size={13} />
              Reply
            </button>
          )}

          {(isOwn || user?.role === "admin") && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending || isDeleting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#f87171",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                opacity: deleteMutation.isPending ? 0.6 : 1,
              }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          )}

          {(comment.replies?.length ?? 0) > 0 && (
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
              {showReplies ? (
                <ChevronUp size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
              {comment.replies?.length ?? 0}{" "}
              {comment.replies?.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* reply textarea */}
        {showReply && (
          <div
            style={{ marginTop: "12px", display: "flex", gap: "10px" }}
          >
            <AvatarCircle
              initials={getInitials(user?.name ?? "You")}
              avatarUrl={user?.avatarUrl}
              isOwner={false}
            />
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author?.full_name ?? "comment"}...`}
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
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(80,70,229,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.1)")
                }
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                style={{
                  alignSelf: "flex-end",
                  background:
                    replyText.trim() && !replyMutation.isPending
                      ? "#5046e5"
                      : "rgba(255,255,255,0.06)",
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

        {/* nested replies */}
        {showReplies && (comment.replies?.length ?? 0) > 0 && (
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
            {(comment.replies ?? []).map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                postId={postId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- public section wrapper --- */

export function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [newComment, setNewComment] = useState("");
  const isLogged = !!user;

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId),
    enabled: !!postId,
  });

  const postMutation = useMutation({
    mutationFn: (body: string) => createPostComment(postId, body),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim() || !isLogged) return;
    postMutation.mutate(newComment.trim());
  };

  const isEmpty = comments.length === 0;

  return (
    <section style={{ marginTop: "64px" }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "28px",
        }}
      >
        <MessageSquare size={18} color="#a5b4fc" />
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: "1.375rem",
            color: "#fff",
            margin: 0,
          }}
        >
          {comments.length > 0
            ? `${comments.length} Comments`
            : "Discussion"}
        </h2>
      </div>

      {/* New comment box */}
      {isLogged ? (
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
          <AvatarCircle
            initials={getInitials(user?.name ?? "You")}
            avatarUrl={user?.avatarUrl}
            isOwner={false}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, questions, or corrections..."
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
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(80,70,229,0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.1)")
              }
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                disabled={!newComment.trim() || postMutation.isPending}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#fff",
                  background:
                    newComment.trim() && !postMutation.isPending
                      ? "#5046e5"
                      : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 22px",
                  cursor:
                    newComment.trim() && !postMutation.isPending
                      ? "pointer"
                      : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  transition: "background 0.15s",
                }}
              >
                <Send size={14} />
                {postMutation.isPending ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => navigate("/auth")}
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px dashed rgba(255,255,255,0.12)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.035)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.025)")
          }
        >
          <LogIn size={18} color="rgba(255,255,255,0.3)" />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Log in to leave a comment
          </span>
        </div>
      )}

      {/* loading */}
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Loading comments...
          </span>
        </div>
      )}

      {/* empty state */}
      {!isLoading && isEmpty && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            background: "rgba(255,255,255,0.015)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "12px",
          }}
        >
          <MessageSquare
            size={36}
            color="rgba(255,255,255,0.15)"
            style={{ margin: "0 auto 16px" }}
          />
          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 8px",
            }}
          >
            No comments yet
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Be the first to share your thoughts or ask a question.
          </p>
        </div>
      )}

      {/* comment list */}
      {!isLoading && !isEmpty && (
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
              <CommentCard comment={comment} postId={postId} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
