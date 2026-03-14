"""Unit tests for password hashing."""

from app.auth.password import hash_password, verify_password


class TestHashPassword:
    def test_returns_string(self):
        hashed = hash_password("mypassword")
        assert isinstance(hashed, str)

    def test_hash_differs_from_plain(self):
        plain = "demo123"
        hashed = hash_password(plain)
        assert hashed != plain

    def test_different_calls_produce_different_hashes(self):
        """bcrypt salts should make each hash unique."""
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2


class TestVerifyPassword:
    def test_correct_password(self):
        plain = "SuperSecret99!"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_wrong_password(self):
        hashed = hash_password("correct")
        assert verify_password("wrong", hashed) is False

    def test_empty_password(self):
        hashed = hash_password("")
        assert verify_password("", hashed) is True
        assert verify_password("notempty", hashed) is False
