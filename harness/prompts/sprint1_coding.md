# Sprint 1 Coding Prompt - Styling Engine & Templates

You are implementing Sprint 1 of KapwaNet - the Styling Engine and Templates system.

## Your Mission

Implement features from `.claude/sprint1_feature_list.json` one at a time. This is the **key differentiator** for KapwaNet - organizations can style and launch branded sites without design skills.

## Current Sprint Goal

Build a powerful theming and template system:
- Organization and theme models
- CSS variable-based theming
- All 20 block types from block_renderer.md
- Template library with preset pages

## Key Technical Requirements

### Organization & Theme Models (Backend)

```python
# organizations/models.py
class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100, blank=True)
    logo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class OrgTheme(models.Model):
    org = models.OneToOneField(Organization, on_delete=models.CASCADE)
    theme_json = models.JSONField(default=dict)
    preset_id = models.CharField(max_length=50, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Theme Token Schema

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

### Theme Provider (Frontend)

```typescript
// components/ThemeProvider.tsx
function ThemeProvider({ theme, children }) {
  const cssVars = {
    '--kn-primary': theme.colors.primary,
    '--kn-secondary': theme.colors.secondary,
    // ... etc
  };

  return (
    <div style={cssVars}>
      {children}
    </div>
  );
}
```

### Block Registry

All 20 block types must be implemented:

```typescript
const blockRegistry = {
  // Core blocks (S1-C1)
  'Hero': HeroBlock,
  'RichTextSection': RichTextSectionBlock,
  'CardGrid': CardGridBlock,
  'Steps': StepsBlock,
  'CTABanner': CTABannerBlock,
  'ContactBlock': ContactBlock,

  // Layout blocks (S1-C3)
  'AnnouncementBanner': AnnouncementBannerBlock,
  'ImageTextSplit': ImageTextSplitBlock,
  'StatsStrip': StatsStripBlock,
  'FAQAccordion': FAQAccordionBlock,

  // Content blocks (S1-C4)
  'TestimonialQuote': TestimonialQuoteBlock,
  'NewsList': NewsListBlock,
  'TeamGrid': TeamGridBlock,
  'PartnerLogos': PartnerLogosBlock,

  // Widget blocks (S1-C5)
  'NeedsWidget': NeedsWidgetBlock,
  'SponsorStrip': SponsorStripBlock,
  'DonateWidget': DonateWidgetBlock,
  'VolunteerRoles': VolunteerRolesBlock,

  // Utility blocks (S1-C6)
  'EventList': EventListBlock,
  'ResourceLinks': ResourceLinksBlock,
};
```

### Block JSON Shape

```json
{
  "id": "b1",
  "type": "Hero",
  "props": {
    "headline": "Welcome to Our Community",
    "subheadline": "Together, we help each other thrive",
    "primaryCta": { "label": "Get Involved", "href": "/join" },
    "backgroundImage": { "src": "/hero.jpg", "alt": "Community" }
  }
}
```

## Feature Implementation Order

### S1-A: Organization & Theme Models
- **S1-A1**: Organization model (slug, name, region, logo)
- **S1-A2**: Theme token schema (colors, fonts, radius, spacing)

### S1-B: Styling Engine (Frontend)
- **S1-B1**: Theme provider (inject CSS variables)
- **S1-B2**: Theme presets switcher (admin-only)

### S1-C: Block Renderer (All 20 blocks)
- **S1-C1**: Core blocks (6) - Hero, RichTextSection, CardGrid, Steps, CTABanner, ContactBlock
- **S1-C2**: Block registry and renderer
- **S1-C3**: Layout blocks (4) - AnnouncementBanner, ImageTextSplit, StatsStrip, FAQAccordion
- **S1-C4**: Content blocks (4) - TestimonialQuote, NewsList, TeamGrid, PartnerLogos
- **S1-C5**: Widget blocks (4) - NeedsWidget, SponsorStrip, DonateWidget, VolunteerRoles
- **S1-C6**: Utility blocks (2) - EventList, ResourceLinks

### S1-D: Template Library
- **S1-D1**: Template seed data (Home, About, Programs templates)
- **S1-D2**: Create page from template

## Block Specifications (Reference: docs/plan/block_renderer.md)

Each block has specific props - see block_renderer.md for full specifications:

### Hero
```json
{
  "headline": "string (required)",
  "subheadline": "string (optional)",
  "primaryCta": { "label": "string", "href": "string" },
  "secondaryCta": { "label": "string", "href": "string" },
  "backgroundImage": { "src": "string", "alt": "string" },
  "showOverlay": "boolean (default true)"
}
```

### CardGrid
```json
{
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

## Theme Presets

Create 4-5 theme presets:

1. **Default** - Clean blue/gray professional
2. **Sunset** - Warm orange/amber community feel
3. **Forest** - Green nature-inspired
4. **Ocean** - Blue calming tones
5. **Midnight** - Dark mode professional

## Testing Protocol

After EACH feature, run the full test suite:

```bash
# Run full test suite (includes regression tests)
./scripts/run_tests.sh

# Or run tests individually:

# 1. Django migrations and tests
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
docker compose exec api python manage.py test --verbosity=2

# 2. Frontend tests
docker compose exec web npm test -- --passWithNoTests

# 3. API integration tests
./scripts/test_api.sh

# 4. Health checks
curl -f http://localhost:8000/api/health/
curl -f http://localhost:3000/
```

### Sprint 1 Specific Tests

```bash
# Organization API
curl http://localhost:8000/api/organizations/
curl http://localhost:8000/api/organizations/test-org/

# Theme API
curl http://localhost:8000/api/organizations/test-org/theme/
curl http://localhost:8000/api/theme-presets/

# Block rendering - verify in browser
# Visit http://localhost:3000/test-blocks
```

## Regression Testing

**CRITICAL**: After implementing each feature, you MUST verify all previous features still work.

### Regression Checklist

Before marking any feature as `passes: true`, verify:

1. **Sprint 0 still works**:
   - [ ] `docker compose up` brings all services up
   - [ ] API health endpoint returns healthy
   - [ ] Frontend loads at localhost:3000
   - [ ] Django admin accessible

2. **Previous Sprint 1 features work**:
   - [ ] All previous S1-* features still pass their acceptance criteria
   - [ ] No console errors in browser
   - [ ] No errors in Docker logs

### Run Regression Tests

```bash
# Quick regression check
./scripts/run_tests.sh health

# Full regression (recommended)
./scripts/run_tests.sh

# Check for errors in logs
docker compose logs api --tail=50
docker compose logs web --tail=50
```

## CSS Variables Required

All blocks must use these CSS variables:

```css
/* Colors */
--kn-primary
--kn-secondary
--kn-accent
--kn-bg
--kn-surface
--kn-text
--kn-muted

/* Radius */
--kn-radius-sm   /* 4px */
--kn-radius-md   /* 8px */
--kn-radius-lg   /* 12px */
--kn-radius-xl   /* 16px */

/* Fonts */
--kn-font-heading
--kn-font-body

/* Spacing */
--kn-spacing-unit  /* 8px base */
```

## Validation Rules

1. **Unknown block type** → Render placeholder (admin) or omit (public)
2. **Missing required props** → Use sensible defaults
3. **HTML in rich text** → Sanitize before rendering
4. **Images** → Require alt text for accessibility

## Commit Messages

```
S1-C3: Implement layout blocks

- Created AnnouncementBanner with info/warning/success variants
- Created ImageTextSplit with left/right positioning
- Created StatsStrip for metrics display
- Created FAQAccordion with keyboard accessibility

Acceptance criteria met:
[x] AnnouncementBanner supports dismissible option
[x] ImageTextSplit supports image positioning
[x] FAQAccordion is keyboard accessible
[x] All blocks use --kn-* CSS variables
```

## IMPORTANT REMINDERS

1. **CSS variables only** - Never hardcode colors/fonts in components
2. **Theme tokens** - All values come from theme_json
3. **Responsive design** - All blocks must work on mobile
4. **Accessibility** - Images need alt, buttons need labels
5. **Sanitize HTML** - Rich text must be sanitized
6. **Graceful fallbacks** - Unknown blocks don't crash the page
7. **All 20 blocks** - Implement all blocks from block_renderer.md

## Start Working

1. Read `.claude/sprint1_feature_list.json` to see current progress
2. Find the first feature where `"passes": false`
3. Implement it following the steps listed
4. Test against acceptance criteria
5. Mark as passing and commit
6. Continue to next feature

Build the best theming system for community organizations!
