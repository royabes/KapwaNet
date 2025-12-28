# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Views for messaging API.
"""

from rest_framework import viewsets, status, filters, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from organizations.models import Membership
from organizations.permissions import OrgMembershipPermission

from .models import Thread, Message
from .serializers import (
    ThreadSerializer,
    ThreadListSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    DirectThreadCreateSerializer,
)


class ThreadParticipantPermission(OrgMembershipPermission):
    """
    Permission class to verify user is a participant in a thread.
    """

    message = "You must be a participant in this thread."

    def has_object_permission(self, request, view, obj):
        """Check if the user is a participant in the thread."""
        # First check org membership
        if not super().has_object_permission(request, view, obj):
            return False

        # Then check thread participation
        return obj.is_participant(request.user)


class ThreadViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet for managing messaging threads.

    Endpoints:
        GET /api/threads/ - List threads for the current user
        GET /api/threads/{id}/ - Get a thread
        POST /api/threads/ - Create a direct message thread
        GET /api/threads/{id}/messages/ - Get messages in a thread
        POST /api/threads/{id}/messages/ - Send a message
        POST /api/threads/{id}/mark-read/ - Mark thread as read
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['last_message_at', 'created_at']
    ordering = ['-last_message_at']

    def get_queryset(self):
        """
        Get threads the current user participates in.
        """
        queryset = Thread.objects.filter(
            participants__user=self.request.user
        ).select_related('org').prefetch_related(
            'participants__user'
        ).distinct()

        # Filter by org if specified
        org_param = self.request.query_params.get('org')
        if org_param:
            try:
                from uuid import UUID
                UUID(org_param)
                queryset = queryset.filter(org_id=org_param)
            except (ValueError, AttributeError):
                queryset = queryset.filter(org__slug=org_param)

        # Filter by thread type
        thread_type = self.request.query_params.get('type')
        if thread_type:
            queryset = queryset.filter(thread_type=thread_type)

        # Filter by ref_id
        ref_id = self.request.query_params.get('ref_id')
        if ref_id:
            queryset = queryset.filter(ref_id=ref_id)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return ThreadListSerializer
        if self.action == 'create':
            return DirectThreadCreateSerializer
        return ThreadSerializer

    def get_permissions(self):
        """Get permissions for the action."""
        if self.action in ['retrieve', 'messages', 'mark_read']:
            return [ThreadParticipantPermission()]
        return super().get_permissions()

    def get_object(self):
        """Get the thread object."""
        thread = super().get_object()
        # Ensure user is participant (beyond the queryset filter)
        if not thread.is_participant(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a participant in this thread.")
        return thread

    def create(self, request, *args, **kwargs):
        """Create a direct message thread."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = serializer.save()
        return Response(
            ThreadSerializer(thread, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get', 'post'])
    def messages(self, request, pk=None):
        """
        Get messages in a thread (GET) or send a message (POST).

        GET supports pagination with limit and offset query params.
        POST expects a body field with the message content.
        """
        thread = self.get_object()

        if request.method == 'POST':
            # Send a message
            serializer = MessageCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            try:
                message = Message.send_user_message(
                    thread=thread,
                    sender=request.user,
                    body=serializer.validated_data['body']
                )
            except ValueError as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                MessageSerializer(message, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )

        # GET - List messages
        # Mark as read
        thread.mark_read(request.user)

        # Get messages
        messages = thread.messages.select_related('sender_user').order_by('created_at')

        # Filter out hidden messages (unless moderator)
        is_moderator = Membership.has_role(
            request.user, thread.org, ['org_admin', 'moderator']
        )
        if not is_moderator:
            messages = messages.filter(is_hidden=False)

        # Apply pagination
        limit = int(request.query_params.get('limit', 50))
        offset = int(request.query_params.get('offset', 0))
        total = messages.count()
        messages = messages[offset:offset + limit]

        serializer = MessageSerializer(
            messages,
            many=True,
            context={'request': request}
        )

        return Response({
            'results': serializer.data,
            'count': total,
            'limit': limit,
            'offset': offset,
        })

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark all messages in a thread as read."""
        thread = self.get_object()
        thread.mark_read(request.user)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['get'])
    def unread_counts(self, request):
        """
        Get unread message counts for all threads.
        """
        threads = self.get_queryset()
        counts = {}
        for thread in threads:
            unread = thread.get_unread_count(request.user)
            if unread > 0:
                counts[str(thread.id)] = unread

        total = sum(counts.values())
        return Response({
            'total': total,
            'by_thread': counts
        })


class MessageViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet for viewing messages.

    Messages are primarily accessed through the thread endpoint,
    but this provides a fallback for fetching individual messages.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        """
        Get messages in threads the user participates in.
        """
        return Message.objects.filter(
            thread__participants__user=self.request.user,
            is_hidden=False
        ).select_related('thread', 'sender_user')
