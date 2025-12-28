'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="flex items-center justify-center py-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[28px]">diversity_3</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">KapwaNet</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">Community Platform</p>
          </div>
        </Link>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-stone-dark/50 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 text-center mb-2">
              Welcome back
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-center mb-8">
              Sign in to your account to continue
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Sign in
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:text-primary-600 font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-stone-600 dark:text-stone-400 text-center">
              <span className="font-semibold text-primary">Demo:</span>{' '}
              test@kapwanet.org / testpass123
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
