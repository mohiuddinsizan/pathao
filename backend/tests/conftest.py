"""Shared fixtures for the test suite."""

import os
import pytest

# Set env vars BEFORE any app import
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-ci")
os.environ.setdefault("JWT_EXPIRY_HOURS", "1")
os.environ.setdefault("FRONTEND_URL", "http://localhost:5173")
