'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { BottomNav } from './BottomNav'
import { AppHeader } from './AppHeader'
import { DesktopSidebar } from './DesktopSidebar'
import { NotificationBell } from '../notifications'

interface AppShellProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showNav?: boolean
  headerLeft?: ReactNode
  headerRight?: ReactNode
}

export function AppShell({
  children,
  title = 'KapwaNet',
  showHeader = true,
  showNav = true,
  headerLeft,
  headerRight,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar - hidden on mobile */}
      <DesktopSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Mobile/Tablet: Centered container with max-width */}
        <div className="flex flex-col min-h-screen w-full max-w-md mx-auto lg:max-w-none overflow-x-hidden pb-24 lg:pb-0">
          {/* Mobile header - hidden on desktop */}
          {showHeader && (
            <div className="lg:hidden">
              <AppHeader
                title={title}
                left={headerLeft}
                right={headerRight}
              />
            </div>
          )}

          {/* Desktop header */}
          <header className="hidden lg:flex sticky top-0 z-40 items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4 border-b border-stone-200 dark:border-stone-800">
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{title}</h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-surface dark:hover:bg-stone-dark transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                <span className="text-sm font-medium">Profile</span>
              </Link>
            </div>
          </header>

          <main className="flex-1 flex flex-col lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav - hidden on desktop */}
      {showNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  )
}
