import uuid

import jwt
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core import security
from app.core.config import settings
from app.models import UserSession


def _login(client: TestClient, email: str, password: str) -> str:
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": email, "password": password},
        headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/126.0"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def _session_id_from_token(token: str) -> str:
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
    return payload["jti"]


def test_login_creates_tracked_session(client: TestClient, db: Session) -> None:
    token = _login(client, settings.FIRST_SUPERUSER, settings.FIRST_SUPERUSER_PASSWORD)
    session_id = _session_id_from_token(token)
    user_session = db.get(UserSession, uuid.UUID(session_id))
    assert user_session is not None
    assert user_session.browser == "Chrome"
    assert user_session.device == "Mac"
    assert user_session.revoked_at is None


def test_read_user_sessions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/users/me/sessions",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert any(session["is_current"] for session in data)


def test_revoke_other_session(
    client: TestClient,
) -> None:
    first_token = _login(
        client, settings.FIRST_SUPERUSER, settings.FIRST_SUPERUSER_PASSWORD
    )
    second_token = _login(
        client, settings.FIRST_SUPERUSER, settings.FIRST_SUPERUSER_PASSWORD
    )
    other_session_id = _session_id_from_token(first_token)
    current_session_id = _session_id_from_token(second_token)

    revoke_response = client.delete(
        f"{settings.API_V1_STR}/users/me/sessions/{other_session_id}",
        headers={"Authorization": f"Bearer {second_token}"},
    )
    assert revoke_response.status_code == 200

    blocked_response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers={"Authorization": f"Bearer {first_token}"},
    )
    assert blocked_response.status_code == 403

    current_response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers={"Authorization": f"Bearer {second_token}"},
    )
    assert current_response.status_code == 200
    assert current_session_id != other_session_id


def test_cannot_revoke_current_session(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    token = normal_user_token_headers["Authorization"].removeprefix("Bearer ")
    session_id = _session_id_from_token(token)
    response = client.delete(
        f"{settings.API_V1_STR}/users/me/sessions/{session_id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400


def test_logout_revokes_current_session(client: TestClient) -> None:
    token = _login(client, settings.FIRST_SUPERUSER, settings.FIRST_SUPERUSER_PASSWORD)
    headers = {"Authorization": f"Bearer {token}"}
    logout_response = client.post(
        f"{settings.API_V1_STR}/login/logout", headers=headers
    )
    assert logout_response.status_code == 200

    me_response = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)
    assert me_response.status_code == 403
