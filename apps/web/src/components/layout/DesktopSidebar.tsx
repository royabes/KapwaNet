'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts'

interface NavItem {
  href: string
  icon: string
  label: string
  badge?: number
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/explore', icon: 'explore', label: 'Explore' },
  { href: '/invitations', icon: 'volunteer_activism', label: 'Invitations' },
  { href: '/gifts', icon: 'redeem', label: 'Gifts' },
  { href: '/messages', icon: 'chat_bubble', label: 'Messages', badge: 3 },
  { href: '/profile', icon: 'person', label: 'Profile' },
]

const bottomNavItems: NavItem[] = [
  { href: '/coordinator', icon: 'admin_panel_settings', label: 'Coordinator' },
  { href: '/philosophy', icon: 'water_drop', label: 'Our Philosophy' },
  { href: '/settings', icon: 'settings', label: 'Settings' },
  { href: '/help', icon: 'help', label: 'Help & Support' },
]

export function DesktopSidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-white dark:bg-[#1a1f14] border-r border-stone-200 dark:border-stone-800 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-200 dark:border-stone-800">
        <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[24px]">diversity_3</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">KapwaNet</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">Community Platform</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-4">
        <Link
          href="/search"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span className="text-sm">Search...</span>
        </Link>
      </div>

      {/* Create Post Button */}
      <div className="px-4 py-4">
        <Link
          href="/create"
          className="flex w-full items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Share or Invite
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-stone-200 dark:border-stone-800" />

      {/* Bottom Navigation */}
      <nav className="px-3 py-2 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-stone-200 dark:border-stone-800">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-stone-200 dark:bg-stone-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-24 mb-1" />
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-16" />
            </div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
                {user.display_name || user.email}
              </p>
              <button
                onClick={logout}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-primary transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-3 px-2 group">
            <div className="size-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">
                Guest User
              </p>
              <p className="text-xs text-primary group-hover:text-primary-600 transition-colors">
                Join to participate
              </p>
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
