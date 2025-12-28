# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for organizations API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import OrganizationViewSet

router = DefaultRouter()
router.register('', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
]
