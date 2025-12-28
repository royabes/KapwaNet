# KapwaNet

**KapwaNet** is an open‑source community platform rooted in the Filipino concept of *kapwa* — shared humanity.

It enables organizations to run dignified **bayanihan (mutual aid)**, **share essential goods**, and manage **community communications** through a branded, easy‑to‑deploy digital platform.

KapwaNet is designed to be:

* 🧭 **Dignity‑centered** (not charity‑only)
* 🧩 **Organization‑first** (deployable per org)
* 🏗️ **Infrastructure, not a marketplace**
* 🌱 **Open‑source and extensible**

---

## What KapwaNet Is

KapwaNet provides:

* A **public website** (CMS‑driven)
* A **member portal** (login‑based)
* Built‑in **bayanihan help** (peer‑to‑peer volunteer support)
* **Item sharing** for food, clothing, and essentials
* **Internal communications** for members and volunteers
* A powerful **styling + template system** so orgs can launch fast

It is **not**:

* A gig marketplace
* A booking or payments platform
* A professional services broker

---

## Core Modules

### 1. CMS & Public Website

* Editable pages (Home, About, Programs, Get Involved, Contact)
* News & announcements
* Media library
* Draft → Review → Publish workflow

### 2. Styling & Templates (Key Differentiator)

* Theme tokens (colors, fonts, spacing, buttons)
* Curated theme presets
* Block‑based page templates
* Template library (Home, About, Programs, Campaigns, Portal)
* Replace text/images, reorder blocks, preview before publish

### 3. Bayanihan Help

* Post help requests or offers
* Non‑regulated categories only
* Matching and messaging
* Status flow: Open → Matched → Completed
* Safety reporting and moderation

### 4. Item Sharing

* Offer/request items (food, clothing, essentials)
* Reservation and pickup coordination
* Food‑specific safety fields
* Prohibited items enforcement

### 5. Internal Communications

* Internal announcements
* Member discussions (basic)
* Direct messaging

### 6. Moderation & Trust

* Reporting (posts, users, messages)
* Moderator dashboard
* Actions: warn, remove, suspend
* Audit logs

---

## Architecture Overview

KapwaNet uses a **modular monolith** architecture optimized for clarity, stability, and open‑source contribution.

**Frontend**

* Next.js (React)

**Backend**

* Django REST Framework
* Wagtail CMS

**Database**

* PostgreSQL

**Deployment**

* Docker Compose
* VPS‑friendly (DigitalOcean Droplet recommended)
* Nginx + Let’s Encrypt

---

## Deployment Modes

### Mode A: One Org per VPS (Recommended for pilots)

* Clean isolation
* Simple ops
* Predictable cost

### Mode B: Multi‑Org Hosted Instance (Later)

* Federated orgs
* Shared infrastructure
* Requires stronger moderation and tenancy controls

---

## Installation (High‑Level)

```bash
# Clone the repo
git clone https://github.com/your-org/kapwanet.git
cd kapwanet

# Configure environment variables
cp .env.example .env

# Start services
docker compose up -d --build

# Run migrations & create admin
docker compose exec api python manage.py migrate
docker compose exec api python manage.py createsuperuser
```

Detailed setup instructions are available in `/docs`.

---

## Open Source & License

KapwaNet is released under the **AGPL‑3.0** license.

This ensures:

* Improvements remain open
* Hosted services share modifications
* Communities benefit collectively

---

## Contributing

We welcome contributors who align with KapwaNet’s values:

* Respect and dignity
* Safety‑first design
* Simplicity over cleverness

Please read:

* `CONTRIBUTING.md`
* `CODE_OF_CONDUCT.md`
* `KapwaNet – AI‑Assisted Build & Contributor Instructions`

---

## Roadmap Snapshot

**Phase 1 (MVP)**

* Core platform + templates
* Bayanihan Help
* Item Sharing
* Moderation

**Phase 2**

* Groups & volunteer boards
* Events
* Custom domains

**Phase 3**

* Federation
* Optional AI assistance
* Sponsors / sustainability tools

---

## Philosophy

KapwaNet is built on the belief that:

> Communities already have what they need — they just need the right infrastructure to connect.

KapwaNet exists to make that connection dignified, safe, and sustainable.
