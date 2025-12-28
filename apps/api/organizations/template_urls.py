# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for templates API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TemplateLibraryViewSet

router = DefaultRouter()
router.register('', TemplateLibraryViewSet, basename='template')

urlpatterns = [
    path('', include(router.urls)),
]
