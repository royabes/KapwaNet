# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
API views for Organization models.
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Organization
from .serializers import OrganizationSerializer, OrganizationListSerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization CRUD operations.

    list: List all active organizations
    retrieve: Get a single organization by ID or slug
    create: Create a new organization (admin only)
    update: Update an organization (admin only)
    destroy: Delete an organization (admin only)
    """

    queryset = Organization.objects.filter(is_active=True)
    serializer_class = OrganizationSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        """
        Allow read access to all, but require admin for write operations.
        """
        if self.action in ['list', 'retrieve', 'by_slug']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return OrganizationListSerializer
        return OrganizationSerializer

    def get_object(self):
        """
        Allow lookup by either UUID or slug.
        """
        lookup_value = self.kwargs.get(self.lookup_field)

        # Try to interpret as UUID first
        try:
            import uuid
            uuid.UUID(str(lookup_value))
            return super().get_object()
        except ValueError:
            # Not a valid UUID, try slug lookup
            queryset = self.filter_queryset(self.get_queryset())
            obj = queryset.filter(slug=lookup_value).first()
            if obj is None:
                from rest_framework.exceptions import NotFound
                raise NotFound(f"Organization with slug '{lookup_value}' not found.")
            self.check_object_permissions(self.request, obj)
            return obj

    @action(detail=False, methods=['get'], url_path='by-slug/(?P<slug>[^/.]+)')
    def by_slug(self, request, slug=None):
        """
        Retrieve an organization by its slug.
        GET /api/organizations/by-slug/{slug}/
        """
        try:
            org = Organization.objects.get(slug=slug, is_active=True)
        except Organization.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound(f"Organization with slug '{slug}' not found.")

        serializer = self.get_serializer(org)
        return Response(serializer.data)
