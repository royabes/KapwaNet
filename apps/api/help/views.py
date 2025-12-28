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

from .models import HelpPost, HelpMatch
from .serializers import (
    HelpPostSerializer,
    HelpPostListSerializer,
    HelpPostStatusUpdateSerializer,
    HelpMatchSerializer,
    HelpMatchListSerializer,
    ExpressInterestSerializer,
    AcceptMatchSerializer,
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

    # Matching endpoints
    @action(detail=True, methods=['post'], url_path='express-interest')
    def express_interest(self, request, pk=None):
        """
        Express interest in a help post.

        Creates a pending match. Only members (not the post author) can express interest.
        The post must be in 'open' status.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        help_post = self.get_object()

        serializer = ExpressInterestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            match = HelpMatch.express_interest(
                help_post=help_post,
                helper_user=request.user,
                message=serializer.validated_data.get('message', '')
            )
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            HelpMatchSerializer(match, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def matches(self, request, pk=None):
        """
        Get all matches for a help post.

        Only the post author can view all matches.
        """
        help_post = self.get_object()

        # Only author or moderators can see all matches
        can_view = (
            help_post.created_by == request.user or
            Membership.has_role(request.user, help_post.org, ['org_admin', 'moderator'])
        )
        if not can_view:
            return Response(
                {'detail': 'Only the post author can view matches.'},
                status=status.HTTP_403_FORBIDDEN
            )

        matches = HelpMatch.objects.filter(help_post=help_post).select_related(
            'helper_user', 'help_post'
        )
        serializer = HelpMatchListSerializer(matches, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='accept-match')
    def accept_match(self, request, pk=None):
        """
        Accept a match for a help post.

        Only the post author can accept matches.
        Accepting a match declines all other pending matches.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        help_post = self.get_object()

        # Only author can accept matches
        if help_post.created_by != request.user:
            return Response(
                {'detail': 'Only the post author can accept matches.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AcceptMatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the match
        try:
            match = HelpMatch.objects.get(
                id=serializer.validated_data['match_id'],
                help_post=help_post
            )
        except HelpMatch.DoesNotExist:
            return Response(
                {'detail': 'Match not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            thread = match.accept()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            HelpMatchSerializer(match, context={'request': request}).data
        )


class HelpMatchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing help matches.

    Provides read-only access to matches and actions for helper to manage their matches.

    Endpoints:
        GET /api/help-matches/ - List user's matches (as helper or post creator)
        GET /api/help-matches/{id}/ - Get a specific match
        POST /api/help-matches/{id}/withdraw/ - Withdraw interest (helper only)
        POST /api/help-matches/{id}/decline/ - Decline a match (post author only)
        POST /api/help-matches/{id}/close/ - Close/complete a match
    """

    permission_classes = [OrgMembershipPermission]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Get matches where user is helper or post author.
        """
        from django.db.models import Q

        queryset = HelpMatch.objects.select_related(
            'org', 'help_post', 'helper_user', 'help_post__created_by'
        )

        # Filter to matches where user is involved
        queryset = queryset.filter(
            Q(helper_user=self.request.user) |
            Q(help_post__created_by=self.request.user)
        )

        # Filter by org if specified
        org_param = self.request.query_params.get('org')
        if org_param:
            try:
                from uuid import UUID
                UUID(org_param)
                queryset = queryset.filter(org_id=org_param)
            except (ValueError, AttributeError):
                queryset = queryset.filter(org__slug=org_param)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by role (as helper or as requester)
        role_filter = self.request.query_params.get('role')
        if role_filter == 'helper':
            queryset = queryset.filter(helper_user=self.request.user)
        elif role_filter == 'requester':
            queryset = queryset.filter(help_post__created_by=self.request.user)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return HelpMatchListSerializer
        return HelpMatchSerializer

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        """
        Withdraw interest from a match.

        Only the helper can withdraw. If the match was accepted,
        this reopens the help post.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        match = self.get_object()

        # Only helper can withdraw
        if match.helper_user != request.user:
            return Response(
                {'detail': 'Only the helper can withdraw from this match.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            match.withdraw()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(HelpMatchSerializer(match, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """
        Decline a pending match.

        Only the post author can decline matches.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        match = self.get_object()

        # Only post author can decline
        if match.requester_user != request.user:
            return Response(
                {'detail': 'Only the post author can decline this match.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            match.decline()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(HelpMatchSerializer(match, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """
        Close/complete an accepted match.

        Both the helper and post author can close a match.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        match = self.get_object()

        # Both parties can close
        can_close = (
            match.helper_user == request.user or
            match.requester_user == request.user
        )
        if not can_close:
            return Response(
                {'detail': 'Only participants can close this match.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get completion status from request
        completed = request.data.get('completed', True)

        try:
            match.close(completed=completed)
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(HelpMatchSerializer(match, context={'request': request}).data)
