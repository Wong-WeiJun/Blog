from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import SiteAboutResponse, SiteAboutUpdate
from app.site_about import (
    build_site_about_response,
    get_or_create_site_about,
    update_site_about,
)

router = APIRouter(tags=["about"])


@router.get("", response_model=SiteAboutResponse)
def get_about(*, session: SessionDep) -> SiteAboutResponse:
    about = get_or_create_site_about(session)
    return build_site_about_response(session, about)


@router.put(
    "",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=SiteAboutResponse,
)
def update_about(
    *, session: SessionDep, about_in: SiteAboutUpdate
) -> SiteAboutResponse:
    about = update_site_about(session, about_in)
    return build_site_about_response(session, about)
