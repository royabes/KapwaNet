'use client'

import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'help_offered' | 'help_requested' | 'item_shared' | 'item_received'
  user: string
  description: string
  time: string
}

const sampleActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'help_offered',
    user: 'Maria G.',
    description: 'offered to help with groceries',
    time: '2 min ago',
  },
  {
    id: '2',
    type: 'item_shared',
    user: 'Ben T.',
    description: 'shared fresh vegetables',
    time: '15 min ago',
  },
  {
    id: '3',
    type: 'help_requested',
    user: 'Sarah L.',
    description: 'needs help with transportation',
    time: '1 hour ago',
  },
  {
    id: '4',
    type: 'item_received',
    user: 'Block 4 Community',
    description: 'organized park cleanup',
    time: '2 hours ago',
  },
]

const typeIcons: Record<ActivityItem['type'], { icon: string; color: string }> = {
  help_offered: { icon: 'volunteer_activism', color: 'text-primary bg-primary/10' },
  help_requested: { icon: 'pan_tool', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  item_shared: { icon: 'inventory_2', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  item_received: { icon: 'celebration', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
}

export function RecentActivity() {
  return (
    <div className="rounded-xl bg-white dark:bg-stone-dark/50 p-6 border border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Recent Activity
        </h3>
        <Link
          href="/activity"
          className="text-primary text-sm font-semibold hover:text-primary-600 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {sampleActivity.map((item) => {
          const { icon, color } = typeIcons[item.type]

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-800 dark:text-stone-200">
                  <span className="font-semibold">{item.user}</span>{' '}
                  <span className="text-stone-600 dark:text-stone-400">{item.description}</span>
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
