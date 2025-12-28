/**
 * ContactBlock block component for KapwaNet.
 *
 * Displays organization contact information with social links.
 */

import React from 'react'
import type { ContactBlockData, SocialLink } from './types'

interface ContactBlockProps {
  block: ContactBlockData
}

/**
 * Get icon for social platform.
 */
function getSocialIcon(platform: SocialLink['platform']): string {
  const icons: Record<SocialLink['platform'], string> = {
    facebook: 'FB',
    twitter: 'X',
    instagram: 'IG',
    linkedin: 'in',
    youtube: 'YT',
    tiktok: 'TT',
    email: '@',
    phone: '#',
    website: 'www',
  }
  return icons[platform]
}

/**
 * Social link component.
 */
function SocialLinkItem({ link }: { link: SocialLink }) {
  return (
    <a
      href={link.url}
      className="w-10 h-10 flex items-center justify-center rounded-full transition-opacity hover:opacity-80"
      style={{
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label || link.platform}
    >
      <span className="text-xs font-bold">
        {getSocialIcon(link.platform)}
      </span>
    </a>
  )
}

/**
 * Contact info item component.
 */
function ContactInfo({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-3">
      <div
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--kn-surface)', color: 'var(--kn-primary)' }}
      >
        <span className="text-lg font-semibold">{icon}</span>
      </div>
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--kn-muted)' }}
        >
          {label}
        </p>
        <p
          className="font-medium"
          style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-body)' }}
        >
          {value}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}

/**
 * ContactBlock block component.
 */
export function ContactBlock({ block }: ContactBlockProps) {
  const {
    title,
    subtitle,
    email,
    phone,
    address,
    hours,
    socialLinks = [],
    showMap = false,
    mapEmbed,
  } = block

  const hasContactInfo = email || phone || address || hours

  return (
    <section
      className="px-4 py-12"
      style={{ backgroundColor: 'var(--kn-surface)' }}
      data-block-type="contact_block"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content grid */}
        <div className={`grid gap-8 ${showMap && mapEmbed ? 'md:grid-cols-2' : ''}`}>
          {/* Contact info */}
          {hasContactInfo && (
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'var(--kn-bg)',
                borderRadius: 'var(--kn-radius-lg)',
              }}
            >
              <div className="space-y-6">
                {email && (
                  <ContactInfo
                    icon="@"
                    label="Email"
                    value={email}
                    href={`mailto:${email}`}
                  />
                )}
                {phone && (
                  <ContactInfo
                    icon="#"
                    label="Phone"
                    value={phone}
                    href={`tel:${phone.replace(/\s/g, '')}`}
                  />
                )}
                {address && (
                  <ContactInfo
                    icon="A"
                    label="Address"
                    value={address}
                  />
                )}
                {hours && (
                  <ContactInfo
                    icon="T"
                    label="Hours"
                    value={hours}
                  />
                )}
              </div>

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--kn-muted)' }}>
                  <p
                    className="text-sm font-medium mb-4"
                    style={{ color: 'var(--kn-muted)' }}
                  >
                    Follow us
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((link, index) => (
                      <SocialLinkItem key={index} link={link} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map embed */}
          {showMap && mapEmbed && (
            <div
              className="aspect-video rounded-lg overflow-hidden"
              style={{ borderRadius: 'var(--kn-radius-lg)' }}
              dangerouslySetInnerHTML={{ __html: mapEmbed }}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default ContactBlock
