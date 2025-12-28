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
from .models import Organization, OrgTheme, ThemePreset, Membership, Invite, DEFAULT_THEME
from .permissions import OrgMembershipPermission, OrgAdminPermission, OrgModeratorPermission


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


class MembershipModelTest(TestCase):
    """Test Membership model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.user = User.objects.create_user(
            email='member@test.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            email='member2@test.com',
            password='testpass123'
        )

    def test_create_membership(self):
        """Test creating a membership."""
        membership = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='active',
        )
        self.assertEqual(str(membership), 'member@test.com - Test Org (Member)')
        self.assertIsNotNone(membership.id)
        self.assertTrue(membership.is_active_member)

    def test_role_choices(self):
        """Test different role choices."""
        admin = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='org_admin',
        )
        self.assertTrue(admin.is_admin)
        self.assertTrue(admin.is_moderator)

        moderator = Membership.objects.create(
            org=self.org,
            user=self.user2,
            role='moderator',
        )
        self.assertFalse(moderator.is_admin)
        self.assertTrue(moderator.is_moderator)

    def test_status_choices(self):
        """Test different status choices."""
        membership = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='org_admin',
            status='active',
        )
        self.assertTrue(membership.is_active_member)
        self.assertTrue(membership.is_admin)

        # Suspend the user
        membership.status = 'suspended'
        membership.save()
        self.assertFalse(membership.is_active_member)
        self.assertFalse(membership.is_admin)  # Suspended = no admin rights

    def test_unique_constraint(self):
        """Test that user can only have one membership per org."""
        Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
        )
        # Attempting to create duplicate should fail
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Membership.objects.create(
                org=self.org,
                user=self.user,
                role='moderator',
            )

    def test_is_user_member(self):
        """Test is_user_member class method."""
        # Before membership
        self.assertFalse(Membership.is_user_member(self.user, self.org))

        # Create active membership
        Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='active',
        )
        self.assertTrue(Membership.is_user_member(self.user, self.org))

    def test_is_user_member_suspended(self):
        """Test is_user_member with suspended status."""
        membership = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
            status='suspended',
        )
        # Active check should fail
        self.assertFalse(Membership.is_user_member(self.user, self.org))
        # But non-active check should pass
        self.assertTrue(Membership.is_user_member(self.user, self.org, require_active=False))

    def test_has_role(self):
        """Test has_role class method."""
        Membership.objects.create(
            org=self.org,
            user=self.user,
            role='moderator',
            status='active',
        )
        # Has moderator role
        self.assertTrue(Membership.has_role(self.user, self.org, 'moderator'))
        # Does not have admin role
        self.assertFalse(Membership.has_role(self.user, self.org, 'org_admin'))
        # Has one of multiple roles
        self.assertTrue(Membership.has_role(self.user, self.org, ['org_admin', 'moderator']))

    def test_has_role_suspended(self):
        """Test has_role returns False for suspended users."""
        Membership.objects.create(
            org=self.org,
            user=self.user,
            role='org_admin',
            status='suspended',
        )
        self.assertFalse(Membership.has_role(self.user, self.org, 'org_admin'))

    def test_get_user_membership(self):
        """Test get_user_membership class method."""
        # Before membership
        self.assertIsNone(Membership.get_user_membership(self.user, self.org))

        # After membership
        created = Membership.objects.create(
            org=self.org,
            user=self.user,
            role='member',
        )
        found = Membership.get_user_membership(self.user, self.org)
        self.assertEqual(found, created)


class MembershipAPITest(APITestCase):
    """Test Membership API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            display_name='Admin User',
        )
        self.member_user = User.objects.create_user(
            email='member@test.com',
            password='testpass123',
            display_name='Member User',
        )
        self.non_member = User.objects.create_user(
            email='nonmember@test.com',
            password='testpass123',
        )

        # Create memberships
        self.admin_membership = Membership.objects.create(
            org=self.org,
            user=self.admin_user,
            role='org_admin',
            status='active',
        )
        self.member_membership = Membership.objects.create(
            org=self.org,
            user=self.member_user,
            role='member',
            status='active',
        )

    def test_my_memberships(self):
        """Test getting user's own memberships."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/memberships/my-memberships/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['org_name'], 'Test Org')
        self.assertEqual(response.data[0]['role'], 'org_admin')

    def test_list_org_members(self):
        """Test listing members of an organization."""
        self.client.force_authenticate(user=self.member_user)
        response = self.client.get(f'/api/memberships/?org_id={self.org.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_org_members_not_member(self):
        """Test that non-members cannot list org members."""
        self.client.force_authenticate(user=self.non_member)
        response = self.client.get(f'/api/memberships/?org_id={self.org.id}')

        # Should be forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_member_role(self):
        """Test updating a member's role (admin only)."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f'/api/memberships/{self.member_membership.id}/',
            {'role': 'moderator'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'moderator')

    def test_suspend_member(self):
        """Test suspending a member (admin only)."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f'/api/memberships/{self.member_membership.id}/',
            {'status': 'suspended', 'notes': 'Violation of community guidelines'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'suspended')

    def test_member_cannot_update_roles(self):
        """Test that regular members cannot update roles."""
        self.client.force_authenticate(user=self.member_user)
        response = self.client.patch(
            f'/api/memberships/{self.member_membership.id}/',
            {'role': 'org_admin'},
            format='json'
        )

        # Should be forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_demote_self(self):
        """Test that admin cannot demote themselves."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.patch(
            f'/api/memberships/{self.admin_membership.id}/',
            {'role': 'member'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leave_organization(self):
        """Test leaving an organization."""
        self.client.force_authenticate(user=self.member_user)
        response = self.client.post(f'/api/memberships/{self.member_membership.id}/leave/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member_membership.refresh_from_db()
        self.assertEqual(self.member_membership.status, 'left')

    def test_only_admin_cannot_leave(self):
        """Test that the only admin cannot leave."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/memberships/{self.admin_membership.id}/leave/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('only admin', response.data['detail'].lower())


class InviteModelTest(TestCase):
    """Test Invite model."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.admin = User.objects.create_user(
            email='admin@test.com',
            password='testpass123'
        )
        Membership.objects.create(
            org=self.org,
            user=self.admin,
            role='org_admin',
            status='active',
        )

    def test_create_invite(self):
        """Test creating an invite."""
        invite = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='member',
            created_by=self.admin,
        )
        self.assertIsNotNone(invite.id)
        self.assertIsNotNone(invite.token)
        self.assertTrue(len(invite.token) > 20)
        self.assertEqual(invite.status, 'pending')
        self.assertTrue(invite.is_valid)
        self.assertFalse(invite.is_expired)

    def test_accept_invite(self):
        """Test accepting an invite."""
        invite = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='member',
            created_by=self.admin,
        )

        # Create user and accept invite
        new_user = User.objects.create_user(
            email='newmember@test.com',
            password='testpass123'
        )
        membership = invite.accept(new_user)

        self.assertEqual(membership.org, self.org)
        self.assertEqual(membership.user, new_user)
        self.assertEqual(membership.role, 'member')
        self.assertEqual(membership.status, 'active')

        # Check invite is marked as accepted
        invite.refresh_from_db()
        self.assertEqual(invite.status, 'accepted')
        self.assertEqual(invite.accepted_by, new_user)
        self.assertIsNotNone(invite.accepted_at)

    def test_expired_invite(self):
        """Test that expired invites cannot be accepted."""
        from django.utils import timezone
        from datetime import timedelta

        invite = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='member',
            created_by=self.admin,
        )
        # Manually set to expired
        invite.expires_at = timezone.now() - timedelta(days=1)
        invite.save()

        self.assertTrue(invite.is_expired)
        self.assertFalse(invite.is_valid)

        # Try to accept
        new_user = User.objects.create_user(
            email='newmember@test.com',
            password='testpass123'
        )
        with self.assertRaises(ValueError) as ctx:
            invite.accept(new_user)
        self.assertIn('expired', str(ctx.exception).lower())

    def test_cancel_invite(self):
        """Test cancelling an invite."""
        invite = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='member',
            created_by=self.admin,
        )
        invite.cancel()

        self.assertEqual(invite.status, 'cancelled')
        self.assertFalse(invite.is_valid)

    def test_duplicate_invite_cancels_previous(self):
        """Test that creating a new invite cancels the previous one."""
        invite1 = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='member',
            created_by=self.admin,
        )
        invite2 = Invite.create_for_email(
            org=self.org,
            email='newmember@test.com',
            role='moderator',
            created_by=self.admin,
        )

        invite1.refresh_from_db()
        self.assertEqual(invite1.status, 'cancelled')
        self.assertEqual(invite2.status, 'pending')


