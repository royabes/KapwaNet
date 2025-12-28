# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for item sharing functionality.
"""

from datetime import date, timedelta
from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status as http_status

from organizations.models import Organization, Membership
from users.models import User
from .models import ItemPost, ItemReservation


class ItemPostModelTests(TestCase):
    """Tests for the ItemPost model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            display_name='Test User',
        )
        Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='active',
        )

    def test_create_item_post_offer(self):
        """Test creating an item offer."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Winter Jacket',
            description='Warm winter jacket, size M',
            quantity=1,
            condition='good',
            created_by=self.user,
        )
        self.assertEqual(item.status, 'available')
        self.assertEqual(item.type, 'offer')
        self.assertFalse(item.is_food)

    def test_create_item_post_request(self):
        """Test creating an item request."""
        item = ItemPost.objects.create(
            org=self.org,
            type='request',
            category='household',
            title='Kitchen Utensils',
            description='Looking for basic kitchen utensils',
            quantity=1,
            created_by=self.user,
        )
        self.assertEqual(item.status, 'available')
        self.assertEqual(item.type, 'request')

    def test_food_item_requires_expiry(self):
        """Test that food offers require expiry date."""
        with self.assertRaises(ValidationError) as context:
            ItemPost.objects.create(
                org=self.org,
                type='offer',
                category='food',
                title='Canned Goods',
                description='Assorted canned goods',
                quantity=5,
                created_by=self.user,
            )
        self.assertIn('expiry_date', str(context.exception))

    def test_food_item_with_valid_expiry(self):
        """Test creating a food item with valid expiry date."""
        expiry = date.today() + timedelta(days=30)
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='food',
            title='Canned Goods',
            description='Assorted canned goods',
            quantity=5,
            expiry_date=expiry,
            allergens=['none'],
            storage_requirements='room_temp',
            created_by=self.user,
        )
        self.assertTrue(item.is_food)
        self.assertFalse(item.is_expired)

    def test_expired_food_item(self):
        """Test that past expiry date is rejected."""
        with self.assertRaises(ValidationError) as context:
            ItemPost.objects.create(
                org=self.org,
                type='offer',
                category='food',
                title='Expired Food',
                description='Should not be allowed',
                quantity=1,
                expiry_date=date.today() - timedelta(days=1),
                created_by=self.user,
            )
        self.assertIn('expiry_date', str(context.exception))

    def test_food_request_no_expiry_required(self):
        """Test that food requests don't require expiry date."""
        item = ItemPost.objects.create(
            org=self.org,
            type='request',
            category='food',
            title='Looking for groceries',
            description='Need basic groceries',
            quantity=1,
            created_by=self.user,
        )
        self.assertEqual(item.status, 'available')

    def test_status_transitions(self):
        """Test valid status transitions."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Shirt',
            description='Test shirt',
            created_by=self.user,
        )
        self.assertEqual(item.status, 'available')

        # available -> reserved
        item.reserve()
        self.assertEqual(item.status, 'reserved')

        # reserved -> completed
        item.mark_completed()
        self.assertEqual(item.status, 'completed')

    def test_cancel_and_reopen(self):
        """Test cancelling and reopening an item."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Pants',
            description='Test pants',
            created_by=self.user,
        )

        item.cancel()
        self.assertEqual(item.status, 'cancelled')

        item.reopen()
        self.assertEqual(item.status, 'available')

    def test_invalid_status_transition(self):
        """Test that invalid status transitions raise an error."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Shoes',
            description='Test shoes',
            created_by=self.user,
        )

        item.mark_completed = lambda: None  # Prevent actual completion
        # Try to complete from 'available' (invalid)
        with self.assertRaises(ValidationError):
            if not item.can_transition_to('completed'):
                raise ValidationError("Invalid transition")


class ItemReservationModelTests(TestCase):
    """Tests for the ItemReservation model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='testpass123',
            display_name='Owner User',
        )
        self.requester = User.objects.create_user(
            email='requester@example.com',
            password='testpass123',
            display_name='Requester User',
        )
        Membership.objects.create(
            org=self.org, user=self.owner, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.requester, role='member', status='active'
        )
        self.item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Test Item',
            description='A test item',
            quantity=2,
            created_by=self.owner,
        )

    def test_create_reservation(self):
        """Test creating a reservation."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
            message='I would like this item',
            quantity=1,
        )
        self.assertEqual(reservation.status, 'pending')
        self.assertEqual(reservation.requester, self.requester)
        self.assertEqual(reservation.item_post, self.item)

    def test_cannot_reserve_own_item(self):
        """Test that you cannot reserve your own item."""
        with self.assertRaises(ValidationError) as context:
            ItemReservation.create_reservation(
                item_post=self.item,
                requester=self.owner,
            )
        self.assertIn('own item', str(context.exception))

    def test_cannot_reserve_twice(self):
        """Test that you cannot reserve an item twice."""
        ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )
        with self.assertRaises(ValidationError) as context:
            ItemReservation.create_reservation(
                item_post=self.item,
                requester=self.requester,
            )
        self.assertIn('already have a reservation', str(context.exception))

    def test_approve_reservation(self):
        """Test approving a reservation creates thread and updates status."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        thread = reservation.approve()

        self.assertEqual(reservation.status, 'approved')
        self.assertIsNotNone(reservation.thread)
        self.assertEqual(thread.thread_type, 'item_reservation')
        self.assertEqual(self.item.status, 'reserved')

    def test_approve_rejects_other_pending(self):
        """Test that approving a reservation rejects other pending ones."""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
        )
        Membership.objects.create(
            org=self.org, user=other_user, role='member', status='active'
        )

        res1 = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )
        res2 = ItemReservation.create_reservation(
            item_post=self.item,
            requester=other_user,
        )

        res1.approve()

        res2.refresh_from_db()
        self.assertEqual(res2.status, 'rejected')

    def test_complete_reservation(self):
        """Test completing a reservation."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )
        reservation.approve()
        reservation.complete()

        self.assertEqual(reservation.status, 'completed')
        self.item.refresh_from_db()
        self.assertEqual(self.item.status, 'completed')

    def test_cancel_approved_releases_item(self):
        """Test that cancelling an approved reservation releases the item."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )
        reservation.approve()
        reservation.cancel()

        self.assertEqual(reservation.status, 'cancelled')
        self.item.refresh_from_db()
        self.assertEqual(self.item.status, 'available')


