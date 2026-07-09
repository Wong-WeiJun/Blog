from sqlmodel import Session, select

from app.core.config import settings
from app.models import (
    Certification,
    EducationEntry,
    Interest,
    SiteAbout,
    SiteAboutResponse,
    SiteAboutUpdate,
    SiteOwner,
    SkillGroup,
    User,
    get_datetime_utc,
)

SITE_ABOUT_ID = 1


def get_site_owner(session: Session) -> User | None:
    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if user:
        return user
    return session.exec(
        select(User)
        .where(User.is_superuser == True)  # noqa: E712
        .order_by(User.created_at.asc())  # type: ignore[attr-defined]
    ).first()


def get_or_create_site_about(session: Session) -> SiteAbout:
    about = session.get(SiteAbout, SITE_ABOUT_ID)
    if about:
        return about
    about = SiteAbout(id=SITE_ABOUT_ID)
    session.add(about)
    session.commit()
    session.refresh(about)
    return about


def _serialize_lists(about: SiteAbout) -> dict:
    return {
        "skill_groups": [
            SkillGroup.model_validate(g) for g in (about.skill_groups or [])
        ],
        "certifications": [
            Certification.model_validate(c) for c in (about.certifications or [])
        ],
        "education": [
            EducationEntry.model_validate(e) for e in (about.education or [])
        ],
        "interests": [Interest.model_validate(i) for i in (about.interests or [])],
    }


def build_site_about_response(session: Session, about: SiteAbout) -> SiteAboutResponse:
    owner_user = get_site_owner(session)
    owner = SiteOwner(
        full_name=owner_user.full_name if owner_user else None,
        avatar_url=owner_user.avatar_url if owner_user else None,
    )
    lists = _serialize_lists(about)
    return SiteAboutResponse(
        homepage_tagline=about.homepage_tagline,
        homepage_headline=about.homepage_headline,
        homepage_headline_accent=about.homepage_headline_accent,
        homepage_bio=about.homepage_bio,
        hero_subtitle=about.hero_subtitle,
        hero_bio=about.hero_bio,
        open_to_work=about.open_to_work,
        resume_url=about.resume_url,
        github_url=about.github_url,
        linkedin_url=about.linkedin_url,
        about_paragraphs=about.about_paragraphs or [],
        pull_quote=about.pull_quote,
        pull_quote_attribution=about.pull_quote_attribution,
        location=about.location,
        availability_text=about.availability_text,
        cta_heading=about.cta_heading,
        cta_subtext=about.cta_subtext,
        owner=owner,
        updated_at=about.updated_at,
        **lists,
    )


def update_site_about(session: Session, about_in: SiteAboutUpdate) -> SiteAbout:
    about = get_or_create_site_about(session)
    update_data = about_in.model_dump(exclude_unset=True)

    json_list_fields = ("skill_groups", "certifications", "education", "interests")
    for field in json_list_fields:
        if field in update_data and update_data[field] is not None:
            update_data[field] = [
                item.model_dump() if hasattr(item, "model_dump") else item
                for item in update_data[field]
            ]

    for field, value in update_data.items():
        setattr(about, field, value)

    about.updated_at = get_datetime_utc()
    session.add(about)
    session.commit()
    session.refresh(about)
    return about
