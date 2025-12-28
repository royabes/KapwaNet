'use client'

import { useState, useEffect } from 'react'
import { usePWA } from './PWAProvider'

export function InstallPrompt() {
  const { isInstallable, installApp, dismissInstallPrompt } = usePWA()
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Show prompt after a delay to not be intrusive
    const timer = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isInstallable])

  const handleInstall = async () => {
    await installApp()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    dismissInstallPrompt()
    setShowPrompt(false)
  }

  if (!showPrompt || !isInstallable) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-8 lg:bottom-8 lg:w-96 animate-slide-up">
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl p-4">
        <div className="flex gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">install_mobile</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
              Install KapwaNet
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              Add to your home screen for a better experience with offline access.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium text-sm transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 self-start"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  )
}
