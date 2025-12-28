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


class HelpMatch(models.Model):
    """
    A match between a help requester and a helper.

    When someone expresses interest in a help post, a HelpMatch is created.
    The post creator can then accept or decline the match.
    When accepted, a messaging thread is created for communication.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('withdrawn', 'Withdrawn'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the match"
    )
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='help_matches',
        help_text="The organization this match belongs to"
    )
    help_post = models.ForeignKey(
        HelpPost,
        on_delete=models.CASCADE,
        related_name='matches',
        help_text="The help post this match is for"
    )
    # The requester is whoever created the help post
    # The helper is whoever expressed interest
    helper_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='help_matches_as_helper',
        help_text="The user who is offering to help"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Current status of the match"
    )
    message = models.TextField(
        blank=True,
        help_text="Optional message from the helper when expressing interest"
    )

    # Reference to messaging thread (created when match is accepted)
    thread = models.ForeignKey(
        'messaging.Thread',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='help_matches',
        help_text="The messaging thread for this match"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the match was accepted"
    )
    closed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the match was closed/completed"
    )

    class Meta:
        db_table = 'help_matches'
        ordering = ['-created_at']
        verbose_name = 'help match'
        verbose_name_plural = 'help matches'
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['help_post', 'status']),
        ]
        # Prevent duplicate matches from same helper
        unique_together = [['help_post', 'helper_user']]

    def __str__(self):
        return f"Match: {self.helper_user.email} -> {self.help_post.title}"

    @property
    def requester_user(self):
        """Get the user who created the help post."""
        return self.help_post.created_by

    @property
    def is_pending(self):
        """Check if the match is pending."""
        return self.status == 'pending'

    @property
    def is_accepted(self):
        """Check if the match is accepted."""
        return self.status == 'accepted'

    def accept(self):
        """
        Accept this match request.

        This creates a messaging thread and updates the help post status.
        """
        from django.utils import timezone
        from messaging.models import Thread, Message

        if self.status != 'pending':
            raise ValidationError(f"Cannot accept a match in '{self.status}' status.")

        # Decline all other pending matches for this post
        HelpMatch.objects.filter(
            help_post=self.help_post,
            status='pending'
        ).exclude(pk=self.pk).update(status='declined')

        # Update this match
        self.status = 'accepted'
        self.accepted_at = timezone.now()

        # Create messaging thread
        thread = Thread.create_for_help_match(
            org=self.org,
            ref_id=self.id,
            participants=[self.requester_user, self.helper_user],
            subject=f"Help: {self.help_post.title}"
        )
        self.thread = thread
        self.save()

        # Update the help post status
        self.help_post.mark_matched()

        # Send system message about the match
        Message.send_system_message(
            thread=thread,
            body=f"Match accepted! You can now discuss the details of '{self.help_post.title}'."
        )

        return thread

    def decline(self):
        """Decline this match request."""
        if self.status != 'pending':
            raise ValidationError(f"Cannot decline a match in '{self.status}' status.")

        self.status = 'declined'
        self.save()

    def withdraw(self):
        """Withdraw interest (by the helper)."""
        if self.status not in ('pending', 'accepted'):
            raise ValidationError(f"Cannot withdraw a match in '{self.status}' status.")

        # If was accepted, need to reopen the post
        was_accepted = self.status == 'accepted'

        self.status = 'withdrawn'
        self.save()

        if was_accepted:
            # Send system message if there's a thread
            if self.thread:
                from messaging.models import Message
                Message.send_system_message(
                    thread=self.thread,
                    body=f"{self.helper_user.get_full_name() or self.helper_user.email} has withdrawn from this match."
                )
            # Reopen the help post
            self.help_post.reopen()

    def close(self, completed=True):
        """
        Close this match (mark as complete or unsuccessful).

        Args:
            completed: If True, marks the help post as completed.
                      If False, just closes the match.
        """
        from django.utils import timezone

        if self.status != 'accepted':
            raise ValidationError(f"Cannot close a match in '{self.status}' status.")

        self.status = 'closed'
        self.closed_at = timezone.now()
        self.save()

        if completed and self.thread:
            from messaging.models import Message
            Message.send_system_message(
                thread=self.thread,
                body="This help request has been marked as complete. Thank you for participating in bayanihan!"
            )
            self.help_post.mark_completed()

    @classmethod
    def express_interest(cls, help_post, helper_user, message=''):
        """
        Express interest in a help post.

        Creates a new pending match.

        Args:
            help_post: The HelpPost to match with
            helper_user: The User expressing interest
            message: Optional message from the helper

        Returns:
            The created HelpMatch
        """
        # Validate user is not the post creator
        if help_post.created_by == helper_user:
            raise ValidationError("You cannot express interest in your own post.")

        # Validate post is open
        if help_post.status != 'open':
            raise ValidationError(f"Cannot express interest in a post with status '{help_post.status}'.")

        # Check if match already exists
        existing = cls.objects.filter(
            help_post=help_post,
            helper_user=helper_user
        ).first()

        if existing:
            if existing.status in ('pending', 'accepted'):
                raise ValidationError("You have already expressed interest in this post.")
            elif existing.status in ('declined', 'withdrawn'):
                # Allow re-expressing interest if previously declined/withdrawn
                existing.status = 'pending'
                existing.message = message
                existing.save()
                return existing

        # Create new match
        return cls.objects.create(
            org=help_post.org,
            help_post=help_post,
            helper_user=helper_user,
            message=message
        )
