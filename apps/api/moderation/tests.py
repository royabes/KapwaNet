# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for moderation functionality.
"""

from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status as http_status

from organizations.models import Organization, Membership
from users.models import User
from help.models import HelpPost
from .models import Report, ModerationAction


class ReportModelTests(TestCase):
    """Tests for the Report model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            password='testpass123',
            display_name='Reporter User',
        )
        self.target_user = User.objects.create_user(
            email='target@example.com',
            password='testpass123',
            display_name='Target User',
        )
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123',
            display_name='Mod User',
        )
        Membership.objects.create(
            org=self.org, user=self.reporter, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.target_user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.moderator, role='moderator', status='active'
        )

    def test_create_report(self):
        """Test creating a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='harassment',
            details='This user was harassing me.',
        )
        self.assertEqual(report.status, 'open')
        self.assertIsNotNone(report.get_target_object())

    def test_start_review(self):
        """Test starting review on a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )
        report.start_review(self.moderator)
        self.assertEqual(report.status, 'reviewing')

    def test_resolve_report(self):
        """Test resolving a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )
        report.resolve(self.moderator, notes='Warned the user.')
        self.assertEqual(report.status, 'resolved')
        self.assertEqual(report.resolved_by, self.moderator)
        self.assertIsNotNone(report.resolved_at)

    def test_dismiss_report(self):
        """Test dismissing a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )
        report.dismiss(self.moderator, notes='No evidence of spam.')
        self.assertEqual(report.status, 'dismissed')

    def test_cannot_resolve_already_resolved(self):
        """Test that already resolved reports cannot be resolved again."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
            status='resolved',
        )
        with self.assertRaises(ValidationError):
            report.resolve(self.moderator)


class ModerationActionModelTests(TestCase):
    """Tests for the ModerationAction model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.target_user = User.objects.create_user(
            email='target@example.com',
            password='testpass123',
            display_name='Target User',
        )
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123',
            display_name='Mod User',
        )
        Membership.objects.create(
            org=self.org, user=self.target_user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.moderator, role='moderator', status='active'
        )

    def test_warn_user(self):
        """Test issuing a warning."""
        action = ModerationAction.warn_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Inappropriate language',
            user_message='Please be respectful.',
        )
        self.assertEqual(action.action_type, 'warn')
        self.assertEqual(action.target_type, 'user')

    def test_suspend_user(self):
        """Test suspending a user."""
        action = ModerationAction.suspend_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Repeated violations',
            duration_days=7,
        )
        self.assertEqual(action.action_type, 'suspend')

        # Check membership is suspended
        membership = Membership.objects.get(org=self.org, user=self.target_user)
        self.assertEqual(membership.status, 'suspended')

    def test_unsuspend_user(self):
        """Test unsuspending a user."""
        # First suspend
        ModerationAction.suspend_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Violations',
        )

        # Then unsuspend
        action = ModerationAction.unsuspend_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Served suspension',
        )
        self.assertEqual(action.action_type, 'unsuspend')

        # Check membership is active
        membership = Membership.objects.get(org=self.org, user=self.target_user)
        self.assertEqual(membership.status, 'active')

    def test_ban_user(self):
        """Test banning a user."""
        action = ModerationAction.ban_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Severe violation',
        )
        self.assertEqual(action.action_type, 'ban')

        # Check membership is banned
        membership = Membership.objects.get(org=self.org, user=self.target_user)
        self.assertEqual(membership.status, 'left')
        self.assertTrue(membership.is_banned)

    def test_hide_help_post(self):
        """Test hiding a help post."""
        post = HelpPost.objects.create(
            org=self.org,
            type='offer',
            category='transportation',
            title='Test Post',
            description='Test',
            created_by=self.target_user,
        )

        action = ModerationAction.hide_content(
            org=self.org,
            moderator=self.moderator,
            content_type='help_post',
            content_id=post.id,
            reason='Violated guidelines',
        )
        self.assertEqual(action.action_type, 'hide_content')

        # Check post is cancelled
        post.refresh_from_db()
        self.assertEqual(post.status, 'cancelled')


