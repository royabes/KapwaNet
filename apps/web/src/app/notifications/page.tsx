'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { useAuth } from '@/contexts'

interface Notification {
  id: string
  type: 'match' | 'message' | 'interest' | 'system' | 'reminder'
  title: string
  body: string
  read: boolean
  created_at: string
  link?: string
  actor_name?: string
}

// Mock notifications - would come from API
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'interest',
    title: 'Someone responded to your invitation',
    body: 'Maria expressed interest in helping with grocery pickup',
    read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    link: '/messages',
    actor_name: 'Maria G.',
  },
  {
    id: '2',
    type: 'match',
    title: 'You have a new match!',
    body: 'Your request for a ride to the clinic has been matched with Ben T.',
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    link: '/messages',
  },
  {
    id: '3',
    type: 'message',
    title: 'New message from Ben T.',
    body: 'Thanks for offering to help! When works best for you?',
    read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/messages',
    actor_name: 'Ben T.',
  },
  {
    id: '4',
    type: 'interest',
    title: 'Sarah L. wants to participate',
    body: 'Sarah expressed interest in your shared vegetables offer',
    read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    link: '/messages',
  },
  {
    id: '5',
    type: 'system',
    title: 'Welcome to KapwaNet',
    body: 'You are now part of the flow. Start by exploring your community or reading our philosophy.',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '/philosophy',
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Your invitation is still open',
    body: 'Your request for help with yard work has been open for 3 days',
    read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/invitations',
  },
]

function getNotificationIcon(type: Notification['type']): { icon: string; color: string } {
  switch (type) {
    case 'match':
      return { icon: 'handshake', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' }
    case 'message':
      return { icon: 'chat_bubble', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' }
    case 'interest':
      return { icon: 'favorite', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' }
    case 'reminder':
      return { icon: 'schedule', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' }
    case 'system':
    default:
      return { icon: 'info', color: 'text-primary bg-primary/10' }
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
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isAuthenticated) {
      setNotifications(MOCK_NOTIFICATIONS)
    }
  }, [isAuthenticated])

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (authLoading) {
    return (
      <AppShell title="Notifications">
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
        </div>
      </AppShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppShell title="Notifications">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">notifications</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Stay in the loop
          </h2>
          <p className="text-stone-500 dark:text-stone-500 mb-6 max-w-sm">
            Sign in to receive notifications when someone responds to your posts or messages you.
          </p>
          <Link
            href="/login?redirect=/notifications"
            className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Notifications">
      <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                  filter === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:text-primary-600 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="size-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-stone-400 text-[40px]">
                {filter === 'unread' ? 'mark_email_read' : 'notifications_off'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-stone-500 dark:text-stone-500">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : 'When someone responds to your posts, you\'ll see it here'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden divide-y divide-stone-200 dark:divide-stone-700">
            {filteredNotifications.map((notification) => {
              const { icon, color } = getNotificationIcon(notification.type)

              const content = (
                <div
                  className={`flex gap-4 p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-[24px]">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`${!notification.read ? 'font-semibold' : 'font-medium'} text-stone-800 dark:text-stone-100`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="size-2.5 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 mt-1">
                      {notification.body}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </div>
              )

              if (notification.link) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    {content}
                  </Link>
                )
              }

              return <div key={notification.id}>{content}</div>
            })}
          </div>
        )}

        {/* Spacer for mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
