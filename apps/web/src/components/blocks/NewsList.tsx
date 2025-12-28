/**
 * NewsList block component for KapwaNet.
 *
 * Displays a list of news articles with optional filtering.
 * Can fetch from backend or use provided items.
 */

'use client'

import React, { useState, useEffect } from 'react'
import type { NewsListBlock, NewsItem, CTAButton } from './types'

interface NewsListProps {
  block: NewsListBlock
}

/**
 * Format date for display.
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * News card component.
 */
function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article
      className="flex flex-col rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--kn-surface)',
        borderRadius: 'var(--kn-radius-lg)',
        border: '1px solid var(--kn-muted)',
      }}
    >
      {/* Image */}
      {item.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <time
          dateTime={item.published_at}
          className="text-xs mb-2"
          style={{
            color: 'var(--kn-muted)',
            fontFamily: 'var(--kn-font-body)',
          }}
        >
          {formatDate(item.published_at)}
        </time>

        <h3
          className="text-lg font-semibold mb-2 line-clamp-2"
          style={{
            color: 'var(--kn-text)',
            fontFamily: 'var(--kn-font-heading)',
          }}
        >
          <a
            href={`/news/${item.slug}`}
            className="hover:underline"
            style={{ color: 'inherit' }}
          >
            {item.title}
          </a>
        </h3>

        {item.excerpt && (
          <p
            className="text-sm line-clamp-3 flex-1"
            style={{
              color: 'var(--kn-muted)',
              fontFamily: 'var(--kn-font-body)',
            }}
          >
            {item.excerpt}
          </p>
        )}

        <a
          href={`/news/${item.slug}`}
          className="inline-flex items-center mt-4 text-sm font-medium"
          style={{ color: 'var(--kn-primary)' }}
        >
          Read more
          <span className="ml-1" aria-hidden="true">
            &rarr;
          </span>
        </a>
      </div>
    </article>
  )
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
      className="inline-flex items-center px-6 py-3 rounded-md font-medium transition-colors hover:opacity-90"
      style={{
        backgroundColor: 'var(--kn-primary)',
        color: '#ffffff',
        borderRadius: 'var(--kn-radius)',
      }}
      {...openProps}
    >
      {cta.label}
    </a>
  )
}

/**
 * Placeholder news items for demo.
 */
const placeholderNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Community Food Drive This Weekend',
    excerpt: 'Join us for our monthly food drive to support families in need. We are collecting non-perishable items and fresh produce.',
    published_at: new Date().toISOString(),
    slug: 'community-food-drive',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600',
  },
  {
    id: 'news-2',
    title: 'Volunteer Appreciation Event',
    excerpt: 'Celebrating our amazing volunteers who make everything possible. Thank you for your dedication!',
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    slug: 'volunteer-appreciation',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600',
  },
  {
    id: 'news-3',
    title: 'New Partnership Announced',
    excerpt: 'We are excited to partner with local businesses to expand our reach and impact in the community.',
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    slug: 'new-partnership',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600',
  },
]

/**
 * NewsList block component.
 */
export function NewsList({ block }: NewsListProps) {
  const {
    title,
    limit = 3,
    source = 'public',
    showFilters = false,
    cta,
    items: providedItems,
  } = block

  const [newsItems, setNewsItems] = useState<NewsItem[]>(providedItems || [])
  const [loading, setLoading] = useState(!providedItems)
  const [error, setError] = useState<string | null>(null)

  // Fetch news from backend if not provided
  useEffect(() => {
    if (providedItems) {
      setNewsItems(providedItems.slice(0, limit))
      return
    }

    // Simulate API fetch (in production, fetch from actual API)
    const fetchNews = async () => {
      try {
        setLoading(true)
        // In production: const response = await fetch(`/api/news?limit=${limit}&source=${source}`)
        // For now, use placeholder data
        await new Promise(resolve => setTimeout(resolve, 300))
        setNewsItems(placeholderNews.slice(0, limit))
        setError(null)
      } catch {
        setError('Failed to load news')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [providedItems, limit, source])

  // Loading state
  if (loading) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="news_list"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].slice(0, limit).map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg overflow-hidden"
                style={{ backgroundColor: 'var(--kn-surface)' }}
              >
                <div className="aspect-video bg-gray-300" />
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-300 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="news_list"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: 'var(--kn-muted)' }}>{error}</p>
        </div>
      </section>
    )
  }

  // Empty state
  if (newsItems.length === 0) {
    return (
      <section
        className="px-4 py-12"
        data-block-type="news_list"
        data-block-id={block.id}
      >
        <div className="max-w-6xl mx-auto text-center">
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
          <p style={{ color: 'var(--kn-muted)' }}>No news articles found.</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="px-4 py-12"
      data-block-type="news_list"
      data-block-id={block.id}
    >
      <div className="max-w-6xl mx-auto">
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

        {/* Filters placeholder (for future implementation) */}
        {showFilters && (
          <div className="mb-6 flex justify-center gap-4">
            <span
              className="text-sm"
              style={{ color: 'var(--kn-muted)' }}
            >
              Filters coming soon...
            </span>
          </div>
        )}

        {/* News grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <NewsCard key={item.id} item={item} />
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

export default NewsList
