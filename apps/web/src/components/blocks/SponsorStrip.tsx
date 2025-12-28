/**
 * SponsorStrip block component for KapwaNet.
 *
 * Displays sponsor/partner logos with optional "Sponsored" label.
 */

import React from 'react'
import type { SponsorStripBlock, SponsorLogo } from './types'

interface SponsorStripProps {
  block: SponsorStripBlock
}

/**
 * Individual sponsor logo.
 */
function SponsorLogoItem({ logo }: { logo: SponsorLogo }) {
  const imageElement = (
    <img
      src={logo.src}
      alt={logo.name}
      className="max-h-12 md:max-h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
      loading="lazy"
    />
  )

  if (logo.href) {
    return (
      <a
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center p-2"
        title={logo.name}
      >
        {imageElement}
      </a>
    )
  }

  return (
    <div className="flex items-center justify-center p-2" title={logo.name}>
      {imageElement}
    </div>
  )
}

/**
 * SponsorStrip block component.
 */
export function SponsorStrip({ block }: SponsorStripProps) {
  const { title, logos, sponsoredLabel = true } = block

  if (!logos || logos.length === 0) {
    return null
  }

  return (
    <section
      className="px-4 py-8"
      style={{ backgroundColor: 'var(--kn-surface)' }}
      data-block-type="sponsor_strip"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          {title && (
            <h2
              className="text-lg md:text-xl font-semibold"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-heading)',
              }}
            >
              {title}
            </h2>
          )}
          {sponsoredLabel && (
            <span
              className="text-xs uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                backgroundColor: 'var(--kn-primary)',
                color: '#ffffff',
                opacity: 0.9,
              }}
            >
              Sponsored
            </span>
          )}
        </div>

        {/* Logo strip */}
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-8">
          {logos.map((logo, index) => (
            <SponsorLogoItem key={`sponsor-${index}-${logo.name}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SponsorStrip
