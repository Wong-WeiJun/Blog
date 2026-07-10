from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import (
    Comment,
    CommentLike,
    ContactSubmission,
    Post,
    PostTagLink,
    User,
    UserSession,
)  # add Comment, CommentLike
from tests.utils.user import authentication_token_from_email
from tests.utils.utils import get_superuser_token_headers


def _assert_safe_test_database() -> None:
    db_uri = str(settings.SQLALCHEMY_DATABASE_URI).lower()
    if settings.ENVIRONMENT != "production" and "neon.tech" in db_uri:
        pytest.fail(
            "Refusing to run tests against Neon while ENVIRONMENT is not production. "
            "Use local POSTGRES_* settings or set ENVIRONMENT=production only on deploy."
        )


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    _assert_safe_test_database()
    with Session(engine) as session:
        init_db(session)
        yield session
        session.execute(delete(CommentLike))  # references Comment
        session.execute(delete(Comment))  # references Post + User
        session.execute(delete(ContactSubmission))
        session.execute(delete(PostTagLink))  # references Post + Tag
        session.execute(delete(Post))  # references User
        session.execute(delete(UserSession))  # references User
        session.execute(delete(User))
        session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )
