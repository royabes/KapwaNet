# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for Organization models.
"""

from rest_framework import serializers

from .models import Organization, OrgTheme, ThemePreset, TemplateLibrary, OrgPage, Membership, Invite


class OrganizationSerializer(serializers.ModelSerializer):
    """Serializer for Organization model."""

    class Meta:
        model = Organization
        fields = [
            'id',
            'slug',
            'name',
            'region',
            'logo_url',
            'description',
            'website',
            'contact_email',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing organizations."""

    class Meta:
        model = Organization
        fields = [
            'id',
            'slug',
            'name',
            'region',
            'logo_url',
        ]


class ThemePresetSerializer(serializers.ModelSerializer):
    """Serializer for ThemePreset model."""

    class Meta:
        model = ThemePreset
        fields = [
            'id',
            'name',
            'description',
            'theme_json',
            'preview_colors',
            'is_dark',
            'created_at',
        ]
        read_only_fields = ['created_at']


class ThemePresetListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing theme presets."""

    class Meta:
        model = ThemePreset
        fields = [
            'id',
            'name',
            'description',
            'preview_colors',
            'is_dark',
        ]


class OrgThemeSerializer(serializers.ModelSerializer):
    """Serializer for OrgTheme model."""

    preset_id = serializers.CharField(
        write_only=True,
        required=False,
        allow_null=True,
        help_text="ID of the preset to apply"
    )
    preset = ThemePresetListSerializer(read_only=True)
    css_variables = serializers.SerializerMethodField()

    class Meta:
        model = OrgTheme
        fields = [
            'org_id',
            'theme_json',
            'preset',
            'preset_id',
            'css_variables',
            'updated_at',
        ]
        read_only_fields = ['org_id', 'css_variables', 'updated_at']

    def get_css_variables(self, obj):
        """Get CSS variables for the theme."""
        return obj.get_css_variables()

    def update(self, instance, validated_data):
        """Handle preset application on update."""
        preset_id = validated_data.pop('preset_id', None)

        if preset_id:
            try:
                preset = ThemePreset.objects.get(id=preset_id)
                instance.apply_preset(preset)
                return instance
            except ThemePreset.DoesNotExist:
                raise serializers.ValidationError({
                    'preset_id': f"Preset '{preset_id}' not found."
                })

        # Update theme_json directly
        if 'theme_json' in validated_data:
            instance.theme_json = validated_data['theme_json']
            instance.preset = None  # Clear preset when custom theme applied
            instance.save()

        return instance


class OrgThemeUpdateSerializer(serializers.Serializer):
    """Serializer for updating org theme."""

    preset_id = serializers.CharField(
        required=False,
        allow_null=True,
        help_text="ID of the preset to apply"
    )
    theme_json = serializers.JSONField(
        required=False,
        help_text="Custom theme configuration"
    )

    def validate(self, data):
        """Ensure either preset_id or theme_json is provided."""
        if not data.get('preset_id') and not data.get('theme_json'):
            raise serializers.ValidationError(
                "Either 'preset_id' or 'theme_json' must be provided."
            )
        return data


class TemplateLibrarySerializer(serializers.ModelSerializer):
    """Serializer for TemplateLibrary model."""

    recommended_preset = ThemePresetListSerializer(read_only=True)

    class Meta:
        model = TemplateLibrary
        fields = [
            'id',
            'name',
            'description',
            'page_type',
            'category',
            'blocks_json',
            'thumbnail_url',
            'recommended_preset',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class TemplateLibraryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing templates."""

    recommended_preset_id = serializers.CharField(
        source='recommended_preset.id',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = TemplateLibrary
        fields = [
            'id',
            'name',
            'description',
            'page_type',
            'category',
            'thumbnail_url',
            'recommended_preset_id',
        ]


class OrgPageSerializer(serializers.ModelSerializer):
    """Serializer for OrgPage model."""

    source_template_id = serializers.CharField(
        source='source_template.id',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = OrgPage
        fields = [
            'id',
            'org_id',
            'slug',
            'title',
            'page_type',
            'blocks_json',
            'status',
            'source_template_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'org_id', 'source_template_id', 'created_at', 'updated_at']


class OrgPageListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages."""

    class Meta:
        model = OrgPage
        fields = [
            'id',
            'slug',
            'title',
            'page_type',
            'status',
            'updated_at',
        ]


class CreatePageFromTemplateSerializer(serializers.Serializer):
    """Serializer for creating a page from a template."""

    template_id = serializers.CharField(
        required=True,
        help_text="ID of the template to clone"
    )
    org_id = serializers.UUIDField(
        required=True,
        help_text="ID of the organization to create the page for"
    )
    title = serializers.CharField(
        required=False,
        max_length=255,
        help_text="Optional custom title (defaults to template name)"
    )
    slug = serializers.SlugField(
        required=False,
        max_length=100,
        help_text="Optional custom slug (defaults to slugified title)"
    )

    def validate_template_id(self, value):
        """Validate that the template exists."""
        try:
            TemplateLibrary.objects.get(id=value, is_active=True)
        except TemplateLibrary.DoesNotExist:
            raise serializers.ValidationError(f"Template '{value}' not found.")
        return value

    def validate_org_id(self, value):
        """Validate that the organization exists."""
        try:
            Organization.objects.get(id=value, is_active=True)
        except Organization.DoesNotExist:
            raise serializers.ValidationError(f"Organization not found.")
        return value

    def validate(self, data):
        """Check for duplicate slug within the organization."""
        org_id = data.get('org_id')
        slug = data.get('slug')

        if slug and org_id:
            if OrgPage.objects.filter(org_id=org_id, slug=slug).exists():
                raise serializers.ValidationError({
                    'slug': f"A page with slug '{slug}' already exists for this organization."
                })

        return data

    def create(self, validated_data):
        """Create the page from the template."""
        template = TemplateLibrary.objects.get(id=validated_data['template_id'])
        org = Organization.objects.get(id=validated_data['org_id'])

        page = OrgPage.create_from_template(
            org=org,
            template=template,
            title=validated_data.get('title'),
            slug=validated_data.get('slug'),
        )
        return page


class MembershipSerializer(serializers.ModelSerializer):
    """Full serializer for Membership model."""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)
    org_name = serializers.CharField(source='org.name', read_only=True)
    org_slug = serializers.CharField(source='org.slug', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id',
            'org',
            'org_name',
            'org_slug',
            'user',
            'user_email',
            'user_display_name',
            'role',
            'role_display',
            'status',
            'status_display',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MembershipListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing memberships."""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id',
            'user',
            'user_email',
            'user_display_name',
            'role',
            'role_display',
            'status',
            'status_display',
            'created_at',
        ]


class MyMembershipSerializer(serializers.ModelSerializer):
    """Serializer for a user's own memberships (organizations they belong to)."""

    org_id = serializers.UUIDField(source='org.id', read_only=True)
    org_name = serializers.CharField(source='org.name', read_only=True)
    org_slug = serializers.CharField(source='org.slug', read_only=True)
    org_logo_url = serializers.URLField(source='org.logo_url', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id',
            'org_id',
            'org_name',
            'org_slug',
            'org_logo_url',
            'role',
            'role_display',
            'status',
            'created_at',
        ]


class UpdateMembershipSerializer(serializers.Serializer):
    """Serializer for updating a membership (role/status change)."""

    role = serializers.ChoiceField(
        choices=Membership.ROLE_CHOICES,
        required=False,
        help_text="The new role for the member"
    )
    status = serializers.ChoiceField(
        choices=Membership.STATUS_CHOICES,
        required=False,
        help_text="The new status for the member"
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Notes about the change (e.g., suspension reason)"
    )

    def validate(self, data):
        """Ensure at least one field is provided."""
        if not data.get('role') and not data.get('status') and not data.get('notes'):
            raise serializers.ValidationError(
                "At least one of 'role', 'status', or 'notes' must be provided."
            )
        return data


class InviteSerializer(serializers.ModelSerializer):
    """Full serializer for Invite model."""

    org_name = serializers.CharField(source='org.name', read_only=True)
    org_slug = serializers.CharField(source='org.slug', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invite
        fields = [
            'id',
            'org',
            'org_name',
            'org_slug',
            'email',
            'role',
            'role_display',
            'token',
            'status',
            'status_display',
            'created_by',
            'created_by_email',
            'expires_at',
            'is_valid',
            'is_expired',
            'accepted_by',
            'accepted_at',
            'created_at',
        ]
        read_only_fields = ['id', 'token', 'status', 'created_by', 'accepted_by', 'accepted_at', 'created_at']


class InviteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing invites."""

    role_display = serializers.CharField(source='get_role_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invite
        fields = [
            'id',
            'email',
            'role',
            'role_display',
            'status',
            'status_display',
            'is_valid',
            'expires_at',
            'created_at',
        ]


class CreateInviteSerializer(serializers.Serializer):
    """Serializer for creating an invite."""

    org_id = serializers.UUIDField(
        required=True,
        help_text="ID of the organization to invite to"
    )
    email = serializers.EmailField(
        required=True,
        help_text="Email address to send the invite to"
    )
    role = serializers.ChoiceField(
        choices=Membership.ROLE_CHOICES,
        default='member',
        help_text="Role to assign to the user upon acceptance"
    )
    expires_in_days = serializers.IntegerField(
        default=7,
        min_value=1,
        max_value=30,
        help_text="Number of days until the invite expires"
    )

    def validate_org_id(self, value):
        """Validate that the organization exists."""
        try:
            Organization.objects.get(id=value, is_active=True)
        except Organization.DoesNotExist:
            raise serializers.ValidationError("Organization not found.")
        return value


class AcceptInviteSerializer(serializers.Serializer):
    """Serializer for accepting an invite."""

    token = serializers.CharField(
        required=True,
        help_text="The invite token"
    )

    def validate_token(self, value):
        """Validate that the invite exists and is valid."""
        try:
            invite = Invite.objects.get(token=value)
        except Invite.DoesNotExist:
            raise serializers.ValidationError("Invalid invite token.")

        if not invite.is_valid:
            if invite.is_expired:
                raise serializers.ValidationError("This invite has expired.")
            elif invite.status == 'accepted':
                raise serializers.ValidationError("This invite has already been used.")
            elif invite.status == 'cancelled':
                raise serializers.ValidationError("This invite has been cancelled.")
            else:
                raise serializers.ValidationError("This invite is no longer valid.")

        return value


class InviteInfoSerializer(serializers.ModelSerializer):
    """Public serializer for viewing invite details before accepting."""

    org_name = serializers.CharField(source='org.name', read_only=True)
    org_logo_url = serializers.URLField(source='org.logo_url', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Invite
        fields = [
            'org_name',
            'org_logo_url',
            'role',
            'role_display',
            'is_valid',
            'is_expired',
            'expires_at',
        ]
