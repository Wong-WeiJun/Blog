"""
Upload endpoints — presigned S3 URLs for browser-direct uploads.

POST /api/v1/uploads/cover-image-url   → presigned URL for post cover images
POST /api/v1/uploads/avatar-url        → presigned URL for user profile pictures

Flow for both:
  1. Client calls the endpoint, receives { url, fields, public_url, key }.
  2. Browser POSTs the file as multipart/form-data to `url` with `fields` first.
  3. Client stores `public_url` and then calls the appropriate save endpoint
     (PATCH /posts/{id} or PATCH /users/me/avatar).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import CurrentUser, get_current_active_superuser
from app.core.config import settings
from app.core.s3 import (
    generate_avatar_key,
    generate_cover_key,
    guess_content_type,
    presign_upload,
)

router = APIRouter(tags=["uploads"])

_ALLOWED_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
}

_MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5 MB
_MAX_COVER_BYTES = 10 * 1024 * 1024  # 10 MB


class PresignRequest(BaseModel):
    filename: str
    content_type: str


class PresignResponse(BaseModel):
    url: str
    fields: dict[str, str]
    public_url: str
    key: str


def _validated_content_type(body: PresignRequest) -> str:
    ct = body.content_type.lower().strip()
    if not ct or ct not in _ALLOWED_TYPES:
        ct = guess_content_type(body.filename)
    if ct not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported image type '{ct}'. Allowed: JPEG, PNG, WebP, GIF, AVIF.",
        )
    return ct


def _do_presign(key: str, ct: str, max_bytes: int) -> PresignResponse:
    if not settings.s3_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3 is not configured on this server.",
        )
    try:
        from app.core.s3 import presign_upload as _presign  # noqa: F401

        result = presign_upload(key, ct, max_bytes=max_bytes)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="boto3 is not installed. Run: uv add boto3",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not generate upload URL: {exc}",
        )
    return PresignResponse(
        url=str(result["url"]),
        fields=result["fields"],  # type: ignore[arg-type]
        public_url=str(result["public_url"]),
        key=key,
    )


@router.post(
    "/cover-image-url",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PresignResponse,
    summary="Get a presigned S3 URL to upload a post cover image (admin only)",
)
def get_cover_image_upload_url(body: PresignRequest) -> PresignResponse:
    ct = _validated_content_type(body)
    key = generate_cover_key(body.filename)
    return _do_presign(key, ct, _MAX_COVER_BYTES)


@router.post(
    "/avatar-url",
    response_model=PresignResponse,
    summary="Get a presigned S3 URL to upload a profile picture (any logged-in user)",
)
def get_avatar_upload_url(
    body: PresignRequest,
    current_user: CurrentUser,
) -> PresignResponse:
    ct = _validated_content_type(body)
    key = generate_avatar_key(str(current_user.id), body.filename)
    return _do_presign(key, ct, _MAX_AVATAR_BYTES)
