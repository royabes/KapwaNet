# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Django admin configuration for Organization models.
"""

from django.contrib import admin

from .models import Organization, OrgTheme, ThemePreset, TemplateLibrary, OrgPage, Membership, Invite


@admin.register(ThemePreset)
class ThemePresetAdmin(admin.ModelAdmin):
    """Admin configuration for ThemePreset model."""

    list_display = ('id', 'name', 'is_dark', 'created_at')
    list_filter = ('is_dark',)
    search_fields = ('id', 'name', 'description')
    readonly_fields = ('created_at',)


@admin.register(OrgTheme)
class OrgThemeAdmin(admin.ModelAdmin):
    """Admin configuration for OrgTheme model."""

    list_display = ('org', 'preset', 'updated_at')
    list_filter = ('preset',)
    search_fields = ('org__name', 'org__slug')
    readonly_fields = ('updated_at',)
    autocomplete_fields = ('org',)


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


@admin.register(TemplateLibrary)
class TemplateLibraryAdmin(admin.ModelAdmin):
    """Admin configuration for TemplateLibrary model."""

    list_display = ('id', 'name', 'page_type', 'category', 'is_active', 'created_at')
    list_filter = ('page_type', 'category', 'is_active')
    search_fields = ('id', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('id', 'name', 'description', 'is_active')
        }),
        ('Template Configuration', {
            'fields': ('page_type', 'category', 'recommended_preset', 'thumbnail_url')
        }),
        ('Blocks', {
            'fields': ('blocks_json',),
            'classes': ('wide',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrgPage)
class OrgPageAdmin(admin.ModelAdmin):
    """Admin configuration for OrgPage model."""

    list_display = ('title', 'org', 'slug', 'page_type', 'status', 'updated_at')
    list_filter = ('org', 'page_type', 'status')
    search_fields = ('title', 'slug', 'org__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    autocomplete_fields = ('org',)

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'title', 'slug', 'status')
        }),
        ('Page Configuration', {
            'fields': ('page_type', 'source_template')
        }),
        ('Content', {
            'fields': ('blocks_json',),
            'classes': ('wide',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    """Admin configuration for Membership model."""

    list_display = ('user', 'org', 'role', 'status', 'created_at')
    list_filter = ('org', 'role', 'status')
    search_fields = ('user__email', 'user__display_name', 'org__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    autocomplete_fields = ('org', 'user')

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'user')
        }),
        ('Role & Status', {
            'fields': ('role', 'status', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    """Admin configuration for Invite model."""

    list_display = ('email', 'org', 'role', 'status', 'expires_at', 'created_at')
    list_filter = ('org', 'role', 'status')
    search_fields = ('email', 'org__name', 'token')
    readonly_fields = ('id', 'token', 'created_at', 'updated_at', 'accepted_at')
    autocomplete_fields = ('org', 'created_by', 'accepted_by')

    fieldsets = (
        (None, {
            'fields': ('id', 'org', 'email', 'token')
        }),
        ('Role & Status', {
            'fields': ('role', 'status', 'expires_at')
        }),
        ('Created By', {
            'fields': ('created_by',)
        }),
        ('Accepted By', {
            'fields': ('accepted_by', 'accepted_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
