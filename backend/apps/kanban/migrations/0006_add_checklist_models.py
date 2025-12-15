# Generated migration for Checklist and ChecklistItem models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('kanban', '0005_add_order_field'),
    ]

    operations = [
        migrations.CreateModel(
            name='Checklist',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=255)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='checklists', to='kanban.task')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChecklistItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('text', models.CharField(max_length=500)),
                ('completed', models.BooleanField(default=False, db_index=True)),
                ('position', models.PositiveIntegerField(db_index=True)),
                ('checklist', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='kanban.checklist')),
            ],
            options={
                'ordering': ['position'],
            },
        ),
        # Add index for efficient queries on checklist items
        migrations.AddIndex(
            model_name='checklistitem',
            index=models.Index(fields=['checklist', 'position'], name='kanban_chec_checkli_idx'),
        ),
    ]
