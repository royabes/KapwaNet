# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Admin configuration for moderation.
"""

from django.contrib import admin
from .models import Report, ModerationAction


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin for reports."""

    list_display = [
        'id',
        'target_type',
        'reason',
        'status',
        'reporter',
        'org',
        'created_at',
    ]
    list_filter = ['status', 'reason', 'target_type', 'org']
    search_fields = ['reporter__email', 'details', 'resolution_notes']
    readonly_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'reporter')
        }),
        ('Target', {
            'fields': ('target_type', 'target_id')
        }),
        ('Report Details', {
            'fields': ('reason', 'details')
        }),
        ('Status & Resolution', {
            'fields': ('status', 'resolution_notes', 'resolved_by', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    """Admin for moderation actions."""

    list_display = [
        'id',
        'action_type',
        'target_type',
        'moderator',
        'org',
        'created_at',
    ]
    list_filter = ['action_type', 'target_type', 'org']
    search_fields = ['moderator__email', 'reason', 'internal_notes']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'moderator')
        }),
        ('Action', {
            'fields': ('action_type', 'target_type', 'target_id')
        }),
        ('Details', {
            'fields': ('reason', 'internal_notes', 'user_message')
        }),
        ('Duration', {
            'fields': ('duration_days', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Related', {
            'fields': ('report',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
