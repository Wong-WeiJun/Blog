"""
Tests for POST /api/v1/posts — all CRUD endpoints, the admin/all endpoint,
tag handling, cover image URLs, view count increment, and auth enforcement.
"""

import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import Post, PostStatus, Tag
from tests.utils.posts import create_random_post, random_slug
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string

BASE = f"{settings.API_V1_STR}/posts"


# ─────────────────────────── fixtures ────────────────────────────────


@pytest.fixture()
def superuser(db: Session):
    """A fresh superuser for the test session."""
    from app import crud
    from app.models import UserCreate

    email = f"su-posts-{random_lower_string()[:8]}@example.com"
    user_in = UserCreate(email=email, password=random_lower_string(), is_superuser=True)
    return crud.create_user(session=db, user_create=user_in)


@pytest.fixture()
def superuser_headers(client: TestClient) -> dict[str, str]:
    return _su_headers(client)


def _su_headers(client: TestClient) -> dict[str, str]:
    data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# ──────────────────────── public list endpoint ───────────────────────


class TestReadPosts:
    def test_returns_only_published(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        pub = create_random_post(db, author, status=PostStatus.published)
        create_random_post(db, author, status=PostStatus.draft)

        r = client.get(BASE)
        assert r.status_code == 200
        data = r.json()
        slugs = [p["slug"] for p in data["posts"]]
        assert pub.slug in slugs
        # Draft must never appear in the public list
        for p in data["posts"]:
            assert p["status"] == "published"

    def test_pagination(self, client: TestClient, db: Session):
        author = create_random_user(db)
        for _ in range(3):
            create_random_post(db, author, status=PostStatus.published)

        r1 = client.get(BASE, params={"limit": 2, "page": 1})
        r2 = client.get(BASE, params={"limit": 2, "page": 2})
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert len(r1.json()["posts"]) <= 2
        assert r1.json()["page"] == 1
        assert r2.json()["page"] == 2

    def test_search_by_title(self, client: TestClient, db: Session):
        author = create_random_user(db)
        unique = f"xyzuniq{random_lower_string()[:6]}"
        post = create_random_post(db, author, status=PostStatus.published)
        # Patch the title directly so the slug stays valid
        post.title = f"Post about {unique}"
        db.add(post)
        db.commit()

        r = client.get(BASE, params={"search": unique})
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert post.slug in slugs

    def test_search_no_results(self, client: TestClient):
        r = client.get(BASE, params={"search": "zzzzzz_definitely_nothing"})
        assert r.status_code == 200
        assert r.json()["posts"] == []
        assert r.json()["total"] == 0

    def test_filter_by_tag(self, client: TestClient, db: Session):
        author = create_random_user(db)
        tag_name = f"tag-{random_lower_string()[:8]}"
        post = create_random_post(
            db, author, status=PostStatus.published, tag_names=[tag_name]
        )
        untagged = create_random_post(db, author, status=PostStatus.published)

        r = client.get(BASE, params={"tag": tag_name})
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert post.slug in slugs
        assert untagged.slug not in slugs

    def test_response_shape(self, client: TestClient, db: Session):
        author = create_random_user(db)
        create_random_post(db, author, status=PostStatus.published)
        r = client.get(BASE)
        assert r.status_code == 200
        body = r.json()
        assert "posts" in body
        assert "total" in body
        assert "page" in body
        assert "limit" in body

    def test_invalid_limit_rejected(self, client: TestClient):
        r = client.get(BASE, params={"limit": 0})
        assert r.status_code == 422

    def test_invalid_page_rejected(self, client: TestClient):
        r = client.get(BASE, params={"page": 0})
        assert r.status_code == 422


# ─────────────────────── single post (public) ────────────────────────


class TestReadPost:
    def test_get_published_by_slug(self, client: TestClient, db: Session):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)

        r = client.get(f"{BASE}/{post.slug}")
        assert r.status_code == 200
        body = r.json()
        assert body["slug"] == post.slug
        assert body["title"] == post.title

    def test_increments_view_count(self, client: TestClient, db: Session):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        initial_views = post.view_count or 0

        client.get(f"{BASE}/{post.slug}")
        client.get(f"{BASE}/{post.slug}")

        db.refresh(post)
        assert (post.view_count or 0) == initial_views + 2

    def test_draft_returns_404(self, client: TestClient, db: Session):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.draft)
        r = client.get(f"{BASE}/{post.slug}")
        assert r.status_code == 404

    def test_nonexistent_slug_returns_404(self, client: TestClient):
        r = client.get(f"{BASE}/this-slug-does-not-exist-ever")
        assert r.status_code == 404

    def test_response_includes_read_time(self, client: TestClient, db: Session):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        r = client.get(f"{BASE}/{post.slug}")
        assert r.status_code == 200
        assert "read_time" in r.json()
        assert r.json()["read_time"]  # non-empty

    def test_response_includes_tags(self, client: TestClient, db: Session):
        author = create_random_user(db)
        tag_name = f"tag-{random_lower_string()[:8]}"
        post = create_random_post(
            db, author, status=PostStatus.published, tag_names=[tag_name]
        )
        r = client.get(f"{BASE}/{post.slug}")
        assert r.status_code == 200
        tag_names_resp = [t["name"] for t in r.json()["tags"]]
        assert tag_name in tag_names_resp


