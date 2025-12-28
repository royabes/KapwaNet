# KapwaNet – Block Renderer Specification (v1)

## Purpose

This document defines the **canonical block types**, their **props contracts**, and required rendering behaviors for KapwaNet’s **template + styling system**.

**Key rule:** Blocks must be safe to render from stored JSON. Validate props, apply theme tokens, and fail gracefully.

---

## Global Conventions

### 1) Block JSON Shape

Every page is an ordered array of blocks:

```json
{
  "id": "b1",
  "type": "Hero",
  "props": { "...": "..." }
}
```

### 2) Required Fields

* `id` (string, unique within page)
* `type` (string, must match registered block)
* `props` (object)

### 3) Rendering Rules

* Unknown `type` → render `UnknownBlock` placeholder (admin-only) or omit (public).
* Validate required props; use defaults when missing.
* All blocks must be **responsive** and accessible.

### 4) Theme Tokens

Blocks must use CSS variables:

* `--kn-primary`, `--kn-secondary`, `--kn-accent`
* `--kn-bg`, `--kn-surface`, `--kn-text`, `--kn-muted`
* `--kn-radius-sm/md/lg/xl`
* `--kn-spacing-compact/comfortable`
* `--kn-font-heading`, `--kn-font-body`

---

## Block Registry

A central registry maps type → component:

* `Hero`
* `AnnouncementBanner`
* `RichTextSection`
* `ImageTextSplit`
* `CardGrid`
* `Steps`
* `StatsStrip`
* `TestimonialQuote`
* `FAQAccordion`
* `CTABanner`
* `NewsList`
* `NeedsWidget`
* `SponsorStrip`
* `ContactBlock`
* `TeamGrid`
* `PartnerLogos`
* `DonateWidget`
* `VolunteerRoles`
* `EventList`
* `ResourceLinks`

---

# Block Specs

## 1) Hero

### Purpose

Top-of-page hero with headline, supporting text, CTAs, optional background image.

### Props

```json
{
  "headline": "string (required)",
  "subheadline": "string (optional)",
  "primaryCta": { "label": "string", "href": "string" },
  "secondaryCta": { "label": "string", "href": "string" },
  "backgroundImage": { "src": "string", "alt": "string" },
  "showOverlay": "boolean (default true)
}
```

### Behavior

* Render heading as H1.
* If backgroundImage present, render with overlay for contrast.
* CTAs optional; if missing, omit button row.

---

## 2) AnnouncementBanner

### Props

```json
{
  "variant": "info|warning|success (default info)",
  "title": "string (optional)",
  "text": "string (required)",
  "cta": { "label": "string", "href": "string" },
  "dismissible": "boolean (default false)"
}
```

### Behavior

* If dismissible, store dismissal in local storage (client only).

---

## 3) RichTextSection

### Props

```json
{
  "title": "string (optional)",
  "body": "string (required, HTML or portable rich text)",
  "alignment": "left|center (default left)"
}
```

### Behavior

* Sanitize HTML before rendering.
* Render title as H2 when present.

---

## 4) ImageTextSplit

### Props

```json
{
  "anchor": "string (optional)",
  "title": "string (required)",
  "body": "string (required, HTML)",
  "image": { "src": "string", "alt": "string" },
  "imagePosition": "left|right (default right)"
}
```

---

## 5) CardGrid

### Props

```json
{
  "anchor": "string (optional)",
  "title": "string (optional)",
  "columns": "2|3|4 (default 3)",
  "cards": [
    {
      "title": "string (required)",
      "text": "string (optional)",
      "icon": "string (optional)",
      "image": { "src": "string", "alt": "string" },
      "cta": { "label": "string", "href": "string" }
    }
  ]
}
```

### Behavior

* Cards must be equal height.
* Icons optional.

---

## 6) Steps

### Props

```json
{
  "title": "string (optional)",
  "steps": [
    { "title": "string (required)", "text": "string (optional)" }
  ]
}
```

---

## 7) StatsStrip

### Props

