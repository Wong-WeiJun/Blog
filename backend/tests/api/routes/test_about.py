"""Tests for GET/PUT /api/v1/about."""

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import SkillGroup
from app.site_about import get_or_create_site_about

BASE = f"{settings.API_V1_STR}/about"


class TestGetAbout:
    def test_public_get_returns_defaults(self, client: TestClient, db: Session):
        about = get_or_create_site_about(db)
        about.homepage_tagline = "Building cool things in the cloud"
        db.add(about)
        db.commit()

        r = client.get(BASE)
        assert r.status_code == 200
        data = r.json()
        assert data["homepage_tagline"] == "Building cool things in the cloud"
        assert data["skill_groups"]
        assert len(data["certifications"]) >= 1
        assert "owner" in data


class TestUpdateAbout:
    def test_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.put(
            BASE,
            headers=normal_user_token_headers,
            json={"homepage_tagline": "Updated tagline"},
        )
        assert r.status_code == 403

    def test_superuser_can_update(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ):
        try:
            r = client.put(
                BASE,
                headers=superuser_token_headers,
                json={"homepage_tagline": "New tagline from test"},
            )
            assert r.status_code == 200
            assert r.json()["homepage_tagline"] == "New tagline from test"

            get_r = client.get(BASE)
            assert get_r.json()["homepage_tagline"] == "New tagline from test"
        finally:
            client.put(
                BASE,
                headers=superuser_token_headers,
                json={"homepage_tagline": "Building cool things in the cloud"},
            )

    def test_rejects_invalid_skill_level(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        about = get_or_create_site_about(db)
        current_groups = [
            SkillGroup.model_validate(g) for g in (about.skill_groups or [])
        ]
        if current_groups and current_groups[0].skills:
            current_groups[0].skills[0].level = 150

        r = client.put(
            BASE,
            headers=superuser_token_headers,
            json={
                "skill_groups": [g.model_dump() for g in current_groups],
            },
        )
        assert r.status_code == 422
