import logging

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


def _init_resend() -> bool:
    if settings.RESEND_KEY:
        resend.api_key = settings.RESEND_KEY
        return True
    return False


def send_transactional_email(
    *,
    email_to: str,
    subject: str,
    html_content: str,
    reply_to: str | None = None,
) -> None:
    if not settings.resend_enabled:
        raise RuntimeError(
            "Resend is not configured. Set RESEND_KEY and FROM_EMAIL in the environment."
        )

    if not _init_resend():
        raise RuntimeError("Failed to initialize Resend client.")

    payload: resend.Emails.SendParams = {
        "from": settings.FROM_EMAIL,  # type: ignore[typeddict-item]
        "to": email_to,
        "subject": subject,
        "html": html_content,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    response = resend.Emails.send(payload)
    logger.info("Resend email sent to %s: %s", email_to, response)


def send_contact_notification_email(
    *,
    admin_email: str,
    from_email: str,
    reply_to: str,
    subject: str,
    html: str,
) -> bool:
    if not settings.resend_enabled:
        return False

    try:
        if not _init_resend():
            return False

        resend.Emails.send(
            {
                "from": from_email,
                "to": admin_email,
                "reply_to": reply_to,
                "subject": subject,
                "html": html,
            }
        )
        return True
    except Exception:
        logger.exception("Failed to send contact notification email")
        return False
