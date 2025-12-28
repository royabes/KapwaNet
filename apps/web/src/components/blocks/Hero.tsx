/**
 * Hero block component for KapwaNet.
 *
 * Main page header with headline, subheadline, CTAs, and optional background image.
 */

import React from 'react'
import type { HeroBlock, CTAButton } from './types'

interface HeroProps {
  block: HeroBlock
}

/**
 * Render a CTA button with theming.
 */
function CTAButtonComponent({ cta }: { cta: CTAButton }) {
  const baseClasses = 'inline-block px-6 py-3 font-medium transition-colors'

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--kn-primary)',
      color: '#ffffff',
      borderRadius: 'var(--kn-radius)',
    },
    secondary: {
      backgroundColor: 'var(--kn-secondary)',
      color: '#ffffff',
      borderRadius: 'var(--kn-radius)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--kn-primary)',
      border: '2px solid var(--kn-primary)',
      borderRadius: 'var(--kn-radius)',
    },
  }

  const variant = cta.variant || 'primary'

  return (
    <a
      href={cta.href}
      className={baseClasses}
      style={variantStyles[variant]}
      target={cta.openInNewTab ? '_blank' : undefined}
      rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {cta.label}
    </a>
  )
}

/**
 * Hero block component.
 */
export function Hero({ block }: HeroProps) {
  const {
    headline,
    subheadline,
    ctas = [],
    backgroundImage,
    backgroundOverlay = true,
    alignment = 'center',
    minHeight = 'medium',
  } = block

  // Height mapping
  const heightClasses: Record<string, string> = {
    small: 'min-h-[300px]',
    medium: 'min-h-[500px]',
    large: 'min-h-[700px]',
    full: 'min-h-screen',
  }

  // Alignment mapping
  const alignmentClasses: Record<string, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }

  // Build container styles
  const containerStyle: React.CSSProperties = {
    backgroundColor: 'var(--kn-surface)',
  }

  if (backgroundImage) {
    containerStyle.backgroundImage = `url(${backgroundImage})`
    containerStyle.backgroundSize = 'cover'
    containerStyle.backgroundPosition = 'center'
  }

  return (
    <section
      className={`relative flex flex-col justify-center ${heightClasses[minHeight]} ${alignmentClasses[alignment]} px-4 py-16`}
      style={containerStyle}
      data-block-type="hero"
      data-block-id={block.id}
    >
      {/* Background overlay */}
      {backgroundImage && backgroundOverlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 max-w-4xl mx-auto w-full ${alignment === 'center' ? 'px-4' : ''}`}>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          style={{
            color: backgroundImage ? '#ffffff' : 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          {headline}
        </h1>

        {subheadline && (
          <p
            className="text-lg md:text-xl mb-8 max-w-2xl"
            style={{
              color: backgroundImage ? 'rgba(255, 255, 255, 0.9)' : 'var(--kn-muted)',
              fontFamily: 'var(--kn-font-body)',
              marginLeft: alignment === 'center' ? 'auto' : undefined,
              marginRight: alignment === 'center' ? 'auto' : undefined,
            }}
          >
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div
            className={`flex flex-wrap gap-4 ${
              alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
            }`}
          >
            {ctas.map((cta, index) => (
              <CTAButtonComponent key={index} cta={cta} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
