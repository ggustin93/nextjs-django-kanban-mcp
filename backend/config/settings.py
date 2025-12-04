"""Django settings for minimal GraphQL API."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Secret key from environment variable
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-dev-only-change-in-production")

DEBUG = True

# SECURITY: Allowed hosts from environment (production requires explicit hosts)
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Minimal apps for GraphQL API
INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",  # Required for GraphiQL assets
    "graphene_django",
    "corsheaders",
    # Project apps
    "apps.core",
    "apps.kanban",
]

# Minimal middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS for Next.js frontend
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# GraphQL schema
GRAPHENE = {"SCHEMA": "config.schema.schema"}

ROOT_URLCONF = "config.urls"

# Minimal template config for GraphQL GraphiQL interface
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
    },
]

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "data" / "db.sqlite3",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Static files (required for GraphiQL in development)
STATIC_URL = "/static/"
