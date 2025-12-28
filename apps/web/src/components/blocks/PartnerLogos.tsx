/**
 * PartnerLogos block component for KapwaNet.
 *
 * Displays a grid of partner/sponsor logos with optional links.
 */

import React from 'react'
import type { PartnerLogosBlock, PartnerLogo } from './types'

interface PartnerLogosProps {
  block: PartnerLogosBlock
}

/**
 * Individual logo display.
 */
function LogoItem({ logo }: { logo: PartnerLogo }) {
  const imageElement = (
    <img
      src={logo.src}
      alt={logo.name}
      className="max-h-16 md:max-h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
      loading="lazy"
    />
  )

  if (logo.href) {
    return (
      <a
        href={logo.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center p-4 rounded-lg transition-all hover:scale-105"
        style={{ borderRadius: 'var(--kn-radius)' }}
        title={logo.name}
      >
        {imageElement}
      </a>
    )
  }

  return (
    <div
      className="flex items-center justify-center p-4 rounded-lg"
      style={{ borderRadius: 'var(--kn-radius)' }}
      title={logo.name}
    >
      {imageElement}
    </div>
  )
}

/**
 * PartnerLogos block component.
 */
export function PartnerLogos({ block }: PartnerLogosProps) {
  const { title, logos } = block

  if (!logos || logos.length === 0) {
    return null
  }

  // Determine grid columns based on logo count
  const getGridCols = (count: number): string => {
    if (count <= 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2 md:grid-cols-4'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="partner_logos"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        {title && (
          <h2
            className="text-xl md:text-2xl font-bold mb-8 text-center"
            style={{
              color: 'var(--kn-text)',
              fontFamily: 'var(--kn-font-heading)',
            }}
          >
            {title}
          </h2>
        )}

        {/* Logo grid */}
        <div
          className={`grid ${getGridCols(logos.length)} gap-4 md:gap-8 items-center justify-items-center p-6 rounded-lg`}
          style={{
            backgroundColor: 'var(--kn-surface)',
            borderRadius: 'var(--kn-radius-lg)',
          }}
        >
          {logos.map((logo, index) => (
            <LogoItem key={`logo-${index}-${logo.name}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnerLogos
