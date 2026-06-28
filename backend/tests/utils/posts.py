from sqlmodel import Session

from app import crud
from app.models import Post, PostCreate, PostStatus, Tag, User, UserCreate
from tests.utils.utils import random_lower_string


def random_slug() -> str:
    return "-".join(random_lower_string()[:8] for _ in range(3))


def create_random_post(
    db: Session,
    author: User,
    *,
    status: PostStatus = PostStatus.draft,
    featured: bool = False,
    cover_image_url: str | None = None,
    tag_names: list[str] | None = None,
) -> Post:
    post_in = PostCreate(
        title=f"Test Post {random_lower_string()[:12]}",
        slug=random_slug(),
        excerpt="A short excerpt for testing purposes.",
        content="## Hello\n\nThis is test content with enough words to compute read time.",
        status=status,
        featured=featured,
        cover_image_url=cover_image_url,
        tag_names=tag_names or [],
    )
    post_data = post_in.model_dump(exclude={"tag_names"})
    post = Post.model_validate(post_data, update={"author_id": author.id})
    db.add(post)
    db.commit()
    db.refresh(post)

    if post_in.tag_names:
        from sqlmodel import select

        tags = []
        for name in post_in.tag_names:
            tag = db.exec(select(Tag).where(Tag.name == name)).first()
            if not tag:
                tag = Tag(name=name, color="#5046e5")
                db.add(tag)
                db.commit()
                db.refresh(tag)
            tags.append(tag)
        post.tags = tags
        db.add(post)
        db.commit()
        db.refresh(post)

    return post


def create_random_tag(db: Session, name: str | None = None) -> Tag:
    tag = Tag(
        name=name or f"tag-{random_lower_string()[:8]}",
        color="#5046e5",
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def create_superuser(db: Session) -> User:
    """Create a fresh superuser for tests that need one."""
    email = f"su-{random_lower_string()[:8]}@example.com"
    user_in = UserCreate(email=email, password=random_lower_string(), is_superuser=True)
    return crud.create_user(session=db, user_create=user_in)
