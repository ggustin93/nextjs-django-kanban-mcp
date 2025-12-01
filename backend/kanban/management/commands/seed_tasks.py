"""Create sample tasks for development."""
from django.core.management.base import BaseCommand

from kanban.models import Task


class Command(BaseCommand):
    help = 'Create sample tasks for development'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Delete all existing tasks first')

    def handle(self, *args, **options):
        # Clear existing tasks if requested
        if options['clear']:
            count = Task.objects.count()
            Task.objects.all().delete()
            self.stdout.write(f'Deleted {count} tasks')

        # Create 10 simple tasks: 5 TODO, 3 DOING, 2 DONE
        tasks = [
            ('Design landing page', Task.Status.TODO),
            ('Set up CI/CD', Task.Status.TODO),
            ('Write documentation', Task.Status.TODO),
            ('Add authentication', Task.Status.TODO),
            ('Implement dark mode', Task.Status.TODO),
            ('Build API endpoints', Task.Status.DOING),
            ('Fix layout bugs', Task.Status.DOING),
            ('Add file upload', Task.Status.DOING),
            ('Set up repository', Task.Status.DONE),
            ('Create database models', Task.Status.DONE),
        ]

        for title, status in tasks:
            Task.objects.create(title=title, status=status)

        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(tasks)} tasks'))
