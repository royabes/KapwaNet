# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for messaging functionality.
"""

from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import User
from organizations.models import Organization, Membership
from .models import Thread, ThreadParticipant, Message


class ThreadModelTests(TestCase):
    """Tests for Thread model."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        Membership.objects.create(org=self.org, user=self.user1, role='member', status='active')
        Membership.objects.create(org=self.org, user=self.user2, role='member', status='active')

    def test_create_thread(self):
        """Test creating a thread."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct',
            subject='Test Thread'
        )
        self.assertEqual(thread.thread_type, 'direct')
        self.assertEqual(str(thread), 'Thread: Test Thread')

    def test_add_participant(self):
        """Test adding participants to a thread."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        self.assertEqual(thread.participants.count(), 2)
        self.assertTrue(thread.is_participant(self.user1))
        self.assertTrue(thread.is_participant(self.user2))

    def test_get_or_create_direct(self):
        """Test get_or_create_direct class method."""
        # First call should create
        thread1, created1 = Thread.get_or_create_direct(
            org=self.org,
            user1=self.user1,
            user2=self.user2
        )
        self.assertTrue(created1)
        self.assertEqual(thread1.thread_type, 'direct')

        # Second call should retrieve existing
        thread2, created2 = Thread.get_or_create_direct(
            org=self.org,
            user1=self.user1,
            user2=self.user2
        )
        self.assertFalse(created2)
        self.assertEqual(thread1.id, thread2.id)

    def test_create_for_help_match(self):
        """Test creating a thread for a help match."""
        import uuid
        match_id = uuid.uuid4()

        thread = Thread.create_for_help_match(
            org=self.org,
            ref_id=match_id,
            participants=[self.user1, self.user2],
            subject='Help with groceries'
        )

        self.assertEqual(thread.thread_type, 'help_match')
        self.assertEqual(thread.ref_id, match_id)
        self.assertEqual(thread.participants.count(), 2)


class MessageModelTests(TestCase):
    """Tests for Message model."""

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
        self.thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        self.thread.add_participant(self.user)

    def test_send_user_message(self):
        """Test sending a user message."""
        message = Message.send_user_message(
            thread=self.thread,
            sender=self.user,
            body='Hello, world!'
        )

        self.assertEqual(message.message_type, 'user')
        self.assertEqual(message.sender_user, self.user)
        self.assertEqual(message.body, 'Hello, world!')

    def test_send_system_message(self):
        """Test sending a system message."""
        message = Message.send_system_message(
            thread=self.thread,
            body='The request has been matched.'
        )

        self.assertEqual(message.message_type, 'system')
        self.assertIsNone(message.sender_user)

    def test_non_participant_cannot_send(self):
        """Test that non-participants cannot send messages."""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )

        with self.assertRaises(ValueError):
            Message.send_user_message(
                thread=self.thread,
                sender=other_user,
                body='Unauthorized message'
            )

    def test_message_updates_thread_timestamp(self):
        """Test that sending a message updates thread's last_message_at."""
        old_timestamp = self.thread.last_message_at

        Message.send_user_message(
            thread=self.thread,
            sender=self.user,
            body='Test message'
        )

        self.thread.refresh_from_db()
        self.assertIsNotNone(self.thread.last_message_at)


