# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the organization', primary_key=True, serialize=False)),
                ('slug', models.SlugField(help_text="URL-friendly identifier (e.g., 'calgary-filipino-community')", max_length=100, unique=True)),
                ('name', models.CharField(help_text='Display name of the organization', max_length=255)),
                ('region', models.CharField(blank=True, help_text="Geographic region (e.g., 'Calgary, AB')", max_length=100)),
                ('logo_url', models.URLField(blank=True, help_text="URL to the organization's logo image")),
                ('description', models.TextField(blank=True, help_text='Brief description of the organization')),
                ('website', models.URLField(blank=True, help_text="Organization's external website URL")),
                ('contact_email', models.EmailField(blank=True, help_text='Primary contact email for the organization', max_length=254)),
                ('is_active', models.BooleanField(default=True, help_text='Whether the organization is currently active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'organization',
                'verbose_name_plural': 'organizations',
                'db_table': 'organizations',
                'ordering': ['name'],
            },
        ),
    ]
