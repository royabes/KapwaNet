'use client'

import Link from 'next/link'
import { Notification } from './NotificationBell'

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onClose: () => void
}

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
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NotificationList({ notifications, onMarkAsRead, onClose }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-stone-400 text-[32px]">notifications_off</span>
        </div>
        <p className="text-stone-600 dark:text-stone-400 font-medium">No notifications yet</p>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
          When someone responds to your posts, you'll see it here
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {notifications.map((notification) => {
        const { icon, color } = getNotificationIcon(notification.type)

        const content = (
          <div
            className={`flex gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer ${
              !notification.read ? 'bg-primary/5' : ''
            }`}
            onClick={() => {
              if (!notification.read) {
                onMarkAsRead(notification.id)
              }
            }}
          >
            <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${color}`}>
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-stone-800 dark:text-stone-100 line-clamp-1`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5">
                {notification.body}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
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
              onClick={() => {
                onMarkAsRead(notification.id)
                onClose()
              }}
            >
              {content}
            </Link>
          )
        }

        return <div key={notification.id}>{content}</div>
      })}
    </div>
  )
}
