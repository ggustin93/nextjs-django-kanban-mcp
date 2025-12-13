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
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["priority", "order", "-created_at"]

    def __str__(self):
        return self.title


class Checklist(TimeStampedModel):
    """
    Checklist Model
    ===============

    A checklist is a collection of items that can be checked off.
    Multiple checklists can belong to a single Task (Trello-style).

    Fields:
        - title: Name of the checklist (e.g., "Pre-launch checks")
        - task: ForeignKey to parent Task (CASCADE on delete)

    Related:
        - items: Reverse relation to ChecklistItem (one-to-many)

    Meta:
        - Ordered by creation date (oldest first)
    """

    title = models.CharField(max_length=255)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="checklists")

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.task.title} - {self.title}"

    @property
    def progress(self):
        """Calculate checklist completion progress."""
        total = self.items.count()
        if total == 0:
            return 0
        completed = self.items.filter(completed=True).count()
        return int((completed / total) * 100)


class ChecklistItem(TimeStampedModel):
    """
    ChecklistItem Model
    ===================

    Individual item within a checklist that can be checked/unchecked.
    Items are reorderable within their parent checklist.

    Fields:
        - text: Item description (max 500 chars)
        - completed: Boolean flag for checked state
        - position: Integer for ordering (0-indexed, lower = higher in list)
        - checklist: ForeignKey to parent Checklist (CASCADE on delete)

    Meta:
        - Ordered by position (ascending)
        - Composite index on (checklist, position) for efficient queries

    Performance Notes:
        - Position is indexed for fast ordering queries
        - Completed is indexed for progress calculations
        - Composite index optimizes "get items for checklist" queries
    """

    text = models.CharField(max_length=500)
    completed = models.BooleanField(default=False, db_index=True)
    position = models.PositiveIntegerField(db_index=True)
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name="items")

    class Meta:
        ordering = ["position"]
        indexes = [
            models.Index(fields=["checklist", "position"]),
        ]

    def __str__(self):
        status = "✓" if self.completed else "☐"
        return f"{status} {self.text}"
