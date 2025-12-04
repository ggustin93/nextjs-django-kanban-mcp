"""
Pytest Configuration
=====================

Shared fixtures and configuration for all tests.
"""

import os

import django

import pytest

# Setup Django for tests
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()


@pytest.fixture
def sample_task_data():
    """Sample task data for testing."""
    return {"title": "Test Task", "description": "Test description", "status": "TODO"}
