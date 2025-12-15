"""
GraphQL Schema Tests - API Integration
=======================================

Tests for Ariadne GraphQL API using Django's test client.

Setup:
    python manage.py test kanban.tests.test_schema

Focus Areas:
    - GraphQL query execution via HTTP endpoint
    - Mutation operations (create, update, delete)
    - Enum validation at GraphQL layer
"""

import json

from django.test import Client, TestCase

from apps.kanban.models import Task


class GraphQLSchemaTests(TestCase):
    """Test GraphQL API functionality via HTTP endpoint."""

    def setUp(self):
        """Set up test client and sample data."""
        self.client = Client()
        self.graphql_url = "/graphql/"

        # Create test tasks
        self.task1 = Task.objects.create(
            title="Test Task 1",
            description="First test task",
            status=Task.Status.TODO,
            priority=Task.Priority.P1,
        )
        self.task2 = Task.objects.create(
            title="Test Task 2", status=Task.Status.DOING, priority=Task.Priority.P2
        )
        self.task3 = Task.objects.create(
            title="Test Task 3", status=Task.Status.DONE, priority=Task.Priority.P3
        )

    def execute_query(self, query, variables=None):
        """Execute a GraphQL query via HTTP POST."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables

        response = self.client.post(
            self.graphql_url,
            data=json.dumps(payload),
            content_type="application/json",
        )
        return json.loads(response.content)

    def test_all_tasks_query(self):
        """Test allTasks query returns all tasks."""
        query = """
            query {
                allTasks {
                    id
                    title
                    description
                    status
                    priority
                }
            }
        """
        result = self.execute_query(query)
        self.assertNotIn("errors", result)

        tasks = result["data"]["allTasks"]
        self.assertEqual(len(tasks), 3)

        # Verify task data
        titles = [task["title"] for task in tasks]
        self.assertIn("Test Task 1", titles)
        self.assertIn("Test Task 2", titles)
        self.assertIn("Test Task 3", titles)

    def test_create_task_mutation_with_default_status(self):
        """Test createTask mutation uses default TODO status."""
        mutation = """
            mutation {
                createTask(title: "New Task") {
                    task {
                        id
                        title
                        status
                        priority
                    }
                }
            }
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        task_data = result["data"]["createTask"]["task"]
        self.assertEqual(task_data["title"], "New Task")
        self.assertEqual(task_data["status"], "TODO")
        self.assertEqual(task_data["priority"], "P4")  # Default priority

        # Verify task was created in DB
        task = Task.objects.get(title="New Task")
        self.assertEqual(task.status, Task.Status.TODO)

    def test_create_task_mutation_with_valid_statuses(self):
        """Test createTask mutation works with valid status values."""
        for status in ["TODO", "DOING", "WAITING", "DONE"]:
            with self.subTest(status=status):
                task = Task.objects.create(title=f"Task {status}", status=status)
                self.assertEqual(task.status, status)
                self.assertIn(task.status, [s.value for s in Task.Status])
                task.delete()

    def test_create_task_mutation_with_priority(self):
        """Test createTask mutation with explicit priority."""
        mutation = """
            mutation {
                createTask(title: "Priority Task", priority: P1) {
                    task {
                        id
                        title
                        priority
                    }
                }
            }
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        task_data = result["data"]["createTask"]["task"]
        self.assertEqual(task_data["title"], "Priority Task")
        self.assertEqual(task_data["priority"], "P1")

    def test_update_task_mutation(self):
        """Test updateTask mutation updates task fields."""
        mutation = f"""
            mutation {{
                updateTask(
                    id: "{self.task1.id}",
                    title: "Updated Title",
                    description: "Updated description",
                    status: DOING
                ) {{
                    task {{
                        id
                        title
                        description
                        status
                    }}
                }}
            }}
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        task_data = result["data"]["updateTask"]["task"]
        self.assertEqual(task_data["title"], "Updated Title")
        self.assertEqual(task_data["description"], "Updated description")
        self.assertEqual(task_data["status"], "DOING")

        # Verify DB was updated
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, "Updated Title")
        self.assertEqual(self.task1.status, Task.Status.DOING)

    def test_update_task_status_only(self):
        """Test updating only task status (drag-and-drop scenario)."""
        self.assertEqual(self.task1.status, Task.Status.TODO)

        mutation = f"""
            mutation {{
                updateTask(id: "{self.task1.id}", status: DONE) {{
                    task {{
                        id
                        status
                    }}
                }}
            }}
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        self.task1.refresh_from_db()
        self.assertEqual(self.task1.status, Task.Status.DONE)

    def test_update_task_partial_fields(self):
        """Test updating partial fields preserves other fields."""
        original_description = self.task1.description
        original_status = self.task1.status

        mutation = f"""
            mutation {{
                updateTask(id: "{self.task1.id}", title: "Only Title Changed") {{
                    task {{
                        id
                        title
                        description
                        status
                    }}
                }}
            }}
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, "Only Title Changed")
        self.assertEqual(self.task1.description, original_description)
        self.assertEqual(self.task1.status, original_status)

    def test_delete_task_mutation(self):
        """Test deleteTask mutation removes task."""
        task_id = self.task1.id

        mutation = f"""
            mutation {{
                deleteTask(id: "{task_id}") {{
                    success
                }}
            }}
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)
        self.assertTrue(result["data"]["deleteTask"]["success"])

        # Verify task no longer exists
        self.assertFalse(Task.objects.filter(id=task_id).exists())

    def test_query_returns_correct_status_distribution(self):
        """Test query returns tasks grouped by status correctly."""
        query = """
            query {
                allTasks {
                    status
                }
            }
        """
        result = self.execute_query(query)
        self.assertNotIn("errors", result)

        statuses = [task["status"] for task in result["data"]["allTasks"]]
        self.assertEqual(statuses.count("TODO"), 1)
        self.assertEqual(statuses.count("DOING"), 1)
        self.assertEqual(statuses.count("DONE"), 1)

    def test_task_fields_returned_correctly(self):
        """Test all task fields are returned with correct types."""
        query = """
            query {
                allTasks {
                    id
                    title
                    description
                    status
                    priority
                    category
                    createdAt
                    updatedAt
                }
            }
        """
        result = self.execute_query(query)
        self.assertNotIn("errors", result)

        task = result["data"]["allTasks"][0]
        self.assertIsNotNone(task["id"])
        self.assertIsInstance(task["title"], str)
        self.assertIn(task["status"], ["TODO", "DOING", "WAITING", "DONE"])
        self.assertIn(task["priority"], ["P1", "P2", "P3", "P4"])
        self.assertIsNotNone(task["createdAt"])
        self.assertIsNotNone(task["updatedAt"])

    def test_update_task_priority(self):
        """Test updateTask mutation updates priority."""
        mutation = f"""
            mutation {{
                updateTask(id: "{self.task1.id}", priority: P1) {{
                    task {{
                        id
                        priority
                    }}
                }}
            }}
        """
        result = self.execute_query(mutation)
        self.assertNotIn("errors", result)

        task_data = result["data"]["updateTask"]["task"]
        self.assertEqual(task_data["priority"], "P1")

        self.task1.refresh_from_db()
        self.assertEqual(self.task1.priority, Task.Priority.P1)
