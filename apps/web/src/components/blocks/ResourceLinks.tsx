/**
 * ResourceLinks block component for KapwaNet.
 *
 * Displays a list of downloadable or external resource links.
 */

import React from 'react'
import type { ResourceLinksBlock, ResourceLink } from './types'

interface ResourceLinksProps {
  block: ResourceLinksBlock
}

/**
 * Individual resource link item.
 */
function ResourceLinkItem({ link }: { link: ResourceLink }) {
  const isExternal = link.isExternal ?? link.href.startsWith('http')
  const externalProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={link.href}
      className="group flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md hover:border-transparent"
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderColor: 'var(--kn-muted)',
        borderRadius: 'var(--kn-radius-lg)',
      }}
      {...externalProps}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-colors group-hover:opacity-100"
        style={{
          backgroundColor: 'var(--kn-primary)',
          color: '#ffffff',
          opacity: 0.8,
          borderRadius: 'var(--kn-radius)',
        }}
        aria-hidden="true"
      >
        {isExternal ? (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold mb-1 group-hover:underline"
          style={{
            color: 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          {link.label}
          {isExternal && (
            <span className="ml-1 text-xs" style={{ color: 'var(--kn-muted)' }}>
              ↗
            </span>
          )}
        </h3>
        {link.description && (
          <p
            className="text-sm"
            style={{
              color: 'var(--kn-muted)',
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            {link.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <div
        className="flex-shrink-0 self-center transition-transform group-hover:translate-x-1"
        style={{ color: 'var(--kn-primary)' }}
        aria-hidden="true"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </a>
  )
}

/**
 * ResourceLinks block component.
 */
export function ResourceLinks({ block }: ResourceLinksProps) {
  const { title, links } = block

  if (!links || links.length === 0) {
    return null
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="resource_links"
      data-block-id={block.id}
    >
      <div className="max-w-3xl mx-auto">
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

        {/* Links list */}
        <div className="space-y-3">
          {links.map((link, index) => (
            <ResourceLinkItem key={`link-${index}-${link.label}`} link={link} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResourceLinks
