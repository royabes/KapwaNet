# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Models for bayanihan (mutual aid) help requests and offers.

This module contains the HelpPost model which tracks requests and offers
for help within an organization's community.
"""

import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class HelpPost(models.Model):
    """
    A help post representing either a request for help or an offer to help.

    Help posts are the core of bayanihan (mutual aid) functionality.
    Community members can create posts to request help or offer assistance.
    """

    TYPE_CHOICES = [
        ('request', 'Request'),
        ('offer', 'Offer'),
    ]

    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('matched', 'Matched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Valid status transitions
    VALID_STATUS_TRANSITIONS = {
        'open': ['matched', 'cancelled'],
        'matched': ['completed', 'cancelled', 'open'],  # Can reopen if match fails
        'completed': [],  # Terminal state
        'cancelled': ['open'],  # Can reopen a cancelled post
    }

    # Predefined help categories
    CATEGORY_CHOICES = [
        ('transportation', 'Transportation'),
        ('errands', 'Errands'),
        ('childcare', 'Childcare'),
        ('eldercare', 'Elder Care'),
        ('petcare', 'Pet Care'),
        ('household', 'Household'),
        ('tech_support', 'Tech Support'),
        ('language', 'Language/Translation'),
        ('administrative', 'Administrative'),
        ('emotional', 'Emotional Support'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the help post"
    )
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='help_posts',
        help_text="The organization this help post belongs to"
    )
    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        help_text="Whether this is a request for help or an offer to help"
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        help_text="Category of help needed or offered"
    )
    title = models.CharField(
        max_length=255,
        help_text="Brief title describing the help needed or offered"
    )
    description = models.TextField(
        help_text="Detailed description of the help request or offer"
    )
    urgency = models.CharField(
        max_length=10,
        choices=URGENCY_CHOICES,
        default='normal',
        help_text="Urgency level of the request"
    )
    approx_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Approximate location (neighborhood, area) - never exact address"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        help_text="Current status of the help post"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='help_posts',
        help_text="The user who created this help post"
    )

    # Optional fields for additional context
    availability = models.CharField(
        max_length=255,
        blank=True,
        help_text="When help is needed or available (e.g., 'Weekday mornings')"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'help_posts'
        ordering = ['-created_at']
        verbose_name = 'help post'
        verbose_name_plural = 'help posts'
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['org', 'type']),
            models.Index(fields=['org', 'category']),
        ]

    def __str__(self):
        return f"{self.get_type_display()}: {self.title}"

    def clean(self):
        """Validate the help post data."""
        super().clean()

        # Validate status transitions if the object already exists
        if self.pk:
            try:
                old_instance = HelpPost.objects.get(pk=self.pk)
                if old_instance.status != self.status:
                    self.validate_status_transition(old_instance.status, self.status)
            except HelpPost.DoesNotExist:
                pass

    def validate_status_transition(self, old_status, new_status):
        """
        Validate that a status transition is allowed.

        Raises ValidationError if the transition is not valid.
        """
        valid_transitions = self.VALID_STATUS_TRANSITIONS.get(old_status, [])
        if new_status not in valid_transitions:
            raise ValidationError({
                'status': f"Cannot transition from '{old_status}' to '{new_status}'. "
                         f"Valid transitions: {', '.join(valid_transitions) or 'none'}"
            })

    def can_transition_to(self, new_status):
        """
        Check if transitioning to a new status is valid.

        Returns True if the transition is allowed, False otherwise.
        """
        valid_transitions = self.VALID_STATUS_TRANSITIONS.get(self.status, [])
        return new_status in valid_transitions

    def mark_matched(self):
        """Mark the post as matched."""
        self.validate_status_transition(self.status, 'matched')
        self.status = 'matched'
        self.save()

    def mark_completed(self):
        """Mark the post as completed."""
        self.validate_status_transition(self.status, 'completed')
        self.status = 'completed'
        self.save()

    def cancel(self):
        """Cancel the post."""
        self.validate_status_transition(self.status, 'cancelled')
        self.status = 'cancelled'
        self.save()

    def reopen(self):
        """Reopen a cancelled or matched post."""
        self.validate_status_transition(self.status, 'open')
        self.status = 'open'
        self.save()
