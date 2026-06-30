import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.models import (
    Message,
    PaginatedPostsResponse,
    Post,
    PostCreate,
    PostResponse,
    PostStatus,
    PostTagLink,
    PostUpdate,
    Tag,
)

router = APIRouter(tags=["tags"])
