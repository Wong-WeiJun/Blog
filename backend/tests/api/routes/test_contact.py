from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import ContactSubmission


def _contact_payload(**overrides: str) -> dict[str, str]:
    payload = {
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "subject": "Collaboration",
        "message": "I would love to collaborate on an open-source project together.",
        "captcha_token": "test-captcha-token",
    }
    payload.update(overrides)
    return payload


def test_submit_contact_form_success(
    client: TestClient, db: Session
) -> None:
    with (
        patch(
            "app.api.routes.contact.verify_turnstile_token",
            return_value=True,
        ),
        patch(
            "app.api.routes.contact.send_contact_notification",
            return_value=True,
        ),
    ):
        response = client.post(
            f"{settings.API_V1_STR}/contact",
            json=_contact_payload(),
        )

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Your message has been sent successfully!",
    }

    submission = db.exec(select(ContactSubmission)).first()
    assert submission is not None
    assert submission.name == "Ada Lovelace"
    assert submission.email == "ada@example.com"
    assert submission.subject == "Collaboration"
    assert submission.email_sent is True


def test_submit_contact_form_invalid_captcha(client: TestClient, db: Session) -> None:
    before_count = len(db.exec(select(ContactSubmission)).all())

    with patch(
        "app.api.routes.contact.verify_turnstile_token",
        return_value=False,
    ):
        response = client.post(
            f"{settings.API_V1_STR}/contact",
            json=_contact_payload(),
        )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Captcha verification failed. Please try again."
    }
    assert len(db.exec(select(ContactSubmission)).all()) == before_count


def test_submit_contact_form_invalid_email(client: TestClient) -> None:
    with patch(
        "app.api.routes.contact.verify_turnstile_token",
        return_value=True,
    ):
        response = client.post(
            f"{settings.API_V1_STR}/contact",
            json=_contact_payload(email="not-an-email"),
        )

    assert response.status_code == 422


def test_submit_contact_form_email_send_failure(
    client: TestClient, db: Session
) -> None:
    with (
        patch(
            "app.api.routes.contact.verify_turnstile_token",
            return_value=True,
        ),
        patch(
            "app.api.routes.contact.send_contact_notification",
            return_value=False,
        ),
    ):
        response = client.post(
            f"{settings.API_V1_STR}/contact",
            json=_contact_payload(email="failure@example.com"),
        )

    assert response.status_code == 500
    assert response.json() == {
        "detail": "We securely saved your message, but encountered an issue sending the email notification."
    }

    submission = db.exec(
        select(ContactSubmission).where(ContactSubmission.email == "failure@example.com")
    ).first()
    assert submission is not None
    assert submission.email_sent is False
