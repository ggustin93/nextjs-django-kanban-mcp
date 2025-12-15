"""
Kanban Django Models
====================

Purpose:
    Defines Django ORM models for the kanban task management system.

Models:
    - Task: Kanban task with title, description, status, category, and priority
      (inherits TimeStampedModel from apps.core)

Status Choices:
    - TODO: Task not yet started
    - DOING: Task in progress
    - WAITING: Task waiting for external input
    - DONE: Task completed

Priority Choices (Eisenhower-inspired, solo-friendly):
    - P1: Do First (urgent & important)
    - P2: Schedule (important, not urgent)
    - P3: Quick Win (small tasks to knock out)
    - P4: Backlog (do later)
"""

from django.db import models

from apps.core.models import TimeStampedModel


class Task(TimeStampedModel):
    class Status(models.TextChoices):
        TODO = "TODO", "To Do"
        DOING = "DOING", "In Progress"
        WAITING = "WAITING", "Waiting"
        DONE = "DONE", "Done"

    class Priority(models.TextChoices):
        P1 = "P1", "P1 - Do First"
        P2 = "P2", "P2 - Schedule"
        P3 = "P3", "P3 - Quick Win"
        P4 = "P4", "P4 - Backlog"

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.TODO)
    category = models.CharField(max_length=50, blank=True, db_index=True)
    priority = models.CharField(
        max_length=2, choices=Priority.choices, default=Priority.P4, db_index=True
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["priority", "-created_at"]

    def __str__(self):
        return self.title
