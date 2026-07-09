import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    TokenDep,
    get_current_active_superuser,
    get_token_jti,
)
from app.core import security
from app.core.config import settings
from app.models import (
    Message,
    NewPassword,
    Token,
    UserPublic,
    UserSession,
    UserUpdate,
    VerifyEmail,
)
from app.services.sessions import create_user_session, revoke_user_session
from app.utils import (
    email_delivery_enabled,
    generate_email_verification_token,
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    send_verification_email,
    verify_email_verification_token,
    verify_password_reset_token,
)

router = APIRouter(tags=["login"])
logger = logging.getLogger(__name__)


@router.post("/login/access-token")
def login_access_token(
    request: Request,
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    elif not user.email_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session_id = uuid.uuid4()
    expires_at = datetime.now(timezone.utc) + access_token_expires
    jti: str | None = str(session_id)
    try:
        create_user_session(
            session=session,
            user_id=user.id,
            session_id=session_id,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host if request.client else None,
            expires_at=expires_at,
        )
    except Exception:
        logger.exception(
            "Failed to create user session; issuing token without session id"
        )
        jti = None
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires, jti=jti
        )
    )


@router.post("/login/logout", response_model=Message)
def logout(session: SessionDep, current_user: CurrentUser, token: TokenDep) -> Message:
    """
    Revoke the current session.
    """
    session_id = get_token_jti(token)
    if session_id:
        user_session = session.get(UserSession, session_id)
        if user_session and user_session.user_id == current_user.id:
            revoke_user_session(session=session, user_session=user_session)
    return Message(message="Logged out successfully")


@router.post("/login/test-token", response_model=UserPublic)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user


@router.post("/password-recovery/{email}")
def recover_password(email: str, session: SessionDep) -> Message:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    # Always return the same response to prevent email enumeration attacks
    # Only send email if user actually exists
    if user:
        password_reset_token = generate_password_reset_token(email=email)
        email_data = generate_reset_password_email(
            email_to=user.email, email=email, token=password_reset_token
        )
        send_email(
            email_to=user.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return Message(
        message="If that email is registered, we sent a password recovery link"
    )


@router.post("/reset-password/")
def reset_password(session: SessionDep, body: NewPassword) -> Message:
    """
    Reset password
    """
    email = verify_password_reset_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        # Don't reveal that the user doesn't exist - use same error as invalid token
        raise HTTPException(status_code=400, detail="Invalid token")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    user_in_update = UserUpdate(password=body.new_password)
    crud.update_user(
        session=session,
        db_user=user,
        user_in=user_in_update,
    )
    return Message(message="Password updated successfully")


@router.post("/verify-email/")
def verify_email(session: SessionDep, body: VerifyEmail) -> Message:
    """
    Verify a user's email address.
    """
    email = verify_email_verification_token(token=body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = crud.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    if user.email_verified:
        return Message(message="Email already verified")
    user.email_verified = True
    session.add(user)
    session.commit()
    return Message(message="Email verified successfully")


@router.post("/resend-verification/{email}")
def resend_verification_email(email: str, session: SessionDep) -> Message:
    """
    Resend email verification link.
    """
    user = crud.get_user_by_email(session=session, email=email)
    if user and not user.email_verified:
        if not email_delivery_enabled():
            raise HTTPException(
                status_code=500,
                detail="No email provider configured.",
            )
        token = generate_email_verification_token(email=email)
        send_verification_email(email_to=user.email, email=email, token=token)
    return Message(
        message="If that email is registered and unverified, we sent a verification link"
    )


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDep) -> Any:
    """
    HTML Content for Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )

    return HTMLResponse(
        content=email_data.html_content, headers={"subject": email_data.subject}
    )
