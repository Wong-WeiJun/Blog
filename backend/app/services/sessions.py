import uuid
from datetime import datetime, timezone

from sqlmodel import Session, col, delete, select

from app.models import UserSession, UserSessionPublic
from app.services.user_agent import parse_user_agent


def format_location(ip_address: str | None) -> str:
    if not ip_address:
        return "Unknown location"
    if ip_address in {"127.0.0.1", "::1", "localhost"}:
        return "Local"
    return ip_address


def create_user_session(
    *,
    session: Session,
    user_id: uuid.UUID,
    session_id: uuid.UUID,
    user_agent: str | None,
    ip_address: str | None,
    expires_at: datetime,
) -> UserSession:
    parsed = parse_user_agent(user_agent)
    now = datetime.now(timezone.utc)
    user_session = UserSession(
        id=session_id,
        user_id=user_id,
        user_agent=user_agent,
        ip_address=ip_address,
        device=parsed.device,
        browser=parsed.browser,
        os=parsed.os,
        device_type=parsed.device_type,
        created_at=now,
        last_seen_at=now,
        expires_at=expires_at,
    )
    session.add(user_session)
    session.commit()
    session.refresh(user_session)
    return user_session


def get_active_sessions(*, session: Session, user_id: uuid.UUID) -> list[UserSession]:
    now = datetime.now(timezone.utc)
    statement = (
        select(UserSession)
        .where(UserSession.user_id == user_id)
        .where(UserSession.revoked_at.is_(None))  # type: ignore[union-attr]
        .where(col(UserSession.expires_at) > now)
        .order_by(col(UserSession.last_seen_at).desc())
    )
    return list(session.exec(statement).all())


def to_session_public(
    user_session: UserSession, *, current_session_id: uuid.UUID | None
) -> UserSessionPublic:
    return UserSessionPublic(
        id=user_session.id,
        device=user_session.device,
        browser=user_session.browser,
        os=user_session.os,
        location=format_location(user_session.ip_address),
        device_type=user_session.device_type,
        is_current=current_session_id == user_session.id,
        last_seen_at=user_session.last_seen_at,
        created_at=user_session.created_at,
    )


def touch_user_session(*, session: Session, user_session: UserSession) -> None:
    now = datetime.now(timezone.utc)
    if (now - user_session.last_seen_at).total_seconds() < 300:
        return
    user_session.last_seen_at = now
    session.add(user_session)
    session.commit()


def delete_user_sessions(*, session: Session, user_id: uuid.UUID) -> None:
    session.exec(delete(UserSession).where(UserSession.user_id == user_id))


def revoke_user_session(*, session: Session, user_session: UserSession) -> None:
    if user_session.revoked_at is not None:
        return
    user_session.revoked_at = datetime.now(timezone.utc)
    session.add(user_session)
    session.commit()


def revoke_other_sessions(
    *,
    session: Session,
    user_id: uuid.UUID,
    keep_session_id: uuid.UUID | None,
) -> int:
    now = datetime.now(timezone.utc)
    statement = (
        select(UserSession)
        .where(UserSession.user_id == user_id)
        .where(UserSession.revoked_at.is_(None))  # type: ignore[union-attr]
    )
    sessions = session.exec(statement).all()
    revoked = 0
    for user_session in sessions:
        if keep_session_id and user_session.id == keep_session_id:
            continue
        user_session.revoked_at = now
        session.add(user_session)
        revoked += 1
    if revoked:
        session.commit()
    return revoked
