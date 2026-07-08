from datetime import datetime, timezone
from email.utils import format_datetime
from xml.sax.saxutils import escape

from fastapi import APIRouter, Request
from fastapi.responses import Response
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.config import settings
from app.models import Post, PostStatus

router = APIRouter(tags=["feed"])

FEED_LIMIT = 50


def _format_rfc822(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return format_datetime(dt, usegmt=True)


def _build_rss(posts: list[Post], feed_url: str, site_url: str) -> str:
    site_url = site_url.rstrip("/")
    channel_link = f"{site_url}/blog"
    items: list[str] = []

    for post in posts:
        post_url = f"{site_url}/blog/{post.slug}"
        pub_date = post.published_at or post.created_at
        description = escape(post.excerpt)

        item_parts = [
            "    <item>",
            f"      <title>{escape(post.title)}</title>",
            f"      <link>{escape(post_url)}</link>",
            f'      <guid isPermaLink="true">{escape(post_url)}</guid>',
            f"      <pubDate>{_format_rfc822(pub_date)}</pubDate>",
            f"      <description>{description}</description>",
        ]

        if post.cover_image_url:
            item_parts.append(
                f'      <enclosure url="{escape(post.cover_image_url)}" type="image/jpeg" />'
            )

        item_parts.append("    </item>")
        items.append("\n".join(item_parts))

    last_build = _format_rfc822(datetime.now(timezone.utc))
    channel_description = escape(
        f"Latest posts from {settings.PROJECT_NAME} — cloud engineering, DevOps, and developer notes."
    )

    return "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
            "  <channel>",
            f"    <title>{escape(settings.PROJECT_NAME)}</title>",
            f"    <link>{escape(channel_link)}</link>",
            f"    <description>{channel_description}</description>",
            "    <language>en-us</language>",
            f"    <lastBuildDate>{last_build}</lastBuildDate>",
            f'    <atom:link href="{escape(feed_url)}" rel="self" type="application/rss+xml" />',
            *items,
            "  </channel>",
            "</rss>",
        ]
    )


@router.get("/feed.xml")
def read_feed(session: SessionDep, request: Request) -> Response:
    """Public RSS 2.0 feed of published blog posts."""
    posts = session.exec(
        select(Post)
        .where(Post.status == PostStatus.published)
        .order_by(Post.published_at.desc(), Post.created_at.desc())  # type: ignore[attr-defined]
        .limit(FEED_LIMIT)
    ).all()

    site_url = settings.FRONTEND_HOST.rstrip("/")
    xml = _build_rss(posts, feed_url=str(request.url), site_url=site_url)

    return Response(content=xml, media_type="application/rss+xml; charset=utf-8")
