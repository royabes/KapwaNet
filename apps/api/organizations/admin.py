# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Django admin configuration for Organization models.
"""

from django.contrib import admin

from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin configuration for Organization model."""

    list_display = ('name', 'slug', 'region', 'is_active', 'created_at')
    list_filter = ('is_active', 'region', 'created_at')
    search_fields = ('name', 'slug', 'region', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('id', 'name', 'slug', 'is_active')
        }),
        ('Details', {
            'fields': ('description', 'region', 'logo_url', 'website', 'contact_email')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    ordering = ('name',)
