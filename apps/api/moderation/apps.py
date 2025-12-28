# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
App configuration for moderation.
"""

from django.apps import AppConfig


class ModerationConfig(AppConfig):
    """Configuration for the moderation app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "moderation"
    verbose_name = "Moderation & Trust"
