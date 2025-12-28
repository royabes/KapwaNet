# KapwaNet – Sprint 0–2 Development Backlog

This backlog converts the PRD into **build-ready tasks** suitable for AI agents and human contributors. Each ticket includes scope boundaries and acceptance criteria.

---

## Sprint 0 – Foundation & Repo Setup

**Goal:** A running skeleton with deployment, no features yet.

### EPIC S0-A: Repository & Tooling

**S0-A1. Create monorepo structure**

* apps/web (Next.js)
* apps/api (Django + Wagtail)
* infra/
* docs/
  **Acceptance:** Repo builds without errors; directories committed.

**S0-A2. Docker Compose (dev & prod baseline)**

* Services: web, api, db
* Named volumes for Postgres and media
* Healthchecks
  **Acceptance:** `docker compose up` brings all services up cleanly.

**S0-A3. Environment configuration**

* `.env.example` created
* Secrets excluded from repo
  **Acceptance:** New developer can boot locally using example env.

---

### EPIC S0-B: Backend Skeleton

**S0-B1. Django project initialization**

* Django REST Framework installed
* Wagtail installed
* API app scaffolded
  **Acceptance:** Django server runs; Wagtail admin reachable.

**S0-B2. Auth baseline**

* User model (email login)
* Superuser creation
  **Acceptance:** Admin can log in and access admin panel.

---

### EPIC S0-C: Frontend Skeleton

**S0-C1. Next.js app scaffold**

* App router or pages router
* Tailwind or base styling system
  **Acceptance:** Frontend loads at `/`.

**S0-C2. API connectivity**

* Env-based API base URL
* Sample fetch from backend
  **Acceptance:** Frontend can fetch a test endpoint.

---

## Sprint 1 – Styling Engine & Templates (Differentiator)

**Goal:** Orgs can style and launch a public site using templates.

### EPIC S1-A: Organization & Theme Models

**S1-A1. Organization model**

* organizations table
* slug, name, region
  **Acceptance:** Org can be created via admin.

**S1-A2. Theme token schema**

* org_theme JSON field
* Seed theme presets
  **Acceptance:** Org theme stored and retrievable via API.

---

### EPIC S1-B: Styling Engine (Frontend)

**S1-B1. Theme provider**

* Inject CSS variables from org_theme
  **Acceptance:** Changing theme JSON changes site colors/fonts.

**S1-B2. Theme presets switcher (admin-only)**

* Select preset → apply
  **Acceptance:** Preset applies instantly and persists.

---

### EPIC S1-C: Block Renderer

**S1-C1. Core block components**

* Hero
* RichTextSection
* CardGrid
* Steps
* CTABanner
* ContactBlock
  **Acceptance:** Blocks render correctly with sample JSON.

**S1-C2. Block registry**

* Map block `type` → React component
  **Acceptance:** Unknown block types fail gracefully.

---

### EPIC S1-D: Template Library

**S1-D1. Template seed data**

* Home, About, Programs templates
  **Acceptance:** Templates exist in DB and selectable.

**S1-D2. Create page from template**

* Clone blocks into new page
  **Acceptance:** New page created with editable blocks.

---

## Sprint 2 – Core Community Features

**Goal:** Enable real bayanihan activity and sharing.

### EPIC S2-A: Membership & Roles

**S2-A1. Membership model**

* user ↔ org ↔ role
  **Acceptance:** Roles enforced on API endpoints.

**S2-A2. Invite flow**

* Invite link
* Accept invite
  **Acceptance:** User joins org with assigned role.

---

### EPIC S2-B: Bayanihan Help

**S2-B1. Help post models**

* Request / Offer
* Categories
* Status flow
  **Acceptance:** Help posts create/update correctly.

**S2-B2. Matching flow**

* Express interest
* Accept match
  **Acceptance:** Match creates message thread.

---

### EPIC S2-C: Item Sharing

**S2-C1. Item post models**

* Offer / Request
* Food safety fields
  **Acceptance:** Items enforce required fields.

**S2-C2. Reservation flow**

* Reserve
* Confirm pickup
  **Acceptance:** Status updates correctly.

---

### EPIC S2-D: Messaging

**S2-D1. Thread model**

* One thread per match/reservation
  **Acceptance:** Messages persist and display.

---

### EPIC S2-E: Moderation

**S2-E1. Reporting system**

* Report user/post
  **Acceptance:** Reports visible to moderators.

**S2-E2. Moderator actions**

* Warn, remove, suspend
  **Acceptance:** Actions logged and enforced.

---

## Definition of Done (All Tickets)

* Code committed
* Permissions enforced
* Basic manual test steps written
* No secrets committed

---

## Notes for AI Agents

* Implement **one ticket at a time**
* Never skip acceptance criteria
* Ask for clarification if scope unclear
* Do not introduce features outside ticket scope
