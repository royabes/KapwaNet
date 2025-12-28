/**
 * TestimonialQuote block component for KapwaNet.
 *
 * Displays a testimonial quote with optional image and attribution.
 */

import React from 'react'
import type { TestimonialQuoteBlock } from './types'

interface TestimonialQuoteProps {
  block: TestimonialQuoteBlock
}

/**
 * TestimonialQuote block component.
 */
export function TestimonialQuote({ block }: TestimonialQuoteProps) {
  const { quote, name, role, image } = block

  return (
    <section
      className="px-4 py-12"
      data-block-type="testimonial_quote"
      data-block-id={block.id}
    >
      <div
        className="max-w-3xl mx-auto p-8 md:p-12 rounded-lg"
        style={{
          backgroundColor: 'var(--kn-surface)',
          borderRadius: 'var(--kn-radius-xl)',
        }}
      >
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          {/* Optional image */}
          {image && (
            <div className="flex-shrink-0">
              <img
                src={image.src}
                alt={image.alt}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                style={{
                  border: '3px solid var(--kn-primary)',
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* Quote content */}
          <div className="flex-1 text-center md:text-left">
            {/* Quote icon */}
            <div
              className="text-4xl mb-4"
              style={{ color: 'var(--kn-primary)' }}
              aria-hidden="true"
            >
              &ldquo;
            </div>

            {/* Quote text */}
            <blockquote
              className="text-lg md:text-xl italic mb-4"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-body)',
              }}
            >
              {quote}
            </blockquote>

            {/* Attribution */}
            {(name || role) && (
              <footer className="mt-4">
                {name && (
                  <cite
                    className="not-italic font-semibold block"
                    style={{
                      color: 'var(--kn-text)',
                      fontFamily: 'var(--kn-font-heading)',
                    }}
                  >
                    {name}
                  </cite>
                )}
                {role && (
                  <span
                    className="text-sm"
                    style={{
                      color: 'var(--kn-muted)',
                      fontFamily: 'var(--kn-font-body)',
                    }}
                  >
                    {role}
                  </span>
                )}
              </footer>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialQuote
