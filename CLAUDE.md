# Claude Code Project Instructions

## Git Commit Rules

**CRITICAL: Do NOT include Co-Authored-By lines in commit messages.**

When making commits:
- Use simple commit messages without attribution footers
- Never add `Co-Authored-By: Claude` or similar lines
- The commit author should be the repository owner only

## License

This project uses AGPL-3.0 License.
All source files should include appropriate license headers as needed.

---

# KapwaNet - Community Platform for Dignified Mutual Aid

## Project Overview

KapwaNet is a community platform rooted in the Filipino concept of *kapwa* (shared humanity). It enables organizations to:

1. **Run dignified bayanihan (mutual aid)** - Request/offer help matching
2. **Share essential goods** - Food, clothing, essentials with safety fields
3. **Communicate internally** - Announcements, discussions, direct messaging
4. **Launch branded websites** - Powerful theming and template system

### Key Principles

- **Peer-to-peer**: Platform, not a service provider
- **Organization-first**: Deployable per org (multi-tenant)
- **Dignity-centered**: Not charity-only; mutual exchange
- **Open-source**: AGPL-3.0, community-owned

---

## Project Status

| Sprint | Name | Status |
|--------|------|--------|
| 0 | Foundation & Repo Setup | Pending |
| 1 | Styling Engine & Templates | Pending |
| 2 | Core Community Features | Pending |

---

## Technology Stack

### Frontend
- **Next.js 14+** (React with App Router)
- **TypeScript**
- **Tailwind CSS** (styling)
- **CSS Variables** for theming

### Backend
- **Django 5.0+** with Django REST Framework
- **Wagtail CMS** for content management
- **PostgreSQL** database
- **JWT Authentication** (djangorestframework-simplejwt)

### Infrastructure
- **Docker Compose** for development and deployment
- **Nginx** reverse proxy (production)
- **Let's Encrypt** TLS (production)

---

## Directory Structure

```
kapwanet/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   └── lib/      # Utilities, API client
│   │   └── package.json
│   └── api/              # Django backend
│       ├── kapwanet/     # Django project
│       ├── organizations/
│       ├── users/
│       ├── help/
│       ├── items/
│       ├── messaging/
│       └── moderation/
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/
├── harness/              # Autonomous coding harness
│   ├── run_harness.py
│   └── prompts/
├── docs/
│   └── plan/            # PRD, architecture, specs
├── .claude/             # Harness feature lists
└── .beads/              # Task tracking
```

---

## Running the Application

### Prerequisites
```bash
# Docker and Docker Compose
docker --version
docker-compose --version

# Node.js 18+ (for local frontend dev)
node --version

# Python 3.10+ (for local backend dev)
python3 --version
```

### Development with Docker

```bash
# Build and start all services
docker-compose up --build

# Services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Admin: http://localhost:8000/admin/
```

### Local Development (without Docker)

```bash
# Backend
cd apps/api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (separate terminal)
cd apps/web
npm install
npm run dev
```

---

## Core Modules

### 1. Organizations & Theming
- Multi-tenant organization model
- Theme tokens (colors, fonts, spacing, radius)
- CSS variable injection
- Theme presets

### 2. Block Renderer
20 block types for page building:
- Hero, RichTextSection, CardGrid, CTABanner
- ContactBlock, FAQAccordion, TeamGrid
- NeedsWidget (for help/items display)

### 3. Bayanihan Help
- Request/offer posts
- Matching flow with messaging
- Status: Open → Matched → Completed
- Urgency levels

### 4. Item Sharing
- Food, clothing, essentials
- Food safety fields (expiry, allergens)
- Reservation → Pickup flow

### 5. Moderation
- Report system for content/users
- Moderator dashboard
- Actions: warn, remove, suspend, ban
- Audit logging

---

## Harness (Autonomous Coding)

The harness enables Claude to autonomously implement features from sprint backlogs.

### Usage
```bash
cd harness
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run Sprint 0
python run_harness.py --sprint 0
```

### Options
- `--sprint N` - Sprint number (0, 1, 2)
- `--model MODEL` - opus, sonnet, or haiku
- `--max-iterations N` - Limit iterations per run

### Feature Lists
Located at `.claude/sprint{N}_feature_list.json`

---

## API Endpoints

### Organizations
- `GET /api/organizations/` - List organizations
- `GET /api/organizations/{slug}/` - Get org by slug
- `GET /api/organizations/{id}/theme/` - Get org theme

### Help Posts
- `GET /api/help-posts/` - List help posts
- `POST /api/help-posts/` - Create help post
- `POST /api/help-posts/{id}/express-interest/` - Express interest
- `POST /api/help-posts/{id}/accept-match/` - Accept match

### Item Posts
- `GET /api/item-posts/` - List item posts
- `POST /api/item-posts/` - Create item post
- `POST /api/item-posts/{id}/reserve/` - Reserve item
- `POST /api/item-posts/{id}/confirm-pickup/` - Confirm pickup

### Messaging
- `GET /api/threads/` - List message threads
- `GET /api/threads/{id}/messages/` - Get messages
- `POST /api/threads/{id}/messages/` - Send message

---

## Key Constraints

### Multi-Tenancy
- **Every query must filter by org_id**
- Membership checks required for all portal endpoints
- Admin-only actions require `role == 'org_admin'`

### Safety
- No exact addresses - only approximate location
- No payments between users
- Prohibited items/services enforced
- Food safety fields required for food items

### Privacy
- Alberta PIPA-aligned data handling
- Minimal data collection
- User consent for messaging

---

## Theme System

### CSS Variables
```css
--kn-primary      /* Primary brand color */
--kn-secondary    /* Secondary color */
--kn-accent       /* Accent/highlight */
--kn-bg           /* Background */
--kn-surface      /* Surface/card background */
--kn-text         /* Primary text */
--kn-muted        /* Muted text */
--kn-radius-sm/md/lg/xl   /* Border radius */
--kn-font-heading /* Heading font */
--kn-font-body    /* Body font */
```

### Theme JSON Structure
```json
{
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
```

---

## Testing

```bash
# Backend tests
cd apps/api
python manage.py test

# Frontend tests
cd apps/web
npm test

# Docker-based tests
docker-compose exec api python manage.py test
docker-compose exec web npm test
```

---

## Common Development Tasks

### Create a new Django app
```bash
cd apps/api
python manage.py startapp appname
```

### Create migrations
```bash
docker-compose exec api python manage.py makemigrations
docker-compose exec api python manage.py migrate
```

### Add a new block type
1. Add component in `apps/web/src/components/blocks/`
2. Register in block registry
3. Define props schema
4. Add to template library

---

## Environment Variables

### Required
```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgres://user:pass@db:5432/kapwanet

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Optional
```bash
# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=user
EMAIL_HOST_PASSWORD=pass

# Storage
AWS_S3_BUCKET=kapwanet-media
```

---

## Philosophy

> Communities already have what they need — they just need the right infrastructure to connect.

KapwaNet exists to make that connection dignified, safe, and sustainable.
