# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Management command to seed theme presets.
"""

from django.core.management.base import BaseCommand

from organizations.models import ThemePreset


THEME_PRESETS = [
    {
        "id": "default",
        "name": "Default",
        "description": "Clean, professional theme with indigo and blue tones",
        "is_dark": False,
        "preview_colors": ["#4F46E5", "#0EA5E9", "#F59E0B", "#F8FAFC"],
        "theme_json": {
            "colors": {
                "primary": "#4F46E5",
                "secondary": "#0EA5E9",
                "accent": "#F59E0B",
                "background": "#FFFFFF",
                "surface": "#F8FAFC",
                "text": "#1E293B",
                "muted": "#64748B"
            },
            "fonts": {
                "heading": "Inter",
                "body": "Inter"
            },
            "radius": "md",
            "spacing": "comfortable"
        }
    },
    {
        "id": "sunset",
        "name": "Sunset",
        "description": "Warm, welcoming theme with orange and amber hues",
        "is_dark": False,
        "preview_colors": ["#EA580C", "#F97316", "#FCD34D", "#FFF7ED"],
        "theme_json": {
            "colors": {
                "primary": "#EA580C",
                "secondary": "#F97316",
                "accent": "#FCD34D",
                "background": "#FFFBEB",
                "surface": "#FFF7ED",
                "text": "#431407",
                "muted": "#9A3412"
            },
            "fonts": {
                "heading": "DM Sans",
                "body": "Inter"
            },
            "radius": "lg",
            "spacing": "comfortable"
        }
    },
    {
        "id": "forest",
        "name": "Forest",
        "description": "Nature-inspired theme with green and earth tones",
        "is_dark": False,
        "preview_colors": ["#16A34A", "#22C55E", "#84CC16", "#F0FDF4"],
        "theme_json": {
            "colors": {
                "primary": "#16A34A",
                "secondary": "#22C55E",
                "accent": "#84CC16",
                "background": "#FFFFFF",
                "surface": "#F0FDF4",
                "text": "#14532D",
                "muted": "#166534"
            },
            "fonts": {
                "heading": "Poppins",
                "body": "Inter"
            },
            "radius": "md",
            "spacing": "comfortable"
        }
    },
    {
        "id": "ocean",
        "name": "Ocean",
        "description": "Calming blue theme inspired by the sea",
        "is_dark": False,
        "preview_colors": ["#0284C7", "#0EA5E9", "#38BDF8", "#F0F9FF"],
        "theme_json": {
            "colors": {
                "primary": "#0284C7",
                "secondary": "#0EA5E9",
                "accent": "#38BDF8",
                "background": "#FFFFFF",
                "surface": "#F0F9FF",
                "text": "#0C4A6E",
                "muted": "#0369A1"
            },
            "fonts": {
                "heading": "Plus Jakarta Sans",
                "body": "Inter"
            },
            "radius": "lg",
            "spacing": "comfortable"
        }
    },
    {
        "id": "midnight",
        "name": "Midnight",
        "description": "Professional dark theme for night owls",
        "is_dark": True,
        "preview_colors": ["#8B5CF6", "#A78BFA", "#C4B5FD", "#1E1B4B"],
        "theme_json": {
            "colors": {
                "primary": "#8B5CF6",
                "secondary": "#A78BFA",
                "accent": "#C4B5FD",
                "background": "#0F172A",
                "surface": "#1E293B",
                "text": "#F1F5F9",
                "muted": "#94A3B8"
            },
            "fonts": {
                "heading": "Space Grotesk",
                "body": "Inter"
            },
            "radius": "md",
            "spacing": "comfortable"
        }
    },
]


class Command(BaseCommand):
    help = 'Seed the database with theme presets'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for preset_data in THEME_PRESETS:
            preset, created = ThemePreset.objects.update_or_create(
                id=preset_data['id'],
                defaults={
                    'name': preset_data['name'],
                    'description': preset_data['description'],
                    'is_dark': preset_data['is_dark'],
                    'preview_colors': preset_data['preview_colors'],
                    'theme_json': preset_data['theme_json'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created preset: {preset.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated preset: {preset.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {created_count}, Updated {updated_count} presets.'
            )
        )
