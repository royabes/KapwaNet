/**
 * StatsStrip block component for KapwaNet.
 *
 * Displays key metrics/statistics in a horizontal strip layout.
 */

import React from 'react'
import type { StatsStripBlock, StatItem } from './types'

interface StatsStripProps {
  block: StatsStripBlock
}

/**
 * Background color mapping for variants.
 */
const bgColorMap: Record<string, string> = {
  primary: 'var(--kn-primary)',
  secondary: 'var(--kn-secondary)',
  surface: 'var(--kn-surface)',
  accent: 'var(--kn-accent)',
}

/**
 * Text color based on background (for contrast).
 */
const textColorMap: Record<string, { value: string; label: string }> = {
  primary: { value: '#ffffff', label: 'rgba(255, 255, 255, 0.85)' },
  secondary: { value: '#ffffff', label: 'rgba(255, 255, 255, 0.85)' },
  surface: { value: 'var(--kn-primary)', label: 'var(--kn-text)' },
  accent: { value: '#ffffff', label: 'rgba(255, 255, 255, 0.85)' },
}

/**
 * Individual stat display.
 */
function StatDisplay({ item, textColors }: { item: StatItem; textColors: { value: string; label: string } }) {
  return (
    <div className="text-center px-4 py-2">
      <div
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1"
        style={{
          color: textColors.value,
          fontFamily: 'var(--kn-font-heading)',
        }}
      >
        {item.value}
      </div>
      <div
        className="text-sm md:text-base uppercase tracking-wide"
        style={{
          color: textColors.label,
          fontFamily: 'var(--kn-font-body)',
        }}
      >
        {item.label}
      </div>
    </div>
  )
}

/**
 * StatsStrip block component.
 */
export function StatsStrip({ block }: StatsStripProps) {
  const { items, backgroundColor = 'primary' } = block

  const bgColor = bgColorMap[backgroundColor] || bgColorMap.primary
  const textColors = textColorMap[backgroundColor] || textColorMap.primary

  // Calculate grid columns based on number of items
  const getGridCols = (count: number): string => {
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2'
    if (count === 3) return 'grid-cols-1 sm:grid-cols-3'
    if (count === 4) return 'grid-cols-2 sm:grid-cols-4'
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
  }

  return (
    <section
      className="px-4 py-10 md:py-12"
      style={{ backgroundColor: bgColor }}
      data-block-type="stats_strip"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`grid ${getGridCols(items.length)} gap-6 md:gap-8`}>
          {items.map((item, index) => (
            <StatDisplay
              key={`stat-${index}-${item.label}`}
              item={item}
              textColors={textColors}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsStrip
