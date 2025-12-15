"""
Django Management Command: seed_checklists
==========================================

Purpose:
    Seeds the database with sample checklist data for development/testing.

Usage:
    python manage.py seed_checklists
    python manage.py seed_checklists --tasks 3  # Only add to first 3 tasks
    python manage.py seed_checklists --clear    # Clear existing checklists first

Features:
    - Creates realistic checklist scenarios (development, deployment, QA)
    - Adds items with varied completion states
    - Supports selective clearing of existing data
    - Idempotent when used with --clear flag

Example Output:
    Created 2 checklists for Task 'Setup Development Environment'
    - 'Development Setup' with 5 items
    - 'Testing Requirements' with 3 items
"""

from django.core.management.base import BaseCommand

from apps.kanban.models import Checklist, ChecklistItem, Task


class Command(BaseCommand):
    help = "Seed database with sample checklist data for development"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear all existing checklists before seeding",
        )
        parser.add_argument(
            "--tasks",
            type=int,
            default=None,
            help="Number of tasks to add checklists to (default: all)",
        )

    def handle(self, *args, **options):
        clear = options["clear"]
        max_tasks = options["tasks"]

        if clear:
            deleted_items = ChecklistItem.objects.all().delete()[0]
            deleted_checklists = Checklist.objects.all().delete()[0]
            self.stdout.write(
                self.style.WARNING(
                    f"Cleared {deleted_checklists} checklists and {deleted_items} items"
                )
            )

        # Get tasks to add checklists to
        tasks = Task.objects.all().order_by("created_at")
        if max_tasks:
            tasks = tasks[:max_tasks]

        if not tasks.exists():
            self.stdout.write(
                self.style.ERROR("No tasks found. Run 'python manage.py seed_tasks' first.")
            )
            return

        # Checklist templates
        checklist_templates = [
            {
                "title": "Development Setup",
                "items": [
                    {"text": "Set up local development environment", "completed": True},
                    {"text": "Install required dependencies", "completed": True},
                    {"text": "Configure environment variables", "completed": False},
                    {"text": "Initialize database schema", "completed": False},
                    {"text": "Run initial migrations", "completed": False},
                ],
            },
            {
                "title": "Pre-Launch Checklist",
                "items": [
                    {"text": "Run all unit tests", "completed": True},
                    {"text": "Execute integration tests", "completed": True},
                    {"text": "Perform security audit", "completed": False},
                    {"text": "Update documentation", "completed": False},
                    {"text": "Get stakeholder approval", "completed": False},
                    {"text": "Deploy to staging environment", "completed": False},
                ],
            },
            {
                "title": "QA Validation",
                "items": [
                    {"text": "Test core user flows", "completed": True},
                    {"text": "Verify mobile responsiveness", "completed": False},
                    {"text": "Check accessibility compliance", "completed": False},
                    {"text": "Performance benchmarking", "completed": False},
                ],
            },
            {
                "title": "Documentation Tasks",
                "items": [
                    {"text": "API documentation complete", "completed": True},
                    {"text": "User guide written", "completed": False},
                    {"text": "README updated", "completed": True},
                ],
            },
        ]

        total_checklists = 0
        total_items = 0

        for task in tasks:
            # Add 1-2 random checklists per task
            num_checklists = min(2, len(checklist_templates))
            templates_to_use = checklist_templates[:num_checklists]

            for template in templates_to_use:
                # Create checklist
                checklist = Checklist.objects.create(task=task, title=template["title"])
                total_checklists += 1

                # Create items
                for position, item_data in enumerate(template["items"]):
                    ChecklistItem.objects.create(
                        checklist=checklist,
                        text=item_data["text"],
                        completed=item_data["completed"],
                        position=position,
                    )
                    total_items += 1

                self.stdout.write(f"  - '{template['title']}' with {len(template['items'])} items")

            self.stdout.write(
                self.style.SUCCESS(f"✓ Created {num_checklists} checklists for Task '{task.title}'")
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Seeding complete: {total_checklists} checklists, {total_items} items"
            )
        )
