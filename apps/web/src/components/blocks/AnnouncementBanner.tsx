/**
 * AnnouncementBanner block component for KapwaNet.
 *
 * Displays an announcement banner with info/warning/success variants.
 * Supports optional dismissible functionality with localStorage persistence.
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { AnnouncementBannerBlock, CTAButton } from './types'

interface AnnouncementBannerProps {
  block: AnnouncementBannerBlock
}

/**
 * Get storage key for dismissed banner.
 */
function getDismissedKey(blockId: string): string {
  return `kn-banner-dismissed-${blockId}`
}

/**
 * Variant-specific styling configurations.
 */
const variantStyles: Record<string, {
  background: string
  border: string
  icon: string
  iconBg: string
}> = {
  info: {
    background: 'var(--kn-surface)',
    border: 'var(--kn-primary)',
    icon: 'i',
    iconBg: 'var(--kn-primary)',
  },
  warning: {
    background: '#FEF3C7', // amber-50
    border: '#F59E0B', // amber-500
    icon: '!',
    iconBg: '#F59E0B',
  },
  success: {
    background: '#D1FAE5', // green-100
    border: '#10B981', // green-500
    icon: '✓',
    iconBg: '#10B981',
  },
}

/**
 * CTA button component for banner.
 */
function BannerCTA({ cta }: { cta: CTAButton }) {
  const openProps = cta.openInNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={cta.href}
      className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90"
      style={{
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
        borderRadius: 'var(--kn-radius)',
      }}
      {...openProps}
    >
      {cta.label}
    </a>
  )
}

/**
 * AnnouncementBanner block component.
 */
export function AnnouncementBanner({ block }: AnnouncementBannerProps) {
  const { title, text, cta, variant = 'info', dismissible = false } = block
  const [isDismissed, setIsDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check localStorage for dismissed state on mount (client-side only)
  useEffect(() => {
    setMounted(true)
    if (dismissible && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(getDismissedKey(block.id))
      if (dismissed === 'true') {
        setIsDismissed(true)
      }
    }
  }, [block.id, dismissible])

  // Handle dismiss action
  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getDismissedKey(block.id), 'true')
    }
    setIsDismissed(true)
  }

  // Don't render if dismissed
  if (isDismissed && mounted) {
    return null
  }

  const styles = variantStyles[variant] || variantStyles.info

  return (
    <section
      className="px-4 py-4"
      data-block-type="announcement_banner"
      data-block-id={block.id}
      role="alert"
      aria-live="polite"
    >
      <div
        className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-3 rounded-lg border-l-4"
        style={{
          backgroundColor: styles.background,
          borderLeftColor: styles.border,
          borderRadius: 'var(--kn-radius-lg)',
        }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: styles.iconBg }}
          aria-hidden="true"
        >
          {styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3
              className="font-semibold mb-1"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-heading)',
              }}
            >
              {title}
            </h3>
          )}
          <p
            className="text-sm"
            style={{
              color: 'var(--kn-text)',
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            {text}
          </p>
        </div>

        {/* CTA button */}
        {cta && (
          <div className="flex-shrink-0">
            <BannerCTA cta={cta} />
          </div>
        )}

        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            style={{ color: 'var(--kn-muted)' }}
            aria-label="Dismiss announcement"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </section>
  )
}

export default AnnouncementBanner
