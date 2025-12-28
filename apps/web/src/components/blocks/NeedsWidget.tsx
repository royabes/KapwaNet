/**
 * NeedsWidget block component for KapwaNet.
 *
 * Displays community needs (help requests and items) with filtering.
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { NeedsWidgetBlock, NeedItem } from './types'

interface NeedsWidgetProps {
  block: NeedsWidgetBlock
}

/**
 * Urgency badge styling.
 */
const urgencyStyles: Record<string, { bg: string; text: string; label: string }> = {
  low: {
    bg: '#D1FAE5', // green-100
    text: '#065F46', // green-800
    label: 'Low',
  },
  medium: {
    bg: '#FEF3C7', // amber-100
    text: '#92400E', // amber-800
    label: 'Medium',
  },
  high: {
    bg: '#FEE2E2', // red-100
    text: '#991B1B', // red-800
    label: 'Urgent',
  },
}

/**
 * Type badge styling.
 */
const typeStyles: Record<string, { icon: string; label: string }> = {
  help: { icon: '🤝', label: 'Help Request' },
  item: { icon: '📦', label: 'Item Needed' },
}

/**
 * Format relative time.
 */
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  } catch {
    return ''
  }
}

/**
 * Need card component.
 */
function NeedCard({ item }: { item: NeedItem }) {
  const urgency = urgencyStyles[item.urgency || 'low']
  const type = typeStyles[item.type]

  return (
    <div
      className="p-4 rounded-lg border transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderColor: 'var(--kn-muted)',
        borderRadius: 'var(--kn-radius-lg)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-lg" aria-hidden="true">
          {type.icon}
        </span>
        {item.urgency && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: urgency.bg,
              color: urgency.text,
            }}
          >
            {urgency.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-semibold mb-1 line-clamp-2"
        style={{
          color: 'var(--kn-text)',
          fontFamily: 'var(--kn-font-heading)',
        }}
      >
        {item.title}
      </h3>

      {/* Category and location */}
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        {item.category && (
          <span style={{ color: 'var(--kn-primary)' }}>{item.category}</span>
        )}
        {item.location && (
          <span style={{ color: 'var(--kn-muted)' }}>📍 {item.location}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--kn-muted)' }}>
          {type.label}
        </span>
        <span style={{ color: 'var(--kn-muted)' }}>
          {formatRelativeTime(item.created_at)}
        </span>
      </div>
    </div>
  )
}

/**
 * Placeholder needs for demo.
 */
const placeholderNeeds: NeedItem[] = [
  {
    id: 'need-1',
    type: 'help',
    title: 'Need help with grocery shopping',
    category: 'Transportation',
    urgency: 'high',
    created_at: new Date().toISOString(),
    location: 'Downtown Calgary',
  },
  {
    id: 'need-2',
    type: 'item',
    title: 'Looking for winter coats for children',
    category: 'Clothing',
    urgency: 'medium',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'NE Calgary',
  },
  {
    id: 'need-3',
    type: 'help',
    title: 'Senior needs assistance with yard work',
    category: 'Home Help',
    urgency: 'low',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'SW Calgary',
  },
  {
    id: 'need-4',
    type: 'item',
    title: 'Baby formula and diapers needed',
    category: 'Baby Items',
    urgency: 'high',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'SE Calgary',
  },
  {
    id: 'need-5',
    type: 'help',
    title: 'Looking for tutoring for my child',
    category: 'Education',
    urgency: 'low',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'NW Calgary',
  },
  {
    id: 'need-6',
    type: 'item',
    title: 'Furniture for new apartment',
    category: 'Household',
    urgency: 'medium',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Downtown Calgary',
  },
]

/**
 * NeedsWidget block component.
 */
export function NeedsWidget({ block }: NeedsWidgetProps) {
  const {
    title,
    mode = 'combined',
    filters = {},
    emptyStateText = 'No community needs at the moment.',
    items: providedItems,
  } = block

  const limit = filters.limit || 6

  const [needs, setNeeds] = useState<NeedItem[]>(providedItems || [])
  const [loading, setLoading] = useState(!providedItems)

  // Fetch needs from backend if not provided
  useEffect(() => {
    if (providedItems) {
      let filtered = [...providedItems]

      // Filter by mode
      if (mode === 'help_only') {
        filtered = filtered.filter((n) => n.type === 'help')
      } else if (mode === 'items_only') {
        filtered = filtered.filter((n) => n.type === 'item')
      }

      // Sort by urgency if needed
      if (filters.urgency === 'high_first') {
        const urgencyOrder = { high: 0, medium: 1, low: 2 }
        filtered.sort(
          (a, b) => (urgencyOrder[a.urgency || 'low'] - urgencyOrder[b.urgency || 'low'])
        )
      }

      setNeeds(filtered.slice(0, limit))
      return
    }

    // Simulate API fetch
    const fetchNeeds = async () => {
      try {
        setLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))

        let filtered = [...placeholderNeeds]

        if (mode === 'help_only') {
          filtered = filtered.filter((n) => n.type === 'help')
        } else if (mode === 'items_only') {
          filtered = filtered.filter((n) => n.type === 'item')
        }

        if (filters.urgency === 'high_first') {
          const urgencyOrder = { high: 0, medium: 1, low: 2 }
          filtered.sort(
            (a, b) => (urgencyOrder[a.urgency || 'low'] - urgencyOrder[b.urgency || 'low'])
          )
        }

        setNeeds(filtered.slice(0, limit))
      } finally {
        setLoading(false)
      }
    }

    fetchNeeds()
  }, [providedItems, mode, filters.urgency, limit])

  // Loading state
  if (loading) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="needs_widget"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto">
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-8 text-center"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-heading)',
              }}
            >
              {title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].slice(0, limit).map((i) => (
              <div
                key={i}
                className="animate-pulse p-4 rounded-lg"
                style={{ backgroundColor: 'var(--kn-surface)' }}
              >
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (needs.length === 0) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="needs_widget"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto text-center">
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-heading)',
              }}
            >
              {title}
            </h2>
          )}
          <p style={{ color: 'var(--kn-muted)' }}>{emptyStateText}</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="needs_widget"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {title && (
          <h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{
              color: 'var(--kn-text)',
              fontFamily: 'var(--kn-font-heading)',
            }}
          >
            {title}
          </h2>
        )}

        {/* Needs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {needs.map((need) => (
            <NeedCard key={need.id} item={need} />
          ))}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <a
            href="/needs"
            className="inline-flex items-center font-medium transition-colors hover:underline"
            style={{ color: 'var(--kn-primary)' }}
          >
            View all community needs
            <span className="ml-1" aria-hidden="true">
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default NeedsWidget
