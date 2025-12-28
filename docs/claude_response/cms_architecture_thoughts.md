# CMS Architecture for KapwaNet: Chain of Thought

*Claude's working notes on website building for organizations*

---

## The Question

Do we have CMS capabilities? How do we help organizations build their websites?

## Let Me Think Through This...

### What We Currently Have

Looking at the codebase:

1. **Wagtail CMS** - Yes, it's in the stack! Django + Wagtail is listed in the tech stack. Wagtail is a powerful, flexible CMS built on Django.

2. **Block Renderer System** - We have 20 block types already defined:
   - Hero, RichTextSection, CardGrid, CTABanner
   - ContactBlock, FAQAccordion, TeamGrid
   - NeedsWidget (for displaying help/items)
   - And more...

3. **Theme System** - CSS variables, theme presets, organization-specific theming

4. **Template Library** - Mentioned in the architecture

So we're not starting from zero. The foundation exists.

### But What's Missing?

Let me think about what an organization actually needs...

**Scenario: Edmonton Community Helpers wants to launch their KapwaNet site**

They need:
1. A homepage that explains who they are
2. An "About Us" page with their story
3. A "How It Works" page
4. The actual Needs/Offers functionality (we have this)
5. Contact information
6. Maybe a blog for community stories
7. Their branding (logo, colors, fonts)

**Current gap**: The CMS pieces exist but aren't connected to a user-friendly page builder experience.

### Chain of Thought: Architecture Options

**Option 1: Full Wagtail Integration**

```
Organization Admin → Wagtail Admin Panel → Creates Pages
                                        → Adds Blocks
                                        → Publishes
                                        ↓
Frontend (Next.js) ← Fetches page data via API ← Wagtail
```

Pros:
- Wagtail is mature, well-documented
- Rich editing experience
- Media library built-in
- Version history, drafts, workflows

Cons:
- Learning curve for non-technical admins
- Two admin interfaces (Wagtail + Django admin)
- Might feel heavy for simple sites

**Option 2: Simplified Page Builder (Custom)**

```
Organization Admin → KapwaNet Dashboard → Simple Page Editor
                                       → Drag-drop blocks
                                       → Live preview
                                       ↓
Stores in Django models → Rendered by Next.js
```

Pros:
- Tailored to KapwaNet's specific needs
- Simpler mental model
- Single admin interface

Cons:
- More to build and maintain
- Reinventing what Wagtail already does

**Option 3: Hybrid Approach** (My Recommendation)

Use Wagtail as the backend, but create a simplified "KapwaNet Editor" frontend that:
- Exposes only what organizations need
- Hides Wagtail's complexity
- Provides guided setup wizard
- Uses our block components

```
┌─────────────────────────────────────────────────────────┐
│  KapwaNet Organization Dashboard                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  Site   │  │  Pages  │  │  Posts  │  │ Members │    │
│  │ Setup   │  │         │  │         │  │         │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                         │
│  Powered by Wagtail (hidden from user)                 │
└─────────────────────────────────────────────────────────┘
```

### What Blocks Do Organizations Need?

Thinking about community organization websites...

**Essential Blocks:**
```
HeroBlock          - Big welcome message with image
MissionBlock       - "Why we exist" statement
HowItWorksBlock    - Step-by-step explanation
TeamBlock          - Board members, volunteers
TestimonialBlock   - Community stories
StatsBlock         - Impact numbers ("500 neighbors helped")
NeedsWidgetBlock   - Embed live needs feed
OffersWidgetBlock  - Embed live offers feed
ContactBlock       - Email, phone, location
FAQBlock           - Common questions
CallToActionBlock  - "Join us" / "Get help" buttons
```

**Nice-to-Have Blocks:**
```
EventsBlock        - Upcoming community events
NewsBlock          - Recent announcements
PartnersBlock      - Logos of supporting organizations
MapBlock           - Service area visualization
DonateBlock        - If they accept donations (carefully!)
SocialFeedBlock    - Instagram/Facebook integration
```

### The Setup Wizard Concept

First-time experience for a new organization:

