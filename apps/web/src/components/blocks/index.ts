/**
 * Block component exports for KapwaNet.
 *
 * Core blocks for the page builder system.
 */

// Types
export * from './types'

// Core block components
export { Hero } from './Hero'
export { RichTextSection } from './RichTextSection'
export { CardGrid } from './CardGrid'
export { Steps } from './Steps'
export { CTABanner } from './CTABanner'
export { ContactBlock } from './ContactBlock'

// Layout blocks (S1-C3)
export { AnnouncementBanner } from './AnnouncementBanner'
export { ImageTextSplit } from './ImageTextSplit'
export { StatsStrip } from './StatsStrip'
export { FAQAccordion } from './FAQAccordion'

// Content display blocks (S1-C4)
export { TestimonialQuote } from './TestimonialQuote'
export { NewsList } from './NewsList'
export { TeamGrid } from './TeamGrid'
export { PartnerLogos } from './PartnerLogos'

// Interactive and widget blocks (S1-C5)
export { NeedsWidget } from './NeedsWidget'
export { SponsorStrip } from './SponsorStrip'
export { DonateWidget } from './DonateWidget'
export { VolunteerRoles } from './VolunteerRoles'

// Utility blocks (S1-C6)
export { EventList } from './EventList'
export { ResourceLinks } from './ResourceLinks'

// Block registry and renderer
export {
  blockRegistry,
  getBlockComponent,
  getBlockRegistryEntry,
  isBlockTypeRegistered,
  getRegisteredBlockTypes,
  getBlocksByCategory,
  type BlockComponent,
  type BlockRegistryEntry,
} from './BlockRegistry'

export { BlockRenderer, type BlockRendererProps } from './BlockRenderer'
