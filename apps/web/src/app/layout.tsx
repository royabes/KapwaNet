import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KapwaNet - Community Platform',
  description: 'A community platform for dignified mutual aid, rooted in kapwa (shared humanity).',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-surface border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-primary">KapwaNet</h1>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-surface border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-muted text-sm">
              KapwaNet - Community Platform for Dignified Mutual Aid
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
