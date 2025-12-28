'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAContextType {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  installApp: () => Promise<void>
  dismissInstallPrompt: () => void
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  installApp: async () => {},
  dismissInstallPrompt: () => {},
})

export function usePWA() {
  return useContext(PWAContext)
}

interface PWAProviderProps {
  children: ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = 'standalone' in window.navigator && (window.navigator as any).standalone
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPromptEvent(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope)
        },
        (error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        }
      )
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPromptEvent) return

    await installPromptEvent.prompt()
    const choiceResult = await installPromptEvent.userChoice

    if (choiceResult.outcome === 'accepted') {
      setIsInstalled(true)
    }

    setInstallPromptEvent(null)
  }

  const dismissInstallPrompt = () => {
    setInstallPromptEvent(null)
  }

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !!installPromptEvent && !isInstalled,
        isInstalled,
        isOnline,
        installApp,
        dismissInstallPrompt,
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}
