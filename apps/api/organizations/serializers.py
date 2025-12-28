# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for Organization models.
"""

from rest_framework import serializers

from .models import Organization, OrgTheme, ThemePreset, TemplateLibrary, OrgPage


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
