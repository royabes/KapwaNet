'use client'

import Link from 'next/link'

interface Invitation {
  id: string
  title: string
  category: string
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
  isAnonymous: boolean
  authorName?: string
}

interface OpenInvitationsProps {
  invitations: Invitation[]
}

const urgencyColors = {
  low: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const urgencyLabels = {
  low: 'When possible',
  medium: 'Soon',
  high: 'Urgent',
}

export function OpenInvitations({ invitations }: OpenInvitationsProps) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 p-8 text-center">
        <span className="material-symbols-outlined text-primary text-[48px] mb-3">check_circle</span>
        <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-2">
          All spaces are filled
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-500">
          The community is flowing beautifully. No open invitations at this time.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">
            Open Invitations
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
            {invitations.length} space{invitations.length !== 1 ? 's' : ''} waiting for the flow
          </p>
        </div>
        <Link
          href="/invitations"
          className="text-sm text-primary font-medium hover:text-primary-600 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {invitations.slice(0, 5).map((invitation) => (
          <Link
            key={invitation.id}
            href={`/invitations/${invitation.id}`}
            className="flex items-start gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyColors[invitation.urgency]}`}>
                  {urgencyLabels[invitation.urgency]}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-600">
                  {invitation.category}
                </span>
              </div>
              <p className="font-medium text-stone-800 dark:text-stone-100 truncate">
                {invitation.title}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
                {invitation.isAnonymous ? 'A neighbor' : invitation.authorName} · {invitation.createdAt}
              </p>
            </div>
            <span className="material-symbols-outlined text-stone-400 text-[20px]">
              chevron_right
            </span>
          </Link>
        ))}
      </div>

      {invitations.length > 5 && (
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700 text-center">
          <Link href="/invitations" className="text-sm text-primary font-medium hover:text-primary-600">
            See {invitations.length - 5} more invitations
          </Link>
        </div>
      )}
    </div>
  )
}
