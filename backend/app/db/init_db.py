"""
Database Initialization & Schema Bootstrap Module.

WHAT IT IS:
    This module creates all missing database tables and triggers seed data insertion.

WHY WE USE IT:
    Ensures that when the application starts up or is deployed to Render, all tables
    exist and the curriculum of coding challenges and quizzes is populated.

HOW IT CONNECTS:
    Invoked during FastAPI lifespan startup in `main.py` and can be executed
    directly via `python -m app.db.init_db`.
"""

import logging
import app.models.entities  # Ensure all model tables are registered with Base.metadata
from app.core.database import Base, engine, SessionLocal
from app.db.seed_data import seed_database_curriculum

logger = logging.getLogger(__name__)


def initialize_database() -> None:
    """
    Creates database tables defined in SQLAlchemy Base metadata and seeds curriculum data.

    Side Effects:
        Creates tables in the target database and inserts seed rows.
    """
    logger.info("Bootstrapping database schema...")
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    # Seed initial curriculum
    db = SessionLocal()
    try:
        seed_database_curriculum(db)
        logger.info("Database curriculum seeding complete.")
    except Exception as exc:
        logger.error(f"Error seeding database: {str(exc)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_database()
