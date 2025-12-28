# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Admin configuration for messaging models.
"""

from django.contrib import admin

from .models import Thread, ThreadParticipant, Message


class ThreadParticipantInline(admin.TabularInline):
    """Inline admin for thread participants."""
    model = ThreadParticipant
    extra = 0
    readonly_fields = ['joined_at', 'last_read_at']


class MessageInline(admin.TabularInline):
    """Inline admin for messages."""
    model = Message
    extra = 0
    readonly_fields = ['id', 'sender_user', 'message_type', 'created_at']
    fields = ['sender_user', 'message_type', 'body', 'is_hidden', 'created_at']


@admin.register(Thread)
class ThreadAdmin(admin.ModelAdmin):
    """Admin configuration for Thread model."""

    list_display = [
        'id', 'thread_type', 'subject', 'org',
        'participant_count', 'last_message_at', 'created_at'
    ]
    list_filter = ['thread_type', 'org']
    search_fields = ['subject', 'participants__user__email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_message_at']
    inlines = [ThreadParticipantInline, MessageInline]

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'thread_type', 'ref_id', 'subject')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_message_at'),
            'classes': ('collapse',)
        }),
    )

    def participant_count(self, obj):
        return obj.participants.count()
    participant_count.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin configuration for Message model."""

    list_display = [
        'id', 'thread', 'sender_user', 'message_type',
        'body_preview', 'is_hidden', 'created_at'
    ]
    list_filter = ['message_type', 'is_hidden', 'org']
    search_fields = ['body', 'sender_user__email']
    readonly_fields = ['id', 'created_at', 'updated_at']

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'thread', 'sender_user', 'message_type')
        }),
        ('Content', {
            'fields': ('body',)
        }),
        ('Moderation', {
            'fields': ('is_hidden', 'hidden_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def body_preview(self, obj):
        return obj.body[:50] + '...' if len(obj.body) > 50 else obj.body
    body_preview.short_description = 'Message'
