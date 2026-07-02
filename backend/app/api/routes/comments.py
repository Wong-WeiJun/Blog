import uuid

from fastapi import APIRouter, HTTPException
from sqlmodel import delete, select

from app.api.deps import CurrentUser, OptionalCurrentUser, SessionDep
from app.models import (
    Comment,
    CommentAuthor,
    CommentCreate,
    CommentLike,
    CommentResponse,
    Message,
    Post,
    User,
)

router = APIRouter(tags=["comments"])


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def get_post_comments(
    post_id: uuid.UUID, session: SessionDep, current_user: OptionalCurrentUser = None
):
    """
    Fetch all comments for a post and structure them into a nested tree.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Fetch all comments for the post in a single query
    comments = session.exec(
        select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at)
    ).all()

    if not comments:
        return []

    # Fetch all authors for these comments
    author_ids = {c.author_id for c in comments}
    users = session.exec(select(User).where(User.id.in_(author_ids))).all()
    user_map = {
        u.id: CommentAuthor(id=u.id, full_name=u.full_name, avatar_url=u.avatar_url)
        for u in users
    }

    # Fetch all likes for these comments
    comment_ids = {c.id for c in comments}
    likes = session.exec(
        select(CommentLike).where(CommentLike.comment_id.in_(comment_ids))
    ).all()

    likes_count_map = dict.fromkeys(comment_ids, 0)
    user_liked_map = dict.fromkeys(comment_ids, False)

    for like in likes:
        likes_count_map[like.comment_id] += 1
        # Use current_user cleanly since your OptionalCurrentUser returns the User object or None
        if current_user and like.user_id == current_user.id:
            user_liked_map[like.comment_id] = True

    # Build standard responses and organize into a dictionary map
    comment_dict = {}
    for c in comments:
        comment_dict[c.id] = CommentResponse(
            id=c.id,
            post_id=c.post_id,
            parent_id=c.parent_id,
            body=c.body,
            created_at=c.created_at,
            author=user_map.get(c.author_id),  # type: ignore
            likes_count=likes_count_map.get(c.id, 0),
            user_liked=user_liked_map.get(c.id, False),
            replies=[],
        )

    # Assemble the nested tree
    root_comments = []
    for _, c_resp in comment_dict.items():
        if c_resp.parent_id:
            parent = comment_dict.get(c_resp.parent_id)
            if parent:
                parent.replies.append(c_resp)
        else:
            root_comments.append(c_resp)

    return root_comments


@router.post("/posts/{post_id}/comments", response_model=Message)
def create_comment(
    post_id: uuid.UUID,
    comment_in: CommentCreate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Create a root-level comment on a post.
    """
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = Comment(
        post_id=post_id, author_id=current_user.id, parent_id=None, body=comment_in.body
    )
    session.add(new_comment)
    session.commit()
    return Message(message="Comment added successfully")


@router.post("/comments/{id}/replies", response_model=Message)
def reply_to_comment(
    id: uuid.UUID,
    comment_in: CommentCreate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Reply to an existing comment. Inherits the post_id from the parent comment.
    """
    parent_comment = session.get(Comment, id)
    if not parent_comment:
        raise HTTPException(status_code=404, detail="Parent comment not found")

    reply = Comment(
        post_id=parent_comment.post_id,
        author_id=current_user.id,
        parent_id=parent_comment.id,
        body=comment_in.body,
    )
    session.add(reply)
    session.commit()
    return Message(message="Reply added successfully")


@router.post("/comments/{id}/like", response_model=Message)
def toggle_comment_like(id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    """
    Toggle a like on a comment. If already liked, unlikes it.
    """
    comment = session.get(Comment, id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing_like = session.exec(
        select(CommentLike).where(
            CommentLike.comment_id == id, CommentLike.user_id == current_user.id
        )
    ).first()

    if existing_like:
        session.delete(existing_like)
        session.commit()
        return Message(message="Comment unliked")
    else:
        new_like = CommentLike(comment_id=id, user_id=current_user.id)
        session.add(new_like)
        session.commit()
        return Message(message="Comment liked")


@router.delete("/comments/{id}", response_model=Message)
def delete_comment(id: uuid.UUID, session: SessionDep, current_user: CurrentUser):
    """
    Delete a comment. Ensures only the author or a superuser can delete it.
    Also handles cascading deletion of likes and nested replies manually to prevent DB constraint errors.
    """
    comment = session.get(Comment, id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this comment"
        )

    # Helper function to recursively delete comments and their associated likes
    def delete_recursively(target_id: uuid.UUID):
        # 1. Find and delete children first
        children = session.exec(
            select(Comment).where(Comment.parent_id == target_id)
        ).all()
        for child in children:
            delete_recursively(child.id)

        # 2. Delete likes for this comment
        session.exec(delete(CommentLike).where(CommentLike.comment_id == target_id))

        # 3. Delete the comment itself
        target = session.get(Comment, target_id)
        if target:
            session.delete(target)

    delete_recursively(id)
    session.commit()

    return Message(message="Comment deleted successfully")
