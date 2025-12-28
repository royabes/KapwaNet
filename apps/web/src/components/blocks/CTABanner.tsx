/**
 * CTABanner block component for KapwaNet.
 *
 * Call-to-action banner with headline and primary/secondary buttons.
 */

import React from 'react'
import type { CTABannerBlock, CTAButton } from './types'

interface CTABannerProps {
  block: CTABannerBlock
}

/**
 * CTA Button component for banner.
 */
function BannerButton({ cta, isPrimary, bgColor }: { cta: CTAButton; isPrimary: boolean; bgColor: string }) {
  // Determine colors based on background and variant
  const getButtonStyles = (): React.CSSProperties => {
    if (isPrimary) {
      // Primary button: contrasting with background
      if (bgColor === 'primary') {
        return {
          backgroundColor: '#ffffff',
          color: 'var(--kn-primary)',
          borderRadius: 'var(--kn-radius)',
        }
      }
      return {
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
        borderRadius: 'var(--kn-radius)',
      }
    }

    // Secondary button: outline style
    if (bgColor === 'primary' || bgColor === 'secondary') {
      return {
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: '2px solid #ffffff',
        borderRadius: 'var(--kn-radius)',
      }
    }
    return {
      backgroundColor: 'transparent',
      color: 'var(--kn-primary)',
      border: '2px solid var(--kn-primary)',
      borderRadius: 'var(--kn-radius)',
    }
  }

  return (
    <a
      href={cta.href}
      className="inline-block px-6 py-3 font-medium transition-opacity hover:opacity-90"
      style={getButtonStyles()}
      target={cta.openInNewTab ? '_blank' : undefined}
      rel={cta.openInNewTab ? 'noopener noreferrer' : undefined}
    >
      {cta.label}
    </a>
  )
}

/**
 * CTABanner block component.
 */
export function CTABanner({ block }: CTABannerProps) {
  const {
    headline,
    subheadline,
    primaryCta,
    secondaryCta,
    backgroundColor = 'primary',
  } = block

  // Background color mapping
  const bgColorMap: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--kn-primary)',
    },
    secondary: {
      backgroundColor: 'var(--kn-secondary)',
    },
    accent: {
      backgroundColor: 'var(--kn-accent)',
    },
    surface: {
      backgroundColor: 'var(--kn-surface)',
    },
  }

  // Text color based on background
  const getTextColor = () => {
    if (backgroundColor === 'primary' || backgroundColor === 'secondary') {
      return '#ffffff'
    }
    return 'var(--kn-text)'
  }

  const getSubtextColor = () => {
    if (backgroundColor === 'primary' || backgroundColor === 'secondary') {
      return 'rgba(255, 255, 255, 0.9)'
    }
    return 'var(--kn-muted)'
  }

  return (
    <section
      className="px-4 py-16"
      style={bgColorMap[backgroundColor]}
      data-block-type="cta_banner"
      data-block-id={block.id}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{
            color: getTextColor(),
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          {headline}
        </h2>

        {subheadline && (
          <p
            className="text-lg mb-8 max-w-2xl mx-auto"
            style={{
              color: getSubtextColor(),
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            {subheadline}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div className="flex flex-wrap justify-center gap-4">
            {primaryCta && (
              <BannerButton
                cta={primaryCta}
                isPrimary={true}
                bgColor={backgroundColor}
              />
            )}
            {secondaryCta && (
              <BannerButton
                cta={secondaryCta}
                isPrimary={false}
                bgColor={backgroundColor}
              />
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default CTABanner
