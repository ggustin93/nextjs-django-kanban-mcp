"""
MCP Server Tests - Async Wrapper Functions
===========================================

Minimal tests for MCP server async wrappers around Django ORM operations.

Setup:
    python manage.py test tests.test_mcp_server

Focus Areas:
    - Async wrapper functions (get_all_tasks, create_task_sync, etc.)
    - Task CRUD operations through MCP server functions
    - Error handling for missing tasks
"""

import os

# Setup Django before imports
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.test import TestCase  # noqa: E402

from apps.kanban.models import Task  # noqa: E402
from asgiref.sync import async_to_sync  # noqa: E402

# Import async functions from MCP server
from integrations.mcp.server import (  # noqa: E402
    create_task_sync,
    delete_task_sync,
    get_all_tasks,
    get_task_by_id,
    save_task,
    task_to_dict,
)


class MCPServerAsyncTests(TestCase):
    """Test MCP server async wrapper functions."""

    def setUp(self):
        """Create test tasks."""
        self.task1 = Task.objects.create(
            title="MCP Test Task 1", description="First test task", status=Task.Status.TODO
        )
        self.task2 = Task.objects.create(title="MCP Test Task 2", status=Task.Status.DOING)
        self.task3 = Task.objects.create(title="MCP Test Task 3", status=Task.Status.DONE)

    def tearDown(self):
        """Clean up test tasks."""
        Task.objects.filter(title__startswith="MCP Test").delete()

    def test_get_all_tasks_returns_tasks(self):
        """Test get_all_tasks returns all tasks."""
        tasks = async_to_sync(get_all_tasks)()

        self.assertGreaterEqual(len(tasks), 3)
        titles = [task.title for task in tasks]
        self.assertIn("MCP Test Task 1", titles)
        self.assertIn("MCP Test Task 2", titles)

    def test_get_all_tasks_filtered_by_status(self):
        """Test get_all_tasks filters by status."""
        todo_tasks = async_to_sync(get_all_tasks)(status="TODO")

        self.assertGreater(len(todo_tasks), 0)
        for task in todo_tasks:
            self.assertEqual(task.status, Task.Status.TODO)

    def test_create_task_sync_creates_task(self):
        """Test create_task_sync creates a new task."""
        new_task = async_to_sync(create_task_sync)(
            title="MCP Created Task", description="Task created via MCP", status="DOING"
        )

        self.assertIsNotNone(new_task.id)
        self.assertEqual(new_task.title, "MCP Created Task")
        self.assertEqual(new_task.description, "Task created via MCP")
        self.assertEqual(new_task.status, "DOING")

    def test_create_task_with_defaults(self):
        """Test create_task_sync uses default values."""
        new_task = async_to_sync(create_task_sync)(title="MCP Minimal Task")

        self.assertEqual(new_task.title, "MCP Minimal Task")
        self.assertEqual(new_task.description, "")
        self.assertEqual(new_task.status, "TODO")

    def test_get_task_by_id_returns_task(self):
        """Test get_task_by_id retrieves correct task."""
        task = async_to_sync(get_task_by_id)(self.task1.id)

        self.assertEqual(task.id, self.task1.id)
        self.assertEqual(task.title, "MCP Test Task 1")

    def test_save_task_updates_task(self):
        """Test save_task persists task changes."""
        task = async_to_sync(get_task_by_id)(self.task1.id)
        task.title = "Updated via MCP"
        task.status = Task.Status.DONE

        updated_task = async_to_sync(save_task)(task)

        self.assertEqual(updated_task.title, "Updated via MCP")
        self.assertEqual(updated_task.status, Task.Status.DONE)

        # Verify changes persisted
        task.refresh_from_db()
        self.assertEqual(task.title, "Updated via MCP")
        self.assertEqual(task.status, Task.Status.DONE)

    def test_delete_task_sync_removes_task(self):
        """Test delete_task_sync deletes task."""
        task_id = self.task3.id

        async_to_sync(delete_task_sync)(self.task3)

        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_task_to_dict_converts_correctly(self):
        """Test task_to_dict converts Task to dict."""
        task_dict = task_to_dict(self.task1)

        self.assertEqual(task_dict["id"], self.task1.id)
        self.assertEqual(task_dict["title"], "MCP Test Task 1")
        self.assertEqual(task_dict["description"], "First test task")
        self.assertEqual(task_dict["status"], "TODO")
        self.assertIn("created_at", task_dict)
        self.assertIn("updated_at", task_dict)

    def test_get_task_by_id_raises_for_missing_task(self):
        """Test get_task_by_id raises DoesNotExist for invalid ID."""
        with self.assertRaises(Task.DoesNotExist):
            async_to_sync(get_task_by_id)(99999)
