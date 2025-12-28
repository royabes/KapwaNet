'use client'

import { usePWA } from './PWAProvider'

export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-[18px]">cloud_off</span>
      <span>You&apos;re offline. Some features may be limited.</span>
    </div>
  )
}
