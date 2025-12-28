/**
 * Block registry for KapwaNet page builder.
 *
 * Maps block types to their React components for dynamic rendering.
 */

import React from 'react'
import type { Block, BlockType } from './types'
import { Hero } from './Hero'
import { RichTextSection } from './RichTextSection'
import { CardGrid } from './CardGrid'
import { Steps } from './Steps'
import { CTABanner } from './CTABanner'
import { ContactBlock } from './ContactBlock'
import { AnnouncementBanner } from './AnnouncementBanner'
import { ImageTextSplit } from './ImageTextSplit'
import { StatsStrip } from './StatsStrip'
import { FAQAccordion } from './FAQAccordion'
import { TestimonialQuote } from './TestimonialQuote'
import { NewsList } from './NewsList'
import { TeamGrid } from './TeamGrid'
import { PartnerLogos } from './PartnerLogos'
import { NeedsWidget } from './NeedsWidget'
import { SponsorStrip } from './SponsorStrip'
import { DonateWidget } from './DonateWidget'
import { VolunteerRoles } from './VolunteerRoles'
import { EventList } from './EventList'
import { ResourceLinks } from './ResourceLinks'

/**
 * Block component type - takes a block and renders it.
 */
export type BlockComponent<T extends Block = Block> = React.ComponentType<{ block: T }>

/**
 * Registry entry containing the component and metadata.
 */
export interface BlockRegistryEntry {
  component: BlockComponent<any>
  displayName: string
  category: 'layout' | 'content' | 'interactive' | 'utility'
}

/**
 * Block registry mapping block types to their components.
 */
export const blockRegistry: Record<BlockType, BlockRegistryEntry> = {
  hero: {
    component: Hero,
    displayName: 'Hero',
    category: 'layout',
  },
  rich_text_section: {
    component: RichTextSection,
    displayName: 'Rich Text Section',
    category: 'content',
  },
  card_grid: {
    component: CardGrid,
    displayName: 'Card Grid',
    category: 'layout',
  },
  steps: {
    component: Steps,
    displayName: 'Steps',
    category: 'content',
  },
  cta_banner: {
    component: CTABanner,
    displayName: 'CTA Banner',
    category: 'layout',
  },
  contact_block: {
    component: ContactBlock,
    displayName: 'Contact Block',
    category: 'content',
  },
  announcement_banner: {
    component: AnnouncementBanner,
    displayName: 'Announcement Banner',
    category: 'layout',
  },
  image_text_split: {
    component: ImageTextSplit,
    displayName: 'Image Text Split',
    category: 'layout',
  },
  stats_strip: {
    component: StatsStrip,
    displayName: 'Stats Strip',
    category: 'layout',
  },
  faq_accordion: {
    component: FAQAccordion,
    displayName: 'FAQ Accordion',
    category: 'content',
  },
  testimonial_quote: {
    component: TestimonialQuote,
    displayName: 'Testimonial Quote',
    category: 'content',
  },
  news_list: {
    component: NewsList,
    displayName: 'News List',
    category: 'content',
  },
  team_grid: {
    component: TeamGrid,
    displayName: 'Team Grid',
    category: 'content',
  },
  partner_logos: {
    component: PartnerLogos,
    displayName: 'Partner Logos',
    category: 'content',
  },
  needs_widget: {
    component: NeedsWidget,
    displayName: 'Needs Widget',
    category: 'interactive',
  },
  sponsor_strip: {
    component: SponsorStrip,
    displayName: 'Sponsor Strip',
    category: 'content',
  },
  donate_widget: {
    component: DonateWidget,
    displayName: 'Donate Widget',
    category: 'interactive',
  },
  volunteer_roles: {
    component: VolunteerRoles,
    displayName: 'Volunteer Roles',
    category: 'interactive',
  },
  event_list: {
    component: EventList,
    displayName: 'Event List',
    category: 'utility',
  },
  resource_links: {
    component: ResourceLinks,
    displayName: 'Resource Links',
    category: 'utility',
  },
}

/**
 * Get a block component by type.
 *
 * @param type - The block type
 * @returns The block component or undefined if not found
 */
export function getBlockComponent(type: string): BlockComponent | undefined {
  const entry = blockRegistry[type as BlockType]
  return entry?.component
}

/**
 * Get registry entry by type.
 *
 * @param type - The block type
 * @returns The registry entry or undefined if not found
 */
export function getBlockRegistryEntry(type: string): BlockRegistryEntry | undefined {
  return blockRegistry[type as BlockType]
}

/**
 * Check if a block type is registered.
 *
 * @param type - The block type to check
 * @returns True if the block type is registered
 */
export function isBlockTypeRegistered(type: string): boolean {
  return type in blockRegistry
}

/**
 * Get all registered block types.
 *
 * @returns Array of all registered block types
 */
export function getRegisteredBlockTypes(): BlockType[] {
  return Object.keys(blockRegistry) as BlockType[]
}

/**
 * Get all registered blocks by category.
 *
 * @param category - The category to filter by
 * @returns Object with block type as key and entry as value
 */
export function getBlocksByCategory(category: BlockRegistryEntry['category']): Record<string, BlockRegistryEntry> {
  return Object.fromEntries(
    Object.entries(blockRegistry).filter(([_, entry]) => entry.category === category)
  )
}
