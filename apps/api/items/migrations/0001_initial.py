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
        ('messaging', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemPost',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('type', models.CharField(choices=[('offer', 'Offering'), ('request', 'Requesting')], max_length=10)),
                ('category', models.CharField(choices=[('food', 'Food & Groceries'), ('clothing', 'Clothing'), ('household', 'Household Items'), ('baby_kids', 'Baby & Kids'), ('electronics', 'Electronics'), ('furniture', 'Furniture'), ('hygiene', 'Hygiene & Personal Care'), ('medical', 'Medical Supplies'), ('other', 'Other')], max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('condition', models.CharField(blank=True, choices=[('new', 'New'), ('like_new', 'Like New'), ('good', 'Good'), ('fair', 'Fair'), ('poor', 'Poor')], help_text='Condition of the item (for offers only)', max_length=20)),
                ('status', models.CharField(choices=[('available', 'Available'), ('reserved', 'Reserved'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='available', max_length=20)),
                ('approx_location', models.CharField(blank=True, help_text='Approximate location (neighborhood, area)', max_length=255)),
                ('photos', models.JSONField(blank=True, default=list)),
                ('expiry_date', models.DateField(blank=True, help_text='Expiration date for food items', null=True)),
                ('allergens', models.JSONField(blank=True, default=list, help_text='List of allergens (e.g., ["nuts", "dairy", "gluten"])')),
                ('storage_requirements', models.CharField(blank=True, choices=[('room_temp', 'Room Temperature'), ('refrigerated', 'Refrigerated'), ('frozen', 'Frozen')], help_text='Storage requirements for food items', max_length=20)),
                ('dietary_info', models.CharField(blank=True, help_text='Dietary information (e.g., vegetarian, halal, kosher)', max_length=255)),
                ('is_homemade', models.BooleanField(default=False, help_text='Whether this is a homemade food item')),
                ('pickup_instructions', models.TextField(blank=True, help_text='Instructions for pickup (times, location details)')),
                ('availability_window', models.CharField(blank=True, help_text='When the item is available for pickup', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_posts_created', to=settings.AUTH_USER_MODEL)),
                ('org', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_posts', to='organizations.organization')),
            ],
            options={
                'db_table': 'item_posts',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ItemReservation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('cancelled', 'Cancelled'), ('completed', 'Completed')], default='pending', max_length=20)),
                ('message', models.TextField(blank=True, help_text='Message from requester to item owner')),
                ('quantity_requested', models.PositiveIntegerField(default=1, help_text='Number of items requested')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('approved_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('item_post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reservations', to='items.itempost')),
                ('org', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_reservations', to='organizations.organization')),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_reservations', to=settings.AUTH_USER_MODEL)),
                ('thread', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='item_reservations', to='messaging.thread')),
            ],
            options={
                'db_table': 'item_reservations',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='itempost',
            index=models.Index(fields=['org', 'status'], name='item_posts_org_id_status_idx'),
        ),
        migrations.AddIndex(
            model_name='itempost',
            index=models.Index(fields=['org', 'category'], name='item_posts_org_id_cat_idx'),
        ),
        migrations.AddIndex(
            model_name='itempost',
            index=models.Index(fields=['org', 'type', 'status'], name='item_posts_org_type_stat_idx'),
        ),
        migrations.AddIndex(
            model_name='itemreservation',
            index=models.Index(fields=['org', 'status'], name='item_res_org_id_status_idx'),
        ),
        migrations.AddIndex(
            model_name='itemreservation',
            index=models.Index(fields=['item_post', 'status'], name='item_res_post_status_idx'),
        ),
        migrations.AddConstraint(
            model_name='itemreservation',
            constraint=models.UniqueConstraint(condition=models.Q(('status__in', ['pending', 'approved'])), fields=('item_post', 'requester'), name='unique_active_reservation_per_user'),
        ),
    ]
