"""
Upload endpoints — server-side Cloudflare R2 uploads (avoids browser CORS to R2).

POST /api/v1/uploads/cover-image   → upload a post cover image (admin only)
POST /api/v1/uploads/avatar          → upload a profile picture (any logged-in user)

Legacy presigned URL endpoints remain for backwards compatibility:
POST /api/v1/uploads/cover-image-url
POST /api/v1/uploads/avatar-url
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.api.deps import CurrentUser, get_current_active_superuser
from app.core.config import settings
from app.core.r2 import (
    generate_avatar_key,
    generate_cover_key,
    guess_content_type,
    presign_upload,
    upload_object,
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


class UploadedResponse(BaseModel):
    public_url: str
    key: str


def _validated_content_type(filename: str, content_type: str | None) -> str:
    ct = (content_type or "").lower().strip()
    if not ct or ct not in _ALLOWED_TYPES:
        ct = guess_content_type(filename)
    if ct not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported image type '{ct}'. Allowed: JPEG, PNG, WebP, GIF, AVIF.",
        )
    return ct


async def _read_upload(file: UploadFile, max_bytes: int) -> bytes:
    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Empty file.",
        )
    if len(data) > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image must be under {limit_mb} MB.",
        )
    return data


def _require_r2() -> None:
    if not settings.r2_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="R2 object storage is not configured on this server.",
        )


def _do_upload(key: str, content_type: str, data: bytes) -> UploadedResponse:
    _require_r2()
    try:
        public_url = upload_object(key, content_type, data)
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="boto3 is not installed. Run: uv add boto3",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not upload image: {exc}",
        )
    return UploadedResponse(public_url=public_url, key=key)


def _do_presign(key: str, ct: str, max_bytes: int) -> PresignResponse:
    _require_r2()
    try:
        from app.core.r2 import presign_upload as _presign  # noqa: F401

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
    "/cover-image",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UploadedResponse,
    summary="Upload a post cover image via the backend (admin only)",
)
async def upload_cover_image(file: UploadFile = File(...)) -> UploadedResponse:
    filename = file.filename or "cover.jpg"
    content_type = _validated_content_type(filename, file.content_type)
    data = await _read_upload(file, _MAX_COVER_BYTES)
    key = generate_cover_key(filename)
    return _do_upload(key, content_type, data)


@router.post(
    "/avatar",
    response_model=UploadedResponse,
    summary="Upload a profile picture via the backend (any logged-in user)",
)
async def upload_avatar(
    current_user: CurrentUser,
    file: UploadFile = File(...),
) -> UploadedResponse:
    filename = file.filename or "avatar.jpg"
    content_type = _validated_content_type(filename, file.content_type)
    data = await _read_upload(file, _MAX_AVATAR_BYTES)
    key = generate_avatar_key(str(current_user.id), filename)
    return _do_upload(key, content_type, data)


@router.post(
    "/cover-image-url",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=PresignResponse,
    summary="Get a presigned R2 URL to upload a post cover image (admin only)",
)
def get_cover_image_upload_url(body: PresignRequest) -> PresignResponse:
    ct = _validated_content_type(body.filename, body.content_type)
    key = generate_cover_key(body.filename)
    return _do_presign(key, ct, _MAX_COVER_BYTES)


@router.post(
    "/avatar-url",
    response_model=PresignResponse,
    summary="Get a presigned R2 URL to upload a profile picture (any logged-in user)",
)
def get_avatar_upload_url(
    body: PresignRequest,
    current_user: CurrentUser,
) -> PresignResponse:
    ct = _validated_content_type(body.filename, body.content_type)
    key = generate_avatar_key(str(current_user.id), body.filename)
    return _do_presign(key, ct, _MAX_AVATAR_BYTES)
