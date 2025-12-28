# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organizations', '0001_initial'),
        ('messaging', '0001_initial'),
        ('help', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='HelpMatch',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the match', primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined'), ('withdrawn', 'Withdrawn'), ('closed', 'Closed')], default='pending', help_text='Current status of the match', max_length=20)),
                ('message', models.TextField(blank=True, help_text='Optional message from the helper when expressing interest')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('accepted_at', models.DateTimeField(blank=True, help_text='When the match was accepted', null=True)),
                ('closed_at', models.DateTimeField(blank=True, help_text='When the match was closed/completed', null=True)),
                ('help_post', models.ForeignKey(help_text='The help post this match is for', on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='help.helppost')),
                ('helper_user', models.ForeignKey(help_text='The user who is offering to help', on_delete=django.db.models.deletion.CASCADE, related_name='help_matches_as_helper', to=settings.AUTH_USER_MODEL)),
                ('org', models.ForeignKey(help_text='The organization this match belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='help_matches', to='organizations.organization')),
                ('thread', models.ForeignKey(blank=True, help_text='The messaging thread for this match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='help_matches', to='messaging.thread')),
            ],
            options={
                'verbose_name': 'help match',
                'verbose_name_plural': 'help matches',
                'db_table': 'help_matches',
                'ordering': ['-created_at'],
                'unique_together': {('help_post', 'helper_user')},
            },
        ),
        migrations.AddIndex(
            model_name='helpmatch',
            index=models.Index(fields=['org', 'status'], name='help_matche_org_id_4e7c3d_idx'),
        ),
        migrations.AddIndex(
            model_name='helpmatch',
            index=models.Index(fields=['help_post', 'status'], name='help_matche_help_po_a35e2b_idx'),
        ),
    ]
