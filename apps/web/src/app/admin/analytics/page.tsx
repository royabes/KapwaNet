'use client'

import { useState } from 'react'

interface AnalyticsStat {
  label: string
  value: number
  change: number
  changeLabel: string
  icon: string
  color: string
}

interface ActivityData {
  date: string
  helpPosts: number
  itemPosts: number
  matches: number
  messages: number
}

interface TopCategory {
  name: string
  count: number
  percentage: number
}

// Mock stats
const MOCK_STATS: AnalyticsStat[] = [
  {
    label: 'Total Members',
    value: 156,
    change: 12,
    changeLabel: 'new this month',
    icon: 'group',
    color: 'text-blue-500',
  },
  {
    label: 'Active Help Posts',
    value: 24,
    change: 8,
    changeLabel: 'this week',
    icon: 'volunteer_activism',
    color: 'text-primary',
  },
  {
    label: 'Successful Matches',
    value: 89,
    change: 15,
    changeLabel: 'this month',
    icon: 'handshake',
    color: 'text-green-500',
  },
  {
    label: 'Items Shared',
    value: 203,
    change: 34,
    changeLabel: 'this month',
    icon: 'redeem',
    color: 'text-amber-500',
  },
]

// Mock activity data for chart
const MOCK_ACTIVITY: ActivityData[] = [
  { date: 'Mon', helpPosts: 5, itemPosts: 3, matches: 4, messages: 45 },
  { date: 'Tue', helpPosts: 8, itemPosts: 5, matches: 6, messages: 62 },
  { date: 'Wed', helpPosts: 6, itemPosts: 4, matches: 5, messages: 58 },
  { date: 'Thu', helpPosts: 10, itemPosts: 7, matches: 8, messages: 75 },
  { date: 'Fri', helpPosts: 12, itemPosts: 6, matches: 9, messages: 88 },
  { date: 'Sat', helpPosts: 4, itemPosts: 2, matches: 3, messages: 32 },
  { date: 'Sun', helpPosts: 3, itemPosts: 1, matches: 2, messages: 28 },
]

// Mock top categories
const HELP_CATEGORIES: TopCategory[] = [
  { name: 'Transportation', count: 34, percentage: 28 },
  { name: 'Meals', count: 28, percentage: 23 },
  { name: 'Errands', count: 22, percentage: 18 },
  { name: 'Companionship', count: 18, percentage: 15 },
  { name: 'Childcare', count: 12, percentage: 10 },
  { name: 'Other', count: 8, percentage: 6 },
]

const ITEM_CATEGORIES: TopCategory[] = [
  { name: 'Food', count: 45, percentage: 35 },
  { name: 'Clothing', count: 32, percentage: 25 },
  { name: 'Household', count: 28, percentage: 22 },
  { name: 'Baby Items', count: 15, percentage: 12 },
  { name: 'Other', count: 8, percentage: 6 },
]

// Mock community impact
const IMPACT_STATS = {
  totalExchanges: 312,
  hoursVolunteered: 847,
  itemsShared: 456,
  mealsProvided: 128,
  ridesGiven: 94,
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  const maxActivity = Math.max(
    ...MOCK_ACTIVITY.map((d) => Math.max(d.helpPosts, d.itemPosts, d.matches))
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Analytics</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Community activity and impact metrics
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {MOCK_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`size-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <span className="text-sm text-stone-500">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-1">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">
              +{stat.change} {stat.changeLabel}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-6">
          Weekly Activity
        </h2>
        <div className="flex items-end gap-2 h-48">
          {MOCK_ACTIVITY.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end h-36">
                <div
                  className="flex-1 bg-primary/80 rounded-t"
                  style={{ height: `${(day.helpPosts / maxActivity) * 100}%` }}
                  title={`Help Posts: ${day.helpPosts}`}
                />
                <div
                  className="flex-1 bg-amber-500/80 rounded-t"
                  style={{ height: `${(day.itemPosts / maxActivity) * 100}%` }}
                  title={`Item Posts: ${day.itemPosts}`}
                />
                <div
                  className="flex-1 bg-green-500/80 rounded-t"
                  style={{ height: `${(day.matches / maxActivity) * 100}%` }}
                  title={`Matches: ${day.matches}`}
                />
              </div>
              <span className="text-xs text-stone-500">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded bg-primary" />
            <span className="text-sm text-stone-600 dark:text-stone-400">Help Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded bg-amber-500" />
            <span className="text-sm text-stone-600 dark:text-stone-400">Item Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded bg-green-500" />
            <span className="text-sm text-stone-600 dark:text-stone-400">Matches</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Help Categories */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-6">
            Top Help Categories
          </h2>
          <div className="space-y-4">
            {HELP_CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {category.name}
                  </span>
                  <span className="text-sm text-stone-500">{category.count}</span>
                </div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Item Categories */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-6">
            Top Item Categories
          </h2>
          <div className="space-y-4">
            {ITEM_CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {category.name}
                  </span>
                  <span className="text-sm text-stone-500">{category.count}</span>
                </div>
                <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
              Community Impact
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              The collective flow of giving and receiving
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-white/50 dark:bg-stone-900/50 rounded-xl">
            <p className="text-2xl font-bold text-primary mb-1">
              {IMPACT_STATS.totalExchanges}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Total Exchanges</p>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-stone-900/50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {IMPACT_STATS.hoursVolunteered}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Hours Volunteered</p>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-stone-900/50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600 mb-1">
              {IMPACT_STATS.itemsShared}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Items Shared</p>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-stone-900/50 rounded-xl">
            <p className="text-2xl font-bold text-green-600 mb-1">
              {IMPACT_STATS.mealsProvided}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Meals Provided</p>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-stone-900/50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600 mb-1">
              {IMPACT_STATS.ridesGiven}
            </p>
            <p className="text-xs text-stone-600 dark:text-stone-400">Rides Given</p>
          </div>
        </div>

        <p className="text-center text-sm text-stone-600 dark:text-stone-400 mt-6 italic">
          &ldquo;There is no giver. There is no receiver. There is only the flow.&rdquo;
        </p>
      </div>
    </div>
  )
}
