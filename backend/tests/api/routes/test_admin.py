"""
Tests for GET /api/v1/admin/stats — auth, totals, period filtering, and deltas.
"""

from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import Comment, PostStatus
from tests.utils.posts import create_random_post
from tests.utils.user import create_random_user

BASE = f"{settings.API_V1_STR}/admin/stats"


def _create_comment(
    db: Session,
    *,
    post_id,
    author_id,
    created_at: datetime,
    body: str = "Test comment",
) -> Comment:
    comment = Comment(
        post_id=post_id,
        author_id=author_id,
        body=body,
        created_at=created_at,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


class TestAdminStatsAuth:
    def test_requires_auth(self, client: TestClient):
        r = client.get(BASE)
        assert r.status_code == 401

    def test_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.get(BASE, headers=normal_user_token_headers)
        assert r.status_code == 403


class TestAdminStats:
    def test_returns_correct_totals(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        author = create_random_user(db)
        pub = create_random_post(db, author, status=PostStatus.published, featured=True)
        pub.view_count = 100
        db.add(pub)
        db.commit()

        create_random_post(db, author, status=PostStatus.draft)
        create_random_post(db, author, status=PostStatus.published)

        now = datetime.now(timezone.utc)
        _create_comment(db, post_id=pub.id, author_id=author.id, created_at=now)
        _create_comment(
            db,
            post_id=pub.id,
            author_id=author.id,
            created_at=now - timedelta(days=10),
        )

        r = client.get(BASE, headers=superuser_token_headers)
        assert r.status_code == 200
        data = r.json()

        assert data["total_posts"] == 3
        assert data["published_posts"] == 2
        assert data["draft_posts"] == 1
        assert data["featured_posts"] == 1
        assert data["total_views"] == 100
        assert data["total_comments"] == 2
        assert len(data["top_posts"]) == 2
        assert data["top_posts"][0]["view_count"] == 100

    def test_period_filter_changes_comment_counts(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        baseline = client.get(
            f"{BASE}?period=7d", headers=superuser_token_headers
        ).json()

        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        now = datetime.now(timezone.utc)

        _create_comment(db, post_id=post.id, author_id=author.id, created_at=now)
        _create_comment(
            db,
            post_id=post.id,
            author_id=author.id,
            created_at=now - timedelta(days=3),
        )
        _create_comment(
            db,
            post_id=post.id,
            author_id=author.id,
            created_at=now - timedelta(days=20),
        )

        r = client.get(f"{BASE}?period=7d", headers=superuser_token_headers)
        assert r.status_code == 200
        data = r.json()

        assert data["comments_in_period"] == baseline["comments_in_period"] + 2
        assert data["period"] == "7d"
        assert len(data["comments_by_day"]) == 7
        assert sum(d["count"] for d in data["comments_by_day"]) == (
            sum(d["count"] for d in baseline["comments_by_day"]) + 2
        )

    def test_delta_reflects_previous_period(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        baseline = client.get(
            f"{BASE}?period=7d", headers=superuser_token_headers
        ).json()

        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        now = datetime.now(timezone.utc)

        _create_comment(db, post_id=post.id, author_id=author.id, created_at=now)
        _create_comment(
            db,
            post_id=post.id,
            author_id=author.id,
            created_at=now - timedelta(days=10),
        )
        _create_comment(
            db,
            post_id=post.id,
            author_id=author.id,
            created_at=now - timedelta(days=11),
        )

        r = client.get(f"{BASE}?period=7d", headers=superuser_token_headers)
        assert r.status_code == 200
        data = r.json()

        assert data["comments_in_period"] == baseline["comments_in_period"] + 1
        assert data["comments_prev_period"] == baseline["comments_prev_period"] + 2

    def test_30d_period(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        now = datetime.now(timezone.utc)

        _create_comment(db, post_id=post.id, author_id=author.id, created_at=now)

        r = client.get(f"{BASE}?period=30d", headers=superuser_token_headers)
        assert r.status_code == 200
        data = r.json()

        assert data["period"] == "30d"
        assert len(data["comments_by_day"]) == 30
