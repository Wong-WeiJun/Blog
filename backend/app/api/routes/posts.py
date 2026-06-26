import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.models import (
    Message,
    PaginatedPostsResponse,
    Post,
    PostCreate,
    PostResponse,
    PostStatus,
    PostTagLink,
    PostUpdate,
    Tag,
)

router = APIRouter(tags=["posts"])


@router.get("", response_model=PaginatedPostsResponse)
def read_posts(
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = settings.DEFAULT_PAGE_SIZE,
    tag: str | None = None,
    search: str | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> PaginatedPostsResponse:
    offset = (page - 1) * limit

    query = select(Post).where(Post.status == PostStatus.published)

    if tag:
        query = query.join(PostTagLink).join(Tag).where(Tag.name == tag).distinct()
    if search:
        query = query.where(
            Post.title.ilike(f"%{search}%") | Post.excerpt.ilike(f"%{search}%")  # type: ignore[attr-defined]
        )

    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    posts = session.exec(query.offset(offset).limit(limit)).all()

    return PaginatedPostsResponse(
        posts=[PostResponse.model_validate(post) for post in posts],
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/admin/all",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PaginatedPostsResponse,
)
def read_all_posts(
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = settings.DEFAULT_PAGE_SIZE,
    search: str | None = None,
    status: PostStatus | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> PaginatedPostsResponse:
    offset = (page - 1) * limit

    query = select(Post)
    if status:
        query = query.where(Post.status == status)
    if search:
        query = query.where(
            Post.title.ilike(f"%{search}%") | Post.excerpt.ilike(f"%{search}%")  # type: ignore[attr-defined]
        )

    query = query.order_by(Post.created_at.desc())  # type: ignore[attr-defined]
    total = session.exec(select(func.count()).select_from(query.subquery())).one()
    posts = session.exec(query.offset(offset).limit(limit)).all()

    return PaginatedPostsResponse(
        posts=[PostResponse.model_validate(post) for post in posts],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{slug}", response_model=PostResponse)
def read_post(
    session: SessionDep,
    slug: str,
) -> PostResponse:
    # slug is a path parameter — must NOT be declared as Query(...)
    statement = select(Post).where(
        Post.slug == slug, Post.status == PostStatus.published
    )
    post = session.exec(statement).one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    try:
        post.view_count = (post.view_count or 0) + 1
        session.add(post)
        session.commit()
        session.refresh(post)
    except Exception:
        session.rollback()

    return PostResponse.model_validate(post)


def _get_or_create_tags(session: Session, tag_names: list[str]) -> list[Tag]:
    tags = []
    for name in tag_names:
        tag = session.exec(select(Tag).where(Tag.name == name)).first()
        if not tag:
            tag = Tag(name=name, color="#5046e5")
            session.add(tag)
            session.commit()
            session.refresh(tag)
        tags.append(tag)
    return tags


@router.post(
    "",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PostResponse,
)
def create_post(
    *, session: SessionDep, post_in: PostCreate, current_user: CurrentUser
) -> PostResponse:
    existing = session.exec(select(Post).where(Post.slug == post_in.slug)).first()
    if existing:
        raise HTTPException(
            status_code=409, detail="Post with this slug already exists"
        )

    post_data = post_in.model_dump(exclude={"tag_names"})
    post = Post.model_validate(post_data, update={"author_id": current_user.id})
    session.add(post)
    session.commit()
    session.refresh(post)

    if post_in.tag_names:
        post.tags = _get_or_create_tags(session, post_in.tag_names)
        session.add(post)
        session.commit()
        session.refresh(post)

    return PostResponse.model_validate(post)


@router.put(
    "/{post_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PostResponse,
)
def update_post(
    *, session: SessionDep, post_id: uuid.UUID, post_in: PostUpdate
) -> PostResponse:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post_in.slug and post_in.slug != post.slug:
        existing = session.exec(select(Post).where(Post.slug == post_in.slug)).first()
        if existing:
            raise HTTPException(
                status_code=409, detail="Post with this slug already exists"
            )

    update_data = post_in.model_dump(exclude_unset=True)
    tag_names = update_data.pop("tag_names", None)

    for field, value in update_data.items():
        setattr(post, field, value)

    if tag_names is not None:
        post.tags = _get_or_create_tags(session, tag_names)

    session.add(post)
    session.commit()
    session.refresh(post)
    return PostResponse.model_validate(post)


@router.delete(
    "/{post_id}",
    dependencies=[Depends(get_current_active_superuser)],
)
def delete_post(*, session: SessionDep, post_id: uuid.UUID) -> Message:
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    session.delete(post)
    session.commit()
    return Message(message="Post deleted successfully")


@router.post(
    "/{post_id}/publish",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PostResponse,
)
def publish_post(*, session: SessionDep, post_id: uuid.UUID) -> PostResponse:
    from datetime import datetime, timezone

    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.status = PostStatus.published
    if not post.published_at:
        post.published_at = datetime.now(timezone.utc)

    session.add(post)
    session.commit()
    session.refresh(post)
    return PostResponse.model_validate(post)
