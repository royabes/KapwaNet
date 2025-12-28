# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
API views for Organization models.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Organization, OrgTheme, ThemePreset, TemplateLibrary, OrgPage, Membership, Invite
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
    MembershipSerializer,
    MembershipListSerializer,
    MyMembershipSerializer,
    UpdateMembershipSerializer,
    InviteSerializer,
    InviteListSerializer,
    CreateInviteSerializer,
    AcceptInviteSerializer,
    InviteInfoSerializer,
)
from .permissions import OrgMembershipPermission, OrgAdminPermission


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


class MembershipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for organization memberships.

    list: List members of an organization (requires membership)
    retrieve: Get a specific membership (requires membership)
    create: Add a new member (requires org_admin)
    update: Update membership role/status (requires org_admin)
    destroy: Remove a member (requires org_admin)
    my_memberships: Get current user's memberships across all orgs
    """

    queryset = Membership.objects.select_related('user', 'org')
    serializer_class = MembershipSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['my_memberships', 'leave']:
            # Anyone can access their own memberships or leave
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'retrieve']:
            permission_classes = [OrgMembershipPermission]
        else:
            permission_classes = [OrgAdminPermission]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == 'list':
            return MembershipListSerializer
        if self.action == 'my_memberships':
            return MyMembershipSerializer
        if self.action in ['update', 'partial_update']:
            return UpdateMembershipSerializer
        return MembershipSerializer

    def get_queryset(self):
        """
        Filter memberships by organization.
        """
        queryset = super().get_queryset()

        # Get org_id from query params
        org_id = self.request.query_params.get('org_id') or self.request.query_params.get('org')

        if org_id:
            queryset = queryset.filter(org_id=org_id)

        # Optional status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Optional role filter
        role_filter = self.request.query_params.get('role')
        if role_filter:
            queryset = queryset.filter(role=role_filter)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Add a new member to an organization.
        Only org_admins can add members.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify the current user is admin of this org
        org = serializer.validated_data.get('org')
        if not Membership.has_role(request.user, org, 'org_admin'):
            return Response(
                {'detail': 'You must be an organization admin to add members.'},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update a membership (role/status change).
        Only org_admins can update memberships.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Verify the current user is admin of this org
        if not Membership.has_role(request.user, instance.org, 'org_admin'):
            return Response(
                {'detail': 'You must be an organization admin to update memberships.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Don't allow admins to demote themselves
        if instance.user == request.user and request.data.get('role') != 'org_admin':
            return Response(
                {'detail': 'You cannot change your own admin role.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the instance
        serializer = UpdateMembershipSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        for field, value in serializer.validated_data.items():
            setattr(instance, field, value)
        instance.save()

        return Response(MembershipSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        """
        Remove a member from an organization.
        Only org_admins can remove members.
        """
        instance = self.get_object()

        # Verify the current user is admin of this org
        if not Membership.has_role(request.user, instance.org, 'org_admin'):
            return Response(
                {'detail': 'You must be an organization admin to remove members.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Don't allow admins to remove themselves
        if instance.user == request.user:
            return Response(
                {'detail': 'You cannot remove yourself from the organization.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='my-memberships')
    def my_memberships(self, request):
        """
        Get all organizations the current user is a member of.
        GET /api/memberships/my-memberships/
        """
        memberships = Membership.objects.filter(
            user=request.user
        ).select_related('org').order_by('-created_at')

        # Optional: filter to active only
        active_only = request.query_params.get('active', 'true').lower() == 'true'
        if active_only:
            memberships = memberships.filter(status='active')

        serializer = MyMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None):
        """
        Leave an organization (for the current user).
        POST /api/memberships/{id}/leave/
        """
        membership = self.get_object()

        # Must be the user's own membership
        if membership.user != request.user:
            return Response(
                {'detail': 'You can only leave organizations you are a member of.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Cannot leave if you're the only admin
        if membership.role == 'org_admin':
            admin_count = Membership.objects.filter(
                org=membership.org,
                role='org_admin',
                status='active'
            ).count()
            if admin_count <= 1:
                return Response(
                    {'detail': 'Cannot leave - you are the only admin. Assign another admin first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        membership.status = 'left'
        membership.save()

        return Response({'detail': 'You have left the organization.'}, status=status.HTTP_200_OK)


class InviteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for organization invites.

    list: List invites for an organization (admin only)
    retrieve: Get a specific invite (admin only)
    create: Create a new invite (admin only)
    destroy: Cancel an invite (admin only)
    info: Get public invite info by token (no auth)
    accept: Accept an invite (authenticated user)
    """

    queryset = Invite.objects.select_related('org', 'created_by', 'accepted_by')
    serializer_class = InviteSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'info':
            # Anyone can view invite info by token
            permission_classes = [permissions.AllowAny]
        elif self.action == 'accept':
            # Must be authenticated to accept
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Admin only for list, create, destroy
            permission_classes = [OrgAdminPermission]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """Use appropriate serializer based on action."""
        if self.action == 'list':
            return InviteListSerializer
        if self.action == 'create':
            return CreateInviteSerializer
        if self.action == 'accept':
            return AcceptInviteSerializer
        if self.action == 'info':
            return InviteInfoSerializer
        return InviteSerializer

    def get_queryset(self):
        """
        Filter invites by organization.
        """
        queryset = super().get_queryset()

        # Get org_id from query params
        org_id = self.request.query_params.get('org_id') or self.request.query_params.get('org')

        if org_id:
            queryset = queryset.filter(org_id=org_id)

        # Optional status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Create a new invite.
        Only org_admins can create invites.
        """
        serializer = CreateInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org = Organization.objects.get(id=serializer.validated_data['org_id'])

        # Verify the current user is admin of this org
        if not Membership.has_role(request.user, org, 'org_admin'):
            return Response(
                {'detail': 'You must be an organization admin to create invites.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create the invite
        invite = Invite.create_for_email(
            org=org,
            email=serializer.validated_data['email'],
            role=serializer.validated_data['role'],
            created_by=request.user,
            expires_in_days=serializer.validated_data.get('expires_in_days', 7),
        )

        # Return the full invite data
        response_serializer = InviteSerializer(invite)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """
        Cancel an invite.
        Only org_admins can cancel invites.
        """
        invite = self.get_object()

        # Verify the current user is admin of this org
        if not Membership.has_role(request.user, invite.org, 'org_admin'):
            return Response(
                {'detail': 'You must be an organization admin to cancel invites.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            invite.cancel()
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'detail': 'Invite cancelled.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='info/(?P<token>[^/.]+)')
    def info(self, request, token=None):
        """
        Get public invite info by token.
        GET /api/invites/info/{token}/

        This allows viewing the invite details before accepting.
        """
        try:
            invite = Invite.objects.select_related('org').get(token=token)
        except Invite.DoesNotExist:
            return Response(
                {'detail': 'Invalid invite token.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = InviteInfoSerializer(invite)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='accept')
    def accept(self, request):
        """
        Accept an invite and join the organization.
        POST /api/invites/accept/

        Body: {"token": "invite-token"}
        """
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        invite = Invite.objects.get(token=token)

        try:
            membership = invite.accept(request.user)
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return the membership
        return Response({
            'detail': f'You have joined {invite.org.name}!',
            'membership': MembershipSerializer(membership).data,
        }, status=status.HTTP_200_OK)
