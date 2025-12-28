# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Views for item sharing API.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from organizations.models import Membership
from organizations.permissions import OrgMembershipPermission, IsOwnerOrModerator

from .models import ItemPost, ItemReservation
from .serializers import (
    ItemPostSerializer,
    ItemPostListSerializer,
    ItemReservationSerializer,
    ItemReservationListSerializer,
    ReserveItemSerializer,
)


class ItemPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing item posts.

    Provides CRUD operations and status management for item sharing posts.
    All queries are filtered by organization.

    Endpoints:
        GET /api/item-posts/ - List item posts
        POST /api/item-posts/ - Create an item post
        GET /api/item-posts/{id}/ - Get an item post
        PATCH /api/item-posts/{id}/ - Update an item post
        DELETE /api/item-posts/{id}/ - Delete an item post (admin/moderator only)
        POST /api/item-posts/{id}/cancel/ - Cancel an item post
        POST /api/item-posts/{id}/reopen/ - Reopen a cancelled post
        POST /api/item-posts/{id}/reserve/ - Reserve an item
        GET /api/item-posts/{id}/reservations/ - Get reservations for an item
        POST /api/item-posts/{id}/approve-reservation/ - Approve a reservation
        POST /api/item-posts/{id}/reject-reservation/ - Reject a reservation
        POST /api/item-posts/{id}/confirm-pickup/ - Confirm pickup
        GET /api/item-posts/categories/ - Get available categories
        GET /api/item-posts/my-posts/ - Get user's own posts
    """

    permission_classes = [OrgMembershipPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'expiry_date', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Get queryset filtered by organization.

        Supports filtering by:
        - org (required): Organization ID or slug
        - type: offer or request
        - category: Item category
        - status: Post status
        - created_by: User ID who created the post
        """
        queryset = ItemPost.objects.select_related('org', 'created_by')

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

        created_by_filter = self.request.query_params.get('created_by')
        if created_by_filter:
            queryset = queryset.filter(created_by_id=created_by_filter)

        # Filter for "my posts" shortcut
        if self.request.query_params.get('mine', '').lower() == 'true':
            queryset = queryset.filter(created_by=self.request.user)

        # Filter out expired food items by default (unless explicitly requested)
        show_expired = self.request.query_params.get('show_expired', '').lower() == 'true'
        if not show_expired:
            from django.db.models import Q
            from django.utils import timezone
            queryset = queryset.filter(
                Q(category__in=['clothing', 'household', 'baby_kids', 'electronics',
                               'furniture', 'hygiene', 'medical', 'other']) |
                Q(expiry_date__gte=timezone.now().date()) |
                Q(expiry_date__isnull=True)
            )

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == 'list':
            return ItemPostListSerializer
        return ItemPostSerializer

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
        Cancel an item post.

        Only the author, moderators, or admins can cancel a post.
        """
        item_post = self.get_object()

        # Check permission - author or moderator
        can_cancel = (
            item_post.created_by == request.user or
            Membership.has_role(request.user, item_post.org, ['org_admin', 'moderator'])
        )
        if not can_cancel:
            return Response(
                {'detail': 'You do not have permission to cancel this post.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transition is valid
        if not item_post.can_transition_to('cancelled'):
            return Response(
                {'detail': f"Cannot cancel a post with status '{item_post.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item_post.cancel()
        serializer = self.get_serializer(item_post)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """
        Reopen a cancelled item post.

        Only the author can reopen their post.
        """
        item_post = self.get_object()

        # Only author can reopen
        if item_post.created_by != request.user:
            return Response(
                {'detail': 'Only the author can reopen this post.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transition is valid
        if not item_post.can_transition_to('available'):
            return Response(
                {'detail': f"Cannot reopen a post with status '{item_post.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item_post.reopen()
        serializer = self.get_serializer(item_post)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """
        Get the list of available item categories.
        """
        categories = [
            {'value': value, 'label': label}
            for value, label in ItemPost.CATEGORY_CHOICES
        ]
        return Response(categories)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """
        Get item posts created by the current user.
        """
        queryset = self.get_queryset().filter(created_by=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # Reservation endpoints
    @action(detail=True, methods=['post'])
    def reserve(self, request, pk=None):
        """
        Reserve an item.

        Creates a pending reservation. Only members (not the owner) can reserve.
        The item must be available.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        item_post = self.get_object()

        serializer = ReserveItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reservation = ItemReservation.create_reservation(
                item_post=item_post,
                requester=request.user,
                message=serializer.validated_data.get('message', ''),
                quantity=serializer.validated_data.get('quantity', 1),
            )
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ItemReservationSerializer(reservation, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def reservations(self, request, pk=None):
        """
        Get all reservations for an item post.

        Only the post owner or moderators can view all reservations.
        """
        item_post = self.get_object()

        # Only owner or moderators can see all reservations
        can_view = (
            item_post.created_by == request.user or
            Membership.has_role(request.user, item_post.org, ['org_admin', 'moderator'])
        )
        if not can_view:
            return Response(
                {'detail': 'Only the item owner can view reservations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reservations = ItemReservation.objects.filter(item_post=item_post).select_related(
            'requester', 'item_post'
        )
        serializer = ItemReservationListSerializer(
            reservations, many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='approve-reservation')
    def approve_reservation(self, request, pk=None):
        """
        Approve a reservation.

        Only the item owner can approve. Creates a messaging thread.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        item_post = self.get_object()

        # Only owner can approve
        if item_post.created_by != request.user:
            return Response(
                {'detail': 'Only the item owner can approve reservations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reservation_id = request.data.get('reservation_id')
        if not reservation_id:
            return Response(
                {'detail': 'reservation_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reservation = ItemReservation.objects.get(
                id=reservation_id,
                item_post=item_post
            )
        except ItemReservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            reservation.approve()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ItemReservationSerializer(reservation, context={'request': request}).data
        )

    @action(detail=True, methods=['post'], url_path='reject-reservation')
    def reject_reservation(self, request, pk=None):
        """
        Reject a reservation.

        Only the item owner can reject.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        item_post = self.get_object()

        # Only owner can reject
        if item_post.created_by != request.user:
            return Response(
                {'detail': 'Only the item owner can reject reservations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        reservation_id = request.data.get('reservation_id')
        if not reservation_id:
            return Response(
                {'detail': 'reservation_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reservation = ItemReservation.objects.get(
                id=reservation_id,
                item_post=item_post
            )
        except ItemReservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            reservation.reject()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ItemReservationSerializer(reservation, context={'request': request}).data
        )

    @action(detail=True, methods=['post'], url_path='confirm-pickup')
    def confirm_pickup(self, request, pk=None):
        """
        Confirm pickup for an approved reservation.

        Both the owner and requester can confirm pickup.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        item_post = self.get_object()

        reservation_id = request.data.get('reservation_id')
        if not reservation_id:
            # If no reservation_id, get the approved reservation
            try:
                reservation = ItemReservation.objects.get(
                    item_post=item_post,
                    status='approved'
                )
            except ItemReservation.DoesNotExist:
                return Response(
                    {'detail': 'No approved reservation found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            try:
                reservation = ItemReservation.objects.get(
                    id=reservation_id,
                    item_post=item_post
                )
            except ItemReservation.DoesNotExist:
                return Response(
                    {'detail': 'Reservation not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Both parties can confirm
        can_confirm = (
            reservation.requester == request.user or
            reservation.owner == request.user
        )
        if not can_confirm:
            return Response(
                {'detail': 'Only the requester or item owner can confirm pickup.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            reservation.complete()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ItemReservationSerializer(reservation, context={'request': request}).data
        )


class ItemReservationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing item reservations.

    Provides read-only access to reservations and actions for managing them.

    Endpoints:
        GET /api/item-reservations/ - List user's reservations
        GET /api/item-reservations/{id}/ - Get a specific reservation
        POST /api/item-reservations/{id}/cancel/ - Cancel a reservation
    """

    permission_classes = [OrgMembershipPermission]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Get reservations where user is requester or item owner.
        """
        from django.db.models import Q

        queryset = ItemReservation.objects.select_related(
            'org', 'item_post', 'requester', 'item_post__created_by'
        )

        # Filter to reservations where user is involved
        queryset = queryset.filter(
            Q(requester=self.request.user) |
            Q(item_post__created_by=self.request.user)
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

        # Filter by role (as requester or as owner)
        role_filter = self.request.query_params.get('role')
        if role_filter == 'requester':
            queryset = queryset.filter(requester=self.request.user)
        elif role_filter == 'owner':
            queryset = queryset.filter(item_post__created_by=self.request.user)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return ItemReservationListSerializer
        return ItemReservationSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a reservation.

        Only the requester can cancel their reservation.
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        reservation = self.get_object()

        # Only requester can cancel
        if reservation.requester != request.user:
            return Response(
                {'detail': 'Only the requester can cancel this reservation.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            reservation.cancel()
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ItemReservationSerializer(reservation, context={'request': request}).data
        )
