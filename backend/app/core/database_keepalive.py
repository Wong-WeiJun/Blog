import asyncio
import logging

from sqlmodel import Session, select

from app.core.config import settings
from app.core.db import engine

logger = logging.getLogger(__name__)


def ping_database() -> None:
    with Session(engine) as session:
        session.exec(select(1))


async def keepalive_loop() -> None:
    interval = settings.DATABASE_KEEPALIVE_INTERVAL_SECONDS
    logger.info("Database keep-alive started (interval=%ss)", interval)
    try:
        while True:
            await asyncio.sleep(interval)
            try:
                await asyncio.to_thread(ping_database)
            except Exception:
                logger.warning("Database keep-alive ping failed", exc_info=True)
    except asyncio.CancelledError:
        logger.info("Database keep-alive stopped")
        raise
