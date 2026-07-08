from datetime import datetime, timedelta, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query
from sqlmodel import func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    AdminStatsResponse,
    Comment,
    DailyCount,
    Post,
    PostStatus,
    TopPostStat,
)

router = APIRouter(tags=["admin"])

Period = Literal["7d", "30d", "90d", "12mo"]

PERIOD_DAYS: dict[str, int] = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12mo": 365,
}


def _compute_read_time_minutes(content: str) -> float:
    words = len(content.split()) if content else 0
    return float(max(1, words // 200))


@router.get(
    "/stats",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AdminStatsResponse,
)
def get_admin_stats(
    session: SessionDep,
    period: Annotated[Period | None, Query()] = "7d",
) -> AdminStatsResponse:
    now = datetime.now(timezone.utc)
    effective_period = period or "7d"
    period_days = PERIOD_DAYS[effective_period]
    period_start = now - timedelta(days=period_days)
    prev_period_start = period_start - timedelta(days=period_days)

    total_posts = session.exec(select(func.count()).select_from(Post)).one()
    published_posts = session.exec(
        select(func.count())
        .select_from(Post)
        .where(Post.status == PostStatus.published)
    ).one()
    draft_posts = session.exec(
        select(func.count()).select_from(Post).where(Post.status == PostStatus.draft)
    ).one()
    featured_posts = session.exec(
        select(func.count()).select_from(Post).where(Post.featured.is_(True))  # type: ignore[attr-defined]
    ).one()

    total_views = session.exec(
        select(func.coalesce(func.sum(Post.view_count), 0))
    ).one()

    published = session.exec(
        select(Post).where(Post.status == PostStatus.published)
    ).all()
    avg_read_time = (
        sum(_compute_read_time_minutes(p.content) for p in published) / len(published)
        if published
        else 0.0
    )

    total_comments = session.exec(select(func.count()).select_from(Comment)).one()
    comments_in_period = session.exec(
        select(func.count())
        .select_from(Comment)
        .where(Comment.created_at >= period_start)
    ).one()
    comments_prev_period = session.exec(
        select(func.count())
        .select_from(Comment)
        .where(Comment.created_at >= prev_period_start)
        .where(Comment.created_at < period_start)
    ).one()

    top = session.exec(
        select(Post)
        .where(Post.status == PostStatus.published)
        .order_by(Post.view_count.desc())  # type: ignore[attr-defined]
        .limit(5)
    ).all()
    top_posts = [
        TopPostStat(id=p.id, title=p.title, slug=p.slug, view_count=p.view_count or 0)
        for p in top
    ]

    date_col = func.date(Comment.created_at)
    rows = session.exec(
        select(date_col, func.count())
        .where(Comment.created_at >= period_start)
        .group_by(date_col)
        .order_by(date_col)
    ).all()
    count_map = {str(row[0]): row[1] for row in rows}

    comments_by_day: list[DailyCount] = []
    for i in range(period_days):
        day = (now - timedelta(days=period_days - 1 - i)).date()
        date_str = day.isoformat()
        comments_by_day.append(
            DailyCount(date=date_str, count=count_map.get(date_str, 0))
        )

    return AdminStatsResponse(
        total_posts=total_posts,
        published_posts=published_posts,
        draft_posts=draft_posts,
        featured_posts=featured_posts,
        total_views=int(total_views),
        total_comments=total_comments,
        comments_in_period=comments_in_period,
        comments_prev_period=comments_prev_period,
        avg_read_time_minutes=round(avg_read_time, 1),
        top_posts=top_posts,
        comments_by_day=comments_by_day,
        period=effective_period,
    )
