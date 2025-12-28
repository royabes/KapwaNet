# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for invite endpoints.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import InviteViewSet

router = DefaultRouter()
router.register('', InviteViewSet, basename='invite')

urlpatterns = router.urls
