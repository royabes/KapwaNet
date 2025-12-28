# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later
# Initial migration for moderation app

import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0007_add_membership_is_banned'),
    ]

    operations = [
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('target_type', models.CharField(choices=[('user', 'User'), ('help_post', 'Help Post'), ('item_post', 'Item Post'), ('message', 'Message')], max_length=20)),
                ('target_id', models.UUIDField(help_text='ID of the reported content or user')),
                ('reason', models.CharField(choices=[('spam', 'Spam'), ('harassment', 'Harassment'), ('inappropriate', 'Inappropriate Content'), ('fraud', 'Fraud or Scam'), ('prohibited_item', 'Prohibited Item'), ('safety', 'Safety Concern'), ('false_info', 'False Information'), ('impersonation', 'Impersonation'), ('other', 'Other')], max_length=20)),
                ('details', models.TextField(blank=True, help_text='Additional details about the report')),
                ('status', models.CharField(choices=[('open', 'Open'), ('reviewing', 'Under Review'), ('resolved', 'Resolved'), ('dismissed', 'Dismissed')], default='open', max_length=20)),
                ('resolution_notes', models.TextField(blank=True, help_text='Notes from moderator about resolution')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('org', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='organizations.organization')),
                ('reporter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports_submitted', to=settings.AUTH_USER_MODEL)),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports_resolved', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reports',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ModerationAction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action_type', models.CharField(choices=[('warn', 'Warning'), ('remove_content', 'Remove Content'), ('hide_content', 'Hide Content'), ('suspend', 'Suspend User'), ('unsuspend', 'Unsuspend User'), ('ban', 'Ban User'), ('unban', 'Unban User')], max_length=20)),
                ('target_type', models.CharField(choices=[('user', 'User'), ('help_post', 'Help Post'), ('item_post', 'Item Post'), ('message', 'Message')], max_length=20)),
                ('target_id', models.UUIDField(help_text='ID of the target user or content')),
                ('reason', models.TextField(help_text='Reason for the action')),
                ('internal_notes', models.TextField(blank=True, help_text='Internal notes (not visible to the user)')),
                ('user_message', models.TextField(blank=True, help_text='Message to show the user about this action')),
                ('duration_days', models.PositiveIntegerField(blank=True, help_text='Duration in days for temporary actions', null=True)),
                ('expires_at', models.DateTimeField(blank=True, help_text='When the action expires (for temporary actions)', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('moderator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='moderation_actions_taken', to=settings.AUTH_USER_MODEL)),
                ('org', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='moderation_actions', to='organizations.organization')),
                ('report', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='actions', to='moderation.report')),
            ],
            options={
                'db_table': 'moderation_actions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['org', 'status'], name='reports_org_id_7e5c15_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['target_type', 'target_id'], name='reports_target__b37e5d_idx'),
        ),
        migrations.AddIndex(
            model_name='moderationaction',
            index=models.Index(fields=['org', 'action_type'], name='moderation__org_id_2a8b4c_idx'),
        ),
        migrations.AddIndex(
            model_name='moderationaction',
            index=models.Index(fields=['target_type', 'target_id'], name='moderation__target__d1e8a5_idx'),
        ),
        migrations.AddIndex(
            model_name='moderationaction',
            index=models.Index(fields=['moderator', 'created_at'], name='moderation__moderat_3f7c1e_idx'),
        ),
    ]
