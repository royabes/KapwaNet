# KapwaNet – Database Schema & Data Contracts (v1)

## Purpose

This document defines KapwaNet’s **database schema** and **core data contracts** to prevent drift during AI-assisted implementation.

**Core rule:** Every record that is organization-scoped must include `org_id` and enforce tenant isolation in queries.

---

## 1) Entity Relationship Overview

### Identity & Tenancy

* organizations
* users
* memberships
* invites
* org_settings (feature flags)
* org_theme

### CMS (Wagtail-managed)

* Wagtail page models + media
* Optional: template_library (presets)

### Community Modules

* help_posts
* help_matches
* item_posts
* item_reservations

### Messaging

* threads
* messages
* blocks

### Moderation & Safety

* reports
* moderation_actions

---

## 2) PostgreSQL DDL (Core Tables)

> Types are indicative; adjust for Django migrations.

### 2.1 organizations

```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  region          TEXT,
  logo_url        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  display_name    TEXT,
  phone           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_staff        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 memberships

```sql
CREATE TABLE memberships (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('org_admin','moderator','member')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','left')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX idx_memberships_org ON memberships(org_id);
```

### 2.4 invites

```sql
CREATE TABLE invites (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('org_admin','moderator','member')),
  token           TEXT UNIQUE NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invites_org ON invites(org_id);
```

### 2.5 org_settings (feature flags + policy links)

```sql
CREATE TABLE org_settings (
  org_id          UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  feature_flags   JSONB NOT NULL DEFAULT '{}'::jsonb,
  policy_links    JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.6 org_theme (design tokens)

```sql
CREATE TABLE org_theme (
  org_id          UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  theme_json      JSONB NOT NULL,
  preset_id       TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3) Template Library (Presets)

### 3.1 template_library

```sql
CREATE TABLE template_library (
  id              UUID PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  page_type       TEXT NOT NULL,
  preview_hint    TEXT,
  preview_image   TEXT,
  recommended_theme_preset TEXT,
  blocks_json     JSONB NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_library_type ON template_library(page_type);
```

**Note:** Template library can be global (no org_id) for open-source defaults.

---

## 4) Bayanihan Help

### 4.1 help_posts

```sql
CREATE TABLE help_posts (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('request','offer')),
  category        TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  urgency         TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low','normal','high')),
  approx_location TEXT,
  availability    JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility      TEXT NOT NULL DEFAULT 'org' CHECK (visibility IN ('org','public')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','completed','cancelled')),
  created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_help_posts_org ON help_posts(org_id);
CREATE INDEX idx_help_posts_status ON help_posts(status);
```

### 4.2 help_matches

```sql
CREATE TABLE help_matches (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  help_post_id    UUID NOT NULL REFERENCES help_posts(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  helper_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_help_matches_org ON help_matches(org_id);
CREATE INDEX idx_help_matches_post ON help_matches(help_post_id);
```

---

## 5) Item Sharing

### 5.1 item_posts

```sql
CREATE TABLE item_posts (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('offer','request')),
  category        TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  quantity        INTEGER,
  condition       TEXT,
  photos          JSONB NOT NULL DEFAULT '[]'::jsonb,
  pickup_window   JSONB NOT NULL DEFAULT '{}'::jsonb,
  approx_location TEXT,
  food_expiry     DATE,
  food_allergens  TEXT,
  food_storage    TEXT,
  visibility      TEXT NOT NULL DEFAULT 'org' CHECK (visibility IN ('org','public')),
  status          TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','completed','cancelled')),
  created_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_item_posts_org ON item_posts(org_id);
CREATE INDEX idx_item_posts_status ON item_posts(status);
```

### 5.2 item_reservations

```sql
CREATE TABLE item_reservations (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_post_id    UUID NOT NULL REFERENCES item_posts(id) ON DELETE CASCADE,
  requester_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','confirmed','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_item_reservations_org ON item_reservations(org_id);
CREATE INDEX idx_item_reservations_post ON item_reservations(item_post_id);
```

---

## 6) Messaging

### 6.1 threads

```sql
CREATE TABLE threads (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  thread_type     TEXT NOT NULL CHECK (thread_type IN ('help_match','item_reservation','direct')),
  ref_id          UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_threads_org ON threads(org_id);
```

### 6.2 messages

```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  thread_id       UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  message_type    TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user','system')),
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_thread ON messages(thread_id);
```

### 6.3 blocks (user-to-user)

```sql
CREATE TABLE blocks (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, blocker_user_id, blocked_user_id)
);
```

---

## 7) Moderation & Safety

### 7.1 reports

```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_type     TEXT NOT NULL CHECK (target_type IN ('user','help_post','item_post','message')),
  target_id       UUID NOT NULL,
  reason_code     TEXT NOT NULL,
  details         TEXT,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','closed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_org ON reports(org_id);
CREATE INDEX idx_reports_status ON reports(status);
```

### 7.2 moderation_actions

```sql
CREATE TABLE moderation_actions (
  id              UUID PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  moderator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type     TEXT NOT NULL CHECK (action_type IN ('warn','remove','suspend','ban')),
  target_type     TEXT NOT NULL CHECK (target_type IN ('user','help_post','item_post','message')),
  target_id       UUID NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moderation_actions_org ON moderation_actions(org_id);
```

---

## 8) Data Contracts (API Payload Shapes)

### 8.1 Organization

```json
{
  "id": "uuid",
  "slug": "string",
  "name": "string",
  "region": "string",
  "logo_url": "string"
}
```

### 8.2 Theme

```json
{
  "org_id": "uuid",
  "preset_id": "string",
  "theme_json": { "primaryColor": "#...", "fontHeading": "Inter", "radius": "md" }
}
```

### 8.3 Page Blocks

```json
{
  "slug": "string",
  "title": "string",
  "blocks": [ { "id": "b1", "type": "Hero", "props": {} } ]
}
```

### 8.4 Help Post

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "type": "request|offer",
  "category": "string",
  "title": "string",
  "description": "string",
  "urgency": "low|normal|high",
  "approx_location": "string",
  "visibility": "org|public",
  "status": "open|matched|completed|cancelled",
  "created_by": { "id": "uuid", "display_name": "string" },
  "created_at": "iso"
}
```

### 8.5 Item Post

```json
{
  "id": "uuid",
  "org_id": "uuid",
  "type": "offer|request",
  "category": "string",
  "title": "string",
  "description": "string",
  "quantity": 1,
  "photos": [ { "src": "string", "alt": "string" } ],
  "visibility": "org|public",
  "status": "available|reserved|completed|cancelled",
  "created_by": { "id": "uuid", "display_name": "string" },
  "created_at": "iso"
}
```

---

## 9) Tenant Isolation Requirements

* Every query filtered by `org_id` unless table is truly global.
* Membership checks required for all portal endpoints.
* Admin-only actions require role == org_admin.

---

## 10) Migration Notes (Django)

* Prefer UUID primary keys.
* Use Django constraints to mirror SQL CHECK constraints.
* Add indexes for org_id and status fields.
* Avoid storing exact addresses; only approximate location.
