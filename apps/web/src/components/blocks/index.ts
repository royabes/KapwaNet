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
