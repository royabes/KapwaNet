# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for help matches API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HelpMatchViewSet

router = DefaultRouter()
router.register(r'', HelpMatchViewSet, basename='help-match')

urlpatterns = [
    path('', include(router.urls)),
]
