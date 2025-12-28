'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'

type ExploreTab = 'all' | 'invitations' | 'gifts' | 'activity'

interface ExploreItem {
  id: string
  type: 'invitation' | 'gift'
  title: string
  description: string
  author: string
  category: string
  timeAgo: string
  image?: string
}

const MOCK_ITEMS: ExploreItem[] = [
  {
    id: '1',
    type: 'invitation',
    title: 'Need help with grocery pickup',
    description: 'Looking for someone to help pick up groceries from the store this weekend.',
    author: 'Maria G.',
    category: 'Errands',
    timeAgo: '2h ago',
  },
  {
    id: '2',
    type: 'gift',
    title: 'Fresh vegetables from garden',
    description: 'Tomatoes, zucchini, and peppers from my backyard garden. Free to good home!',
    author: 'Ben T.',
    category: 'Food',
    timeAgo: '3h ago',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
  },
  {
    id: '3',
    type: 'invitation',
    title: 'Offering rides to medical appointments',
    description: 'I have availability on weekday mornings to drive neighbors to appointments.',
    author: 'David K.',
    category: 'Transportation',
    timeAgo: '5h ago',
  },
  {
    id: '4',
    type: 'gift',
    title: 'Baby clothes (0-6 months)',
    description: 'Gently used onesies and sleepers in good condition. Pick up anytime.',
    author: 'Linda M.',
    category: 'Clothing',
    timeAgo: '8h ago',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
  },
  {
    id: '5',
    type: 'invitation',
    title: 'Looking for companionship for walks',
    description: 'Would love to find a walking buddy for morning walks in the neighborhood.',
    author: 'Sarah L.',
    category: 'Companionship',
    timeAgo: '1d ago',
  },
  {
    id: '6',
    type: 'gift',
    title: 'Books for kids ages 5-10',
    description: 'Collection of picture books and early readers. Great condition!',
    author: 'Anonymous',
    category: 'Books',
    timeAgo: '1d ago',
  },
]

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('all')

  const filteredItems = MOCK_ITEMS.filter((item) => {
    if (activeTab === 'all') return true
    if (activeTab === 'invitations') return item.type === 'invitation'
    if (activeTab === 'gifts') return item.type === 'gift'
    return true
  })

  return (
    <AppShell title="Explore">
      <div className="max-w-4xl mx-auto w-full px-4 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Explore Your Community
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Discover invitations, gifts, and ways to connect with neighbors
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {([
            { key: 'all', label: 'All', icon: 'apps' },
            { key: 'invitations', label: 'Invitations', icon: 'volunteer_activism' },
            { key: 'gifts', label: 'Gifts', icon: 'redeem' },
            { key: 'activity', label: 'Activity', icon: 'timeline' },
          ] as const).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Activity Tab */}
        {activeTab === 'activity' ? (
          <div className="text-center py-8">
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              See what&apos;s happening in your community
            </p>
            <Link
              href="/activity"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              Go to Activity Feed
            </Link>
          </div>
        ) : (
          /* Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={item.type === 'invitation' ? '/invitations' : '/gifts'}
                className="group bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
              >
                {item.image && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        item.type === 'invitation'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {item.type === 'invitation' ? 'Invitation' : 'Gift'}
                    </span>
                    <span className="text-xs text-stone-500">{item.category}</span>
                  </div>
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{item.author}</span>
                    <span>{item.timeAgo}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && activeTab !== 'activity' && (
          <div className="py-12 text-center">
            <div className="size-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-stone-400 text-[40px]">
                search_off
              </span>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Nothing here yet
            </h3>
            <p className="text-stone-500 mb-4">
              Be the first to share something with your community!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create Post
            </Link>
          </div>
        )}

        {/* Philosophy reminder */}
        <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-stone-600 dark:text-stone-400 italic">
            &ldquo;There is no giver. There is no receiver. There is only the flow.&rdquo;
          </p>
          <Link
            href="/philosophy"
            className="text-sm text-primary hover:text-primary-600 transition-colors mt-2 inline-block"
          >
            Read our philosophy
          </Link>
        </div>

        {/* Spacer for mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
