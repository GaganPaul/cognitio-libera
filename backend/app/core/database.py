"""
Database Session and Engine Management Module.

WHAT IT IS:
    This module configures SQLAlchemy engine, declarative base, connection pooling,
    and FastAPI database session dependencies.

WHY WE USE IT:
    A robust relational database connection pool prevents connection leaks, enables
    automatic pre-pinging (detecting stale connections before queries fail), and
    supports both Supabase PostgreSQL and local SQLite development.

HOW IT CONNECTS:
    All ORM models inherit from `Base`. API route functions inject `get_database_session`
    to execute queries, perform transactions, and automatically close connections upon request completion.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Configure connection parameters based on dialect
connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False for multi-threaded FastAPI workers
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL (Supabase) connection pool configuration
    engine_kwargs.update({
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    })

# Create SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

# Session factory bound to engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative Base for ORM Models
Base = declarative_base()


def get_database_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides an isolated database session per request.

    Yields:
        Session: Active SQLAlchemy session instance.

    Side Effects:
        Automatically closes the session when the request context finishes,
        returning the connection to the pool.

    Security:
        Ensures transactions are properly rolled back if unhandled exceptions occur,
        preventing dirty transaction states.
    """
    database_session: Session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
