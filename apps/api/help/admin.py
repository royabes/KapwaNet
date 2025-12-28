# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Admin configuration for help models.
"""

from django.contrib import admin

from .models import HelpPost, HelpMatch


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


@admin.register(HelpMatch)
class HelpMatchAdmin(admin.ModelAdmin):
    """Admin configuration for HelpMatch model."""

    list_display = [
        'id', 'help_post', 'helper_user', 'status',
        'org', 'created_at', 'accepted_at'
    ]
    list_filter = ['status', 'org']
    search_fields = ['help_post__title', 'helper_user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'accepted_at', 'closed_at']
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'help_post', 'helper_user')
        }),
        ('Status', {
            'fields': ('status', 'message', 'thread')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'accepted_at', 'closed_at'),
            'classes': ('collapse',)
        }),
    )
