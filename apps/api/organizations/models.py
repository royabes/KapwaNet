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
