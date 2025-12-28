# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Organization models for KapwaNet multi-tenant architecture.

Each organization represents a community group that can have its own
branding, members, and content.
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Organization(models.Model):
    """
    Core organization model for multi-tenant support.

    Organizations are the top-level entity in KapwaNet. All content,
    users, and settings are scoped to an organization.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the organization"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="URL-friendly identifier (e.g., 'calgary-filipino-community')"
    )
    name = models.CharField(
        max_length=255,
        help_text="Display name of the organization"
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        help_text="Geographic region (e.g., 'Calgary, AB')"
    )
    logo_url = models.URLField(
        blank=True,
        help_text="URL to the organization's logo image"
    )

    # Metadata
    description = models.TextField(
        blank=True,
        help_text="Brief description of the organization"
    )
    website = models.URLField(
        blank=True,
        help_text="Organization's external website URL"
    )
    contact_email = models.EmailField(
        blank=True,
        help_text="Primary contact email for the organization"
    )

    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the organization is currently active"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        verbose_name = 'organization'
        verbose_name_plural = 'organizations'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


# Default theme tokens schema
DEFAULT_THEME = {
    "colors": {
        "primary": "#4F46E5",     # Indigo
        "secondary": "#0EA5E9",   # Sky blue
        "accent": "#F59E0B",      # Amber
        "background": "#FFFFFF",  # White
        "surface": "#F8FAFC",     # Slate 50
        "text": "#1E293B",        # Slate 800
        "muted": "#64748B"        # Slate 500
    },
    "fonts": {
        "heading": "Inter",
        "body": "Inter"
    },
    "radius": "md",
    "spacing": "comfortable"
}


class ThemePreset(models.Model):
    """
    Predefined theme presets that can be applied to organizations.

    Theme presets provide a starting point for organizations to style
    their sites without having to configure every color and font.
    """

    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text="Unique identifier for the preset (e.g., 'default', 'sunset')"
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name for the preset"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of the theme's look and feel"
    )
    theme_json = models.JSONField(
        default=dict,
        help_text="Complete theme configuration as JSON"
    )
    preview_colors = models.JSONField(
        default=list,
        help_text="List of 3-4 preview colors for the theme selector"
    )

    # Metadata
    is_dark = models.BooleanField(
        default=False,
        help_text="Whether this is a dark mode theme"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'theme_presets'
        ordering = ['name']
        verbose_name = 'theme preset'
        verbose_name_plural = 'theme presets'

    def __str__(self):
        return self.name


class OrgTheme(models.Model):
    """
    Theme configuration for an organization.

    Each organization has one theme that defines colors, fonts,
    and spacing used across their public site.
    """

    org = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='theme',
        help_text="The organization this theme belongs to"
    )
    theme_json = models.JSONField(
        default=dict,
        help_text="Theme configuration with colors, fonts, radius, spacing"
    )
    preset = models.ForeignKey(
        ThemePreset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='organizations',
        help_text="The preset this theme is based on (if any)"
    )

    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'org_themes'
        verbose_name = 'organization theme'
        verbose_name_plural = 'organization themes'

    def __str__(self):
        return f"Theme for {self.org.name}"

    def save(self, *args, **kwargs):
        """Set default theme if theme_json is empty."""
        if not self.theme_json:
            self.theme_json = DEFAULT_THEME.copy()
        super().save(*args, **kwargs)

    def apply_preset(self, preset):
        """Apply a preset to this theme."""
        self.preset = preset
        self.theme_json = preset.theme_json.copy()
        self.save()

    def get_css_variables(self):
        """
        Convert theme_json to CSS variable format.

        Returns a dict that can be used directly in style attributes.
        """
        theme = self.theme_json or DEFAULT_THEME
        colors = theme.get('colors', {})
        fonts = theme.get('fonts', {})
        radius = theme.get('radius', 'md')
        spacing = theme.get('spacing', 'comfortable')

        # Radius mapping
        radius_values = {
            'none': '0px',
            'sm': '4px',
            'md': '8px',
            'lg': '12px',
            'xl': '16px',
            'full': '9999px'
        }

        # Spacing mapping
        spacing_values = {
            'compact': '4px',
            'comfortable': '8px',
            'spacious': '12px'
        }

        return {
            '--kn-primary': colors.get('primary', DEFAULT_THEME['colors']['primary']),
            '--kn-secondary': colors.get('secondary', DEFAULT_THEME['colors']['secondary']),
            '--kn-accent': colors.get('accent', DEFAULT_THEME['colors']['accent']),
            '--kn-bg': colors.get('background', DEFAULT_THEME['colors']['background']),
            '--kn-surface': colors.get('surface', DEFAULT_THEME['colors']['surface']),
            '--kn-text': colors.get('text', DEFAULT_THEME['colors']['text']),
            '--kn-muted': colors.get('muted', DEFAULT_THEME['colors']['muted']),
            '--kn-font-heading': fonts.get('heading', DEFAULT_THEME['fonts']['heading']),
            '--kn-font-body': fonts.get('body', DEFAULT_THEME['fonts']['body']),
            '--kn-radius-sm': '4px',
            '--kn-radius-md': '8px',
            '--kn-radius-lg': '12px',
            '--kn-radius-xl': '16px',
            '--kn-radius': radius_values.get(radius, '8px'),
            '--kn-spacing-unit': spacing_values.get(spacing, '8px'),
        }


class TemplateLibrary(models.Model):
    """
    Pre-built page templates for organizations to use.

    Templates provide a starting point for creating pages with
    pre-configured blocks. Organizations can clone a template
    to create a new page and then customize it.
    """

    PAGE_TYPE_CHOICES = [
        ('home', 'Home Page'),
        ('about', 'About Page'),
        ('programs', 'Programs Page'),
        ('contact', 'Contact Page'),
        ('custom', 'Custom Page'),
    ]

    CATEGORY_CHOICES = [
        ('starter', 'Starter Templates'),
        ('community', 'Community Organization'),
        ('nonprofit', 'Nonprofit / Charity'),
        ('mutual_aid', 'Mutual Aid Group'),
    ]

    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text="Unique identifier for the template (e.g., 'home-starter')"
    )
    name = models.CharField(
        max_length=100,
        help_text="Display name for the template"
    )
    description = models.TextField(
        blank=True,
        help_text="Description of what this template is for"
    )
    page_type = models.CharField(
        max_length=20,
        choices=PAGE_TYPE_CHOICES,
        default='custom',
        help_text="The type of page this template creates"
    )
    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default='starter',
        help_text="Category for organizing templates"
    )
    blocks_json = models.JSONField(
        default=list,
        help_text="Array of block configurations for this template"
    )
    thumbnail_url = models.URLField(
        blank=True,
        help_text="Preview thumbnail image URL"
    )
    recommended_preset = models.ForeignKey(
        ThemePreset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='templates',
        help_text="Recommended theme preset for this template"
    )

    # Metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this template is available for use"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'template_library'
        ordering = ['category', 'page_type', 'name']
        verbose_name = 'page template'
        verbose_name_plural = 'page templates'

    def __str__(self):
        return f"{self.name} ({self.get_page_type_display()})"

    def clone_blocks(self):
        """
        Return a deep copy of blocks_json for cloning.

        Each cloned block gets a new unique ID.
        """
        import copy
        blocks = copy.deepcopy(self.blocks_json)
        for block in blocks:
            if 'id' in block:
                # Generate new UUID for cloned block
                block['id'] = str(uuid.uuid4())
        return blocks


class OrgPage(models.Model):
    """
    A page belonging to an organization.

    Pages contain blocks_json and can be created from templates
    or built from scratch. All pages are scoped to an organization
    for multi-tenant isolation.
    """

    PAGE_TYPE_CHOICES = [
        ('home', 'Home Page'),
        ('about', 'About Page'),
        ('programs', 'Programs Page'),
        ('contact', 'Contact Page'),
        ('custom', 'Custom Page'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the page"
    )
    org = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='pages',
        help_text="The organization this page belongs to"
    )
    slug = models.SlugField(
        max_length=100,
        help_text="URL-friendly identifier (unique per org)"
    )
    title = models.CharField(
        max_length=255,
        help_text="Page title"
    )
    page_type = models.CharField(
        max_length=20,
        choices=PAGE_TYPE_CHOICES,
        default='custom',
        help_text="The type of page"
    )
    blocks_json = models.JSONField(
        default=list,
        help_text="Array of block configurations for this page"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        help_text="Publication status of the page"
    )

    # Template reference (for tracking where page came from)
    source_template = models.ForeignKey(
        TemplateLibrary,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cloned_pages',
        help_text="The template this page was created from (if any)"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'org_pages'
        ordering = ['org', 'title']
        verbose_name = 'organization page'
        verbose_name_plural = 'organization pages'
        # Ensure slug is unique within an organization
        unique_together = [['org', 'slug']]

    def __str__(self):
        return f"{self.title} ({self.org.name})"

    def save(self, *args, **kwargs):
        """Auto-generate slug from title if not provided."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @classmethod
    def create_from_template(cls, org, template, title=None, slug=None):
        """
        Create a new page from a template.

        Clones the template's blocks with new IDs.
        """
        page_title = title or template.name
        page_slug = slug or slugify(page_title)

        page = cls(
            org=org,
            slug=page_slug,
            title=page_title,
            page_type=template.page_type,
            blocks_json=template.clone_blocks(),
            source_template=template,
            status='draft',
        )
        page.save()
        return page


