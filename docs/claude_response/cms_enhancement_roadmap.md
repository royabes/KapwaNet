# CMS Enhancement Roadmap

*What's next for the KapwaNet page builder*

---

## Current State (Completed)

- Admin layout with sidebar navigation
- Page list with CRUD operations
- Template gallery for creating pages
- Visual block editor with drag-and-drop
- Property editor for all 20 block types
- Draft/Published/Archived status
- API endpoints for pages and templates

---

## Priority 1: Essential Enhancements

### 1.1 Live Preview Mode
**Why**: Currently the preview shows blocks but doesn't apply the organization's theme.

**What's needed**:
- Inject organization's CSS variables into preview iframe
- Show how the page looks on the actual public site
- Mobile/tablet/desktop viewport toggles

### 1.2 Image Upload & Media Library
**Why**: Users currently have to paste external URLs for images.

**What's needed**:
- Image upload component with drag-and-drop
- Media library to browse uploaded images
- Image optimization (resize, compress)
- Django backend for file storage (S3 or local)
- Thumbnail generation

### 1.3 Rich Text Editor
**Why**: Current rich text fields require raw HTML input.

**What's needed**:
- WYSIWYG editor (Tiptap, Slate, or Lexical)
- Formatting toolbar (bold, italic, links, lists)
- Image embedding within rich text
- Clean HTML output

### 1.4 Undo/Redo
**Why**: No way to recover from mistakes.

**What's needed**:
- History stack for block changes
- Undo/redo buttons in toolbar
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

---

## Priority 2: User Experience

### 2.1 Block Duplication
**Why**: Users often want similar blocks with slight variations.

**What's needed**:
- "Duplicate" button on each block
- Copy block with all props
- Keyboard shortcut (Ctrl+D)

### 2.2 Block Templates / Saved Blocks
**Why**: Reusable block configurations across pages.

**What's needed**:
- "Save as template" option per block
- Library of saved block configurations
- Insert from saved blocks

### 2.3 Better Drag-and-Drop
**Why**: Current implementation is basic.

**What's needed**:
- Visual drop indicators
- Smooth animations
- Touch support for mobile
- Consider using @dnd-kit or react-beautiful-dnd

### 2.4 Keyboard Navigation
**Why**: Power users want keyboard shortcuts.

**What's needed**:
- Arrow keys to navigate blocks
- Enter to edit selected block
- Delete key to remove block
- Tab to cycle through fields

### 2.5 Autosave
**Why**: Users may lose work if they navigate away.

**What's needed**:
- Auto-save to draft every 30 seconds
- Show "Last saved" timestamp
- Warn before leaving with unsaved changes

---

## Priority 3: Content Features

### 3.1 SEO Metadata
**Why**: Pages need proper SEO for discoverability.

**What's needed**:
- Page title (for browser tab)
- Meta description
- Open Graph image
- Canonical URL
- Structured data (JSON-LD)

### 3.2 Page Scheduling
**Why**: Organizations want to prepare content ahead of time.

**What's needed**:
- "Schedule publish" option
- Date/time picker
- Background job to publish at scheduled time
- Show scheduled status in page list

### 3.3 Version History
**Why**: Need to see changes and roll back if needed.

**What's needed**:
- Save version on each publish
- Version list with timestamps and authors
- "Restore this version" option
- Diff view between versions

### 3.4 Page Hierarchy / Navigation
**Why**: Currently pages are flat, no parent/child relationships.

**What's needed**:
- Parent page selection
- Breadcrumb generation
- Navigation menu builder
- Sitemap.xml generation

---

## Priority 4: Collaboration

### 4.1 Content Locking
**Why**: Prevent conflicts when multiple admins edit.

**What's needed**:
- Lock page when editing
- Show who is editing
- Timeout lock after inactivity
- Force unlock for admins

### 4.2 Comments on Blocks
**Why**: Team feedback before publishing.

**What's needed**:
- Comment thread per block
- Resolve/unresolve comments
- Notification to relevant users

### 4.3 Approval Workflow
**Why**: Some orgs want review before publish.

**What's needed**:
- "Submit for review" status
- Reviewer role assignment
- Approve/reject with comment
- Notification flow

---

## Priority 5: Advanced Features

### 5.1 Custom Block Creation
**Why**: Organizations may have unique content needs.

**What's needed**:
- Block schema definition UI
- Custom field types
- Preview template
- Markdown-based block definition (simpler)

### 5.2 Conditional Content
**Why**: Show different content based on context.

**What's needed**:
- Show/hide blocks by date range
- Member-only content
- A/B testing framework

### 5.3 Analytics Integration
**Why**: Know what content performs well.

**What's needed**:
- Page view tracking
- Block engagement (scroll depth, clicks)
- Dashboard with metrics
- Privacy-respecting (no third-party)

### 5.4 Multi-language Support
**Why**: Serve diverse communities.

**What's needed**:
- Language field per page
- Language switcher
- Translation workflow
- RTL support

---

## Quick Wins (Low Effort, High Value)

1. **Block descriptions in selector** - Already added!
2. **Confirm before delete** - Already added!
3. **Show block count** - Already added!
4. **Empty state guidance** - Already added!
5. **Settings panel** - Already added!

**Still to add**:
- Keyboard shortcuts tooltip
- "View page" link after publish
- Copy page URL button
- Better loading states with skeleton UI

---

## Technical Debt

1. **Block validation** - Add Zod schemas for each block type
2. **API error handling** - More specific error messages
3. **TypeScript strictness** - Enable strict mode
4. **Component tests** - Add React Testing Library tests
5. **E2E tests** - Playwright tests for editor workflows
6. **Performance** - Virtualize long block lists

---

## Recommended Next Steps

**Immediate (Next Sprint)**:
1. Rich text editor integration
2. Image upload and media library
3. Live preview with theme

**Short-term (1-2 Sprints)**:
1. Undo/redo
2. Block duplication
3. SEO metadata

**Medium-term (2-4 Sprints)**:
1. Version history
2. Autosave
3. Page scheduling

---

*This roadmap prioritizes features that:*
1. *Remove friction from the editing experience*
2. *Enable organizations to manage their content independently*
3. *Build toward a self-service platform*

*The philosophy: Make the 80% use case effortless before adding the 20% power features.*

---

*Generated December 2024*
*For the KapwaNet development team*
