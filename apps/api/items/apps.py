# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
App configuration for items.
"""

from django.apps import AppConfig


class ItemsConfig(AppConfig):
    """Configuration for the items app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "items"
    verbose_name = "Item Sharing"
