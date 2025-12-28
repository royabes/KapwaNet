/**
 * RichTextSection block component for KapwaNet.
 *
 * Renders sanitized HTML content with theming support.
 */

import React from 'react'
import DOMPurify from 'isomorphic-dompurify'
import type { RichTextSectionBlock } from './types'

interface RichTextSectionProps {
  block: RichTextSectionBlock
}

/**
 * RichTextSection block component.
 *
 * Sanitizes HTML content to prevent XSS attacks while preserving
 * safe formatting elements.
 */
export function RichTextSection({ block }: RichTextSectionProps) {
  const { content, maxWidth = 'lg', centered = true } = block

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'a', 'strong', 'b', 'em', 'i', 'u', 's',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'figure', 'figcaption',
      'div', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'title', 'width', 'height',
      'class', 'id',
    ],
    ADD_ATTR: ['target'],
  })

  // Max width mapping
  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full',
  }

  return (
    <section
      className={`px-4 py-12 ${centered ? 'mx-auto' : ''} ${maxWidthClasses[maxWidth]}`}
      data-block-type="rich_text_section"
      data-block-id={block.id}
    >
      <div
        className="prose prose-lg"
        style={{
          '--tw-prose-body': 'var(--kn-text)',
          '--tw-prose-headings': 'var(--kn-text)',
          '--tw-prose-links': 'var(--kn-primary)',
          '--tw-prose-bold': 'var(--kn-text)',
          '--tw-prose-quotes': 'var(--kn-muted)',
          '--tw-prose-quote-borders': 'var(--kn-accent)',
          '--tw-prose-hr': 'var(--kn-muted)',
          fontFamily: 'var(--kn-font-body)',
        } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </section>
  )
}

export default RichTextSection
