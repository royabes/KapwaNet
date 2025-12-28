# KapwaNet CMS - Current State Analysis

*Analysis of existing page builder infrastructure and next steps*

---

## Executive Summary

KapwaNet has a **mature custom page builder system** already implemented. Despite Wagtail being installed, the team made a deliberate architectural decision to use a **headless JSON-based CMS** that's better suited to the multi-tenant, API-first architecture.

**What exists:**
- 20 React block components with full TypeScript types
- Django models for pages, templates, and themes
- Complete REST API for CRUD operations
- Theme system with CSS variable generation
- Template library for page cloning

**What's missing:**
- Frontend page editor UI (the admin can't actually edit pages visually)
- Block validation schemas
- Publishing workflow enforcement

---

## Current Architecture

### The Block System

```
┌─────────────────────────────────────────────────────────────┐
│                     Organization                             │
├─────────────────────────────────────────────────────────────┤
│  OrgPage                                                     │
│  ├── id: UUID                                               │
│  ├── slug: "about-us"                                       │
│  ├── title: "About Our Community"                           │
│  ├── page_type: "about"                                     │
│  ├── status: "draft" | "published" | "archived"             │
│  └── blocks_json: [                                         │
│        { id: "uuid", type: "Hero", props: {...} },          │
│        { id: "uuid", type: "RichTextSection", props: {...}},│
│        { id: "uuid", type: "TeamGrid", props: {...} }       │
│      ]                                                       │
└─────────────────────────────────────────────────────────────┘
```

### Available Block Types

| Category | Blocks |
|----------|--------|
| **Layout** | Hero, ImageTextSplit, Steps |
| **Content** | RichTextSection, CardGrid, FAQAccordion, NewsList, TestimonialQuote |
| **Interactive** | ContactBlock, NeedsWidget, DonateWidget, VolunteerRoles, EventList |
| **Utility** | CTABanner, AnnouncementBanner, StatsStrip, TeamGrid, PartnerLogos, SponsorStrip, ResourceLinks |

### API Endpoints

```
Pages:
  GET    /api/pages/              - List pages
  POST   /api/pages/              - Create page
  GET    /api/pages/{id}/         - Get page
  PUT    /api/pages/{id}/         - Update page
  DELETE /api/pages/{id}/         - Delete page
  POST   /api/pages/from-template/ - Clone from template

Templates:
  GET    /api/templates/          - List templates
  GET    /api/templates/{id}/     - Get template

Themes:
  GET    /api/organizations/{id}/theme/  - Get theme
  PUT    /api/organizations/{id}/theme/  - Update theme
  GET    /api/theme-presets/             - List presets
```

---

## Why Not Wagtail?

Wagtail is installed but unused. This appears intentional:

| Concern | Wagtail Approach | Custom JSON Approach |
|---------|------------------|---------------------|
| Multi-tenancy | One site per Wagtail install | Easy org-scoped pages |
| Headless API | StreamField serialization needed | Native JSON storage |
| React frontend | Requires serialization layer | Direct JSON-to-props |
| Page hierarchy | Wagtail's tree model | Flat pages per org |
| Theme system | Would need extension | Native CSS variables |

**Recommendation**: Continue with custom system. It's already built, fits the architecture, and avoids Wagtail's single-tenant assumptions.

---

## What Needs to Be Built

### Priority 1: Page Editor UI

The most critical missing piece. Organizations can't build pages without a visual editor.

**Components needed:**
1. **PageEditor** - Main editor layout with sidebar and canvas
2. **BlockSelector** - Modal/drawer to add new blocks
3. **BlockPropertyEditor** - Form to edit block props
4. **BlockList** - Sortable list of blocks with drag-and-drop
5. **LivePreview** - Real-time preview of the page

**Location:** `/apps/web/src/app/admin/pages/`

### Priority 2: Validation Layer

```typescript
// Zod schemas for each block type
const HeroBlockSchema = z.object({
  type: z.literal('Hero'),
  props: z.object({
    headline: z.string().min(1),
    subheadline: z.string().optional(),
    backgroundImage: z.string().url().optional(),
    ctas: z.array(CTAButtonSchema).max(2),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
  })
});
```

### Priority 3: Admin Dashboard

```
/admin
├── /pages              - Page management
│   ├── /              - List all pages
│   ├── /new           - Create from template
│   └── /[id]/edit     - Edit page with block editor
├── /templates         - Browse template library
├── /theme            - Theme customizer
└── /settings         - Organization settings
```

### Priority 4: Publishing Workflow

- Draft/Published status enforcement in API
- Preview mode with token-based access
- Scheduled publishing (future)

---

## Immediate Next Steps

1. **Create admin layout** - Sidebar navigation for admin pages
2. **Build page list view** - Show org's pages with status badges
3. **Build page editor** - Visual block editing interface
4. **Add block selector** - Choose and add blocks to page
5. **Add property editor** - Edit block properties with forms
6. **Implement save/publish** - API integration for saving pages

---

## File Structure for Editor

```
apps/web/src/
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin shell with sidebar
│       ├── page.tsx                # Admin dashboard
│       └── pages/
│           ├── page.tsx            # Page list
│           ├── new/page.tsx        # Create from template
│           └── [id]/
│               └── edit/page.tsx   # Page editor
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx        # Admin navigation
│       ├── PageEditor/
│       │   ├── PageEditor.tsx      # Main editor
│       │   ├── BlockList.tsx       # Sortable block list
│       │   ├── BlockSelector.tsx   # Add block modal
│       │   ├── PropertyEditor.tsx  # Block property form
│       │   └── LivePreview.tsx     # Page preview
│       └── PageList/
│           └── PageList.tsx        # Page management table
└── lib/
    └── blocks/
        └── schemas.ts              # Zod validation schemas
```

---

## Conclusion

KapwaNet has 80% of a working CMS. The backend is complete, the block components are built, and the API is ready. The missing piece is the **frontend editor UI** that enables organization admins to visually create and edit pages.

This is a focused, achievable task that will unlock the full value of the existing infrastructure.

---

*Generated December 2024*
*For the KapwaNet development team*
