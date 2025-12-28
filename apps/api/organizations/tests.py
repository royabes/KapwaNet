# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for Organization models and API.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Organization


class OrganizationModelTest(TestCase):
    """Test Organization model."""

    def test_create_organization(self):
        """Test creating an organization."""
        org = Organization.objects.create(
            name="Test Community",
            slug="test-community",
            region="Calgary, AB",
        )
        self.assertEqual(str(org), "Test Community")
        self.assertEqual(org.slug, "test-community")
        self.assertTrue(org.is_active)
        self.assertIsNotNone(org.id)

    def test_auto_slug_generation(self):
        """Test that slug is auto-generated from name if not provided."""
        org = Organization.objects.create(
            name="My Amazing Community",
        )
        self.assertEqual(org.slug, "my-amazing-community")

    def test_organization_fields(self):
        """Test all organization fields."""
        org = Organization.objects.create(
            name="Full Org",
            slug="full-org",
            region="Edmonton, AB",
            logo_url="https://example.com/logo.png",
            description="A great community",
            website="https://example.com",
            contact_email="contact@example.com",
        )
        self.assertEqual(org.region, "Edmonton, AB")
        self.assertEqual(org.logo_url, "https://example.com/logo.png")
        self.assertEqual(org.description, "A great community")
        self.assertEqual(org.website, "https://example.com")
        self.assertEqual(org.contact_email, "contact@example.com")


class OrganizationAPITest(APITestCase):
    """Test Organization API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org1 = Organization.objects.create(
            name="Calgary Filipino Community",
            slug="calgary-filipino",
            region="Calgary, AB",
            logo_url="https://example.com/logo1.png",
            description="Filipino community in Calgary",
        )
        self.org2 = Organization.objects.create(
            name="Edmonton Bayanihan",
            slug="edmonton-bayanihan",
            region="Edmonton, AB",
        )
        # Inactive organization should not appear in list
        self.inactive_org = Organization.objects.create(
            name="Inactive Org",
            slug="inactive-org",
            is_active=False,
        )

    def test_list_organizations(self):
        """Test listing organizations."""
        url = reverse('organization-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only active orgs

    def test_get_organization_by_id(self):
        """Test retrieving organization by UUID."""
        url = reverse('organization-detail', kwargs={'pk': str(self.org1.id)})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Calgary Filipino Community")
        self.assertEqual(response.data['slug'], "calgary-filipino")

    def test_get_organization_by_slug(self):
        """Test retrieving organization by slug using primary lookup."""
        url = reverse('organization-detail', kwargs={'pk': 'calgary-filipino'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Calgary Filipino Community")

    def test_get_organization_by_slug_action(self):
        """Test retrieving organization using by-slug endpoint."""
        url = reverse('organization-by-slug', kwargs={'slug': 'edmonton-bayanihan'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Edmonton Bayanihan")

    def test_organization_not_found(self):
        """Test 404 for non-existent organization."""
        url = reverse('organization-detail', kwargs={'pk': 'nonexistent-org'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_inactive_org_not_in_list(self):
        """Test that inactive organizations are not listed."""
        url = reverse('organization-list')
        response = self.client.get(url)

        slugs = [org['slug'] for org in response.data]
        self.assertNotIn('inactive-org', slugs)

    def test_create_organization_requires_auth(self):
        """Test that creating an organization requires admin auth."""
        url = reverse('organization-list')
        data = {
            'name': 'New Community',
            'slug': 'new-community',
        }
        response = self.client.post(url, data)

        # Should require authentication (401 Unauthorized when not logged in)
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )
