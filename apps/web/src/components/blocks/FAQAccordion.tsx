/**
 * FAQAccordion block component for KapwaNet.
 *
 * Displays an expandable FAQ section with full keyboard accessibility.
 * Follows WAI-ARIA Accordion pattern.
 */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import type { FAQAccordionBlock, FAQItem } from './types'

interface FAQAccordionProps {
  block: FAQAccordionBlock
}

interface AccordionItemProps {
  item: FAQItem
  index: number
  isOpen: boolean
  onToggle: (index: number) => void
  blockId: string
  onKeyDown: (e: React.KeyboardEvent, index: number) => void
}

/**
 * Individual accordion item with accessibility support.
 */
function AccordionItem({
  item,
  index,
  isOpen,
  onToggle,
  blockId,
  onKeyDown,
}: AccordionItemProps) {
  const headingId = `faq-heading-${blockId}-${index}`
  const panelId = `faq-panel-${blockId}-${index}`

  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--kn-muted)', borderBottomWidth: '1px' }}
    >
      {/* Question header (button) */}
      <h3>
        <button
          type="button"
          id={headingId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="w-full flex justify-between items-center py-4 px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors"
          style={{
            color: 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
          data-faq-index={index}
        >
          <span className="text-lg font-medium pr-4">{item.q}</span>
          <span
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--kn-primary)',
            }}
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </h3>

      {/* Answer panel */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!isOpen}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="pb-4 px-1"
          style={{
            color: 'var(--kn-muted)',
            fontFamily: 'var(--kn-font-body)',
          }}
        >
          <p className="text-base leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * FAQAccordion block component.
 */
export function FAQAccordion({ block }: FAQAccordionProps) {
  const { title, items } = block
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  // Toggle accordion item
  const handleToggle = useCallback((index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  // Handle keyboard navigation (WAI-ARIA Accordion pattern)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-faq-index]'
      )
      if (!buttons) return

      let targetIndex: number | null = null

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          targetIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          break
        case 'ArrowUp':
          e.preventDefault()
          targetIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          break
        case 'Home':
          e.preventDefault()
          targetIndex = 0
          break
        case 'End':
          e.preventDefault()
          targetIndex = items.length - 1
          break
        case 'Enter':
        case ' ':
          // Default button behavior handles toggle
          break
        default:
          return
      }

      if (targetIndex !== null) {
        const targetButton = buttons[targetIndex]
        targetButton?.focus()
      }
    },
    [items.length]
  )

  return (
    <section
      className="px-4 py-12"
      data-block-type="faq_accordion"
      data-block-id={block.id}
    >
      <div className="max-w-3xl mx-auto" ref={containerRef}>
        {/* Section title */}
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

        {/* Accordion items */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: 'var(--kn-surface)',
            borderColor: 'var(--kn-muted)',
            borderRadius: 'var(--kn-radius-lg)',
          }}
        >
          {items.map((item, index) => (
            <AccordionItem
              key={`faq-${index}`}
              item={item}
              index={index}
              isOpen={openIndices.has(index)}
              onToggle={handleToggle}
              blockId={block.id}
              onKeyDown={handleKeyDown}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQAccordion
