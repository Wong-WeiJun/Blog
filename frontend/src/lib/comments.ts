/**
 * Comment API helpers — thin wrappers over the generated SDK functions.
 * Using the SDK client ensures auth headers, base URL, and error handling
 * are all consistent with the rest of the app.
 */

import {
  commentsGetPostComments,
  commentsCreateComment,
  commentsReplyToComment,
  commentsToggleCommentLike,
  commentsDeleteComment,
} from "@/client/sdk.gen";
import type { CommentResponse, Message } from "@/client/types.gen";

// Re-export the generated type as the canonical Comment shape so
// CommentSection and CommentsView import from one place.
export type Comment = CommentResponse;
export type { CommentResponse };

export async function getPostComments(postId: string): Promise<Comment[]> {
  const res = await commentsGetPostComments({
    path: { post_id: postId },
    throwOnError: true,
  });
  return (res.data ?? []) as Comment[];
}

export async function createPostComment(
  postId: string,
  body: string,
): Promise<Message> {
  const res = await commentsCreateComment({
    path: { post_id: postId },
    body: { body },
    throwOnError: true,
  });
  return res.data as Message;
}

export async function replyToComment(
  commentId: string,
  body: string,
): Promise<Message> {
  const res = await commentsReplyToComment({
    path: { id: commentId },
    body: { body },
    throwOnError: true,
  });
  return res.data as Message;
}

export async function toggleCommentLike(commentId: string): Promise<Message> {
  const res = await commentsToggleCommentLike({
    path: { id: commentId },
    throwOnError: true,
  });
  return res.data as Message;
}

export async function deleteComment(commentId: string): Promise<Message> {
  const res = await commentsDeleteComment({
    path: { id: commentId },
    throwOnError: true,
  });
  return res.data as Message;
}
