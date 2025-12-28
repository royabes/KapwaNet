# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for moderation API.
"""

from rest_framework import serializers

from .models import Report, ModerationAction


class ReportSerializer(serializers.ModelSerializer):
    """Full serializer for Report model."""

    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    reporter_name = serializers.CharField(source='reporter.display_name', read_only=True)
    resolved_by_email = serializers.EmailField(source='resolved_by.email', read_only=True)
    target_info = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'org',
            'target_type',
            'target_id',
            'target_info',
            'reporter',
            'reporter_email',
            'reporter_name',
            'reason',
            'details',
            'status',
            'resolution_notes',
            'resolved_at',
            'resolved_by',
            'resolved_by_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'reporter', 'status', 'resolution_notes',
            'resolved_at', 'resolved_by', 'created_at', 'updated_at'
        ]

    def get_target_info(self, obj):
        """Get basic info about the target."""
        target = obj.get_target_object()
        if not target:
            return {'deleted': True}

        if obj.target_type == 'user':
            return {
                'email': target.email,
                'display_name': target.display_name,
            }
        elif obj.target_type == 'help_post':
            return {
                'title': target.title,
                'type': target.type,
                'status': target.status,
            }
        elif obj.target_type == 'item_post':
            return {
                'title': target.title,
                'type': target.type,
                'category': target.category,
            }
        elif obj.target_type == 'message':
            return {
                'body': target.body[:100] + '...' if len(target.body) > 100 else target.body,
                'sender': target.sender_user.display_name if target.sender_user else 'System',
            }
        return {}

    def create(self, validated_data):
        """Create a report."""
        request = self.context['request']
        validated_data['reporter'] = request.user
        return super().create(validated_data)


class ReportListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing reports."""

    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)
    target_preview = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'target_type',
            'target_id',
            'target_preview',
            'reporter_email',
            'reason',
            'status',
            'created_at',
        ]

    def get_target_preview(self, obj):
        """Get a brief preview of the target."""
        target = obj.get_target_object()
        if not target:
            return '[Deleted]'

        if obj.target_type == 'user':
            return target.email
        elif obj.target_type in ['help_post', 'item_post']:
            return target.title[:50]
        elif obj.target_type == 'message':
            return target.body[:50] + '...' if len(target.body) > 50 else target.body
        return str(obj.target_id)


class CreateReportSerializer(serializers.Serializer):
    """Serializer for creating a report."""

    org = serializers.UUIDField()
    target_type = serializers.ChoiceField(choices=Report.TARGET_TYPE_CHOICES)
    target_id = serializers.UUIDField()
    reason = serializers.ChoiceField(choices=Report.REASON_CHOICES)
    details = serializers.CharField(required=False, allow_blank=True)


class ResolveReportSerializer(serializers.Serializer):
    """Serializer for resolving a report."""

    resolution_notes = serializers.CharField(required=False, allow_blank=True)


class ModerationActionSerializer(serializers.ModelSerializer):
    """Full serializer for ModerationAction model."""

    moderator_email = serializers.EmailField(source='moderator.email', read_only=True)
    moderator_name = serializers.CharField(source='moderator.display_name', read_only=True)
    target_info = serializers.SerializerMethodField()

    class Meta:
        model = ModerationAction
        fields = [
            'id',
            'org',
            'moderator',
            'moderator_email',
            'moderator_name',
            'action_type',
            'target_type',
            'target_id',
            'target_info',
            'report',
            'reason',
            'internal_notes',
            'user_message',
            'duration_days',
            'expires_at',
            'created_at',
        ]
        read_only_fields = [
            'id', 'moderator', 'created_at', 'expires_at'
        ]

    def get_target_info(self, obj):
        """Get basic info about the target."""
        from users.models import User
        from help.models import HelpPost
        from items.models import ItemPost
        from messaging.models import Message

        model_map = {
            'user': User,
            'help_post': HelpPost,
            'item_post': ItemPost,
            'message': Message,
        }

        model_class = model_map.get(obj.target_type)
        if not model_class:
            return {}

        try:
            target = model_class.objects.get(id=obj.target_id)
            if obj.target_type == 'user':
                return {'email': target.email, 'display_name': target.display_name}
            elif obj.target_type in ['help_post', 'item_post']:
                return {'title': target.title}
            elif obj.target_type == 'message':
                return {'body': target.body[:50]}
        except model_class.DoesNotExist:
            return {'deleted': True}
        return {}


class ModerationActionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing moderation actions."""

    moderator_email = serializers.EmailField(source='moderator.email', read_only=True)

    class Meta:
        model = ModerationAction
        fields = [
            'id',
            'action_type',
            'target_type',
            'target_id',
            'moderator_email',
            'reason',
            'duration_days',
            'created_at',
        ]


class TakeActionSerializer(serializers.Serializer):
    """Serializer for taking a moderation action."""

    action_type = serializers.ChoiceField(choices=ModerationAction.ACTION_TYPE_CHOICES)
    target_type = serializers.ChoiceField(choices=ModerationAction.TARGET_TYPE_CHOICES)
    target_id = serializers.UUIDField()
    reason = serializers.CharField()
    report_id = serializers.UUIDField(required=False)
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    user_message = serializers.CharField(required=False, allow_blank=True)
    duration_days = serializers.IntegerField(required=False, min_value=1)