class ReportAPITests(APITestCase):
    """Tests for the Report API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.reporter = User.objects.create_user(
            email='reporter@example.com',
            password='testpass123',
            display_name='Reporter User',
        )
        self.target_user = User.objects.create_user(
            email='target@example.com',
            password='testpass123',
            display_name='Target User',
        )
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123',
            display_name='Mod User',
        )
        Membership.objects.create(
            org=self.org, user=self.reporter, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.target_user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.moderator, role='moderator', status='active'
        )

    def test_submit_report(self):
        """Test submitting a report."""
        self.client.force_authenticate(user=self.reporter)
        response = self.client.post('/api/reports/', {
            'org': str(self.org.id),
            'target_type': 'user',
            'target_id': str(self.target_user.id),
            'reason': 'harassment',
            'details': 'This user harassed me.',
        })

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'open')
        self.assertEqual(str(response.data['reporter']), str(self.reporter.id))

    def test_list_reports_requires_moderator(self):
        """Test that only moderators can list reports."""
        Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )

        # Regular member cannot list
        self.client.force_authenticate(user=self.reporter)
        response = self.client.get(f'/api/reports/?org={self.org.id}')
        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)

        # Moderator can list
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(f'/api/reports/?org={self.org.id}')
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)

    def test_resolve_report(self):
        """Test resolving a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/reports/{report.id}/resolve/',
            {'resolution_notes': 'Warned the user.'}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'resolved')

    def test_dismiss_report(self):
        """Test dismissing a report."""
        report = Report.objects.create(
            org=self.org,
            target_type='user',
            target_id=self.target_user.id,
            reporter=self.reporter,
            reason='spam',
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/reports/{report.id}/dismiss/',
            {'resolution_notes': 'No evidence.'}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'dismissed')

    def test_get_report_reasons(self):
        """Test getting report reasons."""
        self.client.force_authenticate(user=self.reporter)
        response = self.client.get('/api/reports/reasons/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        reasons = [r['value'] for r in response.data]
        self.assertIn('spam', reasons)
        self.assertIn('harassment', reasons)


class ModerationActionAPITests(APITestCase):
    """Tests for the ModerationAction API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.target_user = User.objects.create_user(
            email='target@example.com',
            password='testpass123',
            display_name='Target User',
        )
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123',
            display_name='Mod User',
        )
        self.member = User.objects.create_user(
            email='member@example.com',
            password='testpass123',
        )
        Membership.objects.create(
            org=self.org, user=self.target_user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.moderator, role='moderator', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.member, role='member', status='active'
        )

    def test_take_action_warn(self):
        """Test issuing a warning via API."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/moderation-actions/take-action/?org={self.org.id}',
            {
                'action_type': 'warn',
                'target_type': 'user',
                'target_id': str(self.target_user.id),
                'reason': 'Inappropriate language',
                'user_message': 'Please be respectful.',
            }
        )

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['action_type'], 'warn')

    def test_take_action_suspend(self):
        """Test suspending a user via API."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/moderation-actions/take-action/?org={self.org.id}',
            {
                'action_type': 'suspend',
                'target_type': 'user',
                'target_id': str(self.target_user.id),
                'reason': 'Repeated violations',
                'duration_days': 7,
            }
        )

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['action_type'], 'suspend')

        # Verify membership is suspended
        membership = Membership.objects.get(org=self.org, user=self.target_user)
        self.assertEqual(membership.status, 'suspended')

    def test_take_action_requires_moderator(self):
        """Test that only moderators can take actions."""
        self.client.force_authenticate(user=self.member)
        response = self.client.post(
            f'/api/moderation-actions/take-action/?org={self.org.id}',
            {
                'action_type': 'warn',
                'target_type': 'user',
                'target_id': str(self.target_user.id),
                'reason': 'Test',
            }
        )

        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_list_actions_moderator_only(self):
        """Test that only moderators can list actions."""
        ModerationAction.warn_user(
            org=self.org,
            moderator=self.moderator,
            user=self.target_user,
            reason='Test warning',
        )

        # Member cannot list
        self.client.force_authenticate(user=self.member)
        response = self.client.get(f'/api/moderation-actions/?org={self.org.id}')
        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)

        # Moderator can list
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(f'/api/moderation-actions/?org={self.org.id}')
        self.assertEqual(response.status_code, http_status.HTTP_200_OK)

    def test_get_action_types(self):
        """Test getting action types."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/moderation-actions/action-types/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        types = [t['value'] for t in response.data]
        self.assertIn('warn', types)
        self.assertIn('suspend', types)
        self.assertIn('ban', types)
