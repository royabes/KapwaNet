# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
API views for Organization models.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Organization, OrgTheme, ThemePreset, TemplateLibrary, OrgPage
from .serializers import (
    OrganizationSerializer,
    OrganizationListSerializer,
    OrgThemeSerializer,
    OrgThemeUpdateSerializer,
    ThemePresetSerializer,
    ThemePresetListSerializer,
    TemplateLibrarySerializer,
    TemplateLibraryListSerializer,
    OrgPageSerializer,
    OrgPageListSerializer,
    CreatePageFromTemplateSerializer,
)


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
        if self.action in ['list', 'retrieve', 'by_slug', 'theme']:
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

    @action(detail=True, methods=['get', 'put', 'patch'], url_path='theme')
    def theme(self, request, pk=None):
        """
        Get or update the theme for an organization.
        GET /api/organizations/{pk}/theme/ - Get current theme
        PUT/PATCH /api/organizations/{pk}/theme/ - Update theme
        """
        org = self.get_object()

        # Get or create the OrgTheme for this organization
        theme, created = OrgTheme.objects.get_or_create(org=org)

        if request.method == 'GET':
            serializer = OrgThemeSerializer(theme)
            return Response(serializer.data)

        # For PUT/PATCH, require admin permissions
        if not request.user.is_staff:
            return Response(
                {'detail': 'Admin permissions required to update theme.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate input
        update_serializer = OrgThemeUpdateSerializer(data=request.data)
        update_serializer.is_valid(raise_exception=True)

        # Apply preset if provided
        preset_id = update_serializer.validated_data.get('preset_id')
        if preset_id:
            try:
                preset = ThemePreset.objects.get(id=preset_id)
                theme.apply_preset(preset)
            except ThemePreset.DoesNotExist:
                return Response(
                    {'detail': f"Preset '{preset_id}' not found."},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif 'theme_json' in update_serializer.validated_data:
            theme.theme_json = update_serializer.validated_data['theme_json']
            theme.preset = None
            theme.save()

        serializer = OrgThemeSerializer(theme)
        return Response(serializer.data)


class ThemePresetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for theme presets.

    list: List all available theme presets
    retrieve: Get a single theme preset by ID
    """

    queryset = ThemePreset.objects.all()
    serializer_class = ThemePresetSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return ThemePresetListSerializer
        return ThemePresetSerializer


class TemplateLibraryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for page templates.

    list: List all active templates (can filter by page_type or category)
    retrieve: Get a single template by ID with full block data
    """

    queryset = TemplateLibrary.objects.filter(is_active=True)
    serializer_class = TemplateLibrarySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return TemplateLibraryListSerializer
        return TemplateLibrarySerializer

    def get_queryset(self):
        """
        Allow filtering by page_type or category.
        """
        queryset = super().get_queryset()

        page_type = self.request.query_params.get('page_type')
        if page_type:
            queryset = queryset.filter(page_type=page_type)

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        return queryset


class OrgPageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for organization pages.

    list: List pages for an organization
    retrieve: Get a single page by ID
    create: Create a new page
    update: Update a page
    destroy: Delete a page
    from_template: Create a page from a template
    """

    queryset = OrgPage.objects.all()
    serializer_class = OrgPageSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        """
        Filter pages by organization.
        For now, only show pages for the organization specified in query params.
        """
        queryset = super().get_queryset()

        org_id = self.request.query_params.get('org_id')
        if org_id:
            queryset = queryset.filter(org_id=org_id)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return OrgPageListSerializer
        if self.action == 'from_template':
            return CreatePageFromTemplateSerializer
        return OrgPageSerializer

    @action(detail=False, methods=['post'], url_path='from-template')
    def from_template(self, request):
        """
        Create a new page from a template.
        POST /api/pages/from-template/

        Body:
        {
            "template_id": "home-starter",
            "org_id": "uuid-of-organization",
            "title": "Optional custom title",
            "slug": "optional-custom-slug"
        }
        """
        serializer = CreatePageFromTemplateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        page = serializer.save()

        # Return the full page data
        response_serializer = OrgPageSerializer(page)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
