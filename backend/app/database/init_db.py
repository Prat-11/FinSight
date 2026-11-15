import logging
from app.database.base import Base, engine
# Import all models to ensure they are registered with Base metadata
import app.models  # noqa: F401

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e
