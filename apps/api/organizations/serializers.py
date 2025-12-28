# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Serializers for Organization models.
"""

from rest_framework import serializers

from .models import Organization


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
