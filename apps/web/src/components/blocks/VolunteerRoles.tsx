/**
 * VolunteerRoles block component for KapwaNet.
 *
 * Displays volunteer opportunities with time commitments.
 */

import React from 'react'
import type { VolunteerRolesBlock, VolunteerRole, CTAButton } from './types'

interface VolunteerRolesProps {
  block: VolunteerRolesBlock
}

/**
 * Individual role card.
 */
function RoleCard({ role }: { role: VolunteerRole }) {
  return (
    <div
      className="p-6 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderColor: 'var(--kn-muted)',
        borderRadius: 'var(--kn-radius-lg)',
      }}
    >
      {/* Role title */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{
          color: 'var(--kn-text)',
          fontFamily: 'var(--kn-font-heading)',
        }}
      >
        {role.title}
      </h3>

      {/* Time commitment */}
      <div
        className="flex items-center gap-2 text-sm mb-3"
        style={{ color: 'var(--kn-primary)' }}
      >
        <span aria-hidden="true">⏰</span>
        <span style={{ fontFamily: 'var(--kn-font-body)' }}>{role.time}</span>
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed"
        style={{
          color: 'var(--kn-muted)',
          fontFamily: 'var(--kn-font-body)',
        }}
      >
        {role.description}
      </p>
    </div>
  )
}

/**
 * CTA button component.
 */
function CTAButtonComponent({ cta }: { cta: CTAButton }) {
  const openProps = cta.openInNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={cta.href}
      className="inline-flex items-center px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90 hover:scale-105"
      style={{
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
        borderRadius: 'var(--kn-radius)',
        fontFamily: 'var(--kn-font-heading)',
      }}
      {...openProps}
    >
      {cta.label}
    </a>
  )
}

/**
 * VolunteerRoles block component.
 */
export function VolunteerRoles({ block }: VolunteerRolesProps) {
  const { anchor, title, roles, cta } = block

  if (!roles || roles.length === 0) {
    return null
  }

  // Determine grid columns based on role count
  const getGridCols = (count: number): string => {
    if (count === 1) return 'grid-cols-1 max-w-md mx-auto'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="volunteer_roles"
      data-block-id={block.id}
      id={anchor || undefined}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              color: 'var(--kn-text)',
              fontFamily: 'var(--kn-font-heading)',
            }}
          >
            {title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{
              color: 'var(--kn-muted)',
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            Join our team of dedicated volunteers making a difference in our community.
          </p>
        </div>

        {/* Roles grid */}
        <div className={`grid ${getGridCols(roles.length)} gap-6 mb-10`}>
          {roles.map((role, index) => (
            <RoleCard key={`role-${index}-${role.title}`} role={role} />
          ))}
        </div>

        {/* CTA */}
        {cta && (
          <div className="text-center">
            <CTAButtonComponent cta={cta} />
          </div>
        )}
      </div>
    </section>
  )
}

export default VolunteerRoles
