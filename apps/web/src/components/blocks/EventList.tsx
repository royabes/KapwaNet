/**
 * EventList block component for KapwaNet.
 *
 * Displays upcoming events. This is a Phase 2 placeholder that
 * will be fully implemented when the events module is built.
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { EventListBlock, EventItem, CTAButton } from './types'

interface EventListProps {
  block: EventListBlock
}

/**
 * Format date for display.
 */
function formatDate(dateString: string): { day: string; month: string; year: string } {
  try {
    const date = new Date(dateString)
    return {
      day: date.getDate().toString(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear().toString(),
    }
  } catch {
    return { day: '--', month: '---', year: '----' }
  }
}

/**
 * Event card component.
 */
function EventCard({ event }: { event: EventItem }) {
  const dateInfo = formatDate(event.date)

  const content = (
    <div
      className="flex gap-4 p-4 rounded-lg border transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderColor: 'var(--kn-muted)',
        borderRadius: 'var(--kn-radius-lg)',
      }}
    >
      {/* Date badge */}
      <div
        className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-lg text-center"
        style={{
          backgroundColor: 'var(--kn-primary)',
          color: '#ffffff',
          borderRadius: 'var(--kn-radius)',
        }}
      >
        <span
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: 'var(--kn-font-heading)' }}
        >
          {dateInfo.day}
        </span>
        <span
          className="text-xs uppercase"
          style={{ fontFamily: 'var(--kn-font-body)' }}
        >
          {dateInfo.month}
        </span>
      </div>

      {/* Event details */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold mb-1 line-clamp-1"
          style={{
            color: 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          {event.title}
        </h3>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2">
          {event.time && (
            <span style={{ color: 'var(--kn-muted)' }}>
              <span aria-hidden="true">🕐 </span>
              {event.time}
            </span>
          )}
          {event.location && (
            <span style={{ color: 'var(--kn-muted)' }}>
              <span aria-hidden="true">📍 </span>
              {event.location}
            </span>
          )}
        </div>

        {event.description && (
          <p
            className="text-sm line-clamp-2"
            style={{
              color: 'var(--kn-muted)',
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            {event.description}
          </p>
        )}
      </div>
    </div>
  )

  if (event.href) {
    return (
      <a href={event.href} className="block">
        {content}
      </a>
    )
  }

  return content
}

/**
 * CTA link component.
 */
function CTALink({ cta }: { cta: CTAButton }) {
  const openProps = cta.openInNewTab
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={cta.href}
      className="inline-flex items-center font-medium transition-colors hover:underline"
      style={{ color: 'var(--kn-primary)' }}
      {...openProps}
    >
      {cta.label}
      <span className="ml-1" aria-hidden="true">
        &rarr;
      </span>
    </a>
  )
}

/**
 * Placeholder events for demo.
 */
const placeholderEvents: EventItem[] = [
  {
    id: 'event-1',
    title: 'Monthly Community Potluck',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '6:00 PM - 9:00 PM',
    location: 'Community Center, 123 Main St',
    description: 'Join us for our monthly potluck dinner. Bring a dish to share and meet your neighbors!',
    href: '/events/potluck',
  },
  {
    id: 'event-2',
    title: 'Volunteer Orientation',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00 AM - 12:00 PM',
    location: 'Online via Zoom',
    description: 'Learn about volunteer opportunities and how you can make a difference in your community.',
    href: '/events/orientation',
  },
  {
    id: 'event-3',
    title: 'Food Bank Distribution',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '9:00 AM - 1:00 PM',
    location: 'KapwaNet Office',
    description: 'Weekly food bank distribution for registered community members.',
    href: '/events/food-bank',
  },
  {
    id: 'event-4',
    title: 'Community Workshop: Digital Literacy',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '2:00 PM - 4:00 PM',
    location: 'Public Library',
    description: 'Free workshop on using smartphones and the internet safely.',
    href: '/events/workshop',
  },
  {
    id: 'event-5',
    title: 'Annual Fundraising Gala',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    time: '7:00 PM - 11:00 PM',
    location: 'Downtown Convention Center',
    description: 'Join us for an evening of celebration and support for our community programs.',
    href: '/events/gala',
  },
]

/**
 * EventList block component.
 */
export function EventList({ block }: EventListProps) {
  const { title, limit = 5, cta, events: providedEvents } = block

  const [events, setEvents] = useState<EventItem[]>(providedEvents || [])
  const [loading, setLoading] = useState(!providedEvents)

  // Fetch events from backend if not provided
  useEffect(() => {
    if (providedEvents) {
      setEvents(providedEvents.slice(0, limit))
      return
    }

    // Simulate API fetch
    const fetchEvents = async () => {
      try {
        setLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 300))
        setEvents(placeholderEvents.slice(0, limit))
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [providedEvents, limit])

  // Loading state
  if (loading) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="event_list"
        data-block-id={block.id}
      >
        <div className="max-w-3xl mx-auto">
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
          <div className="space-y-4">
            {[1, 2, 3].slice(0, limit).map((i) => (
              <div
                key={i}
                className="animate-pulse flex gap-4 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--kn-surface)' }}
              >
                <div className="w-16 h-16 bg-gray-300 rounded" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (events.length === 0) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="event_list"
        data-block-id={block.id}
      >
        <div className="max-w-3xl mx-auto text-center">
          {title && (
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{
                color: 'var(--kn-text)',
                fontFamily: 'var(--kn-font-heading)',
              }}
            >
              {title}
            </h2>
          )}
          <p style={{ color: 'var(--kn-muted)' }}>No upcoming events at this time.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="event_list"
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

        {/* Events list */}
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* CTA */}
        {cta && (
          <div className="mt-8 text-center">
            <CTALink cta={cta} />
          </div>
        )}
      </div>
    </section>
  )
}

export default EventList
