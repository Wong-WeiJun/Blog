"""
Tests for /api/v1/projects — public list and admin CRUD.
"""

from fastapi.testclient import TestClient

from app.core.config import settings

BASE = f"{settings.API_V1_STR}/projects"

SAMPLE = {
    "title": "InfraKit",
    "description": "Infrastructure automation toolkit.",
    "stack": ["Terraform", "AWS", "Python"],
    "status": "completed",
    "stars": 42,
    "forks": 7,
    "github_url": "https://github.com/example/infrakit",
    "live_url": None,
    "accent": "#5046e5",
    "category": "DevOps",
    "sort_order": 1,
}


class TestProjectsAuth:
    def test_create_requires_auth(self, client: TestClient):
        r = client.post(BASE, json=SAMPLE)
        assert r.status_code == 401

    def test_create_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.post(BASE, json=SAMPLE, headers=normal_user_token_headers)
        assert r.status_code == 403

    def test_update_requires_superuser(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.put(
            f"{BASE}/{SAMPLE.get('id', '00000000-0000-0000-0000-000000000000')}",
            json={"title": "Updated"},
            headers=normal_user_token_headers,
        )
        assert r.status_code in (403, 404, 422)

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


class TestProjectsCRUD:
    def test_list_is_public(self, client: TestClient, superuser_token_headers: dict[str, str]):
        r_create = client.post(BASE, json=SAMPLE, headers=superuser_token_headers)
        assert r_create.status_code == 200

        r_list = client.get(BASE)
        assert r_list.status_code == 200
        data = r_list.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["title"] == SAMPLE["title"]

    def test_create_update_delete(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ):
        r_create = client.post(BASE, json=SAMPLE, headers=superuser_token_headers)
        assert r_create.status_code == 200
        project = r_create.json()
        project_id = project["id"]
        assert project["stack"] == SAMPLE["stack"]

        r_update = client.put(
            f"{BASE}/{project_id}",
            json={"title": "InfraKit v2", "stars": 50},
            headers=superuser_token_headers,
        )
        assert r_update.status_code == 200
        assert r_update.json()["title"] == "InfraKit v2"
        assert r_update.json()["stars"] == 50

        r_delete = client.delete(f"{BASE}/{project_id}", headers=superuser_token_headers)
        assert r_delete.status_code == 200

        r_missing = client.put(
            f"{BASE}/{project_id}",
            json={"title": "Gone"},
            headers=superuser_token_headers,
        )
        assert r_missing.status_code == 404

    def test_delete_not_found(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
    ):
        r = client.delete(
            f"{BASE}/00000000-0000-0000-0000-000000000000",
            headers=superuser_token_headers,
        )
        assert r.status_code == 404
