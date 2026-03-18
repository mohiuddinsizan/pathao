import pytest
from .conftest import unique_email, register_and_login

pytestmark = pytest.mark.asyncio


async def test_register_success(client):
    email = unique_email("register_success")
    payload = {
        "name": "Test User",
        "email": email,
        "password": "testpass123",
        "business_name": "Test Biz",
        "phone": "01711111111",
    }
    res = await client.post("/api/auth/register", json=payload)
    assert res.status_code in (200, 201)
    data = res.json()
    assert "access_token" in data


async def test_register_duplicate_email(client):
    email = unique_email("duplicate")
    payload = {
        "name": "Test User",
        "email": email,
        "password": "testpass123",
        "business_name": "Test Biz",
        "phone": "01711111111",
    }
    first = await client.post("/api/auth/register", json=payload)
    second = await client.post("/api/auth/register", json=payload)
    assert first.status_code in (200, 201)
    assert second.status_code in (400, 409)


async def test_login_success(client):
    email = unique_email("login_success")
    payload = {
        "name": "Test User",
        "email": email,
        "password": "testpass123",
        "business_name": "Test Biz",
        "phone": "01711111111",
    }
    await client.post("/api/auth/register", json=payload)
    res = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "testpass123"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


async def test_login_wrong_password(client):
    email = unique_email("wrong_pass")
    payload = {
        "name": "Test User",
        "email": email,
        "password": "testpass123",
        "business_name": "Test Biz",
        "phone": "01711111111",
    }
    await client.post("/api/auth/register", json=payload)
    res = await client.post(
        "/api/auth/login",
        json={"email": email, "password": "wrongpass"},
    )
    assert res.status_code == 401


async def test_get_me_with_token(client):
    auth = await register_and_login(client)
    res = await client.get("/api/auth/me", headers=auth["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == auth["email"]


async def test_get_me_no_token(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401