import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Message,
    Post,
    PostStatus,
    PostTagLink,
    Tag,
    TagCreate,
    TagWithCountResponse,
)

router = APIRouter(tags=["tags"])


@router.get("", response_model=list[TagWithCountResponse])
def getTags(*, session: SessionDep) -> list[TagWithCountResponse]:
    statement = (
        select(
            Tag.id,
            Tag.name,
            Tag.color,
            func.count(Post.id).label("post_count"),
        )
        .select_from(Tag)
        .join(PostTagLink, PostTagLink.tag_id == Tag.id, isouter=True)
        .join(
            Post,
            (Post.id == PostTagLink.post_id) & (Post.status == PostStatus.published),
            isouter=True,
        )
        .group_by(Tag.id, Tag.name, Tag.color)
        .order_by(func.count(Post.id).desc(), Tag.name)
    )
    results = session.exec(statement).all()
    return [
        TagWithCountResponse(
            id=row.id, name=row.name, color=row.color, post_count=row.post_count
        )
        for row in results
    ]


@router.post(
    "",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=TagWithCountResponse,
)
def create_tag(*, session: SessionDep, tag_in: TagCreate) -> TagWithCountResponse:
    existing = session.exec(select(Tag).where(Tag.name == tag_in.name)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag with this name already exists")

    tag = Tag.model_validate(tag_in)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return TagWithCountResponse(id=tag.id, name=tag.name, color=tag.color, post_count=0)


@router.delete(
    "/{tag_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_tag(*, session: SessionDep, tag_id: uuid.UUID) -> Message:
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    post_count = session.exec(
        select(func.count())
        .select_from(PostTagLink)
        .join(Post, Post.id == PostTagLink.post_id)
        .where(PostTagLink.tag_id == tag_id)
    ).one()

    if post_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Tag is used by {post_count} post(s). Remove it from posts first.",
        )

    links = session.exec(select(PostTagLink).where(PostTagLink.tag_id == tag_id)).all()
    for link in links:
        session.delete(link)

    session.delete(tag)
    session.commit()
    return Message(message="Tag deleted")
