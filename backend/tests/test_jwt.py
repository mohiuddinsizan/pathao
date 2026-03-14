"""Unit tests for JWT token handling."""

from tests.conftest import *  # noqa: ensure env vars set first

from app.auth.jwt_handler import create_access_token, decode_access_token


class TestCreateAccessToken:
    def test_returns_string(self):
        token = create_access_token("merchant-123")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_contains_three_parts(self):
        """JWT structure: header.payload.signature"""
        token = create_access_token("merchant-123")
        parts = token.split(".")
        assert len(parts) == 3


class TestDecodeAccessToken:
    def test_roundtrip(self):
        merchant_id = "abc-def-ghi"
        token = create_access_token(merchant_id)
        decoded = decode_access_token(token)
        assert decoded == merchant_id

    def test_invalid_token_returns_none(self):
        result = decode_access_token("not.a.valid.token")
        assert result is None

    def test_empty_token_returns_none(self):
        result = decode_access_token("")
        assert result is None

    def test_tampered_token_returns_none(self):
        token = create_access_token("merchant-1")
        tampered = token[:-5] + "XXXXX"
        result = decode_access_token(tampered)
        assert result is None

    def test_different_merchants_get_different_tokens(self):
        t1 = create_access_token("merchant-1")
        t2 = create_access_token("merchant-2")
        assert t1 != t2
