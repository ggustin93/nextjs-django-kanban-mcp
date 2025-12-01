# Multi-stage Dockerfile for Django backend with hot reload support

# Stage 1: Base image with Python and dependencies
FROM python:3.11-slim as base

# Prevent Python from writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Development image with hot reload
FROM base as development

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Expose Django dev server port
EXPOSE 8000

# Development command (hot reload via runserver)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Stage 3: Production image (optimized)
FROM base as production

# Create non-root user for security
RUN useradd -m -u 1000 django && \
    mkdir -p /app/data && \
    chown -R django:django /app

USER django

# Copy requirements and install
COPY --chown=django:django requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application code
COPY --chown=django:django . .

# Add user's local bin to PATH
ENV PATH=/home/django/.local/bin:$PATH

EXPOSE 8000

# Production command (use gunicorn in real production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
