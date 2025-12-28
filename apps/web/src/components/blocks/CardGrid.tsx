/**
 * CardGrid block component for KapwaNet.
 *
 * Displays cards in a responsive grid with configurable columns.
 */

import React from 'react'
import type { CardGridBlock, CardItem } from './types'

interface CardGridProps {
  block: CardGridBlock
}

/**
 * Individual card component.
 */
function Card({ card, cardStyle }: { card: CardItem; cardStyle: CardGridBlock['cardStyle'] }) {
  // Card style variants
  const styleMap: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'var(--kn-surface)',
      borderRadius: 'var(--kn-radius-lg)',
    },
    bordered: {
      backgroundColor: 'var(--kn-surface)',
      border: '1px solid var(--kn-muted)',
      borderRadius: 'var(--kn-radius-lg)',
    },
    elevated: {
      backgroundColor: 'var(--kn-surface)',
      borderRadius: 'var(--kn-radius-lg)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
  }

  const style = cardStyle || 'default'

  const content = (
    <>
      {card.image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {card.icon && (
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-2xl"
            style={{ backgroundColor: 'var(--kn-primary)', color: '#ffffff' }}
          >
            {card.icon}
          </div>
        )}
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--kn-text)', fontFamily: 'var(--kn-font-heading)' }}
        >
          {card.title}
        </h3>
        {card.description && (
          <p style={{ color: 'var(--kn-muted)', fontFamily: 'var(--kn-font-body)' }}>
            {card.description}
          </p>
        )}
      </div>
    </>
  )

  const cardClasses = 'overflow-hidden transition-transform hover:scale-[1.02]'

  if (card.href) {
    return (
      <a
        href={card.href}
        className={cardClasses}
        style={styleMap[style]}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={cardClasses} style={styleMap[style]}>
      {content}
    </div>
  )
}

/**
 * CardGrid block component.
 */
export function CardGrid({ block }: CardGridProps) {
  const { title, subtitle, cards, columns = 3, cardStyle = 'default' } = block

  // Column mapping
  const columnClasses: Record<number, string> = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section
      className="px-4 py-12 max-w-7xl mx-auto"
      data-block-type="card_grid"
      data-block-id={block.id}
    >
      {/* Section header */}
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

      {/* Cards grid */}
      <div className={`grid gap-6 ${columnClasses[columns]}`}>
        {cards.map((card) => (
          <Card key={card.id} card={card} cardStyle={cardStyle} />
        ))}
      </div>
    </section>
  )
}

export default CardGrid
