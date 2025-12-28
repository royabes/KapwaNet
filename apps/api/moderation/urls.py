# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for moderation API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ReportViewSet, ModerationActionViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'moderation-actions', ModerationActionViewSet, basename='moderation-action')

urlpatterns = [
    path('', include(router.urls)),
]
