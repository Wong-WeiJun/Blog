import random
import re
import string
import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import ConfigDict, EmailStr, model_validator
from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def random_lower_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def random_slug_suffix() -> str:
    return random_lower_string(8)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=1000)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore[assignment]
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=1000)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class Tag(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    color: str


class TagResponse(SQLModel):
    name: str
    color: str


class TagWithCountResponse(SQLModel):
    id: uuid.UUID
    name: str
    color: str
    post_count: int


class PostTagLink(SQLModel, table=True):
    post_id: uuid.UUID = Field(foreign_key="post.id", primary_key=True)
    tag_id: uuid.UUID = Field(foreign_key="tag.id", primary_key=True)


class PostStatus(str, Enum):
    draft = "draft"
    published = "published"


class Post(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title: str
    excerpt: str
    content: str
    status: PostStatus = PostStatus.draft
    featured: bool = False
    cover_image_url: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    view_count: int = 0
    author_id: uuid.UUID = Field(foreign_key="user.id")

    author: "User" = Relationship()

    published_at: datetime | None = None
    created_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )
    tags: list[Tag] = Relationship(link_model=PostTagLink)


class PostAuthorResponse(SQLModel):
    full_name: str | None = None
    avatar_url: str | None = None


class PostResponse(SQLModel):
    id: uuid.UUID
    slug: str
    title: str
    excerpt: str
    status: PostStatus
    featured: bool
    cover_image_url: str | None
    meta_title: str | None
    meta_description: str | None
    view_count: int
    published_at: datetime | None
    created_at: datetime
    tags: list[TagResponse] = []
    content: str | None = None
    read_time: str = ""

    author: PostAuthorResponse | None = None

    @model_validator(mode="after")
    def compute_read_time(self) -> "PostResponse":
        words = len(self.content.split()) if self.content else 0
        minutes = max(1, words // 200)
        self.read_time = f"{minutes} min"
        return self

    model_config = ConfigDict(from_attributes=True)


class PaginatedPostsResponse(SQLModel):
    posts: list[PostResponse]
    total: int
    page: int
    limit: int


class PostCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    slug: str | None = Field(default=None, max_length=255)
    excerpt: str = Field(min_length=1, max_length=1000)
    content: str = Field(min_length=1)
    status: PostStatus = PostStatus.draft
    featured: bool = False
    cover_image_url: str | None = Field(default=None, max_length=1000)
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    tag_names: list[str] = []

    @model_validator(mode="before")
    @classmethod
    def handle_slug_generation(cls, data: any) -> any:
        if isinstance(data, dict):
            title = data.get("title")
            slug = data.get("slug")

            if not slug and title:
                base_slug = slugify(title)
                data["slug"] = f"{base_slug}-{random_slug_suffix()}"
            elif slug:
                data["slug"] = slugify(slug)

        return data


class PostUpdate(SQLModel):
    slug: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    excerpt: str | None = Field(default=None, min_length=1, max_length=1000)
    content: str | None = Field(default=None, min_length=1)
    status: PostStatus | None = None
    featured: bool | None = None
    cover_image_url: str | None = Field(default=None, max_length=1000)
    meta_title: str | None = Field(default=None, max_length=255)
    meta_description: str | None = Field(default=None, max_length=500)
    tag_names: list[str] | None = None


class Comment(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    post_id: uuid.UUID = Field(foreign_key="post.id", index=True)
    author_id: uuid.UUID = Field(foreign_key="user.id")
    parent_id: uuid.UUID | None = Field(default=None, foreign_key="comment.id")
    body: str
    created_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )


class CommentLike(SQLModel, table=True):
    comment_id: uuid.UUID = Field(foreign_key="comment.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)


class CommentCreate(SQLModel):
    body: str = Field(min_length=1, max_length=2000)


class CommentAuthor(SQLModel):
    id: uuid.UUID
    full_name: str | None = None
    avatar_url: str | None = None


class CommentResponse(SQLModel):
    id: uuid.UUID
    post_id: uuid.UUID
    parent_id: uuid.UUID | None
    body: str
    created_at: datetime
    author: CommentAuthor
    likes_count: int = 0
    user_liked: bool = False
    replies: list["CommentResponse"] = []


CommentResponse.model_rebuild()


class ContactSubmission(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: EmailStr
    subject: str
    message: str
    email_sent: bool = False
    created_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )
