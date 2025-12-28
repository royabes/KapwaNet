# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later
# Generated migration for Invite model

import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0005_add_membership'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invite',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the invite', primary_key=True, serialize=False)),
                ('email', models.EmailField(help_text='Email address the invite was sent to', max_length=254)),
                ('role', models.CharField(choices=[('org_admin', 'Organization Admin'), ('moderator', 'Moderator'), ('member', 'Member')], default='member', help_text='The role the user will have upon acceptance', max_length=20)),
                ('token', models.CharField(db_index=True, help_text='Unique token for accepting the invite', max_length=64, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('expired', 'Expired'), ('cancelled', 'Cancelled')], default='pending', help_text='The current status of the invite', max_length=20)),
                ('expires_at', models.DateTimeField(help_text='When the invite expires')),
                ('accepted_at', models.DateTimeField(blank=True, help_text='When the invite was accepted', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('org', models.ForeignKey(help_text='The organization being joined', on_delete=django.db.models.deletion.CASCADE, related_name='invites', to='organizations.organization')),
                ('created_by', models.ForeignKey(help_text='The admin who created the invite', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_invites', to=settings.AUTH_USER_MODEL)),
                ('accepted_by', models.ForeignKey(blank=True, help_text='The user who accepted the invite', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='accepted_invites', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'invite',
                'verbose_name_plural': 'invites',
                'db_table': 'invites',
                'ordering': ['-created_at'],
            },
        ),
    ]
