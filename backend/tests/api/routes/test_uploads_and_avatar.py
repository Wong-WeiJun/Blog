"""
Tests for:
  POST /api/v1/uploads/cover-image-url  — presigned cover upload URL
  POST /api/v1/uploads/avatar-url       — presigned avatar upload URL
  PATCH /api/v1/users/me/avatar         — persist avatar URL after S3 upload

S3 calls are always mocked: we never hit AWS in tests.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings

COVER_URL = f"{settings.API_V1_STR}/uploads/cover-image-url"
AVATAR_URL = f"{settings.API_V1_STR}/uploads/avatar-url"
SAVE_AVATAR_URL = f"{settings.API_V1_STR}/users/me/avatar"

# ── fake presign response returned by the mocked boto3 client ────────

_FAKE_PRESIGN = {
    "url": "https://fake-bucket.s3.amazonaws.com/",
    "fields": {
        "key": "covers/fake-uuid.jpg",
        "Content-Type": "image/jpeg",
        "x-amz-credential": "FAKE/20260101/us-east-1/s3/aws4_request",
        "policy": "base64encodedpolicy",
        "x-amz-signature": "fakesig",
    },
}

_S3_ENABLED_SETTINGS = {
    "AWS_ACCESS_KEY_ID": "FAKEID",
    "AWS_SECRET_ACCESS_KEY": "FAKESECRET",
    "AWS_S3_BUCKET": "fake-bucket",
    "AWS_S3_REGION": "us-east-1",
    "AWS_S3_CDN_URL": None,
}


def _s3_mock():
    """Context manager: patches settings to enable S3 + mocks the boto3 client."""
    boto3_client = MagicMock()
    boto3_client.generate_presigned_post.return_value = _FAKE_PRESIGN

    patches = [
        patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
        patch("app.core.s3._client", return_value=boto3_client),
    ]
    return patches


# ──────────────────────── cover-image-url ────────────────────────────


class TestCoverImageUrl:
    def test_requires_superuser(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        r = client.post(
            COVER_URL,
            json={"filename": "cover.jpg", "content_type": "image/jpeg"},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 403

    def test_requires_auth(self, client: TestClient):
        r = client.post(
            COVER_URL,
            json={"filename": "cover.jpg", "content_type": "image/jpeg"},
        )
        assert r.status_code == 401

    def test_returns_503_when_s3_not_configured(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        with patch.multiple(
            "app.core.config.settings",
            AWS_ACCESS_KEY_ID=None,
            AWS_SECRET_ACCESS_KEY=None,
            AWS_S3_BUCKET=None,
        ):
            r = client.post(
                COVER_URL,
                json={"filename": "cover.jpg", "content_type": "image/jpeg"},
                headers=superuser_token_headers,
            )
            assert r.status_code == 503
            assert "S3 is not configured" in r.json()["detail"]

    def test_returns_presign_when_s3_configured(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={"filename": "photo.jpg", "content_type": "image/jpeg"},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200
        body = r.json()
        assert "url" in body
        assert "fields" in body
        assert "public_url" in body
        assert "key" in body
        assert body["key"].startswith("covers/")
        assert body["key"].endswith(".jpg")

    @pytest.mark.parametrize(
        "filename,content_type,expected_ext",
        [
            ("photo.jpg", "image/jpeg", ".jpg"),
            ("photo.png", "image/png", ".png"),
            ("photo.webp", "image/webp", ".webp"),
            ("photo.gif", "image/gif", ".gif"),
            ("photo.avif", "image/avif", ".avif"),
        ],
    )
    def test_accepted_image_types(
        self,
        client: TestClient,
        superuser_token_headers: dict[str, str],
        filename: str,
        content_type: str,
        expected_ext: str,
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={"filename": filename, "content_type": content_type},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200
        assert r.json()["key"].endswith(expected_ext)

    def test_rejects_non_image_content_type(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={
                    "filename": "malware.exe",
                    "content_type": "application/octet-stream",
                },
                headers=superuser_token_headers,
            )

        assert r.status_code == 422
        assert "Unsupported image type" in r.json()["detail"]

    def test_public_url_uses_cdn_when_configured(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN
        cdn = "https://d1234abcdef.cloudfront.net"

        with (
            patch.multiple(
                "app.core.config.settings",
                **{**_S3_ENABLED_SETTINGS, "AWS_S3_CDN_URL": cdn},
            ),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={"filename": "cover.png", "content_type": "image/png"},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200
        assert r.json()["public_url"].startswith(cdn)

    def test_public_url_uses_s3_domain_when_no_cdn(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={"filename": "cover.jpg", "content_type": "image/jpeg"},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200
        assert "s3.amazonaws.com" in r.json()["public_url"]
        assert "covers/" in r.json()["public_url"]

    def test_content_type_guessed_from_filename_when_blank(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        """If content_type is unrecognised, the endpoint falls back to guessing from filename."""
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                COVER_URL,
                json={"filename": "cover.jpeg", "content_type": "garbage/type"},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200  # guesses image/jpeg from .jpeg extension


# ──────────────────────── avatar-url ─────────────────────────────────


class TestAvatarUrl:
    def test_requires_auth(self, client: TestClient):
        r = client.post(
            AVATAR_URL,
            json={"filename": "me.jpg", "content_type": "image/jpeg"},
        )
        assert r.status_code == 401

    def test_normal_user_can_request(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        """Any logged-in user (not just superuser) can get an avatar presign URL."""
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                AVATAR_URL,
                json={"filename": "me.jpg", "content_type": "image/jpeg"},
                headers=normal_user_token_headers,
            )

        assert r.status_code == 200

    def test_superuser_can_request(
        self, client: TestClient, superuser_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                AVATAR_URL,
                json={"filename": "me.png", "content_type": "image/png"},
                headers=superuser_token_headers,
            )

        assert r.status_code == 200

    def test_key_scoped_to_user_id(
        self,
        client: TestClient,
        db: Session,
        normal_user_token_headers: dict[str, str],
    ):
        """Avatar keys must be namespaced under avatars/<user-id>/."""
        from app import crud

        user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
        assert user

        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                AVATAR_URL,
                json={"filename": "me.jpg", "content_type": "image/jpeg"},
                headers=normal_user_token_headers,
            )

        assert r.status_code == 200
        key = r.json()["key"]
        assert key.startswith(f"avatars/{user.id}/")

    def test_returns_503_when_s3_not_configured(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        with patch.multiple(
            "app.core.config.settings",
            AWS_ACCESS_KEY_ID=None,
            AWS_SECRET_ACCESS_KEY=None,
            AWS_S3_BUCKET=None,
        ):
            r = client.post(
                AVATAR_URL,
                json={"filename": "me.jpg", "content_type": "image/jpeg"},
                headers=normal_user_token_headers,
            )
            assert r.status_code == 503

    def test_rejects_non_image(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                AVATAR_URL,
                json={
                    "filename": "script.js",
                    "content_type": "application/javascript",
                },
                headers=normal_user_token_headers,
            )

        assert r.status_code == 422

    def test_each_request_produces_unique_key(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        keys = []
        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            for _ in range(3):
                r = client.post(
                    AVATAR_URL,
                    json={"filename": "me.jpg", "content_type": "image/jpeg"},
                    headers=normal_user_token_headers,
                )
                assert r.status_code == 200
                keys.append(r.json()["key"])

        assert len(set(keys)) == 3, "Keys should be unique per request"

    def test_public_url_contains_avatars_prefix(
        self, client: TestClient, normal_user_token_headers: dict[str, str]
    ):
        boto_mock = MagicMock()
        boto_mock.generate_presigned_post.return_value = _FAKE_PRESIGN

        with (
            patch.multiple("app.core.config.settings", **_S3_ENABLED_SETTINGS),
            patch("app.core.s3._client", return_value=boto_mock),
        ):
            r = client.post(
                AVATAR_URL,
                json={"filename": "avatar.webp", "content_type": "image/webp"},
                headers=normal_user_token_headers,
            )

        assert r.status_code == 200
        assert "avatars/" in r.json()["public_url"]


# ─────────────────── PATCH /users/me/avatar ──────────────────────────


class TestSaveAvatar:
    def test_save_avatar_url_persists_to_db(
        self,
        client: TestClient,
        db: Session,
        normal_user_token_headers: dict[str, str],
    ):
        url = "https://fake-bucket.s3.amazonaws.com/avatars/user-id/abc.jpg"
        r = client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": url},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 200
        body = r.json()
        assert body["avatar_url"] == url

        from app import crud

        user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
        assert user
        db.refresh(user)
        assert user.avatar_url == url

    def test_clear_avatar_url(
        self,
        client: TestClient,
        db: Session,
        normal_user_token_headers: dict[str, str],
    ):
        # First set it
        url = "https://fake-bucket.s3.amazonaws.com/avatars/user-id/to-remove.jpg"
        client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": url},
            headers=normal_user_token_headers,
        )

        # Then clear it
        r = client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": None},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["avatar_url"] is None

        from app import crud

        user = crud.get_user_by_email(session=db, email=settings.EMAIL_TEST_USER)
        db.refresh(user)
        assert user.avatar_url is None

    def test_requires_auth(self, client: TestClient):
        r = client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": "https://example.com/pic.jpg"},
        )
        assert r.status_code == 401

    def test_superuser_can_save_avatar(
        self,
        client: TestClient,
        db: Session,
        superuser_token_headers: dict[str, str],
    ):
        url = "https://fake-bucket.s3.amazonaws.com/avatars/su/pic.png"
        r = client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": url},
            headers=superuser_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["avatar_url"] == url

    def test_response_is_full_user_object(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        r = client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": "https://example.com/a.jpg"},
            headers=normal_user_token_headers,
        )
        assert r.status_code == 200
        body = r.json()
        # UserPublic fields should all be present
        assert "id" in body
        assert "email" in body
        assert "is_active" in body
        assert "avatar_url" in body

    def test_avatar_url_appears_in_me_endpoint(
        self,
        client: TestClient,
        normal_user_token_headers: dict[str, str],
    ):
        url = "https://cdn.example.com/avatars/visible-in-me.jpg"
        client.patch(
            SAVE_AVATAR_URL,
            json={"avatar_url": url},
            headers=normal_user_token_headers,
        )
        r = client.get(
            f"{settings.API_V1_STR}/users/me",
            headers=normal_user_token_headers,
        )
        assert r.status_code == 200
        assert r.json()["avatar_url"] == url


# ──────────────────────── s3 unit tests ─────────────────────────────


class TestS3Helpers:
    """Pure unit tests for app.core.s3 — no HTTP, no fixtures needed."""

    def test_generate_cover_key_format(self):
        from app.core.s3 import generate_cover_key

        key = generate_cover_key("photo.jpg")
        assert key.startswith("covers/")
        assert key.endswith(".jpg")
        # UUID4 part has 36 chars between covers/ and .jpg
        uuid_part = key[len("covers/") : -len(".jpg")]
        import uuid

        uuid.UUID(uuid_part)  # raises ValueError if not a valid UUID

    def test_generate_cover_key_unknown_ext_defaults_to_jpg(self):
        from app.core.s3 import generate_cover_key

        key = generate_cover_key("photo.bmp")
        assert key.endswith(".jpg")

    def test_generate_cover_key_no_ext_defaults_to_jpg(self):
        from app.core.s3 import generate_cover_key

        key = generate_cover_key("photonoext")
        assert key.endswith(".jpg")

    @pytest.mark.parametrize("ext", ["jpg", "jpeg", "png", "webp", "gif", "avif"])
    def test_generate_cover_key_safelisted_extensions(self, ext: str):
        from app.core.s3 import generate_cover_key

        key = generate_cover_key(f"photo.{ext}")
        # jpeg normalises to jpg or jpeg depending on input
        assert key.split(".")[-1] == ext

    def test_generate_avatar_key_format(self):
        import uuid

        from app.core.s3 import generate_avatar_key

        user_id = str(uuid.uuid4())
        key = generate_avatar_key(user_id, "me.png")
        assert key.startswith(f"avatars/{user_id}/")
        assert key.endswith(".png")

    def test_generate_avatar_key_unique_per_call(self):
        import uuid

        from app.core.s3 import generate_avatar_key

        uid = str(uuid.uuid4())
        keys = {generate_avatar_key(uid, "me.jpg") for _ in range(10)}
        assert len(keys) == 10

    def test_generate_avatar_key_unknown_ext_defaults_to_jpg(self):
        from app.core.s3 import generate_avatar_key

        key = generate_avatar_key("user-123", "selfie.tiff")
        assert key.endswith(".jpg")

    def test_public_url_no_cdn_us_east_1(self):
        from app.core.s3 import _public_url

        with patch.multiple(
            "app.core.config.settings",
            AWS_S3_BUCKET="my-bucket",
            AWS_S3_REGION="us-east-1",
            AWS_S3_CDN_URL=None,
        ):
            url = _public_url("covers/abc.jpg")

        assert url == "https://my-bucket.s3.amazonaws.com/covers/abc.jpg"

    def test_public_url_no_cdn_other_region(self):
        from app.core.s3 import _public_url

        with patch.multiple(
            "app.core.config.settings",
            AWS_S3_BUCKET="my-bucket",
            AWS_S3_REGION="ap-southeast-1",
            AWS_S3_CDN_URL=None,
        ):
            url = _public_url("covers/abc.jpg")

        assert url == "https://my-bucket.s3.ap-southeast-1.amazonaws.com/covers/abc.jpg"

    def test_public_url_with_cdn(self):
        from app.core.s3 import _public_url

        with patch.multiple(
            "app.core.config.settings",
            AWS_S3_BUCKET="my-bucket",
            AWS_S3_REGION="us-east-1",
            AWS_S3_CDN_URL="https://d1234abcdef.cloudfront.net",
        ):
            url = _public_url("avatars/uid/pic.jpg")

        assert url == "https://d1234abcdef.cloudfront.net/avatars/uid/pic.jpg"

    def test_public_url_cdn_trailing_slash_stripped(self):
        from app.core.s3 import _public_url

        with patch.multiple(
            "app.core.config.settings",
            AWS_S3_BUCKET="b",
            AWS_S3_REGION="us-east-1",
            AWS_S3_CDN_URL="https://cdn.example.com/",
        ):
            url = _public_url("covers/x.jpg")

        assert not url.endswith("//")
        assert url == "https://cdn.example.com/covers/x.jpg"

    def test_guess_content_type_jpeg(self):
        from app.core.s3 import guess_content_type

        assert guess_content_type("photo.jpg") == "image/jpeg"
        assert guess_content_type("photo.jpeg") == "image/jpeg"

    def test_guess_content_type_png(self):
        from app.core.s3 import guess_content_type

        assert guess_content_type("image.png") == "image/png"

    def test_guess_content_type_unknown_falls_back(self):
        from app.core.s3 import guess_content_type

        ct = guess_content_type("file.unknown123")
        assert ct == "application/octet-stream"
