'use client'

import { useEffect, useState } from 'react'

interface ImpactStats {
  invitationsAnswered: number
  giftsShared: number
  connectionsFormed: number
  membersParticipating: number
}

export function CollectiveImpact() {
  const [stats, setStats] = useState<ImpactStats>({
    invitationsAnswered: 0,
    giftsShared: 0,
    connectionsFormed: 0,
    membersParticipating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    // For now, use demo values
    setTimeout(() => {
      setStats({
        invitationsAnswered: 247,
        giftsShared: 189,
        connectionsFormed: 436,
        membersParticipating: 156,
      })
      setIsLoading(false)
    }, 500)
  }, [])

  const impactItems = [
    {
      icon: 'handshake',
      value: stats.invitationsAnswered,
      label: 'Invitations answered',
      color: 'text-primary',
    },
    {
      icon: 'redeem',
      value: stats.giftsShared,
      label: 'Gifts shared',
      color: 'text-amber-500',
    },
    {
      icon: 'link',
      value: stats.connectionsFormed,
      label: 'Connections formed',
      color: 'text-green-500',
    },
    {
      icon: 'diversity_3',
      value: stats.membersParticipating,
      label: 'Neighbors participating',
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-6 border border-primary/20">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          Together, We&apos;ve Made a Difference
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Every number represents a moment of mutual care
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {impactItems.map((item) => (
          <div
            key={item.label}
            className="bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            {isLoading ? (
              <div className="h-8 w-16 mx-auto bg-stone-200 dark:bg-stone-700 rounded animate-pulse mb-1" />
            ) : (
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-stone-500 dark:text-stone-500 mt-4 italic">
        We don&apos;t track individuals. We celebrate community.
      </p>
    </div>
  )
}
