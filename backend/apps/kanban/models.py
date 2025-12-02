"""
Kanban Django Models
====================

Purpose:
    Defines Django ORM models for the kanban task management system.

Models:
    - Task: Kanban task with title, description, and status
      (inherits TimeStampedModel from apps.core)

Status Choices:
    - TODO: Task not yet started
    - DOING: Task in progress
    - DONE: Task completed
"""
from django.db import models

from apps.core.models import TimeStampedModel


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
