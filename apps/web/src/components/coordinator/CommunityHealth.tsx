'use client'

interface HealthStats {
  openInvitations: number
  answeredThisWeek: number
  averageResponseTime: string
  activeParticipants: number
  newMembers: number
}

interface CommunityHealthProps {
  stats: HealthStats
}

export function CommunityHealth({ stats }: CommunityHealthProps) {
  const healthItems = [
    {
      icon: 'volunteer_activism',
      label: 'Open invitations',
      value: stats.openInvitations,
      color: stats.openInvitations > 10 ? 'text-amber-500' : 'text-primary',
    },
    {
      icon: 'handshake',
      label: 'Answered this week',
      value: stats.answeredThisWeek,
      color: 'text-green-500',
    },
    {
      icon: 'schedule',
      label: 'Avg response time',
      value: stats.averageResponseTime,
      color: 'text-blue-500',
    },
    {
      icon: 'diversity_3',
      label: 'Active channels',
      value: stats.activeParticipants,
      color: 'text-primary',
    },
  ]

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">
          Community Health
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {healthItems.map((item) => (
          <div
            key={item.label}
            className="bg-white/60 dark:bg-stone-800/60 rounded-xl p-4 text-center"
          >
            <span className={`material-symbols-outlined ${item.color} text-[24px] mb-1`}>
              {item.icon}
            </span>
            <div className={`text-xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {stats.newMembers > 0 && (
        <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-2 justify-center">
          <span className="material-symbols-outlined text-primary text-[18px]">celebration</span>
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {stats.newMembers} new neighbor{stats.newMembers !== 1 ? 's' : ''} joined this week
          </span>
        </div>
      )}
    </div>
  )
}
