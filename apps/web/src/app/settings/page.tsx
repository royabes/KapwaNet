'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts'
import { AppShell } from '@/components/layout'

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'appearance'

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  if (!isAuthenticated) {
    return (
      <AppShell title="Settings">
        <div className="max-w-2xl mx-auto w-full px-4 lg:px-0">
          <div className="py-12 text-center">
            <div className="size-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-stone-400 text-[40px]">settings</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              Sign In Required
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Please sign in to access your settings.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              Sign In
            </a>
          </div>
        </div>
      </AppShell>
    )
  }

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: 'person' },
    { id: 'notifications' as const, label: 'Notifications', icon: 'notifications' },
    { id: 'privacy' as const, label: 'Privacy', icon: 'lock' },
    { id: 'appearance' as const, label: 'Appearance', icon: 'palette' },
  ]

  return (
    <AppShell title="Settings">
      <div className="max-w-3xl mx-auto w-full px-4 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">Settings</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800 divide-y divide-stone-200 dark:divide-stone-800">
          {activeTab === 'account' && (
            <>
              <div className="p-6">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.display_name || ''}
                      placeholder="Enter your display name"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                  Danger Zone
                </h3>
                <button className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                Notification Preferences
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    Email Notifications
                  </p>
                  <p className="text-sm text-stone-500">
                    Receive updates about your posts and messages
                  </p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailNotifications ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      emailNotifications ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    Push Notifications
                  </p>
                  <p className="text-sm text-stone-500">Get notified on your device</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    pushNotifications ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      pushNotifications ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
                Privacy Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      Show Profile to Community
                    </p>
                    <p className="text-sm text-stone-500">
                      Let other members see your profile and activity
                    </p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-primary transition-colors">
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      Allow Direct Messages
                    </p>
                    <p className="text-sm text-stone-500">
                      Let community members send you messages
                    </p>
                  </div>
                  <button className="relative w-12 h-6 rounded-full bg-primary transition-colors">
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
                <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Your Data</h4>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors text-sm font-medium">
                    Download My Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">Appearance</h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100">Dark Mode</p>
                  <p className="text-sm text-stone-500">Switch between light and dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-primary' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <p className="font-medium text-stone-800 dark:text-stone-100 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {['System', 'Light', 'Dark'].map((theme) => (
                    <button
                      key={theme}
                      className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                        theme === 'System'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Spacer for mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
