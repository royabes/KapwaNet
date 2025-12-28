# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for help posts functionality.
"""

from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from organizations.models import Organization, Membership
from .models import HelpPost


class HelpPostModelTests(TestCase):
    """Tests for HelpPost model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        self.membership = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='active'
        )

    def test_create_help_post_request(self):
        """Test creating a help request."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Need a ride to the hospital',
            description='I need help getting to my doctor appointment.',
            urgency='high',
            created_by=self.user
        )
        self.assertEqual(post.type, 'request')
        self.assertEqual(post.status, 'open')
        self.assertEqual(str(post), 'Request: Need a ride to the hospital')

    def test_create_help_post_offer(self):
        """Test creating a help offer."""
        post = HelpPost.objects.create(
            org=self.org,
            type='offer',
            category='errands',
            title='Can help with grocery shopping',
            description='I can pick up groceries on weekends.',
            urgency='low',
            created_by=self.user
        )
        self.assertEqual(post.type, 'offer')
        self.assertEqual(post.status, 'open')

    def test_valid_status_transitions(self):
        """Test valid status transitions."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='household',
            title='Need help moving furniture',
            description='Moving to a new apartment.',
            created_by=self.user
        )

        # Open -> Matched
        self.assertTrue(post.can_transition_to('matched'))
        post.mark_matched()
        self.assertEqual(post.status, 'matched')

        # Matched -> Completed
        self.assertTrue(post.can_transition_to('completed'))
        post.mark_completed()
        self.assertEqual(post.status, 'completed')

    def test_invalid_status_transition(self):
        """Test that invalid status transitions raise an error."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='household',
            title='Test post',
            description='Test description',
            created_by=self.user
        )

        # Open -> Completed (invalid, must go through matched)
        self.assertFalse(post.can_transition_to('completed'))
        with self.assertRaises(ValidationError):
            post.mark_completed()

    def test_cancel_and_reopen(self):
        """Test cancelling and reopening a post."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='household',
            title='Test post',
            description='Test description',
            created_by=self.user
        )

        # Cancel the post
        post.cancel()
        self.assertEqual(post.status, 'cancelled')

        # Reopen the post
        post.reopen()
        self.assertEqual(post.status, 'open')


class HelpPostAPITests(APITestCase):
    """Tests for help post API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        self.membership = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='active'
        )
        self.other_membership = Membership.objects.create(
            org=self.org,
            user=self.other_user,
            role='member',
            status='active'
        )

        # Create a moderator
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123'
        )
        Membership.objects.create(
            org=self.org,
            user=self.moderator,
            role='moderator',
            status='active'
        )

    def get_token(self, user):
        """Get JWT token for a user."""
        response = self.client.post('/api/token/', {
            'email': user.email,
            'password': 'testpass123'
        })
        return response.data['access']

    def test_list_help_posts(self):
        """Test listing help posts."""
        # Create some posts
        HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Need a ride',
            description='Test',
            created_by=self.user
        )
        HelpPost.objects.create(
            org=self.org,
            type='offer',
            category='errands',
            title='Can run errands',
            description='Test',
            created_by=self.other_user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.get(f'/api/help-posts/?org={self.org.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_help_post(self):
        """Test creating a help post."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.post('/api/help-posts/', {
            'org': str(self.org.id),
            'type': 'request',
            'category': 'transportation',
            'title': 'Need a ride to the hospital',
            'description': 'I need help getting to my doctor appointment.',
            'urgency': 'high'
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Need a ride to the hospital')
        self.assertEqual(response.data['status'], 'open')

    def test_create_help_post_without_membership(self):
        """Test that non-members cannot create posts."""
        non_member = User.objects.create_user(
            email='nonmember@example.com',
            password='testpass123'
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(non_member)}')

        response = self.client.post('/api/help-posts/', {
            'org': str(self.org.id),
            'type': 'request',
            'category': 'transportation',
            'title': 'Need a ride',
            'description': 'Test',
        })

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_own_post(self):
        """Test that users can update their own posts."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Original title',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.patch(f'/api/help-posts/{post.id}/', {
            'title': 'Updated title'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated title')

    def test_cannot_update_others_post(self):
        """Test that users cannot update others' posts."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Original title',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.other_user)}')
        response = self.client.patch(f'/api/help-posts/{post.id}/', {
            'title': 'Hacked title'
        })

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_update_any_post(self):
        """Test that moderators can update any post."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Original title',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.moderator)}')
        response = self.client.patch(f'/api/help-posts/{post.id}/', {
            'title': 'Moderator updated'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Moderator updated')

    def test_cancel_own_post(self):
        """Test cancelling own post."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Test post',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.post(f'/api/help-posts/{post.id}/cancel/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'cancelled')

    def test_reopen_cancelled_post(self):
        """Test reopening a cancelled post."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Test post',
            description='Test',
            status='cancelled',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.post(f'/api/help-posts/{post.id}/reopen/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'open')

    def test_filter_by_type(self):
        """Test filtering posts by type."""
        HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Request 1',
            description='Test',
            created_by=self.user
        )
        HelpPost.objects.create(
            org=self.org,
            type='offer',
            category='errands',
            title='Offer 1',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.get(f'/api/help-posts/?org={self.org.id}&type=request')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'request')

    def test_filter_by_status(self):
        """Test filtering posts by status."""
        HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Open post',
            description='Test',
            status='open',
            created_by=self.user
        )
        HelpPost.objects.create(
            org=self.org,
            type='request',
            category='errands',
            title='Cancelled post',
            description='Test',
            status='cancelled',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.get(f'/api/help-posts/?org={self.org.id}&status=open')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'open')

    def test_get_categories(self):
        """Test getting available help categories."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')
        response = self.client.get('/api/help-posts/categories/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
        # Check that transportation category exists
        categories = [c['value'] for c in response.data]
        self.assertIn('transportation', categories)

    def test_status_transition_validation(self):
        """Test that invalid status transitions are rejected."""
        post = HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Test post',
            description='Test',
            status='open',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')

        # Try to complete an open post (should fail)
        response = self.client.post(f'/api/help-posts/{post.id}/complete/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_org_isolation(self):
        """Test that posts are isolated by organization."""
        # Create another org
        other_org = Organization.objects.create(
            name='Other Organization',
            slug='other-org'
        )
        Membership.objects.create(
            org=other_org,
            user=self.user,
            role='member',
            status='active'
        )

        # Create posts in both orgs
        HelpPost.objects.create(
            org=self.org,
            type='request',
            category='transportation',
            title='Post in org 1',
            description='Test',
            created_by=self.user
        )
        HelpPost.objects.create(
            org=other_org,
            type='request',
            category='transportation',
            title='Post in org 2',
            description='Test',
            created_by=self.user
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user)}')

        # Query for org 1
        response = self.client.get(f'/api/help-posts/?org={self.org.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Post in org 1')

        # Query for org 2
        response = self.client.get(f'/api/help-posts/?org={other_org.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Post in org 2')
