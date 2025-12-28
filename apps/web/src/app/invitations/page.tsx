'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { api, HelpPost } from '@/lib/api'
import { useAuth } from '@/contexts'

// Default org ID for demo
const DEFAULT_ORG_ID = '1'

type FilterType = 'all' | 'request' | 'offer'
type FilterUrgency = 'all' | 'high' | 'normal' | 'low'

const urgencyColors = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

// Kapwa reframing: "request" = invitation, "offer" = gift of time/skill
const typeIcons = {
  request: 'mail',        // Invitation to community
  offer: 'volunteer_activism',  // Gift of participation
}

const typeLabels = {
  request: 'Invitation',  // Someone inviting help
  offer: 'Gift',          // Someone sharing capacity
}

const categoryIcons: Record<string, string> = {
  transportation: 'directions_car',
  errands: 'shopping_cart',
  tutoring: 'school',
  childcare: 'child_care',
  eldercare: 'elderly',
  repairs: 'build',
  companionship: 'diversity_3',
  other: 'more_horiz',
}

export default function InvitationsPage() {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<HelpPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterUrgency, setFilterUrgency] = useState<FilterUrgency>('all')

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const filters: Record<string, string> = { status: 'open' }
        if (filterType !== 'all') filters.type = filterType
        if (filterUrgency !== 'all') filters.urgency = filterUrgency

        const data = await api.helpPosts.list(DEFAULT_ORG_ID, filters as any)
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch help posts:', error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [filterType, filterUrgency])

  return (
    <AppShell title="Community Invitations">
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-dark/80 backdrop-blur-sm sticky top-0 z-10 lg:top-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              Community Invitations
            </h1>
            {isAuthenticated && (
              <Link
                href="/create?type=help"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Invite
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* Type Filter */}
            <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
              {(['all', 'request', 'offer'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'request' ? 'Invitations' : 'Gifts'}
                </button>
              ))}
            </div>

            {/* Urgency Filter */}
            <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
              {(['all', 'high', 'normal', 'low'] as FilterUrgency[]).map((urgency) => (
                <button
                  key={urgency}
                  onClick={() => setFilterUrgency(urgency)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterUrgency === urgency
                      ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {urgency === 'all' ? 'Any' : urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-stone-dark/50 rounded-2xl p-4 border border-stone-200 dark:border-stone-800">
                  <div className="flex gap-4">
                    <div className="size-12 rounded-xl bg-stone-200 dark:bg-stone-700 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4" />
                      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-stone-400 text-[32px]">search_off</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                The community is ready
              </h3>
              <p className="text-stone-600 dark:text-stone-400 max-w-sm">
                {filterType !== 'all' || filterUrgency !== 'all'
                  ? 'Try adjusting your filters to see more invitations.'
                  : 'Your invitation gives the community purpose. We belong to each other.'}
              </p>
              {isAuthenticated && (
                <Link
                  href="/create?type=help"
                  className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Invite the Community
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <HelpPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function HelpPostCard({ post }: { post: HelpPost }) {
  const categoryIcon = categoryIcons[post.category] || categoryIcons.other

  return (
    <Link
      href={`/invitations/${post.id}`}
      className="block bg-white dark:bg-stone-dark/50 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
          post.type === 'offer'
            ? 'bg-primary/10 text-primary'
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }`}>
          <span className="material-symbols-outlined text-[24px]">{typeIcons[post.type]}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors truncate">
              {post.title}
            </h3>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${urgencyColors[post.urgency]}`}>
              {post.urgency}
            </span>
          </div>

          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
            {post.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-stone-500 dark:text-stone-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">{categoryIcon}</span>
              {post.category_display}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">person</span>
              {post.created_by_name}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center">
          <span className="material-symbols-outlined text-stone-400 group-hover:text-primary group-hover:translate-x-1 transition-all">
            chevron_right
          </span>
        </div>
      </div>
    </Link>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
