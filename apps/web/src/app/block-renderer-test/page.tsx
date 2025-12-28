'use client'

/**
 * Block renderer test page for KapwaNet.
 *
 * Demonstrates the BlockRenderer with various block types including unknown blocks.
 */

import React, { useState } from 'react'
import { BlockRenderer, type Block } from '@/components/blocks'

// Sample blocks array including an unknown block type
const sampleBlocks: Block[] = [
  {
    id: 'hero-1',
    type: 'hero',
    headline: 'Welcome to Our Community',
    subheadline: 'Together we can make a difference through mutual aid.',
    ctas: [
      { label: 'Join Now', href: '#', variant: 'primary' },
    ],
    alignment: 'center',
    minHeight: 'small',
  },
  {
    id: 'cards-1',
    type: 'card_grid',
    title: 'Our Services',
    columns: 3,
    cardStyle: 'bordered',
    cards: [
      { id: 'c1', title: 'Help Requests', description: 'Ask for help from your community', icon: '🤝' },
      { id: 'c2', title: 'Item Sharing', description: 'Share resources with others', icon: '📦' },
      { id: 'c3', title: 'Messaging', description: 'Connect directly with members', icon: '💬' },
    ],
  },
  // Unknown block type - should show placeholder in admin, hidden in public
  {
    id: 'unknown-1',
    type: 'future_block',
  } as unknown as Block,
  {
    id: 'cta-1',
    type: 'cta_banner',
    headline: 'Ready to Get Started?',
    subheadline: 'Join thousands of community members making a difference.',
    primaryCta: { label: 'Sign Up', href: '#' },
    backgroundColor: 'primary',
  },
  // Another unknown block type
  {
    id: 'unknown-2',
    type: 'deprecated_widget',
  } as unknown as Block,
]

export default function BlockRendererTestPage() {
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: 'var(--kn-text)' }}
      >
        BlockRenderer Test
      </h1>

      {/* Admin toggle */}
      <div
        className="mb-8 p-4 rounded-lg flex items-center justify-between"
        style={{ backgroundColor: 'var(--kn-surface)' }}
      >
        <div>
          <p className="font-medium" style={{ color: 'var(--kn-text)' }}>
            View Mode
          </p>
          <p className="text-sm" style={{ color: 'var(--kn-muted)' }}>
            Toggle between admin and public view to see how unknown blocks are handled.
          </p>
        </div>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className="px-4 py-2 rounded-lg font-medium text-white"
          style={{
            backgroundColor: isAdmin ? 'var(--kn-accent)' : 'var(--kn-primary)',
          }}
        >
          {isAdmin ? '👤 Admin View' : '🌐 Public View'}
        </button>
      </div>

      {/* Block info */}
      <div
        className="mb-8 p-4 rounded-lg border"
        style={{ borderColor: 'var(--kn-muted)' }}
      >
        <h2 className="font-semibold mb-2" style={{ color: 'var(--kn-text)' }}>
          Test Blocks ({sampleBlocks.length} total):
        </h2>
        <ul className="text-sm space-y-1" style={{ color: 'var(--kn-muted)' }}>
          {sampleBlocks.map((block, i) => (
            <li key={block.id}>
              {i + 1}. <code className="bg-gray-100 px-1 rounded">{block.type}</code>
              {' '}(id: {block.id})
              {!['hero', 'card_grid', 'cta_banner', 'rich_text_section', 'steps', 'contact_block'].includes(block.type) && (
                <span className="ml-2 text-xs text-orange-500">⚠️ Unknown type</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm" style={{ color: 'var(--kn-muted)' }}>
          {isAdmin
            ? '🔧 Admin view: Unknown blocks show warning placeholders'
            : '🌐 Public view: Unknown blocks are silently hidden'}
        </p>
      </div>

      {/* Block renderer output */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--kn-muted)' }}>
        <div
          className="p-2 text-xs font-medium border-b"
          style={{
            backgroundColor: 'var(--kn-surface)',
            borderColor: 'var(--kn-muted)',
            color: 'var(--kn-muted)',
          }}
        >
          Rendered Output:
        </div>
        <BlockRenderer
          blocks={sampleBlocks}
          isAdmin={isAdmin}
        />
      </div>

      {/* Empty blocks test */}
      <h2 className="text-2xl font-bold mt-12 mb-4" style={{ color: 'var(--kn-text)' }}>
        Empty Blocks Test
      </h2>
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--kn-muted)' }}>
        <div
          className="p-2 text-xs font-medium border-b"
          style={{
            backgroundColor: 'var(--kn-surface)',
            borderColor: 'var(--kn-muted)',
            color: 'var(--kn-muted)',
          }}
        >
          Empty blocks array (isAdmin={isAdmin.toString()}):
        </div>
        <BlockRenderer
          blocks={[]}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
