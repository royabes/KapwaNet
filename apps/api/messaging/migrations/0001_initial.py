# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Thread',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the thread', primary_key=True, serialize=False)),
                ('thread_type', models.CharField(choices=[('help_match', 'Help Match'), ('item_reservation', 'Item Reservation'), ('direct', 'Direct')], help_text='Type of thread (help_match, item_reservation, or direct)', max_length=20)),
                ('ref_id', models.UUIDField(blank=True, help_text='Reference ID for the linked entity (HelpMatch or ItemReservation UUID)', null=True)),
                ('subject', models.CharField(blank=True, help_text='Optional subject/title for the thread', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_message_at', models.DateTimeField(blank=True, help_text='Timestamp of the most recent message', null=True)),
                ('org', models.ForeignKey(help_text='The organization this thread belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='threads', to='organizations.organization')),
            ],
            options={
                'verbose_name': 'thread',
                'verbose_name_plural': 'threads',
                'db_table': 'threads',
                'ordering': ['-last_message_at', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ThreadParticipant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the participant entry', primary_key=True, serialize=False)),
                ('last_read_at', models.DateTimeField(blank=True, help_text='When the user last read messages in this thread', null=True)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('org', models.ForeignKey(help_text='The organization (denormalized for filtering)', on_delete=django.db.models.deletion.CASCADE, related_name='thread_participants', to='organizations.organization')),
                ('thread', models.ForeignKey(help_text='The thread this participant belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='messaging.thread')),
                ('user', models.ForeignKey(help_text='The user who is a participant', on_delete=django.db.models.deletion.CASCADE, related_name='thread_participations', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'thread participant',
                'verbose_name_plural': 'thread participants',
                'db_table': 'thread_participants',
                'ordering': ['joined_at'],
                'unique_together': {('thread', 'user')},
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the message', primary_key=True, serialize=False)),
                ('message_type', models.CharField(choices=[('user', 'User'), ('system', 'System')], default='user', help_text='Type of message (user or system)', max_length=10)),
                ('body', models.TextField(help_text='The message content')),
                ('is_hidden', models.BooleanField(default=False, help_text='Whether the message is hidden by moderation')),
                ('hidden_reason', models.CharField(blank=True, help_text='Reason for hiding the message', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('org', models.ForeignKey(help_text='The organization (denormalized for filtering)', on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='organizations.organization')),
                ('sender_user', models.ForeignKey(blank=True, help_text='The user who sent this message (null for system messages)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sent_messages', to=settings.AUTH_USER_MODEL)),
                ('thread', models.ForeignKey(help_text='The thread this message belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='messaging.thread')),
            ],
            options={
                'verbose_name': 'message',
                'verbose_name_plural': 'messages',
                'db_table': 'messages',
                'ordering': ['created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='thread',
            index=models.Index(fields=['org', 'thread_type'], name='threads_org_id_a73e08_idx'),
        ),
        migrations.AddIndex(
            model_name='thread',
            index=models.Index(fields=['org', 'ref_id'], name='threads_org_id_b22e4f_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['thread', 'created_at'], name='messages_thread__ba5ab1_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['org', 'sender_user'], name='messages_org_id_42d498_idx'),
        ),
    ]
