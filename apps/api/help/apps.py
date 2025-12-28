# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
App configuration for the help module.

This module handles bayanihan (mutual aid) help requests and offers.
"""

from django.apps import AppConfig


class HelpConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'help'
    verbose_name = 'Bayanihan Help'
