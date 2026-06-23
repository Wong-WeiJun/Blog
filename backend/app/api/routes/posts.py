from typing import Annotated

from fastapi import APIRouter, Query, HTTPException
from sqlmodel import func, select

from app.api.deps import (
    SessionDep,
)
from app.core.config import settings
from app.models import (
    PaginatedPostsResponse,
    Post,
    PostResponse,
    PostStatus,
    PostTagLink,
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


@router.get("/{slug}", response_model=PostResponse)
def read_post(
    session: SessionDep,
    _limit: Annotated[
        int, Query(ge=1, le=100, alias="limit")
    ] = settings.DEFAULT_PAGE_SIZE,
    _tag: str | None = Query(None, alias="tag"),
    _search: str | None = Query(None, alias="search"),
    _page: Annotated[int, Query(ge=1, alias="page")] = 1,
    slug: str = Query(..., description="The slug of the post to retrieve"),
) -> PostResponse:

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