class ThreadUnreadTests(TestCase):
    """Tests for unread message tracking."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        self.thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        self.thread.add_participant(self.user1)
        self.thread.add_participant(self.user2)

    def test_unread_count(self):
        """Test unread message count."""
        # User1 sends 3 messages
        for i in range(3):
            Message.send_user_message(
                thread=self.thread,
                sender=self.user1,
                body=f'Message {i}'
            )

        # User2 has 3 unread messages
        unread = self.thread.get_unread_count(self.user2)
        self.assertEqual(unread, 3)

        # User1 has 0 unread (own messages)
        unread = self.thread.get_unread_count(self.user1)
        self.assertEqual(unread, 0)

    def test_mark_read(self):
        """Test marking messages as read."""
        Message.send_user_message(
            thread=self.thread,
            sender=self.user1,
            body='Test message'
        )

        # Mark as read
        self.thread.mark_read(self.user2)

        # Unread should be 0
        unread = self.thread.get_unread_count(self.user2)
        self.assertEqual(unread, 0)


class ThreadAPITests(APITestCase):
    """Tests for thread API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='user2@example.com',
            password='testpass123'
        )
        self.user3 = User.objects.create_user(
            email='user3@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Organization',
            slug='test-org'
        )
        Membership.objects.create(org=self.org, user=self.user1, role='member', status='active')
        Membership.objects.create(org=self.org, user=self.user2, role='member', status='active')
        Membership.objects.create(org=self.org, user=self.user3, role='member', status='active')

    def get_token(self, user):
        """Get JWT token for a user."""
        response = self.client.post('/api/token/', {
            'email': user.email,
            'password': 'testpass123'
        })
        return response.data['access']

    def test_list_threads(self):
        """Test listing threads."""
        # Create a thread with user1 as participant
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')
        response = self.client.get('/api/threads/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_direct_thread(self):
        """Test creating a direct message thread."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')
        response = self.client.post('/api/threads/', {
            'org_id': str(self.org.id),
            'recipient_user_id': str(self.user2.id),
            'initial_message': 'Hello!'
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['thread_type'], 'direct')

        # Check message was created
        thread = Thread.objects.get(id=response.data['id'])
        self.assertEqual(thread.messages.count(), 1)
        self.assertEqual(thread.messages.first().body, 'Hello!')

    def test_cannot_thread_with_non_member(self):
        """Test that you cannot create a thread with a non-member."""
        non_member = User.objects.create_user(
            email='nonmember@example.com',
            password='testpass123'
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')
        response = self.client.post('/api/threads/', {
            'org_id': str(self.org.id),
            'recipient_user_id': str(non_member.id),
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_thread_messages(self):
        """Test getting messages in a thread."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        # Add some messages
        Message.send_user_message(thread, self.user1, 'Hello')
        Message.send_user_message(thread, self.user2, 'Hi there')

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')
        response = self.client.get(f'/api/threads/{thread.id}/messages/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_send_message(self):
        """Test sending a message to a thread."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')
        response = self.client.post(f'/api/threads/{thread.id}/messages/', {
            'body': 'New message'
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['body'], 'New message')

    def test_non_participant_cannot_access_thread(self):
        """Test that non-participants cannot access a thread."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        # User3 is not a participant
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user3)}')
        response = self.client.get(f'/api/threads/{thread.id}/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_read(self):
        """Test marking a thread as read."""
        thread = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread.add_participant(self.user1)
        thread.add_participant(self.user2)

        Message.send_user_message(thread, self.user1, 'Hello')

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user2)}')
        response = self.client.post(f'/api/threads/{thread.id}/mark-read/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify unread is 0
        response = self.client.get('/api/threads/unread_counts/')
        self.assertEqual(response.data['total'], 0)

    def test_org_isolation(self):
        """Test that threads are isolated by organization."""
        other_org = Organization.objects.create(
            name='Other Organization',
            slug='other-org'
        )
        Membership.objects.create(org=other_org, user=self.user1, role='member', status='active')
        Membership.objects.create(org=other_org, user=self.user2, role='member', status='active')

        # Create thread in org1
        thread1 = Thread.objects.create(
            org=self.org,
            thread_type='direct'
        )
        thread1.add_participant(self.user1)
        thread1.add_participant(self.user2)

        # Create thread in org2
        thread2 = Thread.objects.create(
            org=other_org,
            thread_type='direct'
        )
        thread2.add_participant(self.user1)
        thread2.add_participant(self.user2)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.user1)}')

        # Filter by org
        response = self.client.get(f'/api/threads/?org={self.org.id}')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(thread1.id))

        response = self.client.get(f'/api/threads/?org={other_org.id}')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(thread2.id))
