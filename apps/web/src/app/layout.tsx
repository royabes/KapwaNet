import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider, AuthProvider } from '@/contexts'
import { PWAProvider, InstallPrompt, OfflineIndicator } from '@/components/pwa'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'KapwaNet - Community Platform',
  description: 'A community platform for dignified mutual aid, rooted in kapwa (shared humanity).',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KapwaNet',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#73c91d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakarta.className} bg-background-light dark:bg-background-dark antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              {/* Offline indicator */}
              <OfflineIndicator />

              {/* Texture overlay for wabi-sabi feel */}
              <div className="texture-overlay" />

              {/* Main app content */}
              <div className="relative min-h-screen">
                {children}
              </div>

              {/* PWA install prompt */}
              <InstallPrompt />
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
