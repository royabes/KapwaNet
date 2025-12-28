# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for item sharing API.
"""

from rest_framework import serializers
from django.utils import timezone

from organizations.models import Membership
from .models import ItemPost, ItemReservation


class ItemPostSerializer(serializers.ModelSerializer):
    """Full serializer for item posts."""

    created_by_name = serializers.SerializerMethodField()
    org_name = serializers.SerializerMethodField()
    reservation_count = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    is_food = serializers.BooleanField(read_only=True)

    class Meta:
        model = ItemPost
        fields = [
            'id',
            'org',
            'org_name',
            'type',
            'category',
            'title',
            'description',
            'quantity',
            'condition',
            'status',
            'approx_location',
            'photos',
            # Food safety fields
            'expiry_date',
            'allergens',
            'storage_requirements',
            'dietary_info',
            'is_homemade',
            'is_food',
            'is_expired',
            # Pickup info
            'pickup_instructions',
            'availability_window',
            # Metadata
            'created_by',
            'created_by_name',
            'reservation_count',
            'is_owner',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        """Get the display name of the creator."""
        return obj.created_by.display_name

    def get_org_name(self, obj):
        """Get the organization name."""
        return obj.org.name

    def get_reservation_count(self, obj):
        """Get the count of pending reservations."""
        return obj.reservations.filter(status='pending').count()

    def get_is_owner(self, obj):
        """Check if current user is the owner."""
        request = self.context.get('request')
        if request and request.user:
            return obj.created_by == request.user
        return False

    def validate(self, data):
        """Validate the item post data."""
        category = data.get('category', getattr(self.instance, 'category', None))
        item_type = data.get('type', getattr(self.instance, 'type', None))

        # Food safety validation for food offers
        if category == 'food' and item_type == 'offer':
            expiry_date = data.get('expiry_date')
            if not expiry_date:
                raise serializers.ValidationError({
                    'expiry_date': 'Expiry date is required for food items.'
                })
            if expiry_date < timezone.now().date():
                raise serializers.ValidationError({
                    'expiry_date': 'Expiry date cannot be in the past.'
                })

        return data

    def create(self, validated_data):
        """Create an item post."""
        request = self.context['request']
        validated_data['created_by'] = request.user

        # Get org from the request or validated data
        org = validated_data.get('org')
        if not org:
            org_param = request.query_params.get('org') or request.data.get('org')
            if org_param:
                from organizations.models import Organization
                try:
                    from uuid import UUID
                    UUID(str(org_param))
                    org = Organization.objects.get(id=org_param)
                except (ValueError, AttributeError):
                    org = Organization.objects.get(slug=org_param)
                validated_data['org'] = org

        return super().create(validated_data)


class ItemPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing item posts."""

    created_by_name = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    photo_count = serializers.SerializerMethodField()

    class Meta:
        model = ItemPost
        fields = [
            'id',
            'org',
            'type',
            'category',
            'title',
            'quantity',
            'condition',
            'status',
            'approx_location',
            'expiry_date',
            'is_expired',
            'photo_count',
            'created_by',
            'created_by_name',
            'created_at',
        ]

    def get_created_by_name(self, obj):
        """Get the display name of the creator."""
        return obj.created_by.display_name

    def get_photo_count(self, obj):
        """Get the number of photos."""
        return len(obj.photos) if obj.photos else 0


class ItemReservationSerializer(serializers.ModelSerializer):
    """Full serializer for item reservations."""

    requester_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()
    item_category = serializers.SerializerMethodField()
    is_requester = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = ItemReservation
        fields = [
            'id',
            'org',
            'item_post',
            'item_title',
            'item_category',
            'requester',
            'requester_name',
            'owner_name',
            'status',
            'message',
            'quantity_requested',
            'thread',
            'is_requester',
            'is_owner',
            'created_at',
            'updated_at',
            'approved_at',
            'completed_at',
        ]
        read_only_fields = [
            'id', 'org', 'requester', 'status', 'thread',
            'created_at', 'updated_at', 'approved_at', 'completed_at'
        ]

    def get_requester_name(self, obj):
        """Get the requester's display name."""
        return obj.requester.display_name

    def get_owner_name(self, obj):
        """Get the item owner's display name."""
        return obj.owner.display_name

    def get_item_title(self, obj):
        """Get the item post title."""
        return obj.item_post.title

    def get_item_category(self, obj):
        """Get the item post category."""
        return obj.item_post.category

    def get_is_requester(self, obj):
        """Check if current user is the requester."""
        request = self.context.get('request')
        if request and request.user:
            return obj.requester == request.user
        return False

    def get_is_owner(self, obj):
        """Check if current user is the item owner."""
        request = self.context.get('request')
        if request and request.user:
            return obj.owner == request.user
        return False


class ItemReservationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing reservations."""

    requester_name = serializers.SerializerMethodField()
    item_title = serializers.SerializerMethodField()

    class Meta:
        model = ItemReservation
        fields = [
            'id',
            'item_post',
            'item_title',
            'requester',
            'requester_name',
            'status',
            'quantity_requested',
            'created_at',
        ]

    def get_requester_name(self, obj):
        """Get the requester's display name."""
        return obj.requester.display_name

    def get_item_title(self, obj):
        """Get the item post title."""
        return obj.item_post.title


class ReserveItemSerializer(serializers.Serializer):
    """Serializer for reserve item request."""

    message = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(required=False, default=1, min_value=1)
