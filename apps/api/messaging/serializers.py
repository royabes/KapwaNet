# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for messaging models.
"""

from rest_framework import serializers

from organizations.models import Membership
from .models import Thread, ThreadParticipant, Message


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model.
    """

    sender_name = serializers.SerializerMethodField()
    is_own_message = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'org',
            'thread',
            'sender_user',
            'sender_name',
            'message_type',
            'body',
            'is_hidden',
            'created_at',
            'updated_at',
            'is_own_message',
        ]
        read_only_fields = [
            'id',
            'org',
            'thread',
            'sender_user',
            'message_type',
            'is_hidden',
            'created_at',
            'updated_at',
        ]

    def get_sender_name(self, obj):
        """Get the display name of the sender."""
        if obj.message_type == 'system':
            return 'System'
        if obj.sender_user:
            return obj.sender_user.get_full_name() or obj.sender_user.email
        return 'Unknown'

    def get_is_own_message(self, obj):
        """Check if this message was sent by the current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.sender_user == request.user


class MessageCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a new message.
    """

    body = serializers.CharField(
        max_length=10000,
        help_text="The message content"
    )

    def validate_body(self, value):
        """Validate message body."""
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty.")
        return value.strip()


class ThreadParticipantSerializer(serializers.ModelSerializer):
    """
    Serializer for ThreadParticipant model.
    """

    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ThreadParticipant
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'last_read_at',
            'joined_at',
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        """Get the display name of the participant."""
        return obj.user.get_full_name() or obj.user.email


class ThreadSerializer(serializers.ModelSerializer):
    """
    Serializer for Thread model with details.
    """

    participants = ThreadParticipantSerializer(many=True, read_only=True)
    thread_type_display = serializers.CharField(
        source='get_thread_type_display',
        read_only=True
    )
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id',
            'org',
            'thread_type',
            'thread_type_display',
            'ref_id',
            'subject',
            'participants',
            'unread_count',
            'last_message',
            'created_at',
            'updated_at',
            'last_message_at',
        ]
        read_only_fields = [
            'id',
            'org',
            'thread_type',
            'ref_id',
            'created_at',
            'updated_at',
            'last_message_at',
        ]

    def get_unread_count(self, obj):
        """Get the unread message count for the current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.get_unread_count(request.user)

    def get_last_message(self, obj):
        """Get the last message in the thread."""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': str(last_msg.id),
                'body': last_msg.body[:100] + '...' if len(last_msg.body) > 100 else last_msg.body,
                'sender_name': last_msg.sender_user.get_full_name() if last_msg.sender_user else 'System',
                'created_at': last_msg.created_at.isoformat(),
            }
        return None


class ThreadListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing threads.
    """

    thread_type_display = serializers.CharField(
        source='get_thread_type_display',
        read_only=True
    )
    unread_count = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    other_participant_name = serializers.SerializerMethodField()
    last_message_preview = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = [
            'id',
            'org',
            'thread_type',
            'thread_type_display',
            'ref_id',
            'subject',
            'unread_count',
            'participant_count',
            'other_participant_name',
            'last_message_preview',
            'last_message_at',
            'created_at',
        ]

    def get_unread_count(self, obj):
        """Get the unread message count for the current user."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.get_unread_count(request.user)

    def get_participant_count(self, obj):
        """Get the number of participants in the thread."""
        return obj.participants.count()

    def get_other_participant_name(self, obj):
        """Get the name of the other participant (for direct threads)."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        for participant in obj.participants.select_related('user').all():
            if participant.user != request.user:
                return participant.user.get_full_name() or participant.user.email

        return None

    def get_last_message_preview(self, obj):
        """Get a preview of the last message."""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            body = last_msg.body
            if len(body) > 50:
                body = body[:50] + '...'
            return body
        return None


class DirectThreadCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a direct message thread.
    """

    recipient_user_id = serializers.UUIDField(
        help_text="The UUID of the user to start a conversation with"
    )
    org_id = serializers.UUIDField(
        help_text="The organization UUID"
    )
    initial_message = serializers.CharField(
        max_length=10000,
        required=False,
        allow_blank=True,
        help_text="Optional initial message to send"
    )

    def validate(self, data):
        """Validate that both users are members of the org."""
        from users.models import User
        from organizations.models import Organization

        request = self.context.get('request')

        try:
            org = Organization.objects.get(id=data['org_id'], is_active=True)
        except Organization.DoesNotExist:
            raise serializers.ValidationError({'org_id': 'Organization not found.'})

        try:
            recipient = User.objects.get(id=data['recipient_user_id'])
        except User.DoesNotExist:
            raise serializers.ValidationError({'recipient_user_id': 'User not found.'})

        # Check both users are members
        if not Membership.is_user_member(request.user, org):
            raise serializers.ValidationError(
                {'org_id': 'You are not a member of this organization.'}
            )

        if not Membership.is_user_member(recipient, org):
            raise serializers.ValidationError(
                {'recipient_user_id': 'The recipient is not a member of this organization.'}
            )

        if request.user == recipient:
            raise serializers.ValidationError(
                {'recipient_user_id': 'You cannot start a conversation with yourself.'}
            )

        data['org'] = org
        data['recipient'] = recipient
        return data

    def create(self, validated_data):
        """Create the thread and optionally send the first message."""
        request = self.context.get('request')
        org = validated_data['org']
        recipient = validated_data['recipient']

        # Get or create the direct thread
        thread, created = Thread.get_or_create_direct(
            org=org,
            user1=request.user,
            user2=recipient
        )

        # Send initial message if provided
        initial_message = validated_data.get('initial_message', '').strip()
        if initial_message:
            Message.send_user_message(
                thread=thread,
                sender=request.user,
                body=initial_message
            )

        return thread
