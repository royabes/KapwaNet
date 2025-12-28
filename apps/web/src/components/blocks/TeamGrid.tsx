/**
 * TeamGrid block component for KapwaNet.
 *
 * Displays team members in a grid with optional click-to-expand bio.
 */

'use client'

import React, { useState } from 'react'
import type { TeamGridBlock, TeamMember } from './types'

interface TeamGridProps {
  block: TeamGridBlock
}

/**
 * Modal for displaying member bio.
 */
function BioModal({
  member,
  onClose,
}: {
  member: TeamMember
  onClose: () => void
}) {
  // Handle escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className="relative max-w-lg w-full p-6 rounded-lg shadow-xl"
        style={{
          backgroundColor: 'var(--kn-bg)',
          borderRadius: 'var(--kn-radius-xl)',
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          style={{ color: 'var(--kn-muted)' }}
          aria-label="Close"
        >
          <span className="text-xl" aria-hidden="true">
            &times;
          </span>
        </button>

        {/* Member info */}
        <div className="flex flex-col items-center text-center">
          {member.photo && (
            <img
              src={member.photo.src}
              alt={member.photo.alt}
              className="w-24 h-24 rounded-full object-cover mb-4"
              style={{ border: '3px solid var(--kn-primary)' }}
            />
          )}

          <h3
            id="modal-title"
            className="text-xl font-bold mb-1"
            style={{
              color: 'var(--kn-text)',
              fontFamily: 'var(--kn-font-heading)',
            }}
          >
            {member.name}
          </h3>

          {member.role && (
            <p
              className="text-sm mb-4"
              style={{
                color: 'var(--kn-primary)',
                fontFamily: 'var(--kn-font-body)',
              }}
            >
              {member.role}
            </p>
          )}

          {member.bio && (
            <p
              className="text-base leading-relaxed"
              style={{
                color: 'var(--kn-muted)',
                fontFamily: 'var(--kn-font-body)',
              }}
            >
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Individual team member card.
 */
function MemberCard({
  member,
  onClick,
  showBioOnClick,
}: {
  member: TeamMember
  onClick: () => void
  showBioOnClick: boolean
}) {
  const isClickable = showBioOnClick && member.bio

  return (
    <div
      className={`text-center p-4 rounded-lg transition-all ${
        isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''
      }`}
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderRadius: 'var(--kn-radius-lg)',
      }}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-label={isClickable ? `View bio of ${member.name}` : undefined}
    >
      {/* Photo */}
      {member.photo ? (
        <img
          src={member.photo.src}
          alt={member.photo.alt}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
          style={{ border: '3px solid var(--kn-primary)' }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
          style={{ backgroundColor: 'var(--kn-primary)' }}
          aria-hidden="true"
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name */}
      <h3
        className="text-lg font-semibold mb-1"
        style={{
          color: 'var(--kn-text)',
          fontFamily: 'var(--kn-font-heading)',
        }}
      >
        {member.name}
      </h3>

      {/* Role */}
      {member.role && (
        <p
          className="text-sm"
          style={{
            color: 'var(--kn-muted)',
            fontFamily: 'var(--kn-font-body)',
          }}
        >
          {member.role}
        </p>
      )}

      {/* Click hint */}
      {isClickable && (
        <p
          className="text-xs mt-2"
          style={{ color: 'var(--kn-primary)' }}
        >
          Click to view bio
        </p>
      )}
    </div>
  )
}

/**
 * TeamGrid block component.
 */
export function TeamGrid({ block }: TeamGridProps) {
  const { title, members, showBioOnClick = true, columns = 3 } = block
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Grid columns mapping
  const gridColsMap: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <>
      <section
        className="px-4 py-12"
        data-block-type="team_grid"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto">
          {/* Title */}
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

          {/* Grid */}
          <div className={`grid ${gridColsMap[columns]} gap-6`}>
            {members.map((member, index) => (
              <MemberCard
                key={`member-${index}-${member.name}`}
                member={member}
                onClick={() => setSelectedMember(member)}
                showBioOnClick={showBioOnClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bio Modal */}
      {selectedMember && (
        <BioModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  )
}

export default TeamGrid
