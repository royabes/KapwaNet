# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for membership endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MembershipViewSet

router = DefaultRouter()
router.register('', MembershipViewSet, basename='membership')

urlpatterns = router.urls
