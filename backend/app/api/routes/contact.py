from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import settings
from app.models import ContactSubmission, ContactRequest
from app.api.deps import (
    SessionDep,
)
from app.services.captcha import verify_turnstile_token
from app.services.email import send_contact_notification_email

router = APIRouter(tags=["contact"])


def send_contact_notification(submission: ContactSubmission) -> bool:
    admin_email = getattr(settings, "CONTACT_EMAIL", "admin@wongweijun.me")
    from_email = getattr(settings, "FROM_EMAIL", "Contact Form <noreply@wongweijun.me>")

    return send_contact_notification_email(
        admin_email=admin_email,
        from_email=from_email,
        reply_to=submission.email,
        subject=f"[Contact Form] {submission.subject}",
        html=f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
                    <p><strong>Name:</strong> {submission.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{submission.email}">{submission.email}</a></p>
                    <p><strong>Subject:</strong> {submission.subject}</p>
                    <p><strong>Submission ID:</strong> {submission.id}</p>

                    <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #0070f3; border-radius: 4px;">
                        <p style="margin: 0; white-space: pre-wrap; color: #444; line-height: 1.6;">{submission.message}</p>
                    </div>
                </div>
                """,
    )


@router.post("", status_code=status.HTTP_200_OK)
def submit_contact_form(
    payload: ContactRequest, session: SessionDep, request: Request
):
    """
    Public endpoint to accept contact form submissions.
    Saves the record to the database first, attempts to email the admin,
    and updates the email_sent status flag accordingly.
    """
    remote_ip = request.client.host if request.client else None
    if not verify_turnstile_token(payload.captcha_token, remote_ip):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification failed. Please try again.",
        )

    db_submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        email_sent=False,
    )
    session.add(db_submission)
    session.commit()
    session.refresh(db_submission)
    email_success = send_contact_notification(db_submission)
    if email_success:
        db_submission.email_sent = True
        session.add(db_submission)
        session.commit()
        return {
            "status": "success",
            "message": "Your message has been sent successfully!",
        }
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="We securely saved your message, but encountered an issue sending the email notification.",
    )
