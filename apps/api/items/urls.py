# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
URL configuration for items API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ItemPostViewSet, ItemReservationViewSet

router = DefaultRouter()
router.register(r'', ItemPostViewSet, basename='item-post')

reservation_router = DefaultRouter()
reservation_router.register(r'', ItemReservationViewSet, basename='item-reservation')

urlpatterns = [
    path('', include(router.urls)),
]

reservation_urlpatterns = [
    path('', include(reservation_router.urls)),
]
