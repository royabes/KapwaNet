# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for organizations API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import OrganizationViewSet, ThemePresetViewSet

app_name = 'organizations'

router = DefaultRouter()
router.register('', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
]


# Separate urlpatterns for theme presets (to be included at /api/theme-presets/)
theme_router = DefaultRouter()
theme_router.register('', ThemePresetViewSet, basename='theme-preset')

theme_preset_urlpatterns = [
    path('', include(theme_router.urls)),
]
