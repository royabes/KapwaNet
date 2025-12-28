# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for item reservations API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ItemReservationViewSet

router = DefaultRouter()
router.register(r'', ItemReservationViewSet, basename='item-reservation')

urlpatterns = [
    path('', include(router.urls)),
]
