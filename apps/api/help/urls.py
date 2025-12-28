# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for help posts API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HelpPostViewSet, HelpMatchViewSet

router = DefaultRouter()
router.register(r'', HelpPostViewSet, basename='help-post')

match_router = DefaultRouter()
match_router.register(r'', HelpMatchViewSet, basename='help-match')

urlpatterns = [
    path('', include(router.urls)),
]

match_urlpatterns = [
    path('', include(match_router.urls)),
]
