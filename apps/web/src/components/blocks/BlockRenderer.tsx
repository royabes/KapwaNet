/**
 * BlockRenderer component for KapwaNet page builder.
 *
 * Renders a list of blocks from JSON data, handling unknown block types gracefully.
 */

'use client'

import React from 'react'
import type { Block } from './types'
import { getBlockComponent, getBlockRegistryEntry, isBlockTypeRegistered } from './BlockRegistry'

/**
 * Props for unknown block placeholder in admin view.
 */
interface UnknownBlockPlaceholderProps {
  type: string
  id: string
}

/**
 * Placeholder component for unknown block types (admin view only).
 */
function UnknownBlockPlaceholder({ type, id }: UnknownBlockPlaceholderProps) {
  return (
    <div
      className="p-6 border-2 border-dashed rounded-lg text-center"
      style={{
        borderColor: 'var(--kn-accent)',
        backgroundColor: 'var(--kn-surface)',
      }}
      data-block-type="unknown"
      data-block-id={id}
    >
      <div className="text-3xl mb-2">⚠️</div>
      <p
        className="font-semibold mb-1"
        style={{ color: 'var(--kn-text)' }}
      >
        Unknown Block Type
      </p>
      <p
        className="text-sm"
        style={{ color: 'var(--kn-muted)' }}
      >
        Block type &quot;{type}&quot; is not registered.
      </p>
      <p
        className="text-xs mt-2"
        style={{ color: 'var(--kn-muted)' }}
      >
        Block ID: {id}
      </p>
    </div>
  )
}

/**
 * Error boundary for individual blocks.
 */
interface BlockErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface BlockErrorBoundaryProps {
  children: React.ReactNode
  blockId: string
  blockType: string
  isAdmin: boolean
}

class BlockErrorBoundary extends React.Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): BlockErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (!this.props.isAdmin) {
        // In public view, silently hide errored blocks
        return null
      }

      // In admin view, show error placeholder
      return (
        <div
          className="p-6 border-2 border-dashed rounded-lg"
          style={{
            borderColor: '#EF4444',
            backgroundColor: '#FEE2E2',
          }}
          data-block-type="error"
          data-block-id={this.props.blockId}
        >
          <div className="text-3xl mb-2">❌</div>
          <p className="font-semibold mb-1" style={{ color: '#991B1B' }}>
            Block Render Error
          </p>
          <p className="text-sm" style={{ color: '#991B1B' }}>
            Block &quot;{this.props.blockType}&quot; failed to render.
          </p>
          {this.state.error && (
            <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Props for BlockRenderer component.
 */
export interface BlockRendererProps {
  /** Array of blocks to render */
  blocks: Block[]
  /** Whether to show admin-specific UI (unknown block placeholders, errors) */
  isAdmin?: boolean
  /** Additional class name for the container */
  className?: string
  /** Gap between blocks (Tailwind class) */
  gap?: 'gap-0' | 'gap-2' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-12'
}

/**
 * Renders a single block.
 */
function renderBlock(block: Block, isAdmin: boolean): React.ReactNode {
  const { id, type } = block

  // Check if block type is registered
  if (!isBlockTypeRegistered(type)) {
    // In admin view, show placeholder
    if (isAdmin) {
      return <UnknownBlockPlaceholder key={id} type={type} id={id} />
    }
    // In public view, silently omit
    return null
  }

  // Get the component
  const Component = getBlockComponent(type)
  if (!Component) {
    // Shouldn't happen if isBlockTypeRegistered returned true, but handle gracefully
    if (isAdmin) {
      return <UnknownBlockPlaceholder key={id} type={type} id={id} />
    }
    return null
  }

  // Render the block with error boundary
  return (
    <BlockErrorBoundary key={id} blockId={id} blockType={type} isAdmin={isAdmin}>
      <Component block={block} />
    </BlockErrorBoundary>
  )
}

/**
 * BlockRenderer component - renders an array of blocks from JSON.
 *
 * Handles unknown block types gracefully:
 * - Admin view: Shows placeholder warning
 * - Public view: Silently omits unknown blocks
 *
 * Also includes error boundaries to prevent one block from breaking the entire page.
 */
export function BlockRenderer({
  blocks,
  isAdmin = false,
  className = '',
  gap = 'gap-0',
}: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    if (isAdmin) {
      return (
        <div
          className="p-12 border-2 border-dashed rounded-lg text-center"
          style={{
            borderColor: 'var(--kn-muted)',
            backgroundColor: 'var(--kn-surface)',
          }}
        >
          <p style={{ color: 'var(--kn-muted)' }}>
            No blocks to display. Add blocks to build your page.
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {blocks.map((block) => renderBlock(block, isAdmin))}
    </div>
  )
}

export default BlockRenderer