class Membership(models.Model):
    """
    Membership linking users to organizations with roles.

    This model controls access to organization content and features.
    Each user can be a member of multiple organizations with different roles.
    """

    ROLE_CHOICES = [
        ('org_admin', 'Organization Admin'),
        ('moderator', 'Moderator'),
        ('member', 'Member'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('left', 'Left'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the membership"
    )
    org = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='memberships',
        help_text="The organization the user is a member of"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
        help_text="The user who is a member"
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member',
        help_text="The user's role in the organization"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text="The membership status"
    )

    # Optional notes (e.g., for suspension reason)
    notes = models.TextField(
        blank=True,
        help_text="Internal notes about this membership"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'memberships'
        ordering = ['org', 'user']
        verbose_name = 'membership'
        verbose_name_plural = 'memberships'
        # Each user can only have one membership per organization
        unique_together = [['org', 'user']]

    def __str__(self):
        return f"{self.user.email} - {self.org.name} ({self.get_role_display()})"

    @property
    def is_active_member(self):
        """Check if the membership is active."""
        return self.status == 'active'

    @property
    def is_admin(self):
        """Check if the member has admin privileges."""
        return self.role == 'org_admin' and self.status == 'active'

    @property
    def is_moderator(self):
        """Check if the member has moderation privileges."""
        return self.role in ('org_admin', 'moderator') and self.status == 'active'

    @classmethod
    def get_user_membership(cls, user, org):
        """
        Get a user's membership for a specific organization.

        Returns None if the user is not a member.
        """
        try:
            return cls.objects.get(user=user, org=org)
        except cls.DoesNotExist:
            return None

    @classmethod
    def is_user_member(cls, user, org, require_active=True):
        """
        Check if a user is a member of an organization.

        Args:
            user: The user to check
            org: The organization to check
            require_active: If True, only active memberships count

        Returns:
            True if the user is a member, False otherwise
        """
        queryset = cls.objects.filter(user=user, org=org)
        if require_active:
            queryset = queryset.filter(status='active')
        return queryset.exists()

    @classmethod
    def has_role(cls, user, org, roles):
        """
        Check if a user has any of the specified roles in an organization.

        Args:
            user: The user to check
            org: The organization to check
            roles: A role string or list of role strings to check

        Returns:
            True if the user has any of the specified roles, False otherwise
        """
        if isinstance(roles, str):
            roles = [roles]
        return cls.objects.filter(
            user=user,
            org=org,
            role__in=roles,
            status='active'
        ).exists()


class Invite(models.Model):
    """
    Invite to join an organization.

    Invites are generated by admins and can be accepted by users
    to join an organization with a specific role.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the invite"
    )
    org = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invites',
        help_text="The organization being joined"
    )
    email = models.EmailField(
        help_text="Email address the invite was sent to"
    )
    role = models.CharField(
        max_length=20,
        choices=Membership.ROLE_CHOICES,
        default='member',
        help_text="The role the user will have upon acceptance"
    )
    token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Unique token for accepting the invite"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="The current status of the invite"
    )

    # Who created the invite
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_invites',
        help_text="The admin who created the invite"
    )

    # Expiry
    expires_at = models.DateTimeField(
        help_text="When the invite expires"
    )

    # Who accepted the invite (after acceptance)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invites',
        help_text="The user who accepted the invite"
    )
    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the invite was accepted"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invites'
        ordering = ['-created_at']
        verbose_name = 'invite'
        verbose_name_plural = 'invites'

    def __str__(self):
        return f"Invite to {self.org.name} for {self.email} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        """Generate token if not provided."""
        if not self.token:
            import secrets
            self.token = secrets.token_urlsafe(48)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        """Check if the invite is valid (pending and not expired)."""
        from django.utils import timezone
        return self.status == 'pending' and self.expires_at > timezone.now()

    @property
    def is_expired(self):
        """Check if the invite has expired."""
        from django.utils import timezone
        return self.expires_at <= timezone.now()

    def accept(self, user):
        """
        Accept the invite and create membership.

        Returns the created Membership or raises an exception.
        """
        from django.utils import timezone

        # Check if invite is still valid
        if self.status != 'pending':
            raise ValueError(f"Invite is {self.status}, cannot be accepted")

        if self.is_expired:
            self.status = 'expired'
            self.save()
            raise ValueError("Invite has expired")

        # Check if user is already a member
        existing = Membership.objects.filter(org=self.org, user=user).first()
        if existing:
            if existing.status == 'left':
                # Reactivate membership with invited role
                existing.role = self.role
                existing.status = 'active'
                existing.save()
                membership = existing
            else:
                raise ValueError("User is already a member of this organization")
        else:
            # Create new membership
            membership = Membership.objects.create(
                org=self.org,
                user=user,
                role=self.role,
                status='active',
            )

        # Mark invite as accepted
        self.status = 'accepted'
        self.accepted_by = user
        self.accepted_at = timezone.now()
        self.save()

        return membership

    def cancel(self):
        """Cancel the invite."""
        if self.status != 'pending':
            raise ValueError(f"Cannot cancel invite in {self.status} status")
        self.status = 'cancelled'
        self.save()

    @classmethod
    def create_for_email(cls, org, email, role, created_by, expires_in_days=7):
        """
        Create a new invite for an email address.

        Args:
            org: The organization to invite to
            email: The email address to invite
            role: The role to assign on acceptance
            created_by: The user creating the invite
            expires_in_days: How long until the invite expires

        Returns:
            The created Invite
        """
        from django.utils import timezone
        from datetime import timedelta

        # Cancel any existing pending invites for this email/org
        cls.objects.filter(
            org=org,
            email=email,
            status='pending'
        ).update(status='cancelled')

        return cls.objects.create(
            org=org,
            email=email,
            role=role,
            created_by=created_by,
            expires_at=timezone.now() + timedelta(days=expires_in_days),
        )
