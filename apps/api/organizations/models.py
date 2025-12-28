# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Organization models for KapwaNet multi-tenant architecture.

Each organization represents a community group that can have its own
branding, members, and content.
"""

import uuid

from django.db import models
from django.utils.text import slugify


class Organization(models.Model):
    """
    Core organization model for multi-tenant support.

    Organizations are the top-level entity in KapwaNet. All content,
    users, and settings are scoped to an organization.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the organization"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="URL-friendly identifier (e.g., 'calgary-filipino-community')"
    )
    name = models.CharField(
        max_length=255,
        help_text="Display name of the organization"
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        help_text="Geographic region (e.g., 'Calgary, AB')"
    )
    logo_url = models.URLField(
        blank=True,
        help_text="URL to the organization's logo image"
    )

    # Metadata
    description = models.TextField(
        blank=True,
        help_text="Brief description of the organization"
    )
    website = models.URLField(
        blank=True,
        help_text="Organization's external website URL"
    )
    contact_email = models.EmailField(
        blank=True,
        help_text="Primary contact email for the organization"
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the organization is currently active"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        verbose_name = 'organization'
        verbose_name_plural = 'organizations'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# Default theme tokens schema
DEFAULT_THEME = {
    "colors": {
        "primary": "#4F46E5",     # Indigo
        "secondary": "#0EA5E9",   # Sky blue
        "accent": "#F59E0B",      # Amber
        "background": "#FFFFFF",  # White
        "surface": "#F8FAFC",     # Slate 50
        "text": "#1E293B",        # Slate 800
        "muted": "#64748B"        # Slate 500
    },
    "fonts": {
        "heading": "Inter",
        "body": "Inter"
    },
    "radius": "md",
    "spacing": "comfortable"
}


class ThemePreset(models.Model):
    """
    Predefined theme presets that can be applied to organizations.

    Theme presets provide a starting point for organizations to style
    their sites without having to configure every color and font.
    """

    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text="Unique identifier for the preset (e.g., 'default', 'sunset')"
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name for the preset"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the theme's look and feel"
    )
    theme_json = models.JSONField(
        default=dict,
        help_text="Complete theme configuration as JSON"
    )
    preview_colors = models.JSONField(
        default=list,
        help_text="List of 3-4 preview colors for the theme selector"
    )

    # Metadata
    is_dark = models.BooleanField(
        default=False,
        help_text="Whether this is a dark mode theme"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'theme_presets'
        ordering = ['name']
        verbose_name = 'theme preset'
        verbose_name_plural = 'theme presets'

    def __str__(self):
        return self.name


class OrgTheme(models.Model):
    """
    Theme configuration for an organization.

    Each organization has one theme that defines colors, fonts,
    and spacing used across their public site.
    """

    org = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='theme',
        help_text="The organization this theme belongs to"
    )
    theme_json = models.JSONField(
        default=dict,
        help_text="Theme configuration with colors, fonts, radius, spacing"
    )
    preset = models.ForeignKey(
        ThemePreset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='organizations',
        help_text="The preset this theme is based on (if any)"
    )

    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'org_themes'
        verbose_name = 'organization theme'
        verbose_name_plural = 'organization themes'

    def __str__(self):
        return f"Theme for {self.org.name}"

    def save(self, *args, **kwargs):
        """Set default theme if theme_json is empty."""
        if not self.theme_json:
            self.theme_json = DEFAULT_THEME.copy()
        super().save(*args, **kwargs)

    def apply_preset(self, preset):
        """Apply a preset to this theme."""
        self.preset = preset
        self.theme_json = preset.theme_json.copy()
        self.save()

    def get_css_variables(self):
        """
        Convert theme_json to CSS variable format.

        Returns a dict that can be used directly in style attributes.
        """
        theme = self.theme_json or DEFAULT_THEME
        colors = theme.get('colors', {})
        fonts = theme.get('fonts', {})
        radius = theme.get('radius', 'md')
        spacing = theme.get('spacing', 'comfortable')

        # Radius mapping
        radius_values = {
            'none': '0px',
            'sm': '4px',
            'md': '8px',
            'lg': '12px',
            'xl': '16px',
            'full': '9999px'
        }

        # Spacing mapping
        spacing_values = {
            'compact': '4px',
            'comfortable': '8px',
            'spacious': '12px'
        }

        return {
            '--kn-primary': colors.get('primary', DEFAULT_THEME['colors']['primary']),
            '--kn-secondary': colors.get('secondary', DEFAULT_THEME['colors']['secondary']),
            '--kn-accent': colors.get('accent', DEFAULT_THEME['colors']['accent']),
            '--kn-bg': colors.get('background', DEFAULT_THEME['colors']['background']),
            '--kn-surface': colors.get('surface', DEFAULT_THEME['colors']['surface']),
            '--kn-text': colors.get('text', DEFAULT_THEME['colors']['text']),
            '--kn-muted': colors.get('muted', DEFAULT_THEME['colors']['muted']),
            '--kn-font-heading': fonts.get('heading', DEFAULT_THEME['fonts']['heading']),
            '--kn-font-body': fonts.get('body', DEFAULT_THEME['fonts']['body']),
            '--kn-radius-sm': '4px',
            '--kn-radius-md': '8px',
            '--kn-radius-lg': '12px',
            '--kn-radius-xl': '16px',
            '--kn-radius': radius_values.get(radius, '8px'),
            '--kn-spacing-unit': spacing_values.get(spacing, '8px'),
        }
