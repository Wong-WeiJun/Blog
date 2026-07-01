from fastapi import APIRouter
from sqlmodel import func, select

from app.api.deps import SessionDep
from app.models import Post, PostStatus, PostTagLink, Tag, TagWithCountResponse

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

