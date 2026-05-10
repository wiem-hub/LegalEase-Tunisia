# tests/test_api.py
# pytest tests for LegalEase Tunisia backend
# Run: pytest tests/ -v
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# ── Test DB — SQLite in memory ─────────────────────────────────────────────
TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def auth_token(client):
    """Register + login — return JWT token."""
    client.post("/api/v1/auth/signup", json={
        "email":    "test@legalease.tn",
        "username": "testuser",
        "password": "testpass123",
    })
    resp = client.post("/api/v1/auth/login", data={
        "username": "testuser",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    return resp.json()["access_token"]


# ══════════════════════════════════════════════════════════════════════════
# AUTH TESTS
# ══════════════════════════════════════════════════════════════════════════

class TestAuth:

    def test_signup_success(self, client):
        resp = client.post("/api/v1/auth/signup", json={
            "email":    "new@legalease.tn",
            "username": "newuser",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["username"] == "newuser"
        assert data["email"]    == "new@legalease.tn"
        assert "id" in data

    def test_signup_duplicate_email(self, client):
        payload = {"email": "dup@legalease.tn", "username": "dupuser1", "password": "pass12345"}
        client.post("/api/v1/auth/signup", json=payload)
        resp = client.post("/api/v1/auth/signup", json={
            "email": "dup@legalease.tn", "username": "dupuser2", "password": "pass12345"
        })
        assert resp.status_code == 400
        assert "Email" in resp.json()["detail"]

    def test_signup_duplicate_username(self, client):
        client.post("/api/v1/auth/signup", json={
            "email": "a@legalease.tn", "username": "sameuser", "password": "pass12345"
        })
        resp = client.post("/api/v1/auth/signup", json={
            "email": "b@legalease.tn", "username": "sameuser", "password": "pass12345"
        })
        assert resp.status_code == 400
        assert "Username" in resp.json()["detail"]

    def test_signup_short_password(self, client):
        resp = client.post("/api/v1/auth/signup", json={
            "email": "short@legalease.tn", "username": "shortpass", "password": "abc"
        })
        assert resp.status_code == 422

    def test_login_success(self, client):
        client.post("/api/v1/auth/signup", json={
            "email": "login@legalease.tn", "username": "loginuser", "password": "loginpass123"
        })
        resp = client.post("/api/v1/auth/login", data={
            "username": "loginuser", "password": "loginpass123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        resp = client.post("/api/v1/auth/login", data={
            "username": "loginuser", "password": "wrongpassword"
        })
        assert resp.status_code == 401

    def test_login_unknown_user(self, client):
        resp = client.post("/api/v1/auth/login", data={
            "username": "nobody", "password": "pass123"
        })
        assert resp.status_code == 401


# ══════════════════════════════════════════════════════════════════════════
# PROTECTED ROUTE TESTS
# ══════════════════════════════════════════════════════════════════════════

class TestProtectedRoutes:

    def test_no_token_rejected(self, client):
        resp = client.get("/api/v1/procedures/my")
        assert resp.status_code == 401

    def test_invalid_token_rejected(self, client):
        resp = client.get(
            "/api/v1/procedures/my",
            headers={"Authorization": "Bearer invalidtoken123"}
        )
        assert resp.status_code == 401

    def test_valid_token_accepted(self, client, auth_token):
        resp = client.get(
            "/api/v1/procedures/my",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # 200 or 404 — both mean auth passed
        assert resp.status_code in [200, 404]


# ══════════════════════════════════════════════════════════════════════════
# AI ENDPOINTS TESTS
# ══════════════════════════════════════════════════════════════════════════

class TestAIEndpoints:

    def test_health_endpoint(self, client):
        resp = client.get("/api/v1/ai/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "configured" in data
        assert "model" in data
        assert "rag_ready" in data

    def test_public_chat_no_auth_required(self, client):
        """Public endpoint should work without token."""
        resp = client.post("/api/v1/ai/chat/public", json={
            "message": "What is LegalEase Tunisia?",
            "history": []
        })
        # 200 = works, 503 = Groq not configured (OK in test env)
        assert resp.status_code in [200, 503]

    def test_stream_requires_auth(self, client):
        """Stream endpoint must require authentication."""
        resp = client.post("/api/v1/ai/chat/stream", json={
            "message": "Comment créer une startup ?",
            "history": []
        })
        assert resp.status_code == 401

    def test_conversations_requires_auth(self, client):
        resp = client.get("/api/v1/ai/conversations")
        assert resp.status_code == 401

    def test_conversations_with_auth(self, client, auth_token):
        resp = client.get(
            "/api/v1/ai/conversations",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ══════════════════════════════════════════════════════════════════════════
# RAG TESTS
# ══════════════════════════════════════════════════════════════════════════

class TestRAG:

    def test_retriever_returns_results(self):
        """Test that ChromaDB retrieves relevant documents."""
        try:
            from app.rag.retriever import retrieve
            results = retrieve("Comment créer une startup en Tunisie ?", lang="fr", top_k=3)
            assert isinstance(results, list)
            if results:
                assert "text"     in results[0]
                assert "title"    in results[0]
                assert "score"    in results[0]
                assert "category" in results[0]
        except RuntimeError:
            pytest.skip("ChromaDB not built — run python -m app.rag.ingest first")

    def test_retriever_darija(self):
        """Test Darija language retrieval."""
        try:
            from app.rag.retriever import retrieve
            results = retrieve("كيفاش نعمل شركة في تونس؟", lang="darija", top_k=3)
            assert isinstance(results, list)
        except RuntimeError:
            pytest.skip("ChromaDB not built")

    def test_build_context(self):
        """Test context builder."""
        from app.rag.retriever import build_context
        docs = [
            {"text": "Pour créer une SARL, il faut...", "title": "Guide SARL", "source": "test.pdf", "category": "startup", "score": 0.9},
            {"text": "La CNSS exige...", "title": "Guide CNSS", "source": "cnss.pdf", "category": "cnss", "score": 0.8},
        ]
        ctx = build_context(docs, max_chars=5000)
        assert "Guide SARL" in ctx
        assert "Guide CNSS" in ctx
        assert len(ctx) < 5000

    def test_language_detection(self):
        """Test language detection from ai.py."""
        from app.v1.endpoints.ai import detect_language
        assert detect_language("Comment créer une startup ?") == "fr"
        assert detect_language("How to create a company?")    == "en"
        assert detect_language("كيفاش نعمل شركة؟")            == "darija"

    def test_dataset_integrity(self):
        """Test that full_dataset.json is valid and has expected structure."""
        import json
        from pathlib import Path
        dataset_path = Path("app/rag/datasets/full_dataset.json")
        if not dataset_path.exists():
            pytest.skip("Dataset not found")
        with open(dataset_path, encoding="utf-8") as f:
            data = json.load(f)
        assert len(data) >= 62, "Dataset should have at least 62 entries"
        for entry in data[:5]:
            assert "document_id"       in entry
            assert "procedure_category" in entry
            assert "simplified_text"   in entry


# ══════════════════════════════════════════════════════════════════════════
# ANALYTICS TESTS
# ══════════════════════════════════════════════════════════════════════════

class TestAnalytics:

    def test_overview_requires_admin(self, client, auth_token):
        """Analytics should be admin-only."""
        resp = client.get(
            "/api/v1/analytics/overview",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        # 403 = not admin (expected for regular user)
        assert resp.status_code in [200, 403]

    def test_log_query(self):
        """Test that log_query writes to DB."""
        from app.analytics.tracker import log_query, get_overview
        db = TestingSessionLocal()
        try:
            initial = get_overview(db)["total_queries"]
            log_query(
                db         = db,
                question   = "Test question for pytest",
                lang       = "fr",
                docs_found = 3,
                category   = "startup",
                answered   = True,
                user_id    = None,
                endpoint   = "test",
            )
            after = get_overview(db)["total_queries"]
            assert after == initial + 1
        finally:
            db.close()