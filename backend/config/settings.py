"""Django settings for minimal GraphQL API."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-0pg7s9l-l6mi^-l0+lbfxa^26mp4uddbk%s@==xt*e6bqdf^e8'

DEBUG = True

ALLOWED_HOSTS = []

# Minimal apps for GraphQL API
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',  # Required for GraphiQL assets
    'graphene_django',
    'corsheaders',
    'kanban',
]

# Minimal middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS for Next.js frontend
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# GraphQL schema
GRAPHENE = {'SCHEMA': 'config.schema.schema'}

ROOT_URLCONF = 'config.urls'

# Minimal template config for GraphQL GraphiQL interface
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
    },
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Static files (required for GraphiQL in development)
STATIC_URL = '/static/'
