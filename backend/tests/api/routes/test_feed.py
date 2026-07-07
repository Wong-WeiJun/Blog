from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.models import PostStatus
from tests.utils.posts import create_random_post
from tests.utils.user import create_random_user

FEED_URL = f"{settings.API_V1_STR}/feed.xml"


class TestReadFeed:
    def test_returns_rss_xml(self, client: TestClient, db: Session):
        author = create_random_user(db)
        post = create_random_post(db, author, status=PostStatus.published)

        response = client.get(FEED_URL)

        assert response.status_code == 200
        assert response.headers["content-type"].startswith("application/rss+xml")
        body = response.text
        assert "<rss" in body
        assert post.title in body
        assert f"/blog/{post.slug}" in body

    def test_excludes_drafts(self, client: TestClient, db: Session):
        author = create_random_user(db)
        draft = create_random_post(db, author, status=PostStatus.draft)

        response = client.get(FEED_URL)

        assert response.status_code == 200
        assert draft.title not in response.text
