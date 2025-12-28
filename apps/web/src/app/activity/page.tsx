'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { useAuth } from '@/contexts'

interface ActivityItem {
  id: string
  type: 'post_created' | 'match_made' | 'gift_shared' | 'member_joined' | 'post_completed'
  actor_name: string
  actor_avatar?: string
  action: string
  target?: string
  target_link?: string
  created_at: string
}

// Mock activity data - would come from API with polling or WebSocket
const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    type: 'post_created',
    actor_name: 'Maria G.',
    action: 'opened an invitation',
    target: 'Need help with grocery pickup',
    target_link: '/invitations',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'gift_shared',
    actor_name: 'Ben T.',
    action: 'is sharing',
    target: 'Fresh vegetables from garden',
    target_link: '/gifts',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'match_made',
    actor_name: 'Sarah L.',
    action: 'connected with',
    target: 'David K. for a ride to the clinic',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'member_joined',
    actor_name: 'New neighbor',
    action: 'joined the community',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'post_completed',
    actor_name: 'Community',
    action: 'celebrated a completed exchange',
    target: 'Meal delivery to elder neighbor',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'post_created',
    actor_name: 'Anonymous neighbor',
    action: 'opened an invitation',
    target: 'Looking for companionship for walks',
    target_link: '/invitations',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'gift_shared',
    actor_name: 'Linda M.',
    action: 'is sharing',
    target: 'Baby clothes (0-6 months)',
    target_link: '/gifts',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    type: 'match_made',
    actor_name: 'Two neighbors',
    action: 'connected for',
    target: 'weekly meal prep exchange',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
]

function getActivityIcon(type: ActivityItem['type']): { icon: string; color: string } {
  switch (type) {
    case 'post_created':
      return { icon: 'add_circle', color: 'text-primary bg-primary/10' }
    case 'gift_shared':
      return { icon: 'redeem', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' }
    case 'match_made':
      return { icon: 'handshake', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' }
    case 'member_joined':
      return { icon: 'person_add', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' }
    case 'post_completed':
      return { icon: 'celebration', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' }
    default:
      return { icon: 'info', color: 'text-stone-500 bg-stone-100 dark:bg-stone-800' }
  }
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

export default function ActivityPage() {
  const { isAuthenticated } = useAuth()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate fetching activity
    const fetchActivity = () => {
      setActivity(MOCK_ACTIVITY)
      setIsLoading(false)
      setLastUpdate(new Date())
    }

    fetchActivity()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActivity()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <AppShell title="Activity">
      <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
              Community Activity
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-500">
              Last updated {formatTimeAgo(lastUpdate.toISOString())}
            </p>
          </div>
          <button
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => {
                setActivity(MOCK_ACTIVITY)
                setIsLoading(false)
                setLastUpdate(new Date())
              }, 500)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">
            Live updates every 30 seconds
          </span>
        </div>

        {/* Activity Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                <div className="size-12 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item, index) => {
              const { icon, color } = getActivityIcon(item.type)

              return (
                <div
                  key={item.id}
                  className={`flex gap-4 p-4 rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 transition-all ${
                    index === 0 ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 dark:text-stone-100">
                      <span className="font-semibold">{item.actor_name}</span>
                      {' '}
                      <span className="text-stone-600 dark:text-stone-400">{item.action}</span>
                      {item.target && (
                        <>
                          {' '}
                          {item.target_link ? (
                            <Link
                              href={item.target_link}
                              className="text-primary hover:underline font-medium"
                            >
                              {item.target}
                            </Link>
                          ) : (
                            <span className="font-medium">{item.target}</span>
                          )}
                        </>
                      )}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                      {formatTimeAgo(item.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Philosophy reminder */}
        <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-stone-600 dark:text-stone-400 italic">
            "There is no giver. There is no receiver. There is only the flow."
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
            Every action here is part of the flow.
          </p>
        </div>

        {/* Spacer for mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
