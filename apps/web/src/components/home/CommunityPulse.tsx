'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, HelpPost, ItemPost } from '@/lib/api'

interface StoryItem {
  id: string
  title: string
  author: string
  imageUrl: string
  avatarUrl?: string
  type: 'help' | 'item'
}

// Fallback sample data when API is unavailable
const sampleStories: StoryItem[] = [
  {
    id: '1',
    title: 'Shared 5kg of rice',
    author: 'Maria G.',
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80',
    type: 'item',
  },
  {
    id: '2',
    title: 'Park cleanup',
    author: 'Block 4',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    type: 'help',
  },
  {
    id: '3',
    title: 'Book exchange',
    author: 'Sarah L.',
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
    type: 'item',
  },
  {
    id: '4',
    title: 'Fresh Veggies',
    author: 'Ben T.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    type: 'item',
  },
]

// Category to image mapping for visual variety
const categoryImages: Record<string, string> = {
  food: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  clothing: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80',
  household: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80',
  transportation: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80',
  errands: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  tutoring: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
  childcare: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
  eldercare: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80',
}

function getImageForCategory(category: string): string {
  return categoryImages[category] || categoryImages.default
}

// Default org ID for demo - in production this would come from context
const DEFAULT_ORG_ID = '1'

export function CommunityPulse() {
  const [stories, setStories] = useState<StoryItem[]>(sampleStories)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCommunityActivity() {
      try {
        // Fetch both help posts and item posts
        const [helpPosts, itemPosts] = await Promise.all([
          api.helpPosts.list(DEFAULT_ORG_ID, { status: 'open' }).catch(() => [] as HelpPost[]),
          api.itemPosts.list(DEFAULT_ORG_ID, { status: 'available' }).catch(() => [] as ItemPost[]),
        ])

        // Convert to story format
        const helpStories: StoryItem[] = helpPosts.slice(0, 3).map((post) => ({
          id: `help-${post.id}`,
          title: post.title,
          author: post.created_by_name,
          imageUrl: getImageForCategory(post.category),
          type: 'help' as const,
        }))

        const itemStories: StoryItem[] = itemPosts.slice(0, 3).map((post) => ({
          id: `item-${post.id}`,
          title: post.title,
          author: post.created_by_name,
          imageUrl: getImageForCategory(post.category),
          type: 'item' as const,
        }))

        // Interleave stories
        const combined: StoryItem[] = []
        const maxLen = Math.max(helpStories.length, itemStories.length)
        for (let i = 0; i < maxLen; i++) {
          if (helpStories[i]) combined.push(helpStories[i])
          if (itemStories[i]) combined.push(itemStories[i])
        }

        if (combined.length > 0) {
          setStories(combined)
        }
      } catch (error) {
        console.error('Failed to fetch community activity:', error)
        // Keep sample data on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunityActivity()
  }, [])

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6">
        <h2 className="text-stone-800 dark:text-stone-100 text-xl font-bold tracking-tight">
          Community Pulse
        </h2>
        <Link
          href="/explore"
          className="text-primary text-sm font-semibold hover:text-primary-600 transition-colors"
        >
          View all
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="flex w-full overflow-x-auto no-scrollbar px-6 pb-4 snap-x snap-mandatory">
        <div className="flex flex-row items-start gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 w-32 snap-start shrink-0">
                <div className="w-full aspect-[4/5] rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-24 mx-1" />
              </div>
            ))
          ) : (
            stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StoryCard({ story }: { story: StoryItem }) {
  // Determine the correct link based on type
  const href = story.type === 'help'
    ? `/needs/${story.id.replace('help-', '')}`
    : `/offers/${story.id.replace('item-', '')}`

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 w-32 snap-start shrink-0 group cursor-pointer"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url("${story.imageUrl}")` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
            story.type === 'help'
              ? 'bg-amber-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {story.type === 'help' ? 'Help' : 'Item'}
          </span>
        </div>

        {/* Author Avatar and Name */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
          <div
            className="size-5 rounded-full border border-white bg-primary-500"
            style={
              story.avatarUrl
                ? { backgroundImage: `url("${story.avatarUrl}")`, backgroundSize: 'cover' }
                : {}
            }
          />
          <span className="text-[10px] font-medium text-white truncate">{story.author}</span>
        </div>
      </div>

      {/* Caption */}
      <p className="text-stone-800 dark:text-stone-200 text-xs font-semibold leading-tight px-1">
        {story.title}
      </p>
    </Link>
  )
}
