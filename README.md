# KapwaNet

**KapwaNet** is an open-source community platform rooted in the Filipino concept of *kapwa* — shared humanity.

It enables organizations to run dignified **bayanihan (mutual aid)**, **share essential goods**, and manage **community communications** through a branded, easy-to-deploy digital platform.

## Key Principles

- **Dignity-centered** — Not charity-only; mutual exchange
- **Organization-first** — Deployable per org (multi-tenant)
- **Peer-to-peer** — Platform infrastructure, not a marketplace
- **Open-source** — AGPL-3.0, community-owned

---

## Quick Start

### Using the Autonomous Harness

The fastest way to build KapwaNet is with the autonomous coding harness:

```bash
# 1. Set up harness
cd harness
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Run Sprint 0 (Foundation)
python run_harness.py --sprint 0
```

See [harness/README.md](harness/README.md) for full harness documentation.

### Manual Development

```bash
# With Docker (recommended)
docker-compose up --build

# Services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Admin: http://localhost:8000/admin/
```

---

## Project Structure

```
kapwanet/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Django + Wagtail backend
├── infra/            # Docker, nginx configs
├── harness/          # Autonomous coding harness
├── docs/             # Documentation
├── .claude/          # Feature lists for harness
└── .beads/           # Task tracking (Beads)
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Backend | Django 5.0+, Django REST Framework, Wagtail CMS |
| Database | PostgreSQL |
| Auth | JWT (djangorestframework-simplejwt) |
| Deployment | Docker Compose, Nginx |

---

## Core Modules

### 1. CMS & Public Website
Editable pages, news, media library with draft → review → publish workflow.

### 2. Styling & Templates (Key Differentiator)
- Theme tokens (colors, fonts, spacing)
- Curated theme presets
- 20 block types for page building
- Template library for quick site launch

### 3. Bayanihan Help
- Post help requests or offers
- Matching and messaging
- Status flow: Open → Matched → Completed

### 4. Item Sharing
- Offer/request items (food, clothing, essentials)
- Food safety fields (expiry, allergens)
- Reservation and pickup coordination

### 5. Moderation & Trust
- Reporting system
- Moderator dashboard
- Audit logs

---

## Development Sprints

| Sprint | Name | Features |
|--------|------|----------|
| 0 | Foundation | Monorepo, Docker, Django/Next.js skeletons |
| 1 | Styling & Templates | Theme engine, block renderer, template library |
| 2 | Community Features | Help posts, item sharing, messaging, moderation |

Feature lists: `.claude/sprint{N}_feature_list.json`

---

## Documentation

- [CLAUDE.md](CLAUDE.md) — Project instructions for Claude Code
- [AGENTS.md](AGENTS.md) — AI agent workflow with Beads
- [docs/plan/prd.md](docs/plan/prd.md) — Product Requirements Document
- [docs/plan/architecture.md](docs/plan/architecture.md) — System Architecture
- [docs/plan/schema.md](docs/plan/schema.md) — Database Schema
- [docs/plan/block_renderer.md](docs/plan/block_renderer.md) — Block Specifications

---

## Task Tracking (Beads)

This project uses [Beads](https://github.com/steveyegge/beads) for AI-native issue tracking.

```bash
# Initialize Beads
bd init

# See available tasks
bd ready

# Start working on a task
bd update <task-id> --status in_progress

# Complete and sync
bd close <task-id> --reason done
bd sync
```

---

## License

**AGPL-3.0** — Improvements remain open, hosted services share modifications.

---

## Philosophy

> Communities already have what they need — they just need the right infrastructure to connect.

KapwaNet exists to make that connection dignified, safe, and sustainable.
