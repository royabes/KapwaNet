# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for help posts API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HelpPostViewSet

router = DefaultRouter()
router.register(r'', HelpPostViewSet, basename='help-post')

urlpatterns = [
    path('', include(router.urls)),
]
