"""
Kanban Django Models
====================

Purpose:
    Defines Django ORM models for the kanban task management system.

Models:
    - TimeStampedModel: Abstract base model with automatic timestamps
    - Task: Kanban task with title, description, and status

Status Choices:
    - TODO: Task not yet started
    - DOING: Task in progress
    - DONE: Task completed
"""
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model with timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Task(TimeStampedModel):
    class Status(models.TextChoices):
        TODO = 'TODO', 'To Do'
        DOING = 'DOING', 'In Progress'
        DONE = 'DONE', 'Done'

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.TODO)

    def __str__(self):
        return self.title
