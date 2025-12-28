# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Admin configuration for items.
"""

from django.contrib import admin
from .models import ItemPost, ItemReservation


@admin.register(ItemPost)
class ItemPostAdmin(admin.ModelAdmin):
    """Admin for item posts."""

    list_display = [
        'title',
        'type',
        'category',
        'status',
        'org',
        'created_by',
        'created_at',
    ]
    list_filter = ['type', 'category', 'status', 'org', 'is_homemade']
    search_fields = ['title', 'description', 'created_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'type', 'category', 'title', 'description')
        }),
        ('Details', {
            'fields': ('quantity', 'condition', 'status', 'approx_location', 'photos')
        }),
        ('Food Safety', {
            'fields': (
                'expiry_date', 'allergens', 'storage_requirements',
                'dietary_info', 'is_homemade'
            ),
            'classes': ('collapse',),
        }),
        ('Pickup Info', {
            'fields': ('pickup_instructions', 'availability_window'),
            'classes': ('collapse',),
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(ItemReservation)
class ItemReservationAdmin(admin.ModelAdmin):
    """Admin for item reservations."""

    list_display = [
        'id',
        'item_post',
        'requester',
        'status',
        'quantity_requested',
        'created_at',
    ]
    list_filter = ['status', 'org']
    search_fields = [
        'item_post__title',
        'requester__email',
        'message',
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at',
        'approved_at', 'completed_at'
    ]
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'item_post', 'requester')
        }),
        ('Reservation Details', {
            'fields': ('status', 'message', 'quantity_requested', 'thread')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'approved_at', 'completed_at')
        }),
    )
