import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlmodel import select

from app.core.config import Settings
from app.core.database_keepalive import keepalive_loop, ping_database


def test_ping_database() -> None:
    engine_mock = MagicMock()
    session_mock = MagicMock()
    session_mock.__enter__.return_value = session_mock
    select1 = select(1)

    with (
        patch("app.core.database_keepalive.engine", engine_mock),
        patch("app.core.database_keepalive.Session", return_value=session_mock),
        patch("app.core.database_keepalive.select", return_value=select1),
    ):
        ping_database()

    session_mock.exec.assert_called_once_with(select1)


def test_keepalive_loop_calls_ping_database() -> None:
    async def run_test() -> None:
        with (
            patch(
                "app.core.database_keepalive.settings.DATABASE_KEEPALIVE_INTERVAL_SECONDS",
                0.01,
            ),
            patch(
                "app.core.database_keepalive.asyncio.to_thread",
                new_callable=AsyncMock,
            ) as to_thread_mock,
        ):
            task = asyncio.create_task(keepalive_loop())
            await asyncio.sleep(0.05)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
            assert to_thread_mock.await_count >= 1

    asyncio.run(run_test())


def test_database_keepalive_active_in_production() -> None:
    settings = Settings(
        PROJECT_NAME="Test",
        SECRET_KEY="test-secret-key-not-default",
        FIRST_SUPERUSER="admin@example.com",
        FIRST_SUPERUSER_PASSWORD="secret",
        ENVIRONMENT="production",
        DATABASE_URL="postgresql://user:pass@host/db",
        DATABASE_KEEPALIVE_ENABLED=True,
    )
    assert settings.database_keepalive_active is True


def test_database_keepalive_inactive_when_local() -> None:
    settings = Settings(
        PROJECT_NAME="Test",
        SECRET_KEY="test-secret-key-not-default",
        FIRST_SUPERUSER="admin@example.com",
        FIRST_SUPERUSER_PASSWORD="secret",
        ENVIRONMENT="local",
        DATABASE_URL="postgresql://user:pass@host/db",
        DATABASE_KEEPALIVE_ENABLED=True,
    )
    assert settings.database_keepalive_active is False


def test_database_keepalive_inactive_when_disabled() -> None:
    settings = Settings(
        PROJECT_NAME="Test",
        SECRET_KEY="test-secret-key-not-default",
        FIRST_SUPERUSER="admin@example.com",
        FIRST_SUPERUSER_PASSWORD="secret",
        ENVIRONMENT="production",
        DATABASE_URL="postgresql://user:pass@host/db",
        DATABASE_KEEPALIVE_ENABLED=False,
    )
    assert settings.database_keepalive_active is False
