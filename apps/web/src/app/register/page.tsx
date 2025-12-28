'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  })
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      // Register the user
      await api.auth.register({
        email: formData.email,
        password: formData.password,
        display_name: formData.displayName || undefined,
      })

      // Auto-login after registration
      await login(formData.email, formData.password)
      router.push('/welcome')
    } catch (err: any) {
      console.error('Registration failed:', err)
      setError(err.message || 'Registration failed. Please try again.')
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

      {/* Registration Form */}
      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-stone-dark/50 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 text-center mb-2">
              Join the Flow
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-center mb-8">
              Become part of your community&apos;s web of mutual care
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
                  htmlFor="displayName"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  What should we call you?
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  autoComplete="name"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Your name (optional)"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  Confirm password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Confirm your password"
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
                    Creating account...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Join KapwaNet
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-primary-600 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Philosophy snippet */}
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400 italic">
              &ldquo;There is no giver. There is no receiver. There is only the flow.&rdquo;
            </p>
            <Link href="/philosophy" className="text-xs text-primary hover:text-primary-600 transition-colors mt-2 inline-block">
              Read our philosophy
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
