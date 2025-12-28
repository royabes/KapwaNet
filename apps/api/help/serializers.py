# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for help models.
"""

from rest_framework import serializers

from organizations.models import Membership, Organization
from .models import HelpPost


class HelpPostSerializer(serializers.ModelSerializer):
    """
    Serializer for HelpPost model.

    Handles creation, updates, and validation of help posts.
    """

    # Read-only fields for display
    created_by_name = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # Computed fields
    can_edit = serializers.SerializerMethodField()
    valid_status_transitions = serializers.SerializerMethodField()

    class Meta:
        model = HelpPost
        fields = [
            'id',
            'org',
            'type',
            'type_display',
            'category',
            'category_display',
            'title',
            'description',
            'urgency',
            'urgency_display',
            'approx_location',
            'availability',
            'status',
            'status_display',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'can_edit',
            'valid_status_transitions',
        ]
        read_only_fields = [
            'id',
            'created_by',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):
        """Get the display name of the creator."""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None

    def get_can_edit(self, obj):
        """Check if the current user can edit this post."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        # Author can always edit
        if obj.created_by == request.user:
            return True

        # Moderators and admins can edit
        return Membership.has_role(request.user, obj.org, ['org_admin', 'moderator'])

    def get_valid_status_transitions(self, obj):
        """Get the valid status transitions for this post."""
        return HelpPost.VALID_STATUS_TRANSITIONS.get(obj.status, [])

    def validate_org(self, value):
        """Validate that the user is a member of the organization."""
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError("Request context is required.")

        if not Membership.is_user_member(request.user, value):
            raise serializers.ValidationError(
                "You must be a member of this organization to create help posts."
            )

        return value

    def validate_status(self, value):
        """Validate status transitions."""
        if self.instance:
            # This is an update, check if transition is valid
            current_status = self.instance.status
            if current_status != value:
                valid_transitions = HelpPost.VALID_STATUS_TRANSITIONS.get(current_status, [])
                if value not in valid_transitions:
                    raise serializers.ValidationError(
                        f"Cannot transition from '{current_status}' to '{value}'. "
                        f"Valid transitions: {', '.join(valid_transitions) or 'none'}"
                    )
        return value

    def validate(self, data):
        """Perform cross-field validation."""
        request = self.context.get('request')

        # For updates, check if user has permission to edit
        if self.instance:
            can_edit = (
                self.instance.created_by == request.user or
                Membership.has_role(request.user, self.instance.org, ['org_admin', 'moderator'])
            )
            if not can_edit:
                raise serializers.ValidationError(
                    "You do not have permission to edit this help post."
                )

        return data

    def create(self, validated_data):
        """Create a new help post."""
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)


class HelpPostListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing help posts.

    Contains less detail than the full serializer for better performance.
    """

    created_by_name = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = HelpPost
        fields = [
            'id',
            'org',
            'type',
            'type_display',
            'category',
            'category_display',
            'title',
            'urgency',
            'urgency_display',
            'approx_location',
            'status',
            'status_display',
            'created_by_name',
            'created_at',
        ]

    def get_created_by_name(self, obj):
        """Get the display name of the creator."""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None


class HelpPostStatusUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating help post status.

    Used for specific status change endpoints like cancel, complete, etc.
    """

    status = serializers.ChoiceField(choices=HelpPost.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        """Validate the status transition."""
        instance = self.context.get('instance')
        if not instance:
            raise serializers.ValidationError("Instance is required for status update.")

        current_status = instance.status
        valid_transitions = HelpPost.VALID_STATUS_TRANSITIONS.get(current_status, [])

        if value not in valid_transitions:
            raise serializers.ValidationError(
                f"Cannot transition from '{current_status}' to '{value}'. "
                f"Valid transitions: {', '.join(valid_transitions) or 'none'}"
            )

        return value
