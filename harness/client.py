"""
KapwaNet Claude SDK Client Configuration
========================================

Claude SDK client specifically configured for KapwaNet community platform.
"""

import json
from pathlib import Path

from claude_code_sdk import ClaudeCodeOptions, ClaudeSDKClient
from claude_code_sdk.types import HookMatcher

from security import bash_security_hook


# Built-in tools for development
BUILTIN_TOOLS = [
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep",
    "Bash",
]


def create_client(project_dir: Path, model: str, phase: str, app_name: str = "kapwanet") -> ClaudeSDKClient:
    """
    Create a Claude Agent SDK client for KapwaNet.

    Args:
        project_dir: Directory for the project
        model: Claude model to use
        phase: Current sprint (e.g., "0", "1", "2")
        app_name: Name of the app being built

    Returns:
        Configured ClaudeSDKClient

    Security layers (defense in depth):
    1. Sandbox - OS-level bash command isolation
    2. Permissions - File operations restricted to project_dir only
    3. Security hooks - Bash commands validated against an allowlist

    Note: Uses existing Claude CLI authentication (Anthropic Max or API key).
    """
    # Create security settings
    security_settings = {
        "sandbox": {"enabled": True, "autoAllowBashIfSandboxed": True},
        "permissions": {
            "defaultMode": "acceptEdits",
            "allow": [
                # Allow all file operations within project
                "Read(./**)",
                "Write(./**)",
                "Edit(./**)",
                "Glob(./**)",
                "Grep(./**)",
                # Bash permission (commands validated by hook)
                "Bash(*)",
            ],
        },
    }

    # Ensure directories exist
    project_dir.mkdir(parents=True, exist_ok=True)
    claude_dir = project_dir / ".claude"
    claude_dir.mkdir(parents=True, exist_ok=True)

    # Write settings file
    settings_file = claude_dir / "settings.json"
    with open(settings_file, "w") as f:
        json.dump(security_settings, f, indent=2)

    print(f"Created security settings at {settings_file}")
    print("   - Sandbox enabled (OS-level bash isolation)")
    print(f"   - Filesystem restricted to: {project_dir.resolve()}")
    print("   - Bash commands restricted to allowlist (see security.py)")
    print()

    # System prompt for KapwaNet
    system_prompt = f"""You are an expert developer building KapwaNet - a community platform for dignified mutual aid (bayanihan).

## Project Overview

KapwaNet is rooted in the Filipino concept of *kapwa* (shared humanity). It enables organizations to:
- Run dignified bayanihan (mutual aid)
- Share essential goods
- Communicate internally through a branded, easy-to-deploy digital platform

Key principles:
- **Peer-to-peer**: Platform, not a service provider
- **Organization-first**: Deployable per org
- **Dignity-centered**: Not charity-only
- **Open-source**: Extensible and community-owned

## Architecture

**Frontend**: Next.js (React)
- Server-side rendering for public pages
- Client-side rendering for member portal

**Backend**: Django REST Framework + Wagtail CMS
- JWT-based authentication
- Multi-tenancy via org_id on all records

**Database**: PostgreSQL

**Deployment**: Docker Compose (VPS-friendly)

## Core Modules

1. **CMS & Public Website** - Editable pages, news, media library
2. **Styling & Templates** (Key Differentiator) - Theme tokens, block-based templates
3. **Bayanihan Help** - Request/offer matching, messaging, status flow
4. **Item Sharing** - Food/clothing/essentials with safety fields
5. **Internal Communications** - Announcements, discussions, DMs
6. **Moderation & Trust** - Reporting, moderator dashboard, audit logs

## Directory Structure

```
kapwanet/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Django + Wagtail backend
├── infra/            # Docker, nginx, scripts
├── docs/             # PRD, policies, guides
└── harness/          # Autonomous coding harness
```

## Key Constraints

- **Tenant isolation**: Every query must filter by org_id
- **No exact addresses**: Only approximate location stored
- **No payments**: Peer-to-peer platform only
- **Safety first**: Prohibited items/services enforced
- **PIPA compliant**: Alberta privacy law aligned

## Theme System

Blocks must use CSS variables:
- `--kn-primary`, `--kn-secondary`, `--kn-accent`
- `--kn-bg`, `--kn-surface`, `--kn-text`, `--kn-muted`
- `--kn-radius-sm/md/lg/xl`
- `--kn-font-heading`, `--kn-font-body`

## Block Types

Hero, AnnouncementBanner, RichTextSection, ImageTextSplit, CardGrid,
Steps, StatsStrip, TestimonialQuote, FAQAccordion, CTABanner,
NewsList, NeedsWidget, SponsorStrip, ContactBlock, TeamGrid,
PartnerLogos, DonateWidget, VolunteerRoles, EventList, ResourceLinks

## Current Sprint: {phase}

Project Directory: {project_dir.resolve()}

## Key Guidelines

1. **Follow the feature list**: `.claude/sprint{phase}_feature_list.json`
2. **Mark features passing ONLY after**:
   - All acceptance criteria are met
   - Regression tests pass (all previous features still work)
   - Docker compose up works cleanly
3. **Write clean, documented code**
4. **Use org_id isolation** everywhere
5. **Test Docker builds** before marking complete
6. **Verify API endpoints** respond correctly

## Definition of Done (Per Feature)

- Code committed
- Permissions enforced (org_id)
- Basic manual test steps written
- No secrets committed
- Docker services start cleanly

## Testing Protocol

After implementing each feature:
1. Run ALL previous tests (regression)
2. Verify no new failures
3. Check Docker Compose brings up all services
4. Only then mark feature as `"passes": true`

## CRITICAL RULES

- NEVER hardcode org-specific data
- ALWAYS filter by org_id in queries
- NEVER skip permission checks
- ALWAYS sanitize HTML in rich text blocks
- ALWAYS validate tenant isolation
"""

    return ClaudeSDKClient(
        options=ClaudeCodeOptions(
            model=model,
            system_prompt=system_prompt,
            allowed_tools=BUILTIN_TOOLS,
            hooks={
                "PreToolUse": [
                    HookMatcher(matcher="Bash", hooks=[bash_security_hook]),
                ],
            },
            max_turns=1000,
            cwd=str(project_dir.resolve()),
            settings=str(settings_file.resolve()),
        )
    )
