'use client'

import { AppShell } from '@/components/layout'
import { ReciprocityFlow } from '@/components/profile/ReciprocityFlow'
import { useAuth } from '@/contexts'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <AppShell title="Profile">
        <div className="flex flex-col gap-6 px-6 lg:px-0">
          <div className="animate-pulse">
            <div className="h-24 w-24 rounded-full bg-stone-200 dark:bg-stone-700 mx-auto" />
            <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-32 mx-auto mt-4" />
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile">
      <div className="flex flex-col gap-6 px-6 lg:px-0 max-w-2xl mx-auto w-full">
        {/* Profile Header */}
        <div className="text-center py-6">
          <div className="relative inline-block">
            <div className="size-24 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[48px]">person</span>
            </div>
            <button className="absolute bottom-0 right-0 size-8 rounded-full bg-white dark:bg-stone-800 shadow-md flex items-center justify-center border border-stone-200 dark:border-stone-700">
              <span className="material-symbols-outlined text-[18px] text-stone-600 dark:text-stone-400">edit</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-4">
            {isAuthenticated && user ? (user.display_name || 'Neighbor') : 'Guest'}
          </h1>
          <p className="text-stone-500 dark:text-stone-500 text-sm mt-1">
            {isAuthenticated && user ? user.email : 'Not signed in'}
          </p>

          {isAuthenticated && (
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
              Member since December 2024
            </p>
          )}
        </div>

        {/* Auth prompt for guests */}
        {!isAuthenticated && (
          <div className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 text-center">
            <span className="material-symbols-outlined text-primary text-[48px] mb-3">diversity_3</span>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">
              Join the Flow
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Sign in to participate in your community&apos;s web of mutual care.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Reciprocity Flow - only for authenticated users */}
        {isAuthenticated && (
          <ReciprocityFlow />
        )}

        {/* Activity Summary */}
        {isAuthenticated && (
          <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Your Participation
              </h2>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-700">
              <Link href="/invitations?filter=mine" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">volunteer_activism</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 dark:text-stone-100">Your Invitations</p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Spaces you&apos;ve opened</p>
                </div>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>

              <Link href="/gifts?filter=mine" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">redeem</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 dark:text-stone-100">Your Gifts</p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">What you&apos;ve shared</p>
                </div>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>

              <Link href="/messages" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">chat_bubble</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 dark:text-stone-100">Conversations</p>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Your connections</p>
                </div>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>
            </div>
          </div>
        )}

        {/* Settings Links */}
        {isAuthenticated && (
          <div className="rounded-2xl bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Settings
              </h2>
            </div>

            <div className="divide-y divide-stone-200 dark:divide-stone-700">
              <Link href="/settings/notifications" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-[20px]">notifications</span>
                <span className="flex-1 text-stone-700 dark:text-stone-300">Notifications</span>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>

              <Link href="/settings/privacy" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-[20px]">shield</span>
                <span className="flex-1 text-stone-700 dark:text-stone-300">Privacy</span>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>

              <Link href="/settings" className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                <span className="material-symbols-outlined text-stone-500 text-[20px]">settings</span>
                <span className="flex-1 text-stone-700 dark:text-stone-300">All Settings</span>
                <span className="material-symbols-outlined text-stone-400">chevron_right</span>
              </Link>
            </div>
          </div>
        )}

        {/* Philosophy Link */}
        <Link
          href="/philosophy"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 p-4 hover:from-primary/10 transition-colors"
        >
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">water_drop</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-stone-800 dark:text-stone-100">Our Philosophy</p>
            <p className="text-sm text-stone-500 dark:text-stone-500">The flow that connects us all</p>
          </div>
          <span className="material-symbols-outlined text-primary">arrow_outward</span>
        </Link>

        {/* Spacer for bottom nav on mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
