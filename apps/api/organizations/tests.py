# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Tests for Organization models and API.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from .models import Organization, OrgTheme, ThemePreset, DEFAULT_THEME


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
        url = reverse('organizations:organization-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Only active orgs

    def test_get_organization_by_id(self):
        """Test retrieving organization by UUID."""
        url = reverse('organizations:organization-detail', kwargs={'pk': str(self.org1.id)})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Calgary Filipino Community")
        self.assertEqual(response.data['slug'], "calgary-filipino")

    def test_get_organization_by_slug(self):
        """Test retrieving organization by slug using primary lookup."""
        url = reverse('organizations:organization-detail', kwargs={'pk': 'calgary-filipino'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Calgary Filipino Community")

    def test_get_organization_by_slug_action(self):
        """Test retrieving organization using by-slug endpoint."""
        url = reverse('organizations:organization-by-slug', kwargs={'slug': 'edmonton-bayanihan'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Edmonton Bayanihan")

    def test_organization_not_found(self):
        """Test 404 for non-existent organization."""
        url = reverse('organizations:organization-detail', kwargs={'pk': 'nonexistent-org'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_inactive_org_not_in_list(self):
        """Test that inactive organizations are not listed."""
        url = reverse('organizations:organization-list')
        response = self.client.get(url)

        slugs = [org['slug'] for org in response.data]
        self.assertNotIn('inactive-org', slugs)

    def test_create_organization_requires_auth(self):
        """Test that creating an organization requires admin auth."""
        url = reverse('organizations:organization-list')
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


class ThemePresetModelTest(TestCase):
    """Test ThemePreset model."""

    def test_create_theme_preset(self):
        """Test creating a theme preset."""
        preset = ThemePreset.objects.create(
            id='custom',
            name='Custom Theme',
            description='A custom theme',
            theme_json=DEFAULT_THEME,
            preview_colors=['#4F46E5', '#0EA5E9', '#F59E0B'],
            is_dark=False,
        )
        self.assertEqual(str(preset), 'Custom Theme')
        self.assertEqual(preset.id, 'custom')


class OrgThemeModelTest(TestCase):
    """Test OrgTheme model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.preset = ThemePreset.objects.create(
            id='sunset',
            name='Sunset',
            description='Warm theme',
            theme_json={
                'colors': {
                    'primary': '#EA580C',
                    'secondary': '#F97316',
                    'accent': '#FCD34D',
                    'background': '#FFFBEB',
                    'surface': '#FFF7ED',
                    'text': '#431407',
                    'muted': '#9A3412'
                },
                'fonts': {'heading': 'DM Sans', 'body': 'Inter'},
                'radius': 'lg',
                'spacing': 'comfortable'
            },
            preview_colors=['#EA580C', '#F97316', '#FCD34D'],
        )

    def test_create_org_theme(self):
        """Test creating an org theme."""
        theme = OrgTheme.objects.create(org=self.org)
        self.assertEqual(str(theme), 'Theme for Test Org')
        # Should use default theme
        self.assertEqual(theme.theme_json['colors']['primary'], DEFAULT_THEME['colors']['primary'])

    def test_apply_preset(self):
        """Test applying a preset to an org theme."""
        theme = OrgTheme.objects.create(org=self.org)
        theme.apply_preset(self.preset)

        self.assertEqual(theme.preset, self.preset)
        self.assertEqual(theme.theme_json['colors']['primary'], '#EA580C')

    def test_get_css_variables(self):
        """Test CSS variable generation."""
        theme = OrgTheme.objects.create(org=self.org)
        css_vars = theme.get_css_variables()

        self.assertIn('--kn-primary', css_vars)
        self.assertIn('--kn-secondary', css_vars)
        self.assertIn('--kn-font-heading', css_vars)
        self.assertEqual(css_vars['--kn-primary'], DEFAULT_THEME['colors']['primary'])


class ThemePresetAPITest(APITestCase):
    """Test ThemePreset API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.preset1 = ThemePreset.objects.create(
            id='default',
            name='Default',
            description='Default theme',
            theme_json=DEFAULT_THEME,
            preview_colors=['#4F46E5', '#0EA5E9', '#F59E0B'],
        )
        self.preset2 = ThemePreset.objects.create(
            id='sunset',
            name='Sunset',
            description='Warm theme',
            theme_json={'colors': {'primary': '#EA580C'}},
            preview_colors=['#EA580C', '#F97316'],
        )

    def test_list_presets(self):
        """Test listing theme presets."""
        response = self.client.get('/api/theme-presets/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_preset(self):
        """Test retrieving a theme preset."""
        response = self.client.get('/api/theme-presets/default/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Default')
        self.assertIn('theme_json', response.data)


class OrgThemeAPITest(APITestCase):
    """Test OrgTheme API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.preset = ThemePreset.objects.create(
            id='sunset',
            name='Sunset',
            description='Warm theme',
            theme_json={
                'colors': {
                    'primary': '#EA580C',
                    'secondary': '#F97316',
                    'accent': '#FCD34D',
                    'background': '#FFFBEB',
                    'surface': '#FFF7ED',
                    'text': '#431407',
                    'muted': '#9A3412'
                },
                'fonts': {'heading': 'DM Sans', 'body': 'Inter'},
                'radius': 'lg',
                'spacing': 'comfortable'
            },
            preview_colors=['#EA580C', '#F97316', '#FCD34D'],
        )
        self.admin_user = User.objects.create_superuser(
            email='admin@test.com',
            password='testpass123'
        )

    def test_get_org_theme(self):
        """Test getting an org's theme."""
        url = reverse('organizations:organization-theme', kwargs={'pk': str(self.org.id)})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('theme_json', response.data)
        self.assertIn('css_variables', response.data)

    def test_get_org_theme_by_slug(self):
        """Test getting an org's theme by slug."""
        url = reverse('organizations:organization-theme', kwargs={'pk': 'test-org'})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_theme_requires_admin(self):
        """Test that updating theme requires admin permissions."""
        url = reverse('organizations:organization-theme', kwargs={'pk': 'test-org'})
        data = {'preset_id': 'sunset'}
        response = self.client.put(url, data)

        # Should require authentication
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )

    def test_update_theme_with_preset(self):
        """Test updating theme by applying a preset."""
        self.client.force_authenticate(user=self.admin_user)

        url = reverse('organizations:organization-theme', kwargs={'pk': 'test-org'})
        data = {'preset_id': 'sunset'}
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['theme_json']['colors']['primary'], '#EA580C')

    def test_update_theme_with_custom_json(self):
        """Test updating theme with custom JSON."""
        self.client.force_authenticate(user=self.admin_user)

        custom_theme = {
            'colors': {
                'primary': '#FF0000',
                'secondary': '#00FF00',
                'accent': '#0000FF',
                'background': '#FFFFFF',
                'surface': '#F0F0F0',
                'text': '#000000',
                'muted': '#666666'
            },
            'fonts': {'heading': 'Arial', 'body': 'Helvetica'},
            'radius': 'xl',
            'spacing': 'spacious'
        }

        url = reverse('organizations:organization-theme', kwargs={'pk': 'test-org'})
        data = {'theme_json': custom_theme}
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['theme_json']['colors']['primary'], '#FF0000')
