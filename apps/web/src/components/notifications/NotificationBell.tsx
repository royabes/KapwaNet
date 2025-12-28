'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts'
import { NotificationList } from './NotificationList'

export interface Notification {
  id: string
  type: 'match' | 'message' | 'interest' | 'system' | 'reminder'
  title: string
  body: string
  read: boolean
  created_at: string
  link?: string
  actor_name?: string
  actor_avatar?: string
}

// Mock notifications for demo - would come from API
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
    body: 'Your request for a ride to the clinic has been matched',
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
    type: 'system',
    title: 'Welcome to KapwaNet',
    body: 'You are now part of the flow. Start by exploring your community.',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '/philosophy',
  },
]

export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (isAuthenticated) {
      // In production, fetch from API
      setNotifications(MOCK_NOTIFICATIONS)
    }
  }, [isAuthenticated])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center size-10 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[24px] text-stone-600 dark:text-stone-400">
          {isOpen ? 'notifications_active' : 'notifications'}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary-600 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClose={() => setIsOpen(false)}
          />

          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
            <a
              href="/notifications"
              className="text-sm text-primary hover:text-primary-600 font-medium flex items-center justify-center gap-1"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
