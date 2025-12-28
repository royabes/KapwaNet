# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Admin configuration for help models.
"""

from django.contrib import admin

from .models import HelpPost


@admin.register(HelpPost)
class HelpPostAdmin(admin.ModelAdmin):
    """Admin configuration for HelpPost model."""

    list_display = [
        'title', 'type', 'category', 'urgency', 'status',
        'org', 'created_by', 'created_at'
    ]
    list_filter = ['type', 'category', 'urgency', 'status', 'org']
    search_fields = ['title', 'description', 'created_by__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'type', 'title', 'description')
        }),
        ('Details', {
            'fields': ('category', 'urgency', 'approx_location', 'availability')
        }),
        ('Status', {
            'fields': ('status', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
