from fastapi import APIRouter

from app.api.routes import comments, login, posts, private, tags, uploads, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(posts.router, prefix="/posts")
api_router.include_router(uploads.router, prefix="/uploads")
api_router.include_router(tags.router, prefix="/tags")
api_router.include_router(comments.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
