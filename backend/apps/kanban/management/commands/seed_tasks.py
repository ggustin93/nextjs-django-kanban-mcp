"""Create sample tasks for development with categories and priorities."""
from django.core.management.base import BaseCommand

from apps.kanban.models import Task


class Command(BaseCommand):
    help = 'Create sample tasks for development'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete all existing tasks first')

    def handle(self, *args, **options):
        if options['clear']:
            count = Task.objects.count()
            Task.objects.all().delete()
            self.stdout.write(f'Deleted {count} tasks')

        # Sample tasks with status, category, and priority
        # Format: (title, status, category, priority)
        tasks = [
            # P1 - Do First (urgent & important)
            ('Fix critical production bug', Task.Status.DOING, '#work', Task.Priority.P1),
            ('Deploy security patch', Task.Status.TODO, '#devops', Task.Priority.P1),
            # P2 - Schedule (important, not urgent)
            ('Design landing page', Task.Status.TODO, '#design', Task.Priority.P2),
            ('Write API documentation', Task.Status.TODO, '#docs', Task.Priority.P2),
            ('Add user authentication', Task.Status.DOING, '#feature', Task.Priority.P2),
            # P3 - Quick Win (small tasks)
            ('Update README', Task.Status.TODO, '#docs', Task.Priority.P3),
            ('Fix typo in footer', Task.Status.DOING, '#bugfix', Task.Priority.P3),
            # P4 - Backlog (do later)
            ('Implement dark mode', Task.Status.TODO, '#feature', Task.Priority.P4),
            ('Refactor legacy code', Task.Status.TODO, '#tech-debt', Task.Priority.P4),
            # Done tasks (mixed priorities for realism)
            ('Set up repository', Task.Status.DONE, '#devops', Task.Priority.P2),
            ('Create database models', Task.Status.DONE, '#work', Task.Priority.P1),
        ]

        for title, status, category, priority in tasks:
            Task.objects.create(
                title=title,
                status=status,
                category=category,
                priority=priority,
            )

        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(tasks)} tasks'))
