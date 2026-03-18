import os
import uuid
from pathlib import Path

import pytest
import httpx
from dotenv import load_dotenv
from httpx import ASGITransport
from asgi_lifespan import LifespanManager

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-ci")
os.environ.setdefault("JWT_EXPIRY_HOURS", "1")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("TEST_DATABASE_URL")

from app.main import app


def unique_email(prefix="auto_test"):
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


@pytest.fixture
async def client():
    if not DATABASE_URL:
        pytest.skip("Integration tests require DATABASE_URL or TEST_DATABASE_URL")

    async with LifespanManager(app):
        async with httpx.AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as c:
            yield c


async def register_and_login(client, email=None, password="testpass123"):
    email = email or unique_email()
    register_payload = {
        "name": "Auto Test User",
        "email": email,
        "password": password,
        "business_name": "Test Biz",
        "phone": "01711111111",
    }

    register_res = await client.post("/api/auth/register", json=register_payload)
    assert register_res.status_code in (200, 201), register_res.text

    login_res = await client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200, login_res.text

    data = login_res.json()
    token = data["access_token"]

    return {
        "email": email,
        "password": password,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }