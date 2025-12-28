# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later
# Generated migration for Membership model

import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0004_add_org_page'),
    ]

    operations = [
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the membership', primary_key=True, serialize=False)),
                ('role', models.CharField(choices=[('org_admin', 'Organization Admin'), ('moderator', 'Moderator'), ('member', 'Member')], default='member', help_text="The user's role in the organization", max_length=20)),
                ('status', models.CharField(choices=[('active', 'Active'), ('suspended', 'Suspended'), ('left', 'Left')], default='active', help_text='The membership status', max_length=20)),
                ('notes', models.TextField(blank=True, help_text='Internal notes about this membership')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('org', models.ForeignKey(help_text='The organization the user is a member of', on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='organizations.organization')),
                ('user', models.ForeignKey(help_text='The user who is a member', on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'membership',
                'verbose_name_plural': 'memberships',
                'db_table': 'memberships',
                'ordering': ['org', 'user'],
                'unique_together': {('org', 'user')},
            },
        ),
    ]