```json
{
  "items": [
    { "label": "string", "value": "string" }
  ]
}
```

---

## 8) TestimonialQuote

### Props

```json
{
  "quote": "string (required)",
  "name": "string (optional)",
  "role": "string (optional)",
  "image": { "src": "string", "alt": "string" }
}
```

---

## 9) FAQAccordion

### Props

```json
{
  "title": "string (optional)",
  "items": [
    { "q": "string (required)", "a": "string (required)" }
  ]
}
```

### Behavior

* Keyboard accessible accordion.

---

## 10) CTABanner

### Props

```json
{
  "title": "string (required)",
  "text": "string (optional)",
  "primaryCta": { "label": "string", "href": "string" },
  "secondaryCta": { "label": "string", "href": "string" }
}
```

---

## 11) NewsList

### Props

```json
{
  "title": "string (optional)",
  "limit": "number (default 3)",
  "source": "public|member_only (default public)",
  "showFilters": "boolean (default false)",
  "filters": { "tags": "boolean", "categories": "boolean" },
  "cta": { "label": "string", "href": "string" }
}
```

### Data Contract

* Backend endpoint returns: id, title, excerpt, published_at, slug, image.

---

## 12) NeedsWidget

### Props

```json
{
  "title": "string (optional)",
  "mode": "combined|help_only|items_only (default combined)",
  "filters": {
    "urgency": "any|high_first (default any)",
    "category": "string (optional)",
    "limit": "number (default 6)"
  },
  "emptyStateText": "string (optional)"
}
```

### Data Contract

* Returns summarized rows with safe content only.

---

## 13) SponsorStrip

### Props

```json
{
  "title": "string (optional)",
  "logos": [
    { "name": "string", "src": "string", "href": "string" }
  ],
  "sponsoredLabel": "boolean (default true)"
}
```

---

## 14) ContactBlock

### Props

```json
{
  "title": "string (optional)",
  "orgName": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "hours": "string (optional)",
  "mapLink": "string (optional)",
  "socialLinks": [
    { "label": "string", "href": "string" }
  ]
}
```

---

## 15) TeamGrid

### Props

```json
{
  "title": "string (optional)",
  "members": [
    {
      "name": "string (required)",
      "role": "string (optional)",
      "bio": "string (optional)",
      "photo": { "src": "string", "alt": "string" }
    }
  ],
  "showBioOnClick": "boolean (default true)"
}
```

---

## 16) PartnerLogos

### Props

```json
{
  "title": "string (optional)",
  "logos": [
    { "name": "string", "src": "string", "href": "string (optional)" }
  ]
}
```

---

## 17) DonateWidget

### Props

```json
{
  "title": "string (required)",
  "body": "string (optional, HTML)",
  "donationLinks": [
    { "label": "string", "href": "string" }
  ],
  "suggestedAmounts": ["string"]
}
```

---

## 18) VolunteerRoles

### Props

```json
{
  "anchor": "string (optional)",
  "title": "string (required)",
  "roles": [
    { "title": "string", "time": "string", "description": "string" }
  ],
  "cta": { "label": "string", "href": "string" }
}
```

---

## 19) EventList (Phase 2)

### Props

```json
{
  "title": "string (optional)",
  "limit": "number (default 5)",
  "cta": { "label": "string", "href": "string" }
}
```

---

## 20) ResourceLinks

### Props

```json
{
  "title": "string (optional)",
  "links": [
    { "label": "string (required)", "href": "string (required)" }
  ]
}
```

---

# Validation & Error Handling

## Validation Approach

* Use a shared schema (e.g., Zod) in frontend to validate `props` per block.
* Backend should also validate template JSON before saving.

## UnknownBlock

When block type unknown:

* Admin view: render a warning with block JSON id/type
* Public view: omit block entirely

---

# Accessibility Requirements

* All interactive blocks keyboard accessible
* Images require alt text
* Color contrast must remain readable with theme tokens

---

# Performance Requirements

* Lazy-load images
* Use responsive images when possible
* Avoid heavy client-side JS for public pages
