/**
 * DonateWidget block component for KapwaNet.
 *
 * Displays donation call-to-action with suggested amounts and links.
 */

import React from 'react'
import DOMPurify from 'isomorphic-dompurify'
import type { DonateWidgetBlock, DonationLink } from './types'

interface DonateWidgetProps {
  block: DonateWidgetBlock
}

/**
 * Suggested amount button.
 */
function AmountButton({ amount, href }: { amount: string; href?: string }) {
  const buttonContent = (
    <span
      className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
      style={{
        backgroundColor: 'var(--kn-surface)',
        color: 'var(--kn-text)',
        border: '2px solid var(--kn-primary)',
        borderRadius: 'var(--kn-radius-lg)',
        fontFamily: 'var(--kn-font-heading)',
      }}
    >
      {amount}
    </span>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    )
  }

  return <span className="inline-block">{buttonContent}</span>
}

/**
 * Donation link button.
 */
function DonationLinkButton({ link }: { link: DonationLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90 hover:scale-105"
      style={{
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
        borderRadius: 'var(--kn-radius)',
        fontFamily: 'var(--kn-font-heading)',
      }}
    >
      {link.label}
    </a>
  )
}

/**
 * DonateWidget block component.
 */
export function DonateWidget({ block }: DonateWidgetProps) {
  const { title, body, donationLinks, suggestedAmounts } = block

  // Sanitize body HTML if provided
  const sanitizedBody = body
    ? DOMPurify.sanitize(body, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })
    : null

  return (
    <section
      className="px-4 py-12"
      data-block-type="donate_widget"
      data-block-id={block.id}
    >
      <div
        className="max-w-2xl mx-auto text-center p-8 md:p-12 rounded-xl"
        style={{
          backgroundColor: 'var(--kn-surface)',
          borderRadius: 'var(--kn-radius-xl)',
          border: '1px solid var(--kn-muted)',
        }}
      >
        {/* Heart icon */}
        <div
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: 'var(--kn-primary)', color: '#ffffff' }}
          aria-hidden="true"
        >
          ❤️
        </div>

        {/* Title */}
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{
            color: 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          {title}
        </h2>

        {/* Body content */}
        {sanitizedBody && (
          <div
            className="prose prose-lg mx-auto mb-8"
            style={{
              '--tw-prose-body': 'var(--kn-muted)',
              '--tw-prose-links': 'var(--kn-primary)',
              fontFamily: 'var(--kn-font-body)',
            } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: sanitizedBody }}
          />
        )}

        {/* Suggested amounts */}
        {suggestedAmounts && suggestedAmounts.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {suggestedAmounts.map((amount, index) => (
              <AmountButton key={`amount-${index}`} amount={amount} />
            ))}
          </div>
        )}

        {/* Donation links */}
        {donationLinks && donationLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {donationLinks.map((link, index) => (
              <DonationLinkButton key={`link-${index}`} link={link} />
            ))}
          </div>
        )}

        {/* Security note */}
        <p
          className="mt-6 text-sm"
          style={{ color: 'var(--kn-muted)' }}
        >
          🔒 Secure donation processing. Your contribution makes a difference.
        </p>
      </div>
    </section>
  )
}

export default DonateWidget
