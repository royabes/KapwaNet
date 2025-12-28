# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for theme presets API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ThemePresetViewSet

router = DefaultRouter()
router.register('', ThemePresetViewSet, basename='theme-preset')

urlpatterns = [
    path('', include(router.urls)),
]