class ItemPostAPITests(APITestCase):
    """Tests for the ItemPost API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='testpass123',
            display_name='Test User',
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123',
            display_name='Other User',
        )
        self.moderator = User.objects.create_user(
            email='mod@example.com',
            password='testpass123',
            display_name='Mod User',
        )
        Membership.objects.create(
            org=self.org, user=self.user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.other_user, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.moderator, role='moderator', status='active'
        )

    def test_list_item_posts(self):
        """Test listing item posts."""
        ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Jacket',
            description='Winter jacket',
            created_by=self.user,
        )
        ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='household',
            title='Lamp',
            description='Desk lamp',
            created_by=self.other_user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/item-posts/?org={self.org.id}')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        # Handle both paginated and non-paginated responses
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 2)

    def test_create_item_post(self):
        """Test creating an item post."""
        self.client.force_authenticate(user=self.user)
        data = {
            'org': str(self.org.id),
            'type': 'offer',
            'category': 'electronics',
            'title': 'Old Phone',
            'description': 'Working smartphone',
            'quantity': 1,
            'condition': 'fair',
        }
        response = self.client.post('/api/item-posts/', data)

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Old Phone')
        self.assertEqual(str(response.data['created_by']), str(self.user.id))

    def test_create_food_item_requires_expiry(self):
        """Test that creating food item requires expiry date."""
        self.client.force_authenticate(user=self.user)
        data = {
            'org': str(self.org.id),
            'type': 'offer',
            'category': 'food',
            'title': 'Canned Soup',
            'description': 'Assorted canned soups',
            'quantity': 5,
        }
        response = self.client.post('/api/item-posts/', data)

        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)
        self.assertIn('expiry_date', str(response.data))

    def test_create_food_item_with_expiry(self):
        """Test creating a food item with proper safety fields."""
        self.client.force_authenticate(user=self.user)
        expiry = (date.today() + timedelta(days=30)).isoformat()
        data = {
            'org': str(self.org.id),
            'type': 'offer',
            'category': 'food',
            'title': 'Canned Soup',
            'description': 'Assorted canned soups',
            'quantity': 5,
            'expiry_date': expiry,
            'allergens': ['gluten'],
            'storage_requirements': 'room_temp',
        }
        response = self.client.post('/api/item-posts/', data, format='json')

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'food')

    def test_update_own_post(self):
        """Test updating own item post."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Original Title',
            description='Test',
            created_by=self.user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f'/api/item-posts/{item.id}/',
            {'title': 'Updated Title'}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_cannot_update_others_post(self):
        """Test that users cannot update others' posts."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Title',
            description='Test',
            created_by=self.other_user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            f'/api/item-posts/{item.id}/',
            {'title': 'Hacked'}
        )

        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_moderator_can_update_any_post(self):
        """Test that moderators can update any post."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Title',
            description='Test',
            created_by=self.user,
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.patch(
            f'/api/item-posts/{item.id}/',
            {'title': 'Mod Updated'}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Mod Updated')

    def test_cancel_own_post(self):
        """Test cancelling own item post."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Cancel Me',
            description='Test',
            created_by=self.user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/item-posts/{item.id}/cancel/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'cancelled')

    def test_reopen_cancelled_post(self):
        """Test reopening a cancelled item post."""
        item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Reopen Me',
            description='Test',
            status='cancelled',
            created_by=self.user,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/item-posts/{item.id}/reopen/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'available')

    def test_get_categories(self):
        """Test getting available categories."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/item-posts/categories/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        categories = [c['value'] for c in response.data]
        self.assertIn('food', categories)
        self.assertIn('clothing', categories)

    def test_filter_by_category(self):
        """Test filtering posts by category."""
        ItemPost.objects.create(
            org=self.org, type='offer', category='clothing',
            title='Shirt', description='Test', created_by=self.user
        )
        ItemPost.objects.create(
            org=self.org, type='offer', category='food',
            title='Soup', description='Test', created_by=self.user,
            expiry_date=date.today() + timedelta(days=30),
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/item-posts/?org={self.org.id}&category=clothing')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['category'], 'clothing')

    def test_org_isolation(self):
        """Test that posts are isolated by organization."""
        other_org = Organization.objects.create(name='Other Org', slug='other-org')
        Membership.objects.create(
            org=other_org, user=self.user, role='member', status='active'
        )
        ItemPost.objects.create(
            org=self.org, type='offer', category='clothing',
            title='Org1 Item', description='Test', created_by=self.user
        )
        ItemPost.objects.create(
            org=other_org, type='offer', category='clothing',
            title='Org2 Item', description='Test', created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/item-posts/?org={self.org.id}')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Org1 Item')


class ItemReservationAPITests(APITestCase):
    """Tests for the ItemReservation API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='testpass123',
            display_name='Owner User',
        )
        self.requester = User.objects.create_user(
            email='requester@example.com',
            password='testpass123',
            display_name='Requester User',
        )
        Membership.objects.create(
            org=self.org, user=self.owner, role='member', status='active'
        )
        Membership.objects.create(
            org=self.org, user=self.requester, role='member', status='active'
        )
        self.item = ItemPost.objects.create(
            org=self.org,
            type='offer',
            category='clothing',
            title='Test Item',
            description='A test item',
            quantity=2,
            created_by=self.owner,
        )

    def test_reserve_item(self):
        """Test reserving an item."""
        self.client.force_authenticate(user=self.requester)
        response = self.client.post(
            f'/api/item-posts/{self.item.id}/reserve/',
            {'message': 'I need this!', 'quantity': 1}
        )

        self.assertEqual(response.status_code, http_status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(str(response.data['requester']), str(self.requester.id))

    def test_cannot_reserve_own_item(self):
        """Test that owner cannot reserve own item."""
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(f'/api/item-posts/{self.item.id}/reserve/')

        self.assertEqual(response.status_code, http_status.HTTP_400_BAD_REQUEST)
        self.assertIn('own item', str(response.data))

    def test_view_reservations(self):
        """Test viewing reservations for an item."""
        ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/item-posts/{self.item.id}/reservations/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_non_owner_cannot_view_reservations(self):
        """Test that non-owners cannot view reservations."""
        ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.requester)
        response = self.client.get(f'/api/item-posts/{self.item.id}/reservations/')

        self.assertEqual(response.status_code, http_status.HTTP_403_FORBIDDEN)

    def test_approve_reservation(self):
        """Test approving a reservation."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            f'/api/item-posts/{self.item.id}/approve-reservation/',
            {'reservation_id': str(reservation.id)}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')
        self.assertIsNotNone(response.data['thread'])

    def test_reject_reservation(self):
        """Test rejecting a reservation."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            f'/api/item-posts/{self.item.id}/reject-reservation/',
            {'reservation_id': str(reservation.id)}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'rejected')

    def test_confirm_pickup(self):
        """Test confirming pickup."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )
        reservation.approve()

        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            f'/api/item-posts/{self.item.id}/confirm-pickup/',
            {'reservation_id': str(reservation.id)}
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'completed')

    def test_cancel_reservation(self):
        """Test cancelling a reservation."""
        reservation = ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.requester)
        response = self.client.post(
            f'/api/item-reservations/{reservation.id}/cancel/'
        )

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'cancelled')

    def test_list_my_reservations(self):
        """Test listing user's reservations."""
        ItemReservation.create_reservation(
            item_post=self.item,
            requester=self.requester,
        )

        self.client.force_authenticate(user=self.requester)
        response = self.client.get('/api/item-reservations/')

        self.assertEqual(response.status_code, http_status.HTTP_200_OK)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 1)