# ──────────────────────── create post ────────────────────────────────


class TestCreatePost:
    def test_create_draft(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        payload = {
            "title": "My Draft",
            "slug": random_slug(),
            "excerpt": "Short excerpt.",
            "content": "## Hello world",
            "status": "draft",
        }
        r = client.post(BASE, json=payload, headers=superuser_token_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["slug"] == payload["slug"]
        assert body["status"] == "draft"

    def test_create_with_tags(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        tag1, tag2 = (
            f"tag-{random_lower_string()[:6]}",
            f"tag-{random_lower_string()[:6]}",
        )
        payload = {
            "title": "Tagged Post",
            "slug": random_slug(),
            "excerpt": "excerpt",
            "content": "content",
            "tag_names": [tag1, tag2],
        }
        r = client.post(BASE, json=payload, headers=superuser_token_headers)
        assert r.status_code == 200
        names = [t["name"] for t in r.json()["tags"]]
        assert tag1 in names
        assert tag2 in names

    def test_create_with_cover_image_url(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        url = "https://example.com/cover.jpg"
        payload = {
            "title": "Post with cover",
            "slug": random_slug(),
            "excerpt": "excerpt",
            "content": "content",
            "cover_image_url": url,
        }
        r = client.post(BASE, json=payload, headers=superuser_token_headers)
        assert r.status_code == 200
        assert r.json()["cover_image_url"] == url

    def test_duplicate_slug_rejected(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        existing = create_random_post(db, author)
        payload = {
            "title": "Dupe",
            "slug": existing.slug,
            "excerpt": "x",
            "content": "x",
        }
        r = client.post(BASE, json=payload, headers=superuser_token_headers)
        assert r.status_code == 409
        assert "slug" in r.json()["detail"].lower()

    def test_non_superuser_forbidden(
        self, client: TestClient, normal_user_token_headers
    ):
        payload = {
            "title": "Should fail",
            "slug": random_slug(),
            "excerpt": "x",
            "content": "x",
        }
        r = client.post(BASE, json=payload, headers=normal_user_token_headers)
        assert r.status_code == 403

    def test_unauthenticated_forbidden(self, client: TestClient):
        payload = {
            "title": "No auth",
            "slug": random_slug(),
            "excerpt": "x",
            "content": "x",
        }
        r = client.post(BASE, json=payload)
        assert r.status_code == 401

    def test_reuses_existing_tag(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        """Creating two posts with the same tag name must not duplicate the Tag row."""
        tag_name = f"shared-{random_lower_string()[:6]}"
        for _ in range(2):
            payload = {
                "title": random_lower_string(),
                "slug": random_slug(),
                "excerpt": "x",
                "content": "x",
                "tag_names": [tag_name],
            }
            r = client.post(BASE, json=payload, headers=superuser_token_headers)
            assert r.status_code == 200

        tags = db.exec(select(Tag).where(Tag.name == tag_name)).all()
        assert len(tags) == 1


# ─────────────────────────── update post ─────────────────────────────


class TestUpdatePost:
    def test_update_title(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        new_title = f"Updated {random_lower_string()[:10]}"

        r = client.put(
            f"{BASE}/{post.id}",
            json={"title": new_title},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["title"] == new_title

    def test_update_cover_image_url(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        url = "https://s3.amazonaws.com/bucket/covers/new.jpg"

        r = client.put(
            f"{BASE}/{post.id}",
            json={"cover_image_url": url},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["cover_image_url"] == url

    def test_clear_cover_image_url(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(
            db, author, cover_image_url="https://example.com/old.jpg"
        )
        r = client.put(
            f"{BASE}/{post.id}",
            json={"cover_image_url": None},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["cover_image_url"] is None

    def test_update_tags_replaces_all(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author, tag_names=["old-tag"])
        new_tag = f"new-{random_lower_string()[:6]}"

        r = client.put(
            f"{BASE}/{post.id}",
            json={"tag_names": [new_tag]},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        names = [t["name"] for t in r.json()["tags"]]
        assert new_tag in names
        assert "old-tag" not in names

    def test_update_duplicate_slug_rejected(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post1 = create_random_post(db, author)
        post2 = create_random_post(db, author)

        r = client.put(
            f"{BASE}/{post2.id}",
            json={"slug": post1.slug},
            headers=superuser_token_headers,
        )
        assert r.status_code == 409

    def test_update_nonexistent_returns_404(
        self, client: TestClient, superuser_token_headers
    ):
        r = client.put(
            f"{BASE}/{uuid.uuid4()}",
            json={"title": "Ghost"},
            headers=superuser_token_headers,
        )
        assert r.status_code == 404

    def test_non_superuser_forbidden(
        self, client: TestClient, db: Session, normal_user_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        r = client.put(
            f"{BASE}/{post.id}",
            json={"title": "Nope"},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 403


# ─────────────────────────── delete post ─────────────────────────────


class TestDeletePost:
    def test_delete_removes_post(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        post_id = post.id

        r = client.delete(f"{BASE}/{post_id}", headers=superuser_token_headers)
        assert r.status_code == 200
        assert r.json()["message"] == "Post deleted successfully"
        db.expire_all()
        assert db.get(Post, post_id) is None

    def test_delete_nonexistent_returns_404(
        self, client: TestClient, superuser_token_headers
    ):
        r = client.delete(f"{BASE}/{uuid.uuid4()}", headers=superuser_token_headers)
        assert r.status_code == 404

    def test_non_superuser_forbidden(
        self, client: TestClient, db: Session, normal_user_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        r = client.delete(f"{BASE}/{post.id}", headers=normal_user_token_headers)
        assert r.status_code == 403


# ──────────────────────── publish endpoint ────────────────────────────


class TestPublishPost:
    def test_publishes_draft(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.draft)
        assert post.status == PostStatus.draft

        r = client.post(f"{BASE}/{post.id}/publish", headers=superuser_token_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "published"
        assert body["published_at"] is not None

    def test_publish_sets_published_at_once(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        """Re-publishing must not overwrite the original published_at."""
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.draft)

        r1 = client.post(f"{BASE}/{post.id}/publish", headers=superuser_token_headers)
        ts1 = r1.json()["published_at"]

        r2 = client.post(f"{BASE}/{post.id}/publish", headers=superuser_token_headers)
        ts2 = r2.json()["published_at"]

        assert ts1 == ts2

    def test_publish_nonexistent_returns_404(
        self, client: TestClient, superuser_token_headers
    ):
        r = client.post(
            f"{BASE}/{uuid.uuid4()}/publish", headers=superuser_token_headers
        )
        assert r.status_code == 404

    def test_non_superuser_forbidden(
        self, client: TestClient, db: Session, normal_user_token_headers
    ):
        author = create_random_user(db)
        post = create_random_post(db, author)
        r = client.post(f"{BASE}/{post.id}/publish", headers=normal_user_token_headers)
        assert r.status_code == 403


# ──────────────────────── admin/all endpoint ─────────────────────────


class TestAdminAllPosts:
    ADMIN_URL = f"{settings.API_V1_STR}/posts/admin/all"

    def test_returns_drafts_and_published(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        draft = create_random_post(db, author, status=PostStatus.draft)
        pub = create_random_post(db, author, status=PostStatus.published)

        r = client.get(self.ADMIN_URL, headers=superuser_token_headers)
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert draft.slug in slugs
        assert pub.slug in slugs

    def test_filter_by_status_draft(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        draft = create_random_post(db, author, status=PostStatus.draft)
        pub = create_random_post(db, author, status=PostStatus.published)

        r = client.get(
            self.ADMIN_URL,
            params={"status": "draft"},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert draft.slug in slugs
        assert pub.slug not in slugs

    def test_filter_by_status_published(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        draft = create_random_post(db, author, status=PostStatus.draft)
        pub = create_random_post(db, author, status=PostStatus.published)

        r = client.get(
            self.ADMIN_URL,
            params={"status": "published"},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert pub.slug in slugs
        assert draft.slug not in slugs

    def test_search_works(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        author = create_random_user(db)
        unique = f"adminsearch{random_lower_string()[:6]}"
        post = create_random_post(db, author, status=PostStatus.draft)
        post.title = f"Admin search {unique}"
        db.add(post)
        db.commit()

        r = client.get(
            self.ADMIN_URL,
            params={"search": unique},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        slugs = [p["slug"] for p in r.json()["posts"]]
        assert post.slug in slugs

    def test_non_superuser_forbidden(
        self, client: TestClient, normal_user_token_headers
    ):
        r = client.get(self.ADMIN_URL, headers=normal_user_token_headers)
        assert r.status_code == 403

    def test_unauthenticated_forbidden(self, client: TestClient):
        r = client.get(self.ADMIN_URL)
        assert r.status_code == 401


# ─────────────────────── PostResponse model ───────────────────────────


class TestPostResponseModel:
    def test_read_time_computed(self, client: TestClient, db: Session):
        """read_time must be non-empty for any returned post."""
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)
        r = client.get(f"{BASE}/{post.slug}")
        assert r.status_code == 200
        rt = r.json()["read_time"]
        assert rt
        assert "min" in rt

    def test_read_time_null_content_safe(self, db: Session):
        """PostResponse.compute_read_time must not crash when content is None."""
        from app.models import PostResponse

        pr = PostResponse(
            id=uuid.uuid4(),
            slug="null-content",
            title="No Content",
            excerpt="x",
            status=PostStatus.draft,
            featured=False,
            cover_image_url=None,
            meta_title=None,
            meta_description=None,
            view_count=0,
            published_at=None,
            created_at=datetime.now(timezone.utc),
            tags=[],
            content=None,
            read_time="",
        )
        assert pr.read_time == "1 min"  # falls back to max(1, 0//200)

    def test_cover_image_url_in_response(
        self, client: TestClient, db: Session, superuser_token_headers
    ):
        url = "https://cdn.example.com/covers/abc123.jpg"
        payload = {
            "title": "Cover test",
            "slug": random_slug(),
            "excerpt": "x",
            "content": "x",
            "cover_image_url": url,
            "status": "published",
        }
        r = client.post(BASE, json=payload, headers=superuser_token_headers)
        assert r.status_code == 200
        slug = r.json()["slug"]

        r2 = client.get(f"{BASE}/{slug}")
        assert r2.status_code == 200
        assert r2.json()["cover_image_url"] == url
