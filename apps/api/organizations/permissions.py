# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Permission classes for organization-scoped access control.

These permissions ensure that users can only access resources
within organizations they are members of.
"""

from rest_framework import permissions

from .models import Membership, Organization


class IsAuthenticated(permissions.BasePermission):
    """Simple authenticated check."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class OrgMembershipPermission(permissions.BasePermission):
    """
    Permission class to verify user membership in an organization.

    This permission checks that:
    1. The user is authenticated
    2. The user is an active member of the organization

    The organization is determined from:
    - request.data.get('org_id') or request.data.get('org')
    - request.query_params.get('org_id') or request.query_params.get('org')
    - view.kwargs.get('org_id') or view.kwargs.get('org_pk')

    Usage:
        class MyViewSet(viewsets.ModelViewSet):
            permission_classes = [OrgMembershipPermission]
    """

    message = "You must be an active member of this organization to perform this action."

    def get_org_id(self, request, view):
        """Extract organization ID from request or view kwargs."""
        # Check request data (POST/PUT/PATCH)
        org_id = request.data.get('org_id') or request.data.get('org')

        # Check query params (GET)
        if not org_id:
            org_id = request.query_params.get('org_id') or request.query_params.get('org')

        # Check URL kwargs
        if not org_id:
            org_id = view.kwargs.get('org_id') or view.kwargs.get('org_pk')

        return org_id

    def has_permission(self, request, view):
        """Check if the user has permission to access the view."""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Get the organization ID
        org_id = self.get_org_id(request, view)

        # If no org_id specified, permission check will happen at object level
        if not org_id:
            return True

        # Check membership
        try:
            org = Organization.objects.get(id=org_id, is_active=True)
        except (Organization.DoesNotExist, ValueError):
            # Try by slug
            try:
                org = Organization.objects.get(slug=org_id, is_active=True)
            except Organization.DoesNotExist:
                return False

        return Membership.is_user_member(request.user, org)

    def has_object_permission(self, request, view, obj):
        """Check if the user has permission to access a specific object."""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Get the organization from the object
        org = getattr(obj, 'org', None)
        if not org:
            # For Organization objects themselves
            if isinstance(obj, Organization):
                org = obj
            else:
                return False

        return Membership.is_user_member(request.user, org)


class OrgAdminPermission(OrgMembershipPermission):
    """
    Permission class requiring organization admin role.

    Inherits from OrgMembershipPermission and adds role check.
    """

    message = "You must be an organization admin to perform this action."

    def _check_admin(self, user, org):
        """Check if the user is an admin of the organization."""
        return Membership.has_role(user, org, 'org_admin')

    def has_permission(self, request, view):
        """Check if the user has admin permission."""
        # First check basic membership
        if not super().has_permission(request, view):
            return False

        # Get the organization ID
        org_id = self.get_org_id(request, view)

        if not org_id:
            return True  # Object-level check

        # Check admin role
        try:
            org = Organization.objects.get(id=org_id, is_active=True)
        except (Organization.DoesNotExist, ValueError):
            try:
                org = Organization.objects.get(slug=org_id, is_active=True)
            except Organization.DoesNotExist:
                return False

        return self._check_admin(request.user, org)

    def has_object_permission(self, request, view, obj):
        """Check if the user has admin permission for a specific object."""
        # First check basic membership
        if not super().has_object_permission(request, view, obj):
            return False

        # Get the organization from the object
        org = getattr(obj, 'org', None)
        if not org:
            if isinstance(obj, Organization):
                org = obj
            else:
                return False

        return self._check_admin(request.user, org)


class OrgModeratorPermission(OrgMembershipPermission):
    """
    Permission class requiring moderator or admin role.

    Moderators and admins can both moderate content.
    """

    message = "You must be a moderator or admin to perform this action."

    def _check_moderator(self, user, org):
        """Check if the user is a moderator or admin of the organization."""
        return Membership.has_role(user, org, ['org_admin', 'moderator'])

    def has_permission(self, request, view):
        """Check if the user has moderator permission."""
        # First check basic membership
        if not super().has_permission(request, view):
            return False

        # Get the organization ID
        org_id = self.get_org_id(request, view)

        if not org_id:
            return True  # Object-level check

        # Check moderator role
        try:
            org = Organization.objects.get(id=org_id, is_active=True)
        except (Organization.DoesNotExist, ValueError):
            try:
                org = Organization.objects.get(slug=org_id, is_active=True)
            except Organization.DoesNotExist:
                return False

        return self._check_moderator(request.user, org)

    def has_object_permission(self, request, view, obj):
        """Check if the user has moderator permission for a specific object."""
        # First check basic membership
        if not super().has_object_permission(request, view, obj):
            return False

        # Get the organization from the object
        org = getattr(obj, 'org', None)
        if not org:
            if isinstance(obj, Organization):
                org = obj
            else:
                return False

        return self._check_moderator(request.user, org)


class IsOwnerOrModerator(OrgMembershipPermission):
    """
    Permission that allows access if user is the owner of the object
    or a moderator/admin of the organization.

    Useful for actions like editing or deleting own content.
    """

    message = "You must be the owner or a moderator to perform this action."

    def has_object_permission(self, request, view, obj):
        """Check if the user is the owner or a moderator."""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Check if user is the owner
        owner = getattr(obj, 'created_by', None) or getattr(obj, 'user', None)
        if owner and owner == request.user:
            return True

        # Check if user is a moderator
        org = getattr(obj, 'org', None)
        if org:
            return Membership.has_role(request.user, org, ['org_admin', 'moderator'])

        return False


class AllowAnyRead(permissions.BasePermission):
    """
    Permission class that allows read access to anyone but requires
    membership for write operations.
    """

    def has_permission(self, request, view):
        """Allow read access to anyone."""
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write operations, require authentication
        return request.user and request.user.is_authenticated
