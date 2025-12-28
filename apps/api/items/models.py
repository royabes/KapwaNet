# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Models for item sharing.
"""

import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


class ItemPost(models.Model):
    """
    Model for item sharing posts.

    Supports both offers (sharing items) and requests (seeking items).
    Food items have additional safety fields.
    """

    TYPE_CHOICES = [
        ('offer', 'Offering'),
        ('request', 'Requesting'),
    ]

    CATEGORY_CHOICES = [
        ('food', 'Food & Groceries'),
        ('clothing', 'Clothing'),
        ('household', 'Household Items'),
        ('baby_kids', 'Baby & Kids'),
        ('electronics', 'Electronics'),
        ('furniture', 'Furniture'),
        ('hygiene', 'Hygiene & Personal Care'),
        ('medical', 'Medical Supplies'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # Valid status transitions
    VALID_STATUS_TRANSITIONS = {
        'available': ['reserved', 'cancelled'],
        'reserved': ['available', 'completed', 'cancelled'],
        'completed': [],
        'cancelled': ['available'],
    }

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    STORAGE_CHOICES = [
        ('room_temp', 'Room Temperature'),
        ('refrigerated', 'Refrigerated'),
        ('frozen', 'Frozen'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='item_posts',
    )

    # Basic info
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        blank=True,
        help_text='Condition of the item (for offers only)'
    )

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    # Location (approximate)
    approx_location = models.CharField(
        max_length=255,
        blank=True,
        help_text='Approximate location (neighborhood, area)'
    )

    # Photos (stored as JSON array of URLs)
    photos = models.JSONField(default=list, blank=True)

    # Food safety fields (only required for food category)
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text='Expiration date for food items'
    )
    allergens = models.JSONField(
        default=list,
        blank=True,
        help_text='List of allergens (e.g., ["nuts", "dairy", "gluten"])'
    )
    storage_requirements = models.CharField(
        max_length=20,
        choices=STORAGE_CHOICES,
        blank=True,
        help_text='Storage requirements for food items'
    )
    dietary_info = models.CharField(
        max_length=255,
        blank=True,
        help_text='Dietary information (e.g., vegetarian, halal, kosher)'
    )
    is_homemade = models.BooleanField(
        default=False,
        help_text='Whether this is a homemade food item'
    )

    # Pickup info
    pickup_instructions = models.TextField(
        blank=True,
        help_text='Instructions for pickup (times, location details)'
    )
    availability_window = models.CharField(
        max_length=255,
        blank=True,
        help_text='When the item is available for pickup'
    )

    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='item_posts_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'item_posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['org', 'category']),
            models.Index(fields=['org', 'type', 'status']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"

    def clean(self):
        """Validate food safety fields for food items."""
        super().clean()

        if self.category == 'food' and self.type == 'offer':
            # Food offers should have expiry date
            if not self.expiry_date:
                raise ValidationError({
                    'expiry_date': 'Expiry date is required for food items.'
                })

            # Expiry date should not be in the past
            if self.expiry_date < timezone.now().date():
                raise ValidationError({
                    'expiry_date': 'Expiry date cannot be in the past.'
                })

    def save(self, *args, **kwargs):
        """Save the item post after validation."""
        self.full_clean()
        super().save(*args, **kwargs)

    def can_transition_to(self, new_status):
        """Check if transitioning to the new status is allowed."""
        return new_status in self.VALID_STATUS_TRANSITIONS.get(self.status, [])

    def reserve(self):
        """Mark the item as reserved."""
        if not self.can_transition_to('reserved'):
            raise ValidationError(
                f"Cannot reserve item with status '{self.status}'."
            )
        self.status = 'reserved'
        self.save(update_fields=['status', 'updated_at'])

    def release(self):
        """Release the reservation and make item available again."""
        if not self.can_transition_to('available'):
            raise ValidationError(
                f"Cannot release item with status '{self.status}'."
            )
        self.status = 'available'
        self.save(update_fields=['status', 'updated_at'])

    def mark_completed(self):
        """Mark the item as completed (picked up/received)."""
        if not self.can_transition_to('completed'):
            raise ValidationError(
                f"Cannot complete item with status '{self.status}'."
            )
        self.status = 'completed'
        self.save(update_fields=['status', 'updated_at'])

    def cancel(self):
        """Cancel the item post."""
        if not self.can_transition_to('cancelled'):
            raise ValidationError(
                f"Cannot cancel item with status '{self.status}'."
            )
        self.status = 'cancelled'
        self.save(update_fields=['status', 'updated_at'])

    def reopen(self):
        """Reopen a cancelled item post."""
        if not self.can_transition_to('available'):
            raise ValidationError(
                f"Cannot reopen item with status '{self.status}'."
            )
        self.status = 'available'
        self.save(update_fields=['status', 'updated_at'])

    @property
    def is_food(self):
        """Check if this is a food item."""
        return self.category == 'food'

    @property
    def is_expired(self):
        """Check if a food item is expired."""
        if not self.expiry_date:
            return False
        return self.expiry_date < timezone.now().date()


class ItemReservation(models.Model):
    """
    Model for item reservations.

    Links a requester to an item post with messaging thread.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    org = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='item_reservations',
    )
    item_post = models.ForeignKey(
        ItemPost,
        on_delete=models.CASCADE,
        related_name='reservations',
    )
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='item_reservations',
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(
        blank=True,
        help_text='Message from requester to item owner'
    )
    quantity_requested = models.PositiveIntegerField(
        default=1,
        help_text='Number of items requested'
    )

    # Thread for communication
    thread = models.ForeignKey(
        'messaging.Thread',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='item_reservations',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'item_reservations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['org', 'status']),
            models.Index(fields=['item_post', 'status']),
        ]
        constraints = [
            # One pending/approved reservation per user per item
            models.UniqueConstraint(
                fields=['item_post', 'requester'],
                condition=models.Q(status__in=['pending', 'approved']),
                name='unique_active_reservation_per_user'
            ),
        ]

    def __str__(self):
        return f"Reservation by {self.requester} for {self.item_post}"

    @property
    def owner(self):
        """Get the item post owner."""
        return self.item_post.created_by

    @classmethod
    def create_reservation(cls, item_post, requester, message='', quantity=1):
        """
        Create a new reservation for an item.

        Args:
            item_post: The ItemPost to reserve
            requester: The user requesting the item
            message: Optional message to the owner
            quantity: Number of items requested

        Returns:
            The created ItemReservation

        Raises:
            ValidationError: If reservation is not allowed
        """
        # Cannot reserve own item
        if item_post.created_by == requester:
            raise ValidationError("You cannot reserve your own item.")

        # Item must be available
        if item_post.status != 'available':
            raise ValidationError(
                f"This item is not available for reservation (status: {item_post.status})."
            )

        # Check for existing active reservation
        existing = cls.objects.filter(
            item_post=item_post,
            requester=requester,
            status__in=['pending', 'approved']
        ).exists()
        if existing:
            raise ValidationError("You already have a reservation for this item.")

        # Check quantity
        if quantity > item_post.quantity:
            raise ValidationError(
                f"Requested quantity ({quantity}) exceeds available ({item_post.quantity})."
            )

        # Create reservation
        reservation = cls.objects.create(
            org=item_post.org,
            item_post=item_post,
            requester=requester,
            message=message,
            quantity_requested=quantity,
        )

        return reservation

    def approve(self):
        """
        Approve the reservation.

        Creates a messaging thread and updates item status.
        """
        from messaging.models import Thread, Message

        if self.status != 'pending':
            raise ValidationError(
                f"Cannot approve reservation with status '{self.status}'."
            )

        # Create messaging thread
        thread = Thread.objects.create(
            org=self.org,
            thread_type='item_reservation',
            ref_id=str(self.id),
            subject=f"Reservation: {self.item_post.title}",
        )
        thread.add_participant(self.requester)
        thread.add_participant(self.owner)

        # Send system message
        Message.send_system_message(
            thread=thread,
            body=f"Reservation approved! {self.requester.display_name} will pick up "
                 f"{self.quantity_requested}x {self.item_post.title}."
        )

        # Update reservation
        self.status = 'approved'
        self.thread = thread
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'thread', 'approved_at', 'updated_at'])

        # Update item status
        self.item_post.reserve()

        # Reject other pending reservations
        other_pending = ItemReservation.objects.filter(
            item_post=self.item_post,
            status='pending'
        ).exclude(id=self.id)
        for res in other_pending:
            res.reject()

        return thread

    def reject(self):
        """Reject the reservation."""
        if self.status != 'pending':
            raise ValidationError(
                f"Cannot reject reservation with status '{self.status}'."
            )

        self.status = 'rejected'
        self.save(update_fields=['status', 'updated_at'])

    def cancel(self):
        """
        Cancel the reservation.

        If already approved, releases the item.
        """
        if self.status not in ['pending', 'approved']:
            raise ValidationError(
                f"Cannot cancel reservation with status '{self.status}'."
            )

        was_approved = self.status == 'approved'
        self.status = 'cancelled'
        self.save(update_fields=['status', 'updated_at'])

        # If was approved, release the item
        if was_approved:
            self.item_post.release()

            # Send system message
            if self.thread:
                from messaging.models import Message
                Message.send_system_message(
                    thread=self.thread,
                    body=f"Reservation cancelled by {self.requester.display_name}."
                )

    def complete(self):
        """
        Complete the reservation (item picked up).

        Both parties can mark as complete.
        """
        from messaging.models import Message

        if self.status != 'approved':
            raise ValidationError(
                f"Cannot complete reservation with status '{self.status}'."
            )

        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at', 'updated_at'])

        # Mark item as completed
        self.item_post.mark_completed()

        # Send system message
        if self.thread:
            Message.send_system_message(
                thread=self.thread,
                body=f"Pickup confirmed! Thank you for sharing with the community."
            )
