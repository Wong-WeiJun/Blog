import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import col, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    TokenDep,
    get_current_active_superuser,
    get_token_jti,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Comment,
    CommentLike,
    Message,
    Post,
    UpdatePassword,
    User,
    UserCreate,
    UserDataExport,
    UserDataExportComment,
    UserDataExportPost,
    UserDataExportSession,
    UserPublic,
    UserRegister,
    UserSession,
    UserSessionsPublic,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    get_datetime_utc,
)
from app.services.sessions import (
    delete_user_sessions,
    get_active_sessions,
    revoke_other_sessions,
    revoke_user_session,
    to_session_public,
)
from app.utils import generate_new_account_email, send_email


class AvatarUpdate(BaseModel):
    avatar_url: str | None


router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()

    users_public = [UserPublic.model_validate(user) for user in users]
    return UsersPublic(data=users_public, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    verified, _ = verify_password(body.current_password, current_user.hashed_password)
    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.patch("/me/avatar", response_model=UserPublic)
def update_avatar_me(
    *, session: SessionDep, body: AvatarUpdate, current_user: CurrentUser
) -> Any:
    """
    Save the R2 avatar URL returned after a successful presigned upload.
    The actual file upload happens client-side directly to R2.
    """
    current_user.avatar_url = body.avatar_url
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user


@router.get("/me/export", response_model=UserDataExport)
def export_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Export all data associated with the current user account.
    """
    comments = session.exec(
        select(Comment)
        .where(Comment.author_id == current_user.id)
        .order_by(col(Comment.created_at))
    ).all()

    liked_comment_ids = list(
        session.exec(
            select(CommentLike.comment_id).where(CommentLike.user_id == current_user.id)
        ).all()
    )

    posts = session.exec(
        select(Post)
        .where(Post.author_id == current_user.id)
        .order_by(col(Post.created_at))
    ).all()

    sessions = session.exec(
        select(UserSession)
        .where(UserSession.user_id == current_user.id)
        .order_by(col(UserSession.created_at))
    ).all()

    return UserDataExport(
        exported_at=get_datetime_utc(),
        profile=UserPublic.model_validate(current_user),
        comments=[UserDataExportComment.model_validate(c) for c in comments],
        liked_comment_ids=liked_comment_ids,
        posts=[UserDataExportPost.model_validate(p) for p in posts],
        sessions=[UserDataExportSession.model_validate(s) for s in sessions],
    )


@router.get("/me/sessions", response_model=UserSessionsPublic)
def read_user_sessions(
    session: SessionDep, current_user: CurrentUser, token: TokenDep
) -> Any:
    """
    List active sessions for the current user.
    """
    current_session_id = get_token_jti(token)
    sessions = get_active_sessions(session=session, user_id=current_user.id)
    return UserSessionsPublic(
        data=[
            to_session_public(user_session, current_session_id=current_session_id)
            for user_session in sessions
        ]
    )


@router.delete("/me/sessions/{session_id}", response_model=Message)
def revoke_session(
    session_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    token: TokenDep,
) -> Any:
    """
    Revoke a specific session.
    """
    current_session_id = get_token_jti(token)
    if current_session_id == session_id:
        raise HTTPException(
            status_code=400,
            detail="Use logout to end your current session",
        )
    user_session = session.get(UserSession, session_id)
    if not user_session or user_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    revoke_user_session(session=session, user_session=user_session)
    return Message(message="Session revoked successfully")


@router.delete("/me/sessions", response_model=Message)
def revoke_all_other_sessions(
    session: SessionDep, current_user: CurrentUser, token: TokenDep
) -> Any:
    """
    Revoke all sessions except the current one.
    """
    current_session_id = get_token_jti(token)
    revoked = revoke_other_sessions(
        session=session,
        user_id=current_user.id,
        keep_session_id=current_session_id,
    )
    return Message(message=f"Revoked {revoked} session(s)")


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    delete_user_sessions(session=session, user_id=current_user.id)
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud.create_user(session=session, user_create=user_create)
    return user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user == current_user:
        return user
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """

    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    delete_user_sessions(session=session, user_id=user.id)
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
