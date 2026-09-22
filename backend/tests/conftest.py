"""
Pytest Test Configuration and Fixtures.

WHAT IT IS:
    Configures an isolated SQLite in-memory database and FastAPI TestClient for automated testing.

WHY WE USE IT:
    Automated integration tests ensure regressions are caught immediately without
    polluting the production or development database.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_database_session
from app.core.security import get_current_authenticated_user, AuthenticatedUser
from app.db.seed_data import seed_database_curriculum

# Create in-memory SQLite database specifically for test runner
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Creates tables and seeds test curriculum once for the test session.
    """
    import app.models.entities
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database_curriculum(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    """
    Provides a transactional database session for each test.
    """
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def mock_authenticated_user():
    """
    Mock authenticated user fixture.
    """
    return AuthenticatedUser(
        id="test-user-uuid-1234",
        email="teststudent@cognitiolibera.com",
        username="TestStudent",
        role="authenticated"
    )


@pytest.fixture
def client(db_session, mock_authenticated_user):
    """
    FastAPI TestClient with overridden database session and authentication dependencies.
    """
    def override_get_database_session():
        try:
            yield db_session
        finally:
            pass

    def override_get_current_authenticated_user():
        return mock_authenticated_user

    app.dependency_overrides[get_database_session] = override_get_database_session
    app.dependency_overrides[get_current_authenticated_user] = override_get_current_authenticated_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
