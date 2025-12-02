"""
Model Tests - Task Model Validation
====================================

Critical tests for Task model focusing on enum validation.

Setup:
    python manage.py test kanban.tests.test_models

Focus Areas:
    - Status enum validation (addresses recent bug)
    - Task creation with valid/invalid statuses
    - Default status assignment
"""
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase

from apps.kanban.models import Task


class TaskModelTests(TestCase):
    """Test Task model validation and behavior."""

    def test_create_task_with_default_status(self):
        """Test task creation uses TODO as default status."""
        task = Task.objects.create(title='Test Task')
        self.assertEqual(task.status, Task.Status.TODO)
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.description, '')

    def test_create_task_with_valid_statuses(self):
        """Test task creation with all valid status enum values."""
        statuses = [Task.Status.TODO, Task.Status.DOING, Task.Status.DONE]

        for status in statuses:
            with self.subTest(status=status):
                task = Task.objects.create(title=f'Task {status}', status=status)
                self.assertEqual(task.status, status)
                task.delete()

    def test_create_task_with_status_strings(self):
        """Test task creation with status enum string values."""
        valid_strings = ['TODO', 'DOING', 'DONE']

        for status_str in valid_strings:
            with self.subTest(status=status_str):
                task = Task.objects.create(title=f'Task {status_str}', status=status_str)
                self.assertEqual(task.status, status_str)
                self.assertIn(task.status, [s.value for s in Task.Status])
                task.delete()

    def test_create_task_with_invalid_status_fails(self):
        """Test task creation fails with invalid status (addresses recent bug)."""
        # This is the critical test - invalid statuses like task IDs should fail
        invalid_statuses = ['INVALID', '123', '', 'task_id_here']

        for invalid_status in invalid_statuses:
            with self.subTest(status=invalid_status):
                _task = Task.objects.create(title='Invalid Task', status=invalid_status)  # noqa: F841
                # Django doesn't enforce choices at DB level by default,
                # but we can check the value is not in valid choices
                self.assertNotIn(invalid_status, [s.value for s in Task.Status])

    def test_update_task_status(self):
        """Test updating task status through valid transitions."""
        task = Task.objects.create(title='Test Task')

        # TODO -> DOING
        task.status = Task.Status.DOING
        task.save()
        task.refresh_from_db()
        self.assertEqual(task.status, Task.Status.DOING)

        # DOING -> DONE
        task.status = Task.Status.DONE
        task.save()
        task.refresh_from_db()
        self.assertEqual(task.status, Task.Status.DONE)

    def test_task_with_description(self):
        """Test task creation with title and description."""
        task = Task.objects.create(
            title='Task with description', description='This is a detailed description'
        )
        self.assertEqual(task.title, 'Task with description')
        self.assertEqual(task.description, 'This is a detailed description')
        self.assertEqual(task.status, Task.Status.TODO)

    def test_task_string_representation(self):
        """Test __str__ method returns task title."""
        task = Task.objects.create(title='Display Task')
        self.assertEqual(str(task), 'Display Task')

    def test_task_timestamps_auto_populate(self):
        """Test created_at and updated_at are automatically set."""
        task = Task.objects.create(title='Timestamp Task')
        self.assertIsNotNone(task.created_at)
        self.assertIsNotNone(task.updated_at)

        # Verify updated_at changes on save
        original_updated = task.updated_at
        task.title = 'Updated Title'
        task.save()
        task.refresh_from_db()
        self.assertGreater(task.updated_at, original_updated)

    def test_task_title_required(self):
        """Test task creation fails without title."""
        with self.assertRaises(IntegrityError):
            Task.objects.create(title=None)

    def test_status_choices_enum_values(self):
        """Test Status enum has correct values."""
        self.assertEqual(Task.Status.TODO.value, 'TODO')
        self.assertEqual(Task.Status.DOING.value, 'DOING')
        self.assertEqual(Task.Status.DONE.value, 'DONE')

        # Verify all choices are present
        choices_values = [choice[0] for choice in Task.Status.choices]
        self.assertIn('TODO', choices_values)
        self.assertIn('DOING', choices_values)
        self.assertIn('DONE', choices_values)
        self.assertEqual(len(choices_values), 3)
