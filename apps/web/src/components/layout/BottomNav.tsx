'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
  isCenter?: boolean
}

const navItems: NavItem[] = [
  { href: '/', icon: 'home', label: 'Home' },
  { href: '/invitations', icon: 'volunteer_activism', label: 'Invites' },
  { href: '/create', icon: 'add', label: 'Share', isCenter: true },
  { href: '/gifts', icon: 'redeem', label: 'Gifts' },
  { href: '/profile', icon: 'person', label: 'Me' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto safe-bottom">
      <div className="h-16 w-full rounded-2xl bg-white/90 dark:bg-[#1f2818]/90 backdrop-blur-xl shadow-lg border border-white/20 dark:border-white/5 flex items-center justify-between px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-8 size-14 rounded-full bg-stone-800 dark:bg-stone-700 text-white shadow-lg flex items-center justify-center border-4 border-background-light dark:border-background-dark cursor-pointer hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors btn-press"
              >
                <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-12 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? 'filled' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
