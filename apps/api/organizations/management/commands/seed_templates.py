# KapwaNet - Community Platform for Dignified Mutual Aid
# SPDX-License-Identifier: AGPL-3.0-or-later

"""
Management command to seed page templates.
"""

from django.core.management.base import BaseCommand

from organizations.models import TemplateLibrary, ThemePreset


# Template definitions with blocks
TEMPLATES = [
    {
        "id": "home-starter",
        "name": "Home - Starter",
        "description": "A welcoming home page with hero, stats, cards, and call-to-action sections.",
        "page_type": "home",
        "category": "starter",
        "recommended_preset_id": "default",
        "blocks_json": [
            {
                "id": "hero-1",
                "type": "hero",
                "headline": "Welcome to Our Community",
                "subheadline": "Together, we build connections that matter. Join us in making a difference.",
                "ctas": [
                    {"label": "Get Involved", "href": "/join", "variant": "primary"},
                    {"label": "Learn More", "href": "/about", "variant": "secondary"}
                ],
                "alignment": "center",
                "minHeight": "large"
            },
            {
                "id": "stats-1",
                "type": "stats_strip",
                "items": [
                    {"label": "Community Members", "value": "500+"},
                    {"label": "Families Helped", "value": "1,200"},
                    {"label": "Active Volunteers", "value": "75"},
                    {"label": "Years of Service", "value": "10+"}
                ],
                "backgroundColor": "primary"
            },
            {
                "id": "cards-1",
                "type": "card_grid",
                "title": "How We Help",
                "subtitle": "Discover the many ways we support our community",
                "columns": 3,
                "cardStyle": "elevated",
                "cards": [
                    {
                        "id": "card-1",
                        "title": "Mutual Aid",
                        "description": "Connect with neighbors to give and receive help with everyday needs.",
                        "icon": "hands"
                    },
                    {
                        "id": "card-2",
                        "title": "Item Sharing",
                        "description": "Share food, clothing, and essentials with those who need them.",
                        "icon": "gift"
                    },
                    {
                        "id": "card-3",
                        "title": "Community Events",
                        "description": "Join gatherings, workshops, and celebrations that bring us together.",
                        "icon": "calendar"
                    }
                ]
            },
            {
                "id": "cta-1",
                "type": "cta_banner",
                "headline": "Ready to Make a Difference?",
                "subheadline": "Whether you need help or want to offer support, there's a place for you here.",
                "primaryCta": {"label": "Join Our Community", "href": "/join", "variant": "primary"},
                "secondaryCta": {"label": "Contact Us", "href": "/contact", "variant": "outline"},
                "backgroundColor": "secondary"
            }
        ]
    },
    {
        "id": "about-community",
        "name": "About - Community Organization",
        "description": "An about page with organization story, team, and partners sections.",
        "page_type": "about",
        "category": "community",
        "recommended_preset_id": "forest",
        "blocks_json": [
            {
                "id": "hero-about",
                "type": "hero",
                "headline": "About Our Organization",
                "subheadline": "Learn about our mission, values, and the people who make it all possible.",
                "alignment": "center",
                "minHeight": "medium"
            },
            {
                "id": "story-1",
                "type": "image_text_split",
                "title": "Our Story",
                "body": "<p>Founded by community members who saw a need for connection and mutual support, our organization has grown from a small group of neighbors to a thriving community hub.</p><p>We believe that everyone has something to offer and everyone deserves support when they need it. Our approach is rooted in dignity, respect, and the understanding that we are stronger together.</p>",
                "image": {
                    "src": "/images/placeholder-community.jpg",
                    "alt": "Community members working together"
                },
                "imagePosition": "right"
            },
            {
                "id": "values-1",
                "type": "image_text_split",
                "anchor": "values",
                "title": "Our Values",
                "body": "<p><strong>Dignity First</strong> - Every interaction honors the inherent worth of each person.</p><p><strong>Community Power</strong> - We believe in collective action and shared responsibility.</p><p><strong>Transparency</strong> - We operate openly and accountably to our community.</p><p><strong>Inclusion</strong> - Everyone belongs here, regardless of background or circumstance.</p>",
                "image": {
                    "src": "/images/placeholder-values.jpg",
                    "alt": "Diverse group of community members"
                },
                "imagePosition": "left"
            },
            {
                "id": "team-1",
                "type": "team_grid",
                "title": "Meet Our Team",
                "columns": 4,
                "showBioOnClick": True,
                "members": [
                    {
                        "name": "Maria Santos",
                        "role": "Executive Director",
                        "bio": "Maria has been serving the community for over 15 years.",
                        "photo": {"src": "/images/team/placeholder-1.jpg", "alt": "Maria Santos"}
                    },
                    {
                        "name": "James Chen",
                        "role": "Programs Coordinator",
                        "bio": "James manages our mutual aid programs and volunteer coordination.",
                        "photo": {"src": "/images/team/placeholder-2.jpg", "alt": "James Chen"}
                    },
                    {
                        "name": "Sarah Johnson",
                        "role": "Community Outreach",
                        "bio": "Sarah connects us with partner organizations and community members.",
                        "photo": {"src": "/images/team/placeholder-3.jpg", "alt": "Sarah Johnson"}
                    },
                    {
                        "name": "David Kim",
                        "role": "Volunteer Lead",
                        "bio": "David coordinates our amazing team of volunteers.",
                        "photo": {"src": "/images/team/placeholder-4.jpg", "alt": "David Kim"}
                    }
                ]
            },
            {
                "id": "partners-1",
                "type": "partner_logos",
                "title": "Our Partners",
                "logos": [
                    {"name": "Community Foundation", "src": "/images/partners/placeholder-1.png", "href": "#"},
                    {"name": "Local Government", "src": "/images/partners/placeholder-2.png", "href": "#"},
                    {"name": "Health Alliance", "src": "/images/partners/placeholder-3.png", "href": "#"},
                    {"name": "Food Network", "src": "/images/partners/placeholder-4.png", "href": "#"}
                ]
            }
        ]
    },
    {
        "id": "programs-mutual-aid",
        "name": "Programs - Mutual Aid Focus",
        "description": "A programs page highlighting mutual aid services with steps and volunteer opportunities.",
        "page_type": "programs",
        "category": "mutual_aid",
        "recommended_preset_id": "ocean",
        "blocks_json": [
            {
                "id": "hero-programs",
                "type": "hero",
                "headline": "Our Programs",
                "subheadline": "Discover how we connect community members to support each other.",
                "alignment": "center",
                "minHeight": "medium"
            },
            {
                "id": "intro-1",
                "type": "rich_text_section",
                "content": "<h2>Building Community Through Mutual Aid</h2><p>Our programs are designed to create meaningful connections between community members who want to help and those who need support. We believe in the power of reciprocity and community care.</p>",
                "maxWidth": "lg",
                "centered": True
            },
            {
                "id": "cards-programs",
                "type": "card_grid",
                "title": "Our Services",
                "columns": 2,
                "cardStyle": "bordered",
                "cards": [
                    {
                        "id": "service-1",
                        "title": "Help Exchange",
                        "description": "Request or offer help with transportation, errands, childcare, home repairs, and more.",
                        "href": "/help"
                    },
                    {
                        "id": "service-2",
                        "title": "Item Sharing",
                        "description": "Share food, clothing, household items, and other essentials with neighbors in need.",
                        "href": "/items"
                    },
                    {
                        "id": "service-3",
                        "title": "Skills & Knowledge",
                        "description": "Connect with community members who can teach skills or provide guidance.",
                        "href": "/skills"
                    },
                    {
                        "id": "service-4",
                        "title": "Emergency Support",
                        "description": "Get connected with resources during times of crisis or urgent need.",
                        "href": "/emergency"
                    }
                ]
            },
            {
                "id": "steps-1",
                "type": "steps",
                "title": "How It Works",
                "subtitle": "Getting started is easy",
                "variant": "numbered",
                "steps": [
                    {
                        "id": "step-1",
                        "number": 1,
                        "title": "Create Your Account",
                        "description": "Sign up and verify your membership in our community."
                    },
                    {
                        "id": "step-2",
                        "number": 2,
                        "title": "Post a Request or Offer",
                        "description": "Let the community know what you need or what you can provide."
                    },
                    {
                        "id": "step-3",
                        "number": 3,
                        "title": "Connect & Coordinate",
                        "description": "Use our messaging system to arrange the details."
                    },
                    {
                        "id": "step-4",
                        "number": 4,
                        "title": "Build Community",
                        "description": "Complete the exchange and strengthen community bonds."
                    }
                ]
            },
            {
                "id": "volunteer-1",
                "type": "volunteer_roles",
                "anchor": "volunteer",
                "title": "Volunteer With Us",
                "roles": [
                    {
                        "title": "Community Connector",
                        "time": "2-4 hours/week",
                        "description": "Help match requests with offers and facilitate connections between community members."
                    },
                    {
                        "title": "Delivery Driver",
                        "time": "Flexible schedule",
                        "description": "Help transport donated items and groceries to community members."
                    },
                    {
                        "title": "Event Helper",
                        "time": "As needed",
                        "description": "Assist with community gatherings, workshops, and special events."
                    }
                ],
                "cta": {"label": "Apply to Volunteer", "href": "/volunteer/apply", "variant": "primary"}
            },
            {
                "id": "cta-programs",
                "type": "cta_banner",
                "headline": "Need Help or Want to Offer Support?",
                "subheadline": "Join our community today and start making connections.",
                "primaryCta": {"label": "Get Started", "href": "/join", "variant": "primary"},
                "backgroundColor": "primary"
            }
        ]
    },
    {
        "id": "contact-simple",
        "name": "Contact - Simple",
        "description": "A simple contact page with organization info and FAQ.",
        "page_type": "contact",
        "category": "starter",
        "recommended_preset_id": "default",
        "blocks_json": [
            {
                "id": "hero-contact",
                "type": "hero",
                "headline": "Contact Us",
                "subheadline": "We'd love to hear from you. Reach out with questions, ideas, or just to say hello.",
                "alignment": "center",
                "minHeight": "small"
            },
            {
                "id": "contact-1",
                "type": "contact_block",
                "title": "Get In Touch",
                "subtitle": "Our team is here to help",
                "email": "hello@example.org",
                "phone": "(555) 123-4567",
                "address": "123 Community Lane, Anytown, AB T1X 2Y3",
                "hours": "Monday - Friday: 9am - 5pm",
                "socialLinks": [
                    {"platform": "facebook", "url": "https://facebook.com/example", "label": "Facebook"},
                    {"platform": "instagram", "url": "https://instagram.com/example", "label": "Instagram"},
                    {"platform": "email", "url": "mailto:hello@example.org", "label": "Email"}
                ]
            },
            {
                "id": "faq-1",
                "type": "faq_accordion",
                "title": "Frequently Asked Questions",
                "items": [
                    {
                        "q": "How do I join the community?",
                        "a": "Simply click the 'Join' button on our homepage and follow the registration process. Membership is free and open to all community members."
                    },
                    {
                        "q": "Is there a cost to use your services?",
                        "a": "No, all of our mutual aid services are free. We operate on the principle of community support and reciprocity."
                    },
                    {
                        "q": "How can I volunteer?",
                        "a": "Visit our Programs page and scroll to the volunteer section to see current opportunities and apply."
                    },
                    {
                        "q": "How do you ensure safety?",
                        "a": "We verify all members and have community guidelines in place. Our moderation team reviews activities and handles any concerns promptly."
                    }
                ]
            }
        ]
    },
    {
        "id": "home-nonprofit",
        "name": "Home - Nonprofit Organization",
        "description": "A nonprofit home page with donation widget, testimonials, and sponsor recognition.",
        "page_type": "home",
        "category": "nonprofit",
        "recommended_preset_id": "sunset",
        "blocks_json": [
            {
                "id": "announce-1",
                "type": "announcement_banner",
                "variant": "info",
                "title": "Year-End Campaign",
                "text": "Help us reach our goal of serving 500 more families this year!",
                "cta": {"label": "Donate Now", "href": "/donate", "variant": "primary"},
                "dismissible": True
            },
            {
                "id": "hero-nonprofit",
                "type": "hero",
                "headline": "Strengthening Communities Together",
                "subheadline": "For over a decade, we've been connecting neighbors and building resilient communities.",
                "ctas": [
                    {"label": "Donate", "href": "/donate", "variant": "primary"},
                    {"label": "Get Involved", "href": "/volunteer", "variant": "secondary"}
                ],
                "alignment": "center",
                "minHeight": "large"
            },
            {
                "id": "needs-1",
                "type": "needs_widget",
                "title": "Current Community Needs",
                "mode": "combined",
                "filters": {"urgency": "high_first", "limit": 4},
                "emptyStateText": "No urgent needs at this time. Check back soon!"
            },
            {
                "id": "testimonial-1",
                "type": "testimonial_quote",
                "quote": "When my family was going through a difficult time, this community stepped up in ways I never expected. They didn't just help us survive - they helped us feel like we belonged.",
                "name": "Rosa Martinez",
                "role": "Community Member",
                "image": {"src": "/images/testimonials/placeholder-1.jpg", "alt": "Rosa Martinez"}
            },
            {
                "id": "donate-1",
                "type": "donate_widget",
                "title": "Support Our Mission",
                "body": "<p>Your donation helps us continue serving our community. Every dollar goes directly to programs that connect neighbors and provide essential support.</p>",
                "donationLinks": [
                    {"label": "Donate via PayPal", "href": "https://paypal.com/example"},
                    {"label": "Donate via Stripe", "href": "https://stripe.com/example"}
                ],
                "suggestedAmounts": ["$25", "$50", "$100", "$250"]
            },
            {
                "id": "sponsors-1",
                "type": "sponsor_strip",
                "title": "Our Sponsors",
                "sponsoredLabel": True,
                "logos": [
                    {"name": "ABC Foundation", "src": "/images/sponsors/placeholder-1.png", "href": "#"},
                    {"name": "XYZ Corp", "src": "/images/sponsors/placeholder-2.png", "href": "#"},
                    {"name": "Community Bank", "src": "/images/sponsors/placeholder-3.png", "href": "#"}
                ]
            },
            {
                "id": "cta-nonprofit",
                "type": "cta_banner",
                "headline": "Join Our Community",
                "subheadline": "Be part of something meaningful. Connect, share, and grow together.",
                "primaryCta": {"label": "Sign Up Today", "href": "/join", "variant": "primary"},
                "secondaryCta": {"label": "Learn More", "href": "/about", "variant": "outline"},
                "backgroundColor": "accent"
            }
        ]
    }
]


class Command(BaseCommand):
    help = 'Seed the database with page templates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing templates before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            deleted_count, _ = TemplateLibrary.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted_count} existing templates')
            )

        created_count = 0
        updated_count = 0

        for template_data in TEMPLATES:
            # Get recommended preset if specified
            recommended_preset = None
            preset_id = template_data.pop('recommended_preset_id', None)
            if preset_id:
                try:
                    recommended_preset = ThemePreset.objects.get(id=preset_id)
                except ThemePreset.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Preset "{preset_id}" not found for template "{template_data["id"]}"'
                        )
                    )

            template, created = TemplateLibrary.objects.update_or_create(
                id=template_data['id'],
                defaults={
                    'name': template_data['name'],
                    'description': template_data['description'],
                    'page_type': template_data['page_type'],
                    'category': template_data['category'],
                    'blocks_json': template_data['blocks_json'],
                    'recommended_preset': recommended_preset,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated template: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {created_count}, Updated {updated_count} templates.'
            )
        )
