# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later
# Generated migration for Membership is_banned field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0006_add_invite'),
    ]

    operations = [
        migrations.AddField(
            model_name='membership',
            name='is_banned',
            field=models.BooleanField(
                default=False,
                help_text='Whether the user is banned from the organization'
            ),
        ),
    ]
