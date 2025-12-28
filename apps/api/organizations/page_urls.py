# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for pages API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import OrgPageViewSet

router = DefaultRouter()
router.register('', OrgPageViewSet, basename='page')

urlpatterns = [
    path('', include(router.urls)),
]
