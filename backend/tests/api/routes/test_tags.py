"""
Tests for /api/v1/tags — public list and admin create/delete.
"""

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import PostStatus
from tests.utils.posts import create_random_post, create_random_tag
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string

BASE = f"{settings.API_V1_STR}/tags"


class TestTagsAuth:
    def test_create_requires_auth(self, client: TestClient):
        r = client.post(BASE, json={"name": "AWS", "color": "#f97316"})
        assert r.status_code == 401

    def test_create_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.post(
            BASE,
            json={"name": "AWS", "color": "#f97316"},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 403

    def test_delete_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.delete(
            f"{BASE}/00000000-0000-0000-0000-000000000000",
            headers=normal_user_token_headers,
        )
        assert r.status_code in (403, 404)


class TestTagsCRUD:
    def test_list_is_public(self, client: TestClient, db: Session):
        create_random_tag(db, name=f"tag-{random_lower_string()[:6]}")
        r = client.get(BASE)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_tag(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        name = f"new-tag-{random_lower_string()[:6]}"
        r = client.post(
            BASE,
            json={"name": name, "color": "#22c55e"},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == name
        assert data["color"] == "#22c55e"
        assert data["post_count"] == 0

    def test_create_duplicate_name(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        tag = create_random_tag(db)
        r = client.post(
            BASE,
            json={"name": tag.name, "color": "#5046e5"},
            headers=superuser_token_headers,
        )
        assert r.status_code == 409

    def test_delete_unused_tag(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        tag = create_random_tag(db)
        r = client.delete(f"{BASE}/{tag.id}", headers=superuser_token_headers)
        assert r.status_code == 200

        r_missing = client.delete(f"{BASE}/{tag.id}", headers=superuser_token_headers)
        assert r_missing.status_code == 404

    def test_delete_tag_in_use_blocked(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        author = create_random_user(db)
        tag = create_random_tag(db)
        create_random_post(
            db, author, status=PostStatus.published, tag_names=[tag.name]
        )

        r = client.delete(f"{BASE}/{tag.id}", headers=superuser_token_headers)
        assert r.status_code == 409
        assert "post" in r.json()["detail"].lower()
