import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from pathlib import Path

# Important safety: ensure we are NOT using dev or prod DB url!
os.environ["DATABASE_URL"] = "sqlite:///./test_metroniq.db"
os.environ["GEMINI_API_KEY"] = "mock_key_for_tests"

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

assert settings.DATABASE_URL == "sqlite:///./test_metroniq.db", f"FATAL: Tests MUST use test_metroniq.db, but found {settings.DATABASE_URL}"

# Setup test database engine
test_engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Before the complete test session, create all tables
    Base.metadata.create_all(bind=test_engine)
    yield
    # After the entire test session, destroy the test DB file entirely
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    test_db_path = Path("./test_metroniq.db")
    try:
        if test_db_path.exists():
            test_db_path.unlink()
    except PermissionError:
        pass

@pytest.fixture(scope="function")
def db_session():
    # Provide a fresh DB session for each test
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
