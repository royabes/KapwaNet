'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Pages', href: '/admin/pages', icon: 'article' },
  { label: 'Theme', href: '/admin/theme', icon: 'palette' },
  { label: 'Templates', href: '/admin/templates', icon: 'view_quilt' },
]

const secondaryNavItems: NavItem[] = [
  { label: 'Help Posts', href: '/admin/help', icon: 'volunteer_activism' },
  { label: 'Item Posts', href: '/admin/items', icon: 'inventory_2' },
  { label: 'Members', href: '/admin/members', icon: 'group' },
  { label: 'Moderation', href: '/admin/moderation', icon: 'shield' },
  { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <span className="font-bold text-stone-800 dark:text-stone-100">KapwaNet</span>
            <span className="text-xs text-stone-500 block">Admin</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Website
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 mt-6">
          Community
        </div>
        {secondaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-stone-500 text-[18px]">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
              {user?.display_name || 'Admin User'}
            </p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            View Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
