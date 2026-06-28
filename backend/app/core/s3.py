"""
S3 helpers — presigned upload URLs and public URL construction.

boto3 is imported lazily so the app boots fine when S3 is not configured
(AWS_* env vars absent). The upload endpoint itself returns 503 in that case.
"""

from __future__ import annotations

import mimetypes
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

_PRESIGN_EXPIRY_SECONDS = 300  # 5 minutes — plenty for a browser upload


def _client():  # type: ignore[return]
    """Return a boto3 S3 client, or raise ImportError if boto3 is missing."""
    try:
        import boto3  # type: ignore[import-untyped]
    except ImportError as exc:
        raise ImportError(
            "boto3 is required for S3 uploads. Add it to pyproject.toml."
        ) from exc

    from app.core.config import settings

    return boto3.client(
        "s3",
        region_name=settings.AWS_S3_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def generate_cover_key(filename: str) -> str:
    """
    Produce a unique S3 object key for a cover image.
    Pattern: covers/<uuid4>.<ext>
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    # Safelist — reject anything unexpected
    if ext not in {"jpg", "jpeg", "png", "webp", "gif", "avif"}:
        ext = "jpg"
    return f"covers/{uuid.uuid4()}.{ext}"


def generate_avatar_key(user_id: str, filename: str) -> str:
    """
    Produce a unique S3 object key for a user avatar.
    Pattern: avatars/<user_id>/<uuid4>.<ext>
    The user_id sub-prefix makes it easy to list/delete a user's avatars later.
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
    Return a presigned POST dict that the browser uses to upload directly to S3.

    Returns:
        {
            "url": "https://bucket.s3.amazonaws.com",
            "fields": { "key": "...", "Content-Type": "...", ... },
            "public_url": "https://cdn.example.com/covers/xxx.jpg",
        }
    """
    from app.core.config import settings

    client = _client()

    response: dict = client.generate_presigned_post(
        Bucket=settings.AWS_S3_BUCKET,
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

    if settings.AWS_S3_CDN_URL:
        base = settings.AWS_S3_CDN_URL.rstrip("/")
        return f"{base}/{key}"

    bucket = settings.AWS_S3_BUCKET
    region = settings.AWS_S3_REGION
    if region == "us-east-1":
        return f"https://{bucket}.s3.amazonaws.com/{key}"
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


def guess_content_type(filename: str) -> str:
    ct, _ = mimetypes.guess_type(filename)
    return ct or "application/octet-stream"
