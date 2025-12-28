'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout'
import {
  BurnoutAlert,
  LoadDistribution,
  OpenInvitations,
  CommunityHealth,
} from '@/components/coordinator'
import { useAuth } from '@/contexts'
import Link from 'next/link'

// Demo data - would come from API
const demoInvitations = [
  {
    id: '1',
    title: 'Need help with grocery shopping',
    category: 'Errands',
    urgency: 'medium' as const,
    createdAt: '2 hours ago',
    isAnonymous: true,
  },
  {
    id: '2',
    title: 'Ride to medical appointment Tuesday',
    category: 'Transportation',
    urgency: 'high' as const,
    createdAt: '3 hours ago',
    isAnonymous: false,
    authorName: 'Maria',
  },
  {
    id: '3',
    title: 'Looking for someone to practice English with',
    category: 'Community',
    urgency: 'low' as const,
    createdAt: '1 day ago',
    isAnonymous: false,
    authorName: 'Ahmed',
  },
  {
    id: '4',
    title: 'Need help moving a couch',
    category: 'Labor',
    urgency: 'low' as const,
    createdAt: '2 days ago',
    isAnonymous: true,
  },
]

const demoParticipants = [
  { id: '1', name: 'Sarah Chen', participations: 12, lastActive: 'today' },
  { id: '2', name: 'Marcus Johnson', participations: 8, lastActive: 'today' },
  { id: '3', name: 'Priya Patel', participations: 6, lastActive: 'yesterday' },
  { id: '4', name: 'David Kim', participations: 5, lastActive: 'yesterday' },
  { id: '5', name: 'Elena Rodriguez', participations: 4, lastActive: '2 days ago' },
  { id: '6', name: 'James Williams', participations: 3, lastActive: '3 days ago' },
]

const demoHealthStats = {
  openInvitations: 4,
  answeredThisWeek: 23,
  averageResponseTime: '4 hours',
  activeParticipants: 15,
  newMembers: 3,
}

export default function CoordinatorDashboard() {
  const { isAuthenticated, isLoading } = useAuth()
  const [myParticipations, setMyParticipations] = useState(0)

  useEffect(() => {
    // TODO: Fetch from API
    setTimeout(() => {
      setMyParticipations(12)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <AppShell title="Coordinator Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin">
            <span className="material-symbols-outlined text-primary text-[48px]">progress_activity</span>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppShell title="Coordinator Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <span className="material-symbols-outlined text-stone-300 dark:text-stone-700 text-[64px] mb-4">lock</span>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Coordinator Access Required
          </h2>
          <p className="text-stone-500 dark:text-stone-500 mb-6 max-w-sm">
            This dashboard is for community coordinators. Please sign in to access.
          </p>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Coordinator Dashboard">
      <div className="flex flex-col gap-6 px-6 lg:px-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Welcome, Coordinator
          </h1>
          <p className="text-stone-500 dark:text-stone-500 mt-1">
            Helping the community flow smoothly
          </p>
        </div>

        {/* Burnout Alert - shows if coordinator has high participation */}
        <BurnoutAlert participationCount={myParticipations} />

        {/* Two column layout on desktop */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Open Invitations */}
            <OpenInvitations invitations={demoInvitations} />

            {/* Load Distribution */}
            <LoadDistribution participants={demoParticipants} />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Community Health */}
            <CommunityHealth stats={demoHealthStats} />

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100">
                  Quick Actions
                </h3>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  href="/create"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
                  <span className="text-stone-700 dark:text-stone-300">Post an Announcement</span>
                </Link>
                <Link
                  href="/invitations"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
                  <span className="text-stone-700 dark:text-stone-300">View All Invitations</span>
                </Link>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
                  <span className="text-stone-700 dark:text-stone-300">Check Messages</span>
                </Link>
              </div>
            </div>

            {/* Coordinator Tips */}
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">
                  lightbulb
                </span>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  Coordinator Tip
                </h3>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Notice when certain people are always responding? Reach out and thank them,
                but also gently encourage them to let others participate.
                The healthiest communities have many active channels, not just a few.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy reminder */}
        <div className="text-center py-6 border-t border-stone-200 dark:border-stone-800 mt-6">
          <p className="text-stone-500 dark:text-stone-500 italic">
            &ldquo;We are building channels. Removing dams. Letting the river be a river.&rdquo;
          </p>
          <Link href="/philosophy" className="text-sm text-primary hover:text-primary-600 transition-colors mt-2 inline-block">
            Read our philosophy
          </Link>
        </div>

        {/* Spacer for bottom nav on mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