```
Step 1: Tell us about your organization
        ├── Name: [Edmonton Community Helpers]
        ├── Tagline: [Neighbors helping neighbors]
        └── Region: [Edmonton, Alberta]

Step 2: Choose your look
        ├── Upload logo
        ├── Pick primary color: [color picker]
        └── Choose a style: [Warm / Modern / Classic]

Step 3: What features do you need?
        ├── [x] Help requests & offers
        ├── [x] Item sharing
        ├── [ ] Events calendar
        └── [ ] Blog/News

Step 4: Create your homepage
        [Pre-built template options]
        ├── "Community First" - Hero + Mission + How It Works
        ├── "Action Oriented" - Hero + Stats + Live Feed
        └── "Story Driven" - Hero + Testimonials + Team

Step 5: Review & Launch!
```

### Database Considerations

We need to extend the Organization model:

```python
class Organization(models.Model):
    # Existing fields...
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    # Website settings (new)
    homepage = models.ForeignKey('wagtailcore.Page', null=True)
    custom_domain = models.CharField(max_length=255, blank=True)

    # Feature flags
    features = models.JSONField(default=dict)
    # {
    #   "help_posts": true,
    #   "item_sharing": true,
    #   "events": false,
    #   "blog": false
    # }

    # Analytics
    analytics_id = models.CharField(max_length=50, blank=True)  # GA4
```

### API Design for Page Rendering

```
GET /api/organizations/{slug}/pages/
GET /api/organizations/{slug}/pages/{page_slug}/
GET /api/organizations/{slug}/pages/home/

Response:
{
  "title": "Welcome to Edmonton Community Helpers",
  "meta": {
    "description": "...",
    "image": "..."
  },
  "blocks": [
    {
      "type": "hero",
      "data": {
        "heading": "Neighbors Helping Neighbors",
        "subheading": "Join 500+ community members...",
        "image": "/media/hero-bg.jpg",
        "cta": {"text": "Get Started", "link": "/join"}
      }
    },
    {
      "type": "needs_widget",
      "data": {
        "title": "Current Needs",
        "limit": 6,
        "show_filters": true
      }
    }
  ]
}
```

### Frontend Rendering

Next.js receives block data and renders appropriate components:

```tsx
// pages/[org]/[...slug].tsx

export default function DynamicPage({ pageData }) {
  return (
    <OrganizationLayout org={pageData.organization}>
      {pageData.blocks.map((block, index) => (
        <BlockRenderer key={index} block={block} />
      ))}
    </OrganizationLayout>
  )
}

function BlockRenderer({ block }) {
  const components = {
    hero: HeroBlock,
    mission: MissionBlock,
    needs_widget: NeedsWidgetBlock,
    // ... etc
  }

  const Component = components[block.type]
  return Component ? <Component {...block.data} /> : null
}
```

### Migration Path

We already have blocks in `apps/web/src/components/blocks/`. Let's audit:

```
Current blocks (need to verify):
- HeroBlock
- RichTextSection
- CardGrid
- CTABanner
- ContactBlock
- FAQAccordion
- TeamGrid
- NeedsWidget
... (claimed 20 total)
```

These need to be:
1. Connected to Wagtail StreamField definitions
2. Exposed via API
3. Made editable in a friendly interface

### Priority Order

1. **Phase 1: Verify Wagtail Integration**
   - Ensure Wagtail is properly set up
   - Create basic Page models
   - Test API endpoints

2. **Phase 2: Block-to-Wagtail Mapping**
   - Define StreamField blocks in Django
   - Match to existing React components
   - Create serializers for API

3. **Phase 3: Organization Dashboard**
   - Simple page management UI
   - Theme customization
   - Preview functionality

4. **Phase 4: Setup Wizard**
   - Guided onboarding
   - Template selection
   - One-click site creation

### Open Questions

1. **Domain handling**: How do we route `myorg.kapwanet.org` vs `kapwanet.org/myorg` vs custom domains?

2. **Asset storage**: Where do uploaded images go? S3? Local?

3. **Permissions**: Who in an organization can edit pages? Just admins?

4. **Versioning**: Do we need page version history? Drafts?

5. **SEO**: How do we handle meta tags, sitemaps, structured data?

---

## Summary

Yes, we have CMS foundations (Wagtail + Block system). The work is to:

1. Connect the pieces
2. Create a simplified editing experience
3. Build the setup wizard
4. Add the blocks organizations actually need

The goal: An organization should go from "I want a KapwaNet site" to "My site is live" in under an hour, without touching code.

---

*Next step: Check what Wagtail setup currently exists in the backend, then design the Organization Dashboard.*
