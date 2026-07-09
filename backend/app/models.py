import random
import re
import string
import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import ConfigDict, EmailStr, model_validator
from sqlalchemy import JSON, Column, DateTime
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
    jti: str | None = None


class UserSession(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    user_agent: str | None = Field(default=None, max_length=512)
    ip_address: str | None = Field(default=None, max_length=45)
    device: str = Field(max_length=100)
    browser: str = Field(max_length=100)
    os: str = Field(max_length=100)
    device_type: str = Field(max_length=20)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    last_seen_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    expires_at: datetime = Field(sa_type=DateTime(timezone=True))  # type: ignore
    revoked_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class UserSessionPublic(SQLModel):
    id: uuid.UUID
    device: str
    browser: str
    os: str
    location: str
    device_type: str
    is_current: bool
    last_seen_at: datetime
    created_at: datetime


class UserSessionsPublic(SQLModel):
    data: list[UserSessionPublic]


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


class TagCreate(SQLModel):
    name: str = Field(min_length=1, max_length=50)
    color: str = "#5046e5"


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


class UserDataExportComment(SQLModel):
    id: uuid.UUID
    post_id: uuid.UUID
    parent_id: uuid.UUID | None
    body: str
    created_at: datetime


class UserDataExportPost(SQLModel):
    id: uuid.UUID
    slug: str
    title: str
    excerpt: str
    content: str
    status: PostStatus
    featured: bool
    cover_image_url: str | None
    view_count: int
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class UserDataExportSession(SQLModel):
    id: uuid.UUID
    device: str
    browser: str
    os: str
    device_type: str
    created_at: datetime
    last_seen_at: datetime
    expires_at: datetime
    revoked_at: datetime | None


class UserDataExport(SQLModel):
    exported_at: datetime
    profile: UserPublic
    comments: list[UserDataExportComment]
    liked_comment_ids: list[uuid.UUID]
    posts: list[UserDataExportPost]
    sessions: list[UserDataExportSession]


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


class ContactRequest(SQLModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    captcha_token: str


class TopPostStat(SQLModel):
    id: uuid.UUID
    title: str
    slug: str
    view_count: int


class DailyCount(SQLModel):
    date: str
    count: int


class AdminStatsResponse(SQLModel):
    total_posts: int
    published_posts: int
    draft_posts: int
    featured_posts: int
    total_views: int
    total_comments: int
    comments_in_period: int
    comments_prev_period: int
    avg_read_time_minutes: float
    top_posts: list[TopPostStat]
    comments_by_day: list[DailyCount]
    period: str | None = None


class ProjectStatus(str, Enum):
    completed = "completed"
    in_progress = "in_progress"
    archived = "archived"


class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: str
    stack: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    status: ProjectStatus = ProjectStatus.in_progress
    stars: int = 0
    forks: int = 0
    github_url: str | None = Field(default=None, max_length=1000)
    live_url: str | None = Field(default=None, max_length=1000)
    accent: str = "#5046e5"
    category: str = Field(max_length=100)
    sort_order: int = 0
    created_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )
    updated_at: datetime = Field(
        default_factory=get_datetime_utc, sa_type=DateTime(timezone=True)
    )


class ProjectCreate(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    stack: list[str] = []
    status: ProjectStatus = ProjectStatus.in_progress
    stars: int = 0
    forks: int = 0
    github_url: str | None = Field(default=None, max_length=1000)
    live_url: str | None = Field(default=None, max_length=1000)
    accent: str = "#5046e5"
    category: str = Field(min_length=1, max_length=100)
    sort_order: int = 0


class ProjectUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    stack: list[str] | None = None
    status: ProjectStatus | None = None
    stars: int | None = None
    forks: int | None = None
    github_url: str | None = Field(default=None, max_length=1000)
    live_url: str | None = Field(default=None, max_length=1000)
    accent: str | None = None
    category: str | None = Field(default=None, min_length=1, max_length=100)
    sort_order: int | None = None


class ProjectResponse(SQLModel):
    id: uuid.UUID
    title: str
    description: str
    stack: list[str]
    status: ProjectStatus
    stars: int
    forks: int
    github_url: str | None
    live_url: str | None
    accent: str
    category: str
    sort_order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Site About (singleton CMS) ─────────────────────────────────────


class SkillItem(SQLModel):
    name: str
    level: int = Field(ge=0, le=100)


class SkillGroup(SQLModel):
    category: str
    icon: str
    color: str
    skills: list[SkillItem] = []


class Certification(SQLModel):
    name: str
    issuer: str
    date: str
    badge: str
    color: str
    abbr: str


class EducationEntry(SQLModel):
    institution: str
    degree: str
    minor: str = ""
    start: str
    end: str
    current: bool = False
    gpa: str = "—"
    highlights: list[str] = []


class Interest(SQLModel):
    icon: str
    label: str
    color: str


class SiteAbout(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    homepage_tagline: str = "Building cool things in the cloud"
    homepage_headline: str = "Cloud Engineer"
    homepage_headline_accent: str = "in progress."
    homepage_bio: str = (
        "Building resilient infrastructure, automating deployments, "
        "and documenting the journey — one cloud pattern at a time."
    )
    hero_subtitle: str = "Cloud Engineer in Progress · SRE Aspirant"
    hero_bio: str = (
        "A developer blog chronicling cloud infrastructure, DevOps practices, "
        "and the hard-won lessons learned along the way."
    )
    open_to_work: bool = True
    resume_url: str | None = "/Resume.pdf"
    github_url: str | None = "https://github.com/Wong-WeiJun"
    linkedin_url: str | None = "https://www.linkedin.com/in/wei-jun-wong-507069357/"
    about_paragraphs: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON),
    )
    pull_quote: str = (
        "The best infrastructure is the kind you forget is there "
        "until the day it quietly saves you at 2 AM."
    )
    pull_quote_attribution: str = "engineer-in-progress"
    location: str = "Planet Earth"
    availability_text: str = "Always learning"
    cta_heading: str = "Let's work together"
    cta_subtext: str = "Interested in cloud engineering, SRE, or infrastructure roles."
    skill_groups: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    certifications: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    education: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    interests: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    updated_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),
    )


class SiteOwner(SQLModel):
    full_name: str | None = None
    avatar_url: str | None = None


class SiteAboutUpdate(SQLModel):
    homepage_tagline: str | None = None
    homepage_headline: str | None = None
    homepage_headline_accent: str | None = None
    homepage_bio: str | None = None
    hero_subtitle: str | None = None
    hero_bio: str | None = None
    open_to_work: bool | None = None
    resume_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    about_paragraphs: list[str] | None = None
    pull_quote: str | None = None
    pull_quote_attribution: str | None = None
    location: str | None = None
    availability_text: str | None = None
    cta_heading: str | None = None
    cta_subtext: str | None = None
    skill_groups: list[SkillGroup] | None = None
    certifications: list[Certification] | None = None
    education: list[EducationEntry] | None = None
    interests: list[Interest] | None = None


class SiteAboutResponse(SQLModel):
    homepage_tagline: str
    homepage_headline: str
    homepage_headline_accent: str
    homepage_bio: str
    hero_subtitle: str
    hero_bio: str
    open_to_work: bool
    resume_url: str | None
    github_url: str | None
    linkedin_url: str | None
    about_paragraphs: list[str]
    pull_quote: str
    pull_quote_attribution: str
    location: str
    availability_text: str
    cta_heading: str
    cta_subtext: str
    skill_groups: list[SkillGroup]
    certifications: list[Certification]
    education: list[EducationEntry]
    interests: list[Interest]
    owner: SiteOwner
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
