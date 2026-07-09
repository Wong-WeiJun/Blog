"""
Cloudflare R2 helpers — presigned upload URLs and public URL construction.

R2 exposes an S3-compatible API via boto3. boto3 is imported lazily so the app
boots fine when R2 is not configured (R2_* env vars absent). The upload endpoint
itself returns 503 in that case.
"""

from __future__ import annotations

import mimetypes
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

_PRESIGN_EXPIRY_SECONDS = 300  # 5 minutes — plenty for a browser upload


def _endpoint_url() -> str:
    from app.core.config import settings

    account_id = settings.R2_ACCOUNT_ID
    if not account_id:
        raise ValueError("R2_ACCOUNT_ID is required for R2 uploads.")
    return f"https://{account_id}.r2.cloudflarestorage.com"


def _client():  # type: ignore[return]
    """Return a boto3 S3 client pointed at Cloudflare R2."""
    try:
        import boto3  # type: ignore[import-untyped]
        from botocore.config import Config  # type: ignore[import-untyped]
    except ImportError as exc:
        raise ImportError(
            "boto3 is required for R2 uploads. Add it to pyproject.toml."
        ) from exc

    from app.core.config import settings

    return boto3.client(
        "s3",
        endpoint_url=_endpoint_url(),
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def generate_cover_key(filename: str) -> str:
    """
    Produce a unique R2 object key for a cover image.
    Pattern: covers/<uuid4>.<ext>
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif", "avif"}:
        ext = "jpg"
    return f"covers/{uuid.uuid4()}.{ext}"


def generate_avatar_key(user_id: str, filename: str) -> str:
    """
    Produce a unique R2 object key for a user avatar.
    Pattern: avatars/<user_id>/<uuid4>.<ext>
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif", "avif"}:
        ext = "jpg"
    return f"avatars/{user_id}/{uuid.uuid4()}.{ext}"


def presign_upload(
    key: str,
    content_type: str,
    max_bytes: int = 10 * 1024 * 1024,
) -> dict[str, object]:
    """
    Return a presigned POST dict that the browser uses to upload directly to R2.

    Returns:
        {
            "url": "https://<account>.r2.cloudflarestorage.com/<bucket>",
            "fields": { "key": "...", "Content-Type": "...", ... },
            "public_url": "https://cdn.example.com/covers/xxx.jpg",
        }
    """
    from app.core.config import settings

    client = _client()

    response: dict = client.generate_presigned_post(
        Bucket=settings.R2_BUCKET,
        Key=key,
        Fields={"Content-Type": content_type},
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 1, max_bytes],
        ],
        ExpiresIn=_PRESIGN_EXPIRY_SECONDS,
    )

    public_url = _public_url(key)
    return {**response, "public_url": public_url}


def _public_url(key: str) -> str:
    """Construct the public URL for an already-uploaded object."""
    from app.core.config import settings

    if settings.R2_PUBLIC_URL:
        base = settings.R2_PUBLIC_URL.rstrip("/")
        return f"{base}/{key}"

    # Fallback when no custom domain / r2.dev public URL is configured.
    # Objects are not publicly readable at this URL unless the bucket allows it.
    endpoint = _endpoint_url().rstrip("/")
    bucket = settings.R2_BUCKET
    return f"{endpoint}/{bucket}/{key}"


def guess_content_type(filename: str) -> str:
    ct, _ = mimetypes.guess_type(filename)
    return ct or "application/octet-stream"
