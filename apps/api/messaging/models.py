# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Models for messaging between community members.

This module contains Thread and Message models for private communication
between users within an organization.
"""

import uuid

from django.conf import settings
from django.db import models


class Thread(models.Model):
    """
    A messaging thread between users.

    Threads can be linked to help matches or item reservations,
    or can be direct messages between users.
    """

    THREAD_TYPE_CHOICES = [
        ('help_match', 'Help Match'),
        ('item_reservation', 'Item Reservation'),
        ('direct', 'Direct'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the thread"
    )
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='threads',
        help_text="The organization this thread belongs to"
    )
    thread_type = models.CharField(
        max_length=20,
        choices=THREAD_TYPE_CHOICES,
        help_text="Type of thread (help_match, item_reservation, or direct)"
    )
    ref_id = models.UUIDField(
        null=True,
        blank=True,
        help_text="Reference ID for the linked entity (HelpMatch or ItemReservation UUID)"
    )
    subject = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional subject/title for the thread"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp of the most recent message"
    )

    class Meta:
        db_table = 'threads'
        ordering = ['-last_message_at', '-created_at']
        verbose_name = 'thread'
        verbose_name_plural = 'threads'
        indexes = [
            models.Index(fields=['org', 'thread_type']),
            models.Index(fields=['org', 'ref_id']),
        ]

    def __str__(self):
        if self.subject:
            return f"Thread: {self.subject}"
        return f"Thread ({self.get_thread_type_display()})"

    def add_participant(self, user):
        """Add a user as a participant in this thread."""
        ThreadParticipant.objects.get_or_create(
            thread=self,
            user=user,
            defaults={'org': self.org}
        )

    def remove_participant(self, user):
        """Remove a user from this thread."""
        ThreadParticipant.objects.filter(thread=self, user=user).delete()

    def get_participants(self):
        """Get all active participants in this thread."""
        return ThreadParticipant.objects.filter(
            thread=self
        ).select_related('user')

    def is_participant(self, user):
        """Check if a user is a participant in this thread."""
        return ThreadParticipant.objects.filter(
            thread=self,
            user=user
        ).exists()

    def get_unread_count(self, user):
        """Get the count of unread messages for a user in this thread."""
        participant = ThreadParticipant.objects.filter(
            thread=self,
            user=user
        ).first()

        # Always exclude messages sent by the user themselves
        base_queryset = self.messages.exclude(sender_user=user)

        if not participant or not participant.last_read_at:
            return base_queryset.count()

        return base_queryset.filter(
            created_at__gt=participant.last_read_at
        ).count()

    def mark_read(self, user):
        """Mark all messages as read for a user."""
        from django.utils import timezone
        ThreadParticipant.objects.filter(
            thread=self,
            user=user
        ).update(last_read_at=timezone.now())

    @classmethod
    def create_for_help_match(cls, org, ref_id, participants, subject=None):
        """
        Create a thread for a help match.

        Args:
            org: The organization
            ref_id: The HelpMatch UUID
            participants: List of User objects to add as participants
            subject: Optional subject line

        Returns:
            The created Thread
        """
        thread = cls.objects.create(
            org=org,
            thread_type='help_match',
            ref_id=ref_id,
            subject=subject or 'Help Match Discussion'
        )
        for user in participants:
            thread.add_participant(user)
        return thread

    @classmethod
    def create_for_item_reservation(cls, org, ref_id, participants, subject=None):
        """
        Create a thread for an item reservation.

        Args:
            org: The organization
            ref_id: The ItemReservation UUID
            participants: List of User objects to add as participants
            subject: Optional subject line

        Returns:
            The created Thread
        """
        thread = cls.objects.create(
            org=org,
            thread_type='item_reservation',
            ref_id=ref_id,
            subject=subject or 'Item Reservation Discussion'
        )
        for user in participants:
            thread.add_participant(user)
        return thread

    @classmethod
    def get_or_create_direct(cls, org, user1, user2, subject=None):
        """
        Get or create a direct message thread between two users.

        Args:
            org: The organization
            user1: First user
            user2: Second user
            subject: Optional subject line

        Returns:
            Tuple of (Thread, created)
        """
        # Look for existing direct thread with both participants
        existing = cls.objects.filter(
            org=org,
            thread_type='direct',
            participants__user=user1
        ).filter(
            participants__user=user2
        ).first()

        if existing:
            return existing, False

        # Create new thread
        thread = cls.objects.create(
            org=org,
            thread_type='direct',
            subject=subject or 'Direct Message'
        )
        thread.add_participant(user1)
        thread.add_participant(user2)
        return thread, True


class ThreadParticipant(models.Model):
    """
    A participant in a messaging thread.

    Tracks who is part of a conversation and their read status.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the participant entry"
    )
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='thread_participants',
        help_text="The organization (denormalized for filtering)"
    )
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='participants',
        help_text="The thread this participant belongs to"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='thread_participations',
        help_text="The user who is a participant"
    )
    last_read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the user last read messages in this thread"
    )

    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'thread_participants'
        ordering = ['joined_at']
        verbose_name = 'thread participant'
        verbose_name_plural = 'thread participants'
        unique_together = [['thread', 'user']]

    def __str__(self):
        return f"{self.user.email} in {self.thread}"


class Message(models.Model):
    """
    A message within a thread.

    Messages can be from users or system-generated (for status changes, etc.).
    """

    MESSAGE_TYPE_CHOICES = [
        ('user', 'User'),
        ('system', 'System'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the message"
    )
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="The organization (denormalized for filtering)"
    )
    thread = models.ForeignKey(
        Thread,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="The thread this message belongs to"
    )
    sender_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_messages',
        help_text="The user who sent this message (null for system messages)"
    )
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPE_CHOICES,
        default='user',
        help_text="Type of message (user or system)"
    )
    body = models.TextField(
        help_text="The message content"
    )

    # Moderation
    is_hidden = models.BooleanField(
        default=False,
        help_text="Whether the message is hidden by moderation"
    )
    hidden_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Reason for hiding the message"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        verbose_name = 'message'
        verbose_name_plural = 'messages'
        indexes = [
            models.Index(fields=['thread', 'created_at']),
            models.Index(fields=['org', 'sender_user']),
        ]

    def __str__(self):
        sender = self.sender_user.email if self.sender_user else 'System'
        return f"Message from {sender} at {self.created_at}"

    def save(self, *args, **kwargs):
        """Update thread's last_message_at on save."""
        super().save(*args, **kwargs)
        # Update the thread's last_message_at
        from django.utils import timezone
        Thread.objects.filter(pk=self.thread_id).update(
            last_message_at=timezone.now()
        )

    @classmethod
    def send_user_message(cls, thread, sender, body):
        """
        Send a user message to a thread.

        Args:
            thread: The Thread to send to
            sender: The User sending the message
            body: The message content

        Returns:
            The created Message
        """
        if not thread.is_participant(sender):
            raise ValueError("User is not a participant in this thread")

        return cls.objects.create(
            org=thread.org,
            thread=thread,
            sender_user=sender,
            message_type='user',
            body=body
        )

    @classmethod
    def send_system_message(cls, thread, body):
        """
        Send a system message to a thread.

        Args:
            thread: The Thread to send to
            body: The message content

        Returns:
            The created Message
        """
        return cls.objects.create(
            org=thread.org,
            thread=thread,
            sender_user=None,
            message_type='system',
            body=body
        )
