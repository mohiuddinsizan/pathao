"""Unit tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError

from tests.conftest import *  # noqa: ensure env vars set first

from app.schemas.auth import RegisterRequest, LoginRequest, MerchantResponse, TokenResponse


class TestRegisterRequest:
    def test_valid(self):
        r = RegisterRequest(
            email="test@example.com",
            password="pass123",
            name="Test User",
        )
        assert r.email == "test@example.com"
        assert r.name == "Test User"
        assert r.phone is None
        assert r.business_name is None

    def test_with_optional_fields(self):
        r = RegisterRequest(
            email="test@example.com",
            password="pass123",
            name="Test User",
            phone="01712345678",
            business_name="My Shop",
        )
        assert r.phone == "01712345678"
        assert r.business_name == "My Shop"

    def test_invalid_email_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="not-an-email", password="p", name="N")

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="a@b.com")


class TestLoginRequest:
    def test_valid(self):
        lr = LoginRequest(email="a@b.com", password="pass")
        assert lr.email == "a@b.com"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="bad", password="pass")


class TestTokenResponse:
    def test_defaults(self):
        t = TokenResponse(access_token="abc123")
        assert t.token_type == "bearer"


class TestMerchantResponse:
    def test_optional_fields(self):
        m = MerchantResponse(id="1", email="a@b.com", name="A")
        assert m.phone is None
        assert m.business_name is None
