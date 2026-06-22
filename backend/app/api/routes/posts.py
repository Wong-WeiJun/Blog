from fastapi import APIRouter, Query
from app.api.deps import (
    SessionDep,
)
from sqlmodel import select, func
from typing import Annotated
from app.core.config import settings
from app.models import (
    Post,
    PaginatedPostsResponse,
    PostTagLink,
    Tag,
    PostResponse,
    PostStatus,
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
            Post.title.ilike(f"%{search}%") | Post.excerpt.ilike(f"%{search}%")
        )

    total = session.exec(select(func.count()).select_from(query.subquery())).one()

    posts = session.exec(query.offset(offset).limit(limit)).all()

    return PaginatedPostsResponse(
        posts=[PostResponse.model_validate(post) for post in posts],
        total=total,
        page=page,
        limit=limit,
    )
