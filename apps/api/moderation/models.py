# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Models for moderation and trust.
"""

import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class Report(models.Model):
    """
    Model for user-submitted reports about content or users.

    Reports can target help posts, item posts, messages, or users.
    """

    TARGET_TYPE_CHOICES = [
        ('user', 'User'),
        ('help_post', 'Help Post'),
        ('item_post', 'Item Post'),
        ('message', 'Message'),
    ]

    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('inappropriate', 'Inappropriate Content'),
        ('fraud', 'Fraud or Scam'),
        ('prohibited_item', 'Prohibited Item'),
        ('safety', 'Safety Concern'),
        ('false_info', 'False Information'),
        ('impersonation', 'Impersonation'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('reviewing', 'Under Review'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='reports',
    )

    # What is being reported
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE_CHOICES)
    target_id = models.UUIDField(help_text='ID of the reported content or user')

    # Who submitted the report
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_submitted',
    )

    # Report details
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    details = models.TextField(
        blank=True,
        help_text='Additional details about the report'
    )

    # Status and resolution
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolution_notes = models.TextField(
        blank=True,
        help_text='Notes from moderator about resolution'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved',
    )

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['target_type', 'target_id']),
        ]

    def __str__(self):
        return f"Report {self.reason} on {self.target_type}:{self.target_id}"

    def get_target_object(self):
        """
        Get the actual object being reported.

        Returns the target object or None if not found.
        """
        from help.models import HelpPost
        from items.models import ItemPost
        from messaging.models import Message
        from users.models import User

        model_map = {
            'user': User,
            'help_post': HelpPost,
            'item_post': ItemPost,
            'message': Message,
        }

        model_class = model_map.get(self.target_type)
        if not model_class:
            return None

        try:
            return model_class.objects.get(id=self.target_id)
        except model_class.DoesNotExist:
            return None

    def start_review(self, moderator):
        """Mark the report as under review."""
        if self.status != 'open':
            raise ValidationError("Can only start review on open reports.")
        self.status = 'reviewing'
        self.save(update_fields=['status', 'updated_at'])

    def resolve(self, moderator, notes='', action_taken=None):
        """
        Resolve the report.

        Args:
            moderator: The moderator resolving the report
            notes: Resolution notes
            action_taken: Optional ModerationAction that was taken
        """
        if self.status not in ['open', 'reviewing']:
            raise ValidationError("Cannot resolve already resolved/dismissed report.")

        self.status = 'resolved'
        self.resolution_notes = notes
        self.resolved_at = timezone.now()
        self.resolved_by = moderator
        self.save(update_fields=[
            'status', 'resolution_notes', 'resolved_at', 'resolved_by', 'updated_at'
        ])

    def dismiss(self, moderator, notes=''):
        """
        Dismiss the report (no action needed).

        Args:
            moderator: The moderator dismissing the report
            notes: Reason for dismissal
        """
        if self.status not in ['open', 'reviewing']:
            raise ValidationError("Cannot dismiss already resolved/dismissed report.")

        self.status = 'dismissed'
        self.resolution_notes = notes
        self.resolved_at = timezone.now()
        self.resolved_by = moderator
        self.save(update_fields=[
            'status', 'resolution_notes', 'resolved_at', 'resolved_by', 'updated_at'
        ])


class ModerationAction(models.Model):
    """
    Model for moderation actions taken by moderators.

    All actions are logged for audit purposes.
    """

    ACTION_TYPE_CHOICES = [
        ('warn', 'Warning'),
        ('remove_content', 'Remove Content'),
        ('hide_content', 'Hide Content'),
        ('suspend', 'Suspend User'),
        ('unsuspend', 'Unsuspend User'),
        ('ban', 'Ban User'),
        ('unban', 'Unban User'),
    ]

    TARGET_TYPE_CHOICES = [
        ('user', 'User'),
        ('help_post', 'Help Post'),
        ('item_post', 'Item Post'),
        ('message', 'Message'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='moderation_actions',
    )

    # Who took the action
    moderator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='moderation_actions_taken',
    )

    # What action was taken
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES)

    # Target of the action
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE_CHOICES)
    target_id = models.UUIDField(help_text='ID of the target user or content')

    # Related report (if any)
    report = models.ForeignKey(
        Report,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actions',
    )

    # Action details
    reason = models.TextField(help_text='Reason for the action')
    internal_notes = models.TextField(
        blank=True,
        help_text='Internal notes (not visible to the user)'
    )
    user_message = models.TextField(
        blank=True,
        help_text='Message to show the user about this action'
    )

    # Duration for temporary actions (e.g., suspension)
    duration_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Duration in days for temporary actions'
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the action expires (for temporary actions)'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'moderation_actions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'action_type']),
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['moderator', 'created_at']),
        ]

    def __str__(self):
        return f"{self.action_type} on {self.target_type}:{self.target_id}"

    def save(self, *args, **kwargs):
        """Set expires_at if duration_days is provided."""
        if self.duration_days and not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=self.duration_days)
        super().save(*args, **kwargs)

    @classmethod
    def warn_user(cls, org, moderator, user, reason, report=None, user_message=''):
        """
        Issue a warning to a user.

        Args:
            org: The organization
            moderator: The moderator issuing the warning
            user: The user to warn
            reason: Reason for the warning
            report: Optional related report
            user_message: Message to show the user

        Returns:
            The created ModerationAction
        """
        action = cls.objects.create(
            org=org,
            moderator=moderator,
            action_type='warn',
            target_type='user',
            target_id=user.id,
            report=report,
            reason=reason,
            user_message=user_message,
        )
        return action

    @classmethod
    def suspend_user(cls, org, moderator, user, reason, duration_days=None,
                     report=None, user_message=''):
        """
        Suspend a user's membership.

        Args:
            org: The organization
            moderator: The moderator suspending the user
            user: The user to suspend
            reason: Reason for suspension
            duration_days: Optional duration (None = indefinite)
            report: Optional related report
            user_message: Message to show the user

        Returns:
            The created ModerationAction
        """
        from organizations.models import Membership

        # Update membership status
        try:
            membership = Membership.objects.get(org=org, user=user)
            membership.status = 'suspended'
            membership.save(update_fields=['status', 'updated_at'])
        except Membership.DoesNotExist:
            raise ValidationError(f"User {user.email} is not a member of this org.")

        action = cls.objects.create(
            org=org,
            moderator=moderator,
            action_type='suspend',
            target_type='user',
            target_id=user.id,
            report=report,
            reason=reason,
            duration_days=duration_days,
            user_message=user_message,
        )
        return action

    @classmethod
    def unsuspend_user(cls, org, moderator, user, reason):
        """
        Remove suspension from a user.

        Args:
            org: The organization
            moderator: The moderator unsuspending
            user: The user to unsuspend
            reason: Reason for unsuspension

        Returns:
            The created ModerationAction
        """
        from organizations.models import Membership

        try:
            membership = Membership.objects.get(org=org, user=user)
            if membership.status != 'suspended':
                raise ValidationError("User is not suspended.")
            membership.status = 'active'
            membership.save(update_fields=['status', 'updated_at'])
        except Membership.DoesNotExist:
            raise ValidationError(f"User {user.email} is not a member of this org.")

        action = cls.objects.create(
            org=org,
            moderator=moderator,
            action_type='unsuspend',
            target_type='user',
            target_id=user.id,
            reason=reason,
        )
        return action

    @classmethod
    def ban_user(cls, org, moderator, user, reason, report=None, user_message=''):
        """
        Ban a user from the organization.

        Sets membership to 'left' status (prevents rejoining via invite).

        Args:
            org: The organization
            moderator: The moderator banning
            user: The user to ban
            reason: Reason for ban
            report: Optional related report
            user_message: Message to show the user

        Returns:
            The created ModerationAction
        """
        from organizations.models import Membership

        try:
            membership = Membership.objects.get(org=org, user=user)
            membership.status = 'left'
            membership.is_banned = True
            membership.save(update_fields=['status', 'is_banned', 'updated_at'])
        except Membership.DoesNotExist:
            # Create a banned membership record
            Membership.objects.create(
                org=org,
                user=user,
                role='member',
                status='left',
                is_banned=True,
            )

        action = cls.objects.create(
            org=org,
            moderator=moderator,
            action_type='ban',
            target_type='user',
            target_id=user.id,
            report=report,
            reason=reason,
            user_message=user_message,
        )
        return action

    @classmethod
    def hide_content(cls, org, moderator, content_type, content_id, reason,
                     report=None):
        """
        Hide content from public view.

        Args:
            org: The organization
            moderator: The moderator hiding content
            content_type: Type of content ('help_post', 'item_post', 'message')
            content_id: ID of the content
            reason: Reason for hiding
            report: Optional related report

        Returns:
            The created ModerationAction
        """
        from help.models import HelpPost
        from items.models import ItemPost
        from messaging.models import Message

        # Get and update the content
        if content_type == 'help_post':
            try:
                post = HelpPost.objects.get(id=content_id)
                post.status = 'cancelled'
                post.save(update_fields=['status', 'updated_at'])
            except HelpPost.DoesNotExist:
                raise ValidationError("Help post not found.")
        elif content_type == 'item_post':
            try:
                post = ItemPost.objects.get(id=content_id)
                post.status = 'cancelled'
                post.save(update_fields=['status', 'updated_at'])
            except ItemPost.DoesNotExist:
                raise ValidationError("Item post not found.")
        elif content_type == 'message':
            try:
                message = Message.objects.get(id=content_id)
                message.is_hidden = True
                message.save(update_fields=['is_hidden', 'updated_at'])
            except Message.DoesNotExist:
                raise ValidationError("Message not found.")
        else:
            raise ValidationError(f"Invalid content type: {content_type}")

        action = cls.objects.create(
            org=org,
            moderator=moderator,
            action_type='hide_content',
            target_type=content_type,
            target_id=content_id,
            report=report,
            reason=reason,
        )
        return action

    @classmethod
    def remove_content(cls, org, moderator, content_type, content_id, reason,
                       report=None):
        """
        Permanently remove content.

        For now, this just hides the content (soft delete).

        Args:
            org: The organization
            moderator: The moderator removing content
            content_type: Type of content
            content_id: ID of the content
            reason: Reason for removal
            report: Optional related report

        Returns:
            The created ModerationAction
        """
        # For safety, we don't actually delete - just hide
        return cls.hide_content(
            org=org,
            moderator=moderator,
            content_type=content_type,
            content_id=content_id,
            reason=reason,
            report=report,
        )
