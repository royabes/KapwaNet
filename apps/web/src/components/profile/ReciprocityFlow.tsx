'use client'

import { useEffect, useState } from 'react'

interface FlowStats {
  participated: number // times user helped others (flow moved through them)
  received: number     // times user received help (flow moved toward them)
  month: string
}

export function ReciprocityFlow() {
  const [stats, setStats] = useState<FlowStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    // For now, use demo values
    setTimeout(() => {
      setStats({
        participated: 5,
        received: 3,
        month: 'December',
      })
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/50 p-6 animate-pulse">
        <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-4" />
        <div className="h-16 bg-stone-200 dark:bg-stone-700 rounded" />
      </div>
    )
  }

  if (!stats) return null

  const total = stats.participated + stats.received
  const participatedPercent = total > 0 ? (stats.participated / total) * 100 : 50
  const receivedPercent = total > 0 ? (stats.received / total) * 100 : 50

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-amber-500/5 dark:from-primary/10 dark:to-amber-500/10 border border-primary/10 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">water_drop</span>
        <h3 className="font-semibold text-stone-800 dark:text-stone-100">
          Your Flow This Month
        </h3>
      </div>

      {/* Flow Visualization */}
      <div className="relative mb-6">
        {/* Flow bar */}
        <div className="h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-600 transition-all duration-700"
            style={{ width: `${participatedPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
            style={{ width: `${receivedPercent}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-stone-600 dark:text-stone-400">Flowed through</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-600 dark:text-stone-400">Flowed toward</span>
            <div className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-stone-800/60">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="material-symbols-outlined text-primary text-[18px]">arrow_outward</span>
            <span className="text-2xl font-bold text-primary">{stats.participated}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            times you participated
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500 italic mt-1">
            The flow moved through you
          </p>
        </div>

        <div className="text-center p-4 rounded-xl bg-white/60 dark:bg-stone-800/60">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="material-symbols-outlined text-amber-500 text-[18px]">arrow_inward</span>
            <span className="text-2xl font-bold text-amber-500">{stats.received}</span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            times you opened space
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500 italic mt-1">
            The flow moved toward you
          </p>
        </div>
      </div>

      {/* Gentle reminder */}
      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
        <p className="text-center text-sm text-stone-500 dark:text-stone-500 italic">
          Both are participation. The gift flows both ways.
        </p>
      </div>

      {/* Private indicator */}
      <div className="flex items-center justify-center gap-1 mt-3 text-xs text-stone-400 dark:text-stone-600">
        <span className="material-symbols-outlined text-[14px]">lock</span>
        <span>Only you can see this</span>
      </div>
    </div>
  )
}
