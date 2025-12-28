# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Views for moderation API.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from organizations.models import Membership, Organization
from organizations.permissions import OrgMembershipPermission, OrgModeratorPermission
from users.models import User

from .models import Report, ModerationAction
from .serializers import (
    ReportSerializer,
    ReportListSerializer,
    CreateReportSerializer,
    ResolveReportSerializer,
    ModerationActionSerializer,
    ModerationActionListSerializer,
    TakeActionSerializer,
)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reports.

    Any member can submit a report.
    Only moderators can list/update/resolve reports.

    Endpoints:
        GET /api/reports/ - List reports (moderators only)
        POST /api/reports/ - Submit a report (any member)
        GET /api/reports/{id}/ - Get a report (moderators only)
        POST /api/reports/{id}/start-review/ - Start reviewing (moderators)
        POST /api/reports/{id}/resolve/ - Resolve a report (moderators)
        POST /api/reports/{id}/dismiss/ - Dismiss a report (moderators)
        GET /api/reports/reasons/ - Get available report reasons
    """

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get reports filtered by organization."""
        queryset = Report.objects.select_related('org', 'reporter', 'resolved_by')

        # Filter by org
        org_param = self.request.query_params.get('org')
        if org_param:
            try:
                from uuid import UUID
                UUID(org_param)
                queryset = queryset.filter(org_id=org_param)
            except (ValueError, AttributeError):
                queryset = queryset.filter(org__slug=org_param)
        else:
            # Filter by user's moderator memberships
            mod_orgs = Membership.objects.filter(
                user=self.request.user,
                role__in=['org_admin', 'moderator'],
                status='active'
            ).values_list('org_id', flat=True)
            queryset = queryset.filter(org_id__in=mod_orgs)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by target type
        target_type = self.request.query_params.get('target_type')
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'list':
            return ReportListSerializer
        if self.action == 'create':
            return CreateReportSerializer
        return ReportSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            # Any member can submit a report
            return [OrgMembershipPermission()]
        # All other actions require moderator
        return [OrgModeratorPermission()]

    def create(self, request, *args, **kwargs):
        """Submit a new report."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify org membership
        org_id = serializer.validated_data['org']
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response(
                {'detail': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not Membership.objects.filter(
            org=org, user=request.user, status='active'
        ).exists():
            return Response(
                {'detail': 'You are not a member of this organization.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create the report
        report = Report.objects.create(
            org=org,
            target_type=serializer.validated_data['target_type'],
            target_id=serializer.validated_data['target_id'],
            reporter=request.user,
            reason=serializer.validated_data['reason'],
            details=serializer.validated_data.get('details', ''),
        )

        return Response(
            ReportSerializer(report, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='start-review')
    def start_review(self, request, pk=None):
        """Start reviewing a report."""
        from django.core.exceptions import ValidationError as DjangoValidationError

        report = self.get_object()

        try:
            report.start_review(request.user)
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(ReportSerializer(report, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a report."""
        from django.core.exceptions import ValidationError as DjangoValidationError

        report = self.get_object()
        serializer = ResolveReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            report.resolve(
                moderator=request.user,
                notes=serializer.validated_data.get('resolution_notes', '')
            )
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(ReportSerializer(report, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a report."""
        from django.core.exceptions import ValidationError as DjangoValidationError

        report = self.get_object()
        serializer = ResolveReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            report.dismiss(
                moderator=request.user,
                notes=serializer.validated_data.get('resolution_notes', '')
            )
        except DjangoValidationError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(ReportSerializer(report, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def reasons(self, request):
        """Get the list of available report reasons."""
        reasons = [
            {'value': value, 'label': label}
            for value, label in Report.REASON_CHOICES
        ]
        return Response(reasons)


class ModerationActionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and creating moderation actions.

    Only moderators can access this endpoint.

    Endpoints:
        GET /api/moderation-actions/ - List actions (moderators only)
        GET /api/moderation-actions/{id}/ - Get an action (moderators only)
        POST /api/moderation-actions/take-action/ - Take a moderation action
        GET /api/moderation-actions/action-types/ - Get available action types
    """

    permission_classes = [OrgModeratorPermission]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Get moderation actions filtered by organization."""
        queryset = ModerationAction.objects.select_related('org', 'moderator', 'report')

        # Filter by org
        org_param = self.request.query_params.get('org')
        if org_param:
            try:
                from uuid import UUID
                UUID(org_param)
                queryset = queryset.filter(org_id=org_param)
            except (ValueError, AttributeError):
                queryset = queryset.filter(org__slug=org_param)
        else:
            # Filter by user's moderator memberships
            mod_orgs = Membership.objects.filter(
                user=self.request.user,
                role__in=['org_admin', 'moderator'],
                status='active'
            ).values_list('org_id', flat=True)
            queryset = queryset.filter(org_id__in=mod_orgs)

        # Filter by action type
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        # Filter by target type
        target_type = self.request.query_params.get('target_type')
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        # Filter by moderator
        moderator = self.request.query_params.get('moderator')
        if moderator:
            queryset = queryset.filter(moderator_id=moderator)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'list':
            return ModerationActionListSerializer
        return ModerationActionSerializer

    @action(detail=False, methods=['post'], url_path='take-action')
    def take_action(self, request):
        """Take a moderation action."""
        from django.core.exceptions import ValidationError as DjangoValidationError

        serializer = TakeActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Get org from query param or request data
        org_id = request.query_params.get('org') or request.data.get('org')
        if not org_id:
            return Response(
                {'detail': 'org is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response(
                {'detail': 'Organization not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify moderator permission
        if not Membership.has_role(request.user, org, ['org_admin', 'moderator']):
            return Response(
                {'detail': 'You do not have moderator permissions.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get related report if provided
        report = None
        if data.get('report_id'):
            try:
                report = Report.objects.get(id=data['report_id'])
            except Report.DoesNotExist:
                pass

        try:
            action_type = data['action_type']

            if action_type == 'warn':
                # Get target user
                try:
                    user = User.objects.get(id=data['target_id'])
                except User.DoesNotExist:
                    return Response(
                        {'detail': 'User not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                action = ModerationAction.warn_user(
                    org=org,
                    moderator=request.user,
                    user=user,
                    reason=data['reason'],
                    report=report,
                    user_message=data.get('user_message', ''),
                )

            elif action_type == 'suspend':
                try:
                    user = User.objects.get(id=data['target_id'])
                except User.DoesNotExist:
                    return Response(
                        {'detail': 'User not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                action = ModerationAction.suspend_user(
                    org=org,
                    moderator=request.user,
                    user=user,
                    reason=data['reason'],
                    duration_days=data.get('duration_days'),
                    report=report,
                    user_message=data.get('user_message', ''),
                )

            elif action_type == 'unsuspend':
                try:
                    user = User.objects.get(id=data['target_id'])
                except User.DoesNotExist:
                    return Response(
                        {'detail': 'User not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                action = ModerationAction.unsuspend_user(
                    org=org,
                    moderator=request.user,
                    user=user,
                    reason=data['reason'],
                )

            elif action_type == 'ban':
                try:
                    user = User.objects.get(id=data['target_id'])
                except User.DoesNotExist:
                    return Response(
                        {'detail': 'User not found.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                action = ModerationAction.ban_user(
                    org=org,
                    moderator=request.user,
                    user=user,
                    reason=data['reason'],
                    report=report,
                    user_message=data.get('user_message', ''),
                )

            elif action_type in ['hide_content', 'remove_content']:
                action = ModerationAction.hide_content(
                    org=org,
                    moderator=request.user,
                    content_type=data['target_type'],
                    content_id=data['target_id'],
                    reason=data['reason'],
                    report=report,
                )

            else:
                return Response(
                    {'detail': f"Action type '{action_type}' not supported."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # If there was a related report, resolve it
            if report and report.status in ['open', 'reviewing']:
                report.resolve(
                    moderator=request.user,
                    notes=f"Action taken: {action_type}"
                )

        except DjangoValidationError as e:
            return Response(
                {'detail': str(e.message if hasattr(e, 'message') else e.messages[0])},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            ModerationActionSerializer(action, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='action-types')
    def action_types(self, request):
        """Get the list of available action types."""
        types = [
            {'value': value, 'label': label}
            for value, label in ModerationAction.ACTION_TYPE_CHOICES
        ]
        return Response(types)