class InviteAPITest(APITestCase):
    """Test Invite API endpoints."""

    def setUp(self):
        """Set up test data."""
        self.org = Organization.objects.create(
            name='Test Org',
            slug='test-org',
        )
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            display_name='Admin User',
        )
        self.admin_membership = Membership.objects.create(
            org=self.org,
            user=self.admin_user,
            role='org_admin',
            status='active',
        )
        self.new_user = User.objects.create_user(
            email='newuser@test.com',
            password='testpass123',
        )

    def test_create_invite(self):
        """Test creating an invite (admin only)."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/invites/', {
            'org_id': str(self.org.id),
            'email': 'invited@test.com',
            'role': 'member',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['email'], 'invited@test.com')
        self.assertEqual(response.data['role'], 'member')

    def test_non_admin_cannot_create_invite(self):
        """Test that non-admins cannot create invites."""
        self.client.force_authenticate(user=self.new_user)
        response = self.client.post('/api/invites/', {
            'org_id': str(self.org.id),
            'email': 'invited@test.com',
            'role': 'member',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_invite_info(self):
        """Test getting invite info by token (public)."""
        invite = Invite.create_for_email(
            org=self.org,
            email='invited@test.com',
            role='member',
            created_by=self.admin_user,
        )

        response = self.client.get(f'/api/invites/info/{invite.token}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['org_name'], 'Test Org')
        self.assertEqual(response.data['role'], 'member')
        self.assertTrue(response.data['is_valid'])

    def test_accept_invite(self):
        """Test accepting an invite."""
        invite = Invite.create_for_email(
            org=self.org,
            email='newuser@test.com',
            role='member',
            created_by=self.admin_user,
        )

        self.client.force_authenticate(user=self.new_user)
        response = self.client.post('/api/invites/accept/', {
            'token': invite.token,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('membership', response.data)
        self.assertEqual(response.data['membership']['role'], 'member')

        # Verify membership was created
        self.assertTrue(Membership.is_user_member(self.new_user, self.org))

    def test_accept_invalid_token(self):
        """Test accepting with invalid token."""
        self.client.force_authenticate(user=self.new_user)
        response = self.client.post('/api/invites/accept/', {
            'token': 'invalid-token',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_invite(self):
        """Test cancelling an invite (admin only)."""
        invite = Invite.create_for_email(
            org=self.org,
            email='invited@test.com',
            role='member',
            created_by=self.admin_user,
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/invites/{invite.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invite.refresh_from_db()
        self.assertEqual(invite.status, 'cancelled')

    def test_list_invites(self):
        """Test listing invites for an org (admin only)."""
        Invite.create_for_email(
            org=self.org,
            email='invited1@test.com',
            role='member',
            created_by=self.admin_user,
        )
        Invite.create_for_email(
            org=self.org,
            email='invited2@test.com',
            role='moderator',
            created_by=self.admin_user,
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(f'/api/invites/?org_id={self.org.id}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
