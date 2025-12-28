'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout'

type SearchResultType = 'help' | 'item' | 'member' | 'page'

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  link: string
  meta?: {
    category?: string
    author?: string
    date?: string
  }
}

// Mock search results
const MOCK_HELP_POSTS: SearchResult[] = [
  {
    id: 'h1',
    type: 'help',
    title: 'Need help with grocery pickup',
    description: 'Looking for someone to help pick up groceries from the store this weekend.',
    link: '/invitations',
    meta: { category: 'Errands', author: 'Maria G.' },
  },
  {
    id: 'h2',
    type: 'help',
    title: 'Offering rides to medical appointments',
    description: 'I have availability on weekday mornings to drive neighbors to appointments.',
    link: '/invitations',
    meta: { category: 'Transportation', author: 'Ben T.' },
  },
  {
    id: 'h3',
    type: 'help',
    title: 'Need companionship for walks',
    description: 'Would love to find a walking buddy for morning walks in the neighborhood.',
    link: '/invitations',
    meta: { category: 'Companionship', author: 'Sarah L.' },
  },
]

const MOCK_ITEM_POSTS: SearchResult[] = [
  {
    id: 'i1',
    type: 'item',
    title: 'Fresh vegetables from garden',
    description: 'Tomatoes, zucchini, and peppers from my backyard garden.',
    link: '/gifts',
    meta: { category: 'Food', author: 'Ben T.' },
  },
  {
    id: 'i2',
    type: 'item',
    title: 'Baby clothes (0-6 months)',
    description: 'Gently used onesies and sleepers in good condition.',
    link: '/gifts',
    meta: { category: 'Clothing', author: 'Linda M.' },
  },
  {
    id: 'i3',
    type: 'item',
    title: 'Books for kids ages 5-10',
    description: 'Collection of picture books and early readers.',
    link: '/gifts',
    meta: { category: 'Books', author: 'David K.' },
  },
]

const MOCK_MEMBERS: SearchResult[] = [
  {
    id: 'm1',
    type: 'member',
    title: 'Maria Garcia',
    description: 'Community organizer, loves cooking and helping neighbors.',
    link: '/profile/maria',
  },
  {
    id: 'm2',
    type: 'member',
    title: 'Ben Thompson',
    description: 'Retired teacher, offers tutoring and rides.',
    link: '/profile/ben',
  },
]

const MOCK_PAGES: SearchResult[] = [
  {
    id: 'p1',
    type: 'page',
    title: 'Philosophy',
    description: 'Learn about kapwa and the principles behind KapwaNet.',
    link: '/philosophy',
  },
  {
    id: 'p2',
    type: 'page',
    title: 'Welcome to KapwaNet',
    description: 'Getting started guide for new community members.',
    link: '/welcome',
  },
]

function getResultIcon(type: SearchResultType) {
  switch (type) {
    case 'help':
      return { icon: 'volunteer_activism', color: 'text-primary bg-primary/10' }
    case 'item':
      return { icon: 'redeem', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' }
    case 'member':
      return { icon: 'person', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' }
    case 'page':
      return { icon: 'article', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' }
  }
}

function getTypeLabelColor(type: SearchResultType) {
  switch (type) {
    case 'help':
      return 'bg-primary/10 text-primary'
    case 'item':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    case 'member':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'page':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialType = (searchParams.get('type') as SearchResultType | 'all') || 'all'

  const [query, setQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = useCallback((searchQuery: string, filter: SearchResultType | 'all') => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Simulate search delay
    setTimeout(() => {
      const allResults = [...MOCK_HELP_POSTS, ...MOCK_ITEM_POSTS, ...MOCK_MEMBERS, ...MOCK_PAGES]
      const searchLower = searchQuery.toLowerCase()

      let filtered = allResults.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.meta?.category?.toLowerCase().includes(searchLower) ||
          r.meta?.author?.toLowerCase().includes(searchLower)
      )

      if (filter !== 'all') {
        filtered = filtered.filter((r) => r.type === filter)
      }

      setResults(filtered)
      setIsSearching(false)
    }, 300)
  }, [])

  useEffect(() => {
    performSearch(query, activeFilter)
  }, [query, activeFilter, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL params
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeFilter !== 'all') params.set('type', activeFilter)
    router.push(`/search?${params.toString()}`)
  }

  const handleFilterChange = (filter: SearchResultType | 'all') => {
    setActiveFilter(filter)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filter !== 'all') params.set('type', filter)
    router.push(`/search?${params.toString()}`)
  }

  const counts = {
    all: results.length,
    help: results.filter((r) => r.type === 'help').length,
    item: results.filter((r) => r.type === 'item').length,
    member: results.filter((r) => r.type === 'member').length,
    page: results.filter((r) => r.type === 'page').length,
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[24px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invitations, gifts, members..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
        {([
          { key: 'all', label: 'All' },
          { key: 'help', label: 'Invitations' },
          { key: 'item', label: 'Gifts' },
          { key: 'member', label: 'Members' },
          { key: 'page', label: 'Pages' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === key
                ? 'bg-primary text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {label}
            {query && counts[key] > 0 && (
              <span className={`ml-1.5 ${activeFilter === key ? 'text-white/80' : 'text-stone-400'}`}>
                ({counts[key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
        </div>
      ) : query && results.length === 0 ? (
        <div className="py-12 text-center">
          <div className="size-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-stone-400 text-[40px]">
              search_off
            </span>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            No results found
          </h3>
          <p className="text-stone-500 dark:text-stone-500">
            Try different keywords or remove filters
          </p>
        </div>
      ) : !query ? (
        <div className="py-12 text-center">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[40px]">
              explore
            </span>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            Search your community
          </h3>
          <p className="text-stone-500 dark:text-stone-500">
            Find invitations, gifts, members, and more
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const { icon, color } = getResultIcon(result.type)
            const typeLabelColor = getTypeLabelColor(result.type)

            return (
              <Link
                key={result.id}
                href={result.link}
                className="flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <span className="material-symbols-outlined text-[24px]">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeLabelColor}`}>
                      {result.type === 'help' ? 'Invitation' : result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </span>
                    {result.meta?.category && (
                      <span className="text-xs text-stone-500">{result.meta.category}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1 line-clamp-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                    {result.description}
                  </p>
                  {result.meta?.author && (
                    <p className="text-xs text-stone-500 mt-2">by {result.meta.author}</p>
                  )}
                </div>
                <span className="material-symbols-outlined text-stone-300 text-[20px] self-center">
                  chevron_right
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Spacer for mobile */}
      <div className="h-10 lg:h-0" />
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
      <div className="mb-6">
        <div className="h-14 rounded-2xl bg-stone-200 dark:bg-stone-700 animate-pulse" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
        ))}
      </div>
      <div className="py-12 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
          progress_activity
        </span>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <AppShell title="Search">
      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </AppShell>
  )
}
