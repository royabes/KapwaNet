'use client'

import Link from 'next/link'

interface QuickAction {
  label: string
  description: string
  href: string
  icon: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Page',
    description: 'Build a new page from a template',
    href: '/admin/pages/new',
    icon: 'add_circle',
    color: 'bg-primary text-white',
  },
  {
    label: 'Manage Members',
    description: 'View and manage community members',
    href: '/admin/members',
    icon: 'group',
    color: 'bg-blue-500 text-white',
  },
  {
    label: 'Moderation',
    description: 'Review reports and ensure safety',
    href: '/admin/moderation',
    icon: 'shield',
    color: 'bg-amber-500 text-white',
  },
  {
    label: 'Analytics',
    description: 'View community metrics',
    href: '/admin/analytics',
    icon: 'analytics',
    color: 'bg-green-500 text-white',
  },
]

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
          Welcome to Admin
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mt-2">
          Build and manage your community&apos;s website
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className={`size-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
              </div>
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                {action.label}
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">rocket_launch</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
              Getting Started
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Follow these steps to set up your community website:
            </p>
            <ol className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-stone-700 dark:text-stone-300">
                  <strong>Choose a theme</strong> - Set your brand colors and fonts
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-stone-700 dark:text-stone-300">
                  <strong>Create pages</strong> - Build your homepage and about page
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-stone-700 dark:text-stone-300">
                  <strong>Add content</strong> - Customize blocks with your information
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">4</span>
                <span className="text-stone-700 dark:text-stone-300">
                  <strong>Publish</strong> - Make your pages live for the community
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Stats Placeholder */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-stone-400">article</span>
            <span className="text-sm text-stone-600 dark:text-stone-400">Pages</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">0</p>
          <p className="text-xs text-stone-500 mt-1">Create your first page</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-stone-400">volunteer_activism</span>
            <span className="text-sm text-stone-600 dark:text-stone-400">Help Posts</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">0</p>
          <p className="text-xs text-stone-500 mt-1">Active requests &amp; offers</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-stone-400">group</span>
            <span className="text-sm text-stone-600 dark:text-stone-400">Members</span>
          </div>
          <p className="text-3xl font-bold text-stone-800 dark:text-stone-100">0</p>
          <p className="text-xs text-stone-500 mt-1">Community members</p>
        </div>
      </div>
    </div>
  )
}
