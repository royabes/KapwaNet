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
            name='HelpPost',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the help post', primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('request', 'Request'), ('offer', 'Offer')], help_text='Whether this is a request for help or an offer to help', max_length=10)),
                ('category', models.CharField(choices=[('transportation', 'Transportation'), ('errands', 'Errands'), ('childcare', 'Childcare'), ('eldercare', 'Elder Care'), ('petcare', 'Pet Care'), ('household', 'Household'), ('tech_support', 'Tech Support'), ('language', 'Language/Translation'), ('administrative', 'Administrative'), ('emotional', 'Emotional Support'), ('other', 'Other')], help_text='Category of help needed or offered', max_length=50)),
                ('title', models.CharField(help_text='Brief title describing the help needed or offered', max_length=255)),
                ('description', models.TextField(help_text='Detailed description of the help request or offer')),
                ('urgency', models.CharField(choices=[('low', 'Low'), ('normal', 'Normal'), ('high', 'High')], default='normal', help_text='Urgency level of the request', max_length=10)),
                ('approx_location', models.CharField(blank=True, help_text='Approximate location (neighborhood, area) - never exact address', max_length=255)),
                ('status', models.CharField(choices=[('open', 'Open'), ('matched', 'Matched'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='open', help_text='Current status of the help post', max_length=20)),
                ('availability', models.CharField(blank=True, help_text="When help is needed or available (e.g., 'Weekday mornings')", max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(help_text='The user who created this help post', on_delete=django.db.models.deletion.PROTECT, related_name='help_posts', to=settings.AUTH_USER_MODEL)),
                ('org', models.ForeignKey(help_text='The organization this help post belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='help_posts', to='organizations.organization')),
            ],
            options={
                'verbose_name': 'help post',
                'verbose_name_plural': 'help posts',
                'db_table': 'help_posts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='helppost',
            index=models.Index(fields=['org', 'status'], name='help_posts_org_id_a65fa9_idx'),
        ),
        migrations.AddIndex(
            model_name='helppost',
            index=models.Index(fields=['org', 'type'], name='help_posts_org_id_c4fc1d_idx'),
        ),
        migrations.AddIndex(
            model_name='helppost',
            index=models.Index(fields=['org', 'category'], name='help_posts_org_id_bbb1b9_idx'),
        ),
    ]
