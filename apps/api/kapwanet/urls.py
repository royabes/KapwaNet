"""
URL configuration for KapwaNet project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import health_check

urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Wagtail admin
    path('cms/', include(wagtailadmin_urls)),
    path('documents/', include(wagtaildocs_urls)),

    # API endpoints
    path('api/health/', health_check, name='health_check'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/organizations/', include('organizations.urls')),
    path('api/theme-presets/', include('organizations.theme_urls')),
    path('api/templates/', include('organizations.template_urls')),
    path('api/pages/', include('organizations.page_urls')),
    path('api/memberships/', include('organizations.membership_urls')),
    path('api/invites/', include('organizations.invite_urls')),
    path('api/help-posts/', include('help.urls')),
    path('api/help-matches/', include('help.match_urls')),
    path('api/item-posts/', include('items.urls')),
    path('api/item-reservations/', include('items.reservation_urls')),
    path('api/', include('messaging.urls')),

    # Wagtail pages (catch-all, should be last)
    path('', include(wagtail_urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
