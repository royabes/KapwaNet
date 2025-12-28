'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { api, ItemPost, ITEM_CATEGORIES } from '@/lib/api'
import { useAuth } from '@/contexts'

// Default org ID for demo
const DEFAULT_ORG_ID = '1'

type FilterType = 'all' | 'offer' | 'request'

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  like_new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  good: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  fair: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  poor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const categoryIcons: Record<string, string> = {
  food: 'restaurant',
  clothing: 'checkroom',
  household: 'home',
  baby_kids: 'child_care',
  electronics: 'devices',
  furniture: 'weekend',
  hygiene: 'sanitizer',
  medical: 'medical_services',
  other: 'category',
}

export default function GiftsPage() {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<ItemPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const filters: Record<string, string> = { status: 'available' }
        if (filterType !== 'all') filters.type = filterType
        if (filterCategory !== 'all') filters.category = filterCategory

        const data = await api.itemPosts.list(DEFAULT_ORG_ID, filters as any)
        setPosts(data)
      } catch (error) {
        console.error('Failed to fetch item posts:', error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [filterType, filterCategory])

  return (
    <AppShell title="Community Gifts">
      <div className="flex flex-col min-h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-dark/80 backdrop-blur-sm sticky top-0 z-10 lg:top-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              Community Gifts
            </h1>
            {isAuthenticated && (
              <Link
                href="/create?type=item"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">redeem</span>
                Share
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* Type Filter */}
            <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
              {(['all', 'offer', 'request'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterType === type
                      ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'offer' ? 'Sharing' : 'Seeking'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-sm font-medium text-stone-800 dark:text-stone-200 border-none focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {ITEM_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-stone-dark/50 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
                  <div className="aspect-square bg-stone-200 dark:bg-stone-700 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-stone-400 text-[32px]">inventory_2</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                Ready for sharing
              </h3>
              <p className="text-stone-600 dark:text-stone-400 max-w-sm">
                {filterType !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters to see more gifts.'
                  : 'Share what you have, find what you need. The gift keeps moving.'}
              </p>
              {isAuthenticated && (
                <Link
                  href="/create?type=item"
                  className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
                >
                  <span className="material-symbols-outlined text-[20px]">redeem</span>
                  Share a Gift
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <ItemPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

function ItemPostCard({ post }: { post: ItemPost }) {
  const categoryIcon = categoryIcons[post.category] || categoryIcons.other
  const categoryLabel = ITEM_CATEGORIES.find(c => c.value === post.category)?.label || post.category

  // Placeholder image based on category
  const placeholderImages: Record<string, string> = {
    food: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    clothing: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80',
    household: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80',
    baby_kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
    electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    hygiene: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
    medical: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
    other: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80',
  }

  const imageUrl = (post.photos && post.photos.length > 0)
    ? post.photos[0]
    : placeholderImages[post.category] || placeholderImages.other

  return (
    <Link
      href={`/gifts/${post.id}`}
      className="block bg-white dark:bg-stone-dark/50 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-stone-200 dark:bg-stone-800">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
            post.type === 'offer'
              ? 'bg-primary text-white'
              : 'bg-amber-500 text-white'
          }`}>
            {post.type === 'offer' ? 'Gift' : 'Seeking'}
          </span>
        </div>

        {/* Quantity Badge */}
        {post.quantity > 1 && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold bg-black/60 text-white px-2 py-1 rounded-full">
              x{post.quantity}
            </span>
          </div>
        )}

        {/* Expired Warning */}
        {post.is_expired && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded-lg flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">warning</span>
              Expired
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors truncate">
          {post.title}
        </h3>

        <div className="flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined text-stone-400 text-[16px]">{categoryIcon}</span>
          <span className="text-xs text-stone-600 dark:text-stone-400">{categoryLabel}</span>
        </div>

        {post.type === 'offer' && post.condition && (
          <div className="mt-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${conditionColors[post.condition] || conditionColors.good}`}>
              {conditionLabels[post.condition] || post.condition}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 text-xs text-stone-500 dark:text-stone-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">person</span>
            {post.created_by_name}
          </span>
        </div>
      </div>
    </Link>
  )
}
