'use client'

interface Participant {
  id: string
  name: string
  participations: number
  lastActive: string
}

interface LoadDistributionProps {
  participants: Participant[]
}

export function LoadDistribution({ participants }: LoadDistributionProps) {
  const maxParticipations = Math.max(...participants.map((p) => p.participations), 1)

  // Sort by participations descending
  const sorted = [...participants].sort((a, b) => b.participations - a.participations)

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">
          Who&apos;s Participating
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-500 mt-1">
          The flow distributed across the community
        </p>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {sorted.map((participant) => {
          const percentage = (participant.participations / maxParticipations) * 100
          const isHigh = participant.participations >= 10

          return (
            <div key={participant.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">
                      {participant.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-500">
                      Last active {participant.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isHigh ? 'text-amber-500' : 'text-primary'}`}>
                    {participant.participations}
                  </span>
                  {isHigh && (
                    <span className="material-symbols-outlined text-amber-500 text-[16px]" title="High participation">
                      local_fire_department
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-primary to-primary-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-200 dark:border-stone-700">
        <p className="text-xs text-stone-500 dark:text-stone-500 italic text-center">
          A healthy community has many active channels
        </p>
      </div>
    </div>
  )
}
