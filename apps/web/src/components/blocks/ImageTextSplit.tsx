/**
 * ImageTextSplit block component for KapwaNet.
 *
 * Displays a side-by-side layout with an image on one side
 * and text content (title + body HTML) on the other.
 */

import React from 'react'
import DOMPurify from 'isomorphic-dompurify'
import type { ImageTextSplitBlock } from './types'

interface ImageTextSplitProps {
  block: ImageTextSplitBlock
}

/**
 * ImageTextSplit block component.
 */
export function ImageTextSplit({ block }: ImageTextSplitProps) {
  const { anchor, title, body, image, imagePosition = 'right' } = block

  // Sanitize HTML content
  const sanitizedBody = DOMPurify.sanitize(body, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'a', 'strong', 'b', 'em', 'i', 'u', 's',
      'blockquote', 'code', 'pre',
      'div', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'class', 'id',
    ],
    ADD_ATTR: ['target'],
  })

  // Image component
  const ImageContent = (
    <div className="relative w-full h-64 md:h-auto md:min-h-[300px] lg:min-h-[400px]">
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover rounded-lg"
        style={{ borderRadius: 'var(--kn-radius-lg)' }}
        loading="lazy"
      />
    </div>
  )

  // Text content component
  const TextContent = (
    <div className="flex flex-col justify-center py-4 md:py-8">
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
        style={{
          color: 'var(--kn-text)',
          fontFamily: 'var(--kn-font-heading)',
        }}
      >
        {title}
      </h2>
      <div
        className="prose prose-lg"
        style={{
          '--tw-prose-body': 'var(--kn-text)',
          '--tw-prose-headings': 'var(--kn-text)',
          '--tw-prose-links': 'var(--kn-primary)',
          '--tw-prose-bold': 'var(--kn-text)',
          '--tw-prose-quotes': 'var(--kn-muted)',
          fontFamily: 'var(--kn-font-body)',
        } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />
    </div>
  )

  return (
    <section
      className="px-4 py-12"
      data-block-type="image_text_split"
      data-block-id={block.id}
      id={anchor || undefined}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {imagePosition === 'left' ? (
            <>
              {ImageContent}
              {TextContent}
            </>
          ) : (
            <>
              {TextContent}
              {ImageContent}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default ImageTextSplit
