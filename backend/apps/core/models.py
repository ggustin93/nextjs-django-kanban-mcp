"""
Core Models
===========

Abstract base models providing common functionality across all apps.
Follows OpenHEXA pattern for shared model patterns.
"""
from django.db import models


class TimeStampedModel(models.Model):
    """
    Abstract base model providing automatic timestamp tracking.

    Provides:
        - created_at: Automatically set when object is created
        - updated_at: Automatically updated on every save

    Usage:
        class MyModel(TimeStampedModel):
            # Your fields here
            pass
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']
