# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Views for help posts API.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from organizations.models import Membership
from organizations.permissions import OrgMembershipPermission, IsOwnerOrModerator

from .models import HelpPost
from .serializers import (
    HelpPostSerializer,
    HelpPostListSerializer,
    HelpPostStatusUpdateSerializer,
)


class HelpPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing help posts.

    Provides CRUD operations and status management for help posts.
    All queries are filtered by organization.

    Endpoints:
        GET /api/help-posts/ - List help posts
        POST /api/help-posts/ - Create a help post
        GET /api/help-posts/{id}/ - Get a help post
        PATCH /api/help-posts/{id}/ - Update a help post
        DELETE /api/help-posts/{id}/ - Delete a help post (admin/moderator only)
        POST /api/help-posts/{id}/cancel/ - Cancel a help post
        POST /api/help-posts/{id}/reopen/ - Reopen a cancelled/matched post
    """

    permission_classes = [OrgMembershipPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'urgency', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Get queryset filtered by organization.

        Supports filtering by:
        - org (required): Organization ID or slug
        - type: request or offer
        - category: Help category
        - status: Post status
        - urgency: Urgency level
        - created_by: User ID who created the post
        """
        queryset = HelpPost.objects.select_related('org', 'created_by')

        # Get org filter from query params
        org_param = self.request.query_params.get('org')
        if org_param:
            # Try to match by ID first, then by slug
            try:
                from uuid import UUID
                UUID(org_param)
                queryset = queryset.filter(org_id=org_param)
            except (ValueError, AttributeError):
                queryset = queryset.filter(org__slug=org_param)
        else:
            # If no org specified, filter by user's memberships
            user_orgs = Membership.objects.filter(
                user=self.request.user,
                status='active'
            ).values_list('org_id', flat=True)
            queryset = queryset.filter(org_id__in=user_orgs)

        # Additional filters
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)

        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category=category_filter)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        urgency_filter = self.request.query_params.get('urgency')
        if urgency_filter:
            queryset = queryset.filter(urgency=urgency_filter)

        created_by_filter = self.request.query_params.get('created_by')
        if created_by_filter:
            queryset = queryset.filter(created_by_id=created_by_filter)

        # Filter for "my posts" shortcut
        if self.request.query_params.get('mine', '').lower() == 'true':
            queryset = queryset.filter(created_by=self.request.user)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'list':
            return HelpPostListSerializer
        return HelpPostSerializer

    def get_permissions(self):
        """Return permissions based on action."""
        if self.action in ['destroy']:
            # Only moderators and admins can delete
            return [IsOwnerOrModerator()]
        if self.action in ['update', 'partial_update']:
            # Author or moderators can update
            return [IsOwnerOrModerator()]
        return super().get_permissions()

    def perform_destroy(self, instance):
        """
        Soft delete by setting status to cancelled instead of hard delete.
        """
        instance.status = 'cancelled'
        instance.save()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a help post.

        Only the author, moderators, or admins can cancel a post.
        """
        help_post = self.get_object()

        # Check permission - author or moderator
        can_cancel = (
            help_post.created_by == request.user or
            Membership.has_role(request.user, help_post.org, ['org_admin', 'moderator'])
        )
        if not can_cancel:
            return Response(
                {'detail': 'You do not have permission to cancel this post.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transition is valid
        if not help_post.can_transition_to('cancelled'):
            return Response(
                {'detail': f"Cannot cancel a post with status '{help_post.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        help_post.cancel()
        serializer = self.get_serializer(help_post)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """
        Reopen a cancelled or matched help post.

        Only the author can reopen their post.
        """
        help_post = self.get_object()

        # Only author can reopen
        if help_post.created_by != request.user:
            return Response(
                {'detail': 'Only the author can reopen this post.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transition is valid
        if not help_post.can_transition_to('open'):
            return Response(
                {'detail': f"Cannot reopen a post with status '{help_post.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        help_post.reopen()
        serializer = self.get_serializer(help_post)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a help post as completed.

        Only the author can mark their post as completed.
        Post must be in 'matched' status.
        """
        help_post = self.get_object()

        # Only author can complete
        if help_post.created_by != request.user:
            return Response(
                {'detail': 'Only the author can mark this post as completed.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transition is valid
        if not help_post.can_transition_to('completed'):
            return Response(
                {'detail': f"Cannot complete a post with status '{help_post.status}'. "
                          f"Post must be 'matched' first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        help_post.mark_completed()
        serializer = self.get_serializer(help_post)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get the list of available help categories.
        """
        categories = [
            {'value': value, 'label': label}
            for value, label in HelpPost.CATEGORY_CHOICES
        ]
        return Response(categories)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """
        Get help posts created by the current user.
        """
        queryset = self.get_queryset().filter(created_by=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
