'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'

type ActionChoice = 'invitation' | 'gift' | 'explore' | null

export default function FirstActionPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [selectedAction, setSelectedAction] = useState<ActionChoice>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding/first-action')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSelectAction = (action: ActionChoice) => {
    setSelectedAction(action)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    // Mark onboarding complete
    localStorage.setItem('kapwanet_onboarding_complete', 'true')
    localStorage.setItem('kapwanet_first_action_prompted', 'true')

    // Navigate to the appropriate page
    if (selectedAction === 'invitation') {
      router.push('/create?type=invitation')
    } else if (selectedAction === 'gift') {
      router.push('/create?type=gift')
    } else {
      router.push('/')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Progress Bar - Complete */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-50" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
            <span className="text-sm text-primary font-medium">Onboarding Complete</span>
          </div>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Content */}
      <main className="min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center">
        {!showConfirmation ? (
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-[40px]">water_drop</span>
              </div>
              <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                The channel is open.
              </h1>
              <p className="text-xl text-primary font-medium mb-4">
                What wants to move through you today?
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                There's no wrong answer. The flow moves in both directions.
              </p>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Invitation Option */}
              <button
                onClick={() => handleSelectAction('invitation')}
                className={`group relative p-6 rounded-2xl border-2 text-left transition-all ${
                  selectedAction === 'invitation'
                    ? 'border-primary bg-primary/5'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-primary/50'
                }`}
              >
                <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-[28px]">volunteer_activism</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">
                  Open a space
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                  Is there something you could use help with? A ride, a meal, company?
                  You're not asking—you're creating a channel.
                </p>
                <p className="text-primary text-sm font-medium inline-flex items-center gap-1">
                  Create an invitation
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </p>
              </button>

              {/* Gift Option */}
              <button
                onClick={() => handleSelectAction('gift')}
                className={`group relative p-6 rounded-2xl border-2 text-left transition-all ${
                  selectedAction === 'gift'
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-amber-500/50'
                }`}
              >
                <div className="size-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-amber-500 text-[28px]">redeem</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">
                  Let something flow
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                  Is there something ready to move through you? Time, skills, goods?
                  You're not giving—you're participating.
                </p>
                <p className="text-amber-500 text-sm font-medium inline-flex items-center gap-1">
                  Share a gift
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </p>
              </button>
            </div>

            {/* Explore Option */}
            <div className="text-center">
              <button
                onClick={() => handleSelectAction('explore')}
                className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">explore</span>
                Just explore for now
              </button>
            </div>

            {/* Philosophy reminder */}
            <div className="mt-12 text-center">
              <p className="text-stone-500 dark:text-stone-500 italic text-sm">
                "There is no giver. There is no receiver. There is only the flow."
              </p>
            </div>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="max-w-md mx-auto text-center">
            {selectedAction === 'invitation' && (
              <>
                <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-primary text-[48px]">volunteer_activism</span>
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                  Opening a space
                </h2>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
                  You're about to create an invitation—a channel for the flow to find its way to you.
                </p>
                <p className="text-stone-500 dark:text-stone-500 mb-8">
                  Remember: you're not confessing weakness. You're creating opportunity for connection.
                </p>
              </>
            )}

            {selectedAction === 'gift' && (
              <>
                <div className="size-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-amber-500 text-[48px]">redeem</span>
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                  Letting something flow
                </h2>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
                  You're about to share a gift—letting something move through you that was never fully yours.
                </p>
                <p className="text-stone-500 dark:text-stone-500 mb-8">
                  Remember: you're not being generous. You're being what you are—a living channel.
                </p>
              </>
            )}

            {selectedAction === 'explore' && (
              <>
                <div className="size-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-blue-500 text-[48px]">explore</span>
                </div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                  Explore your community
                </h2>
                <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
                  See what's moving in your community. Browse invitations and gifts from your neighbors.
                </p>
                <p className="text-stone-500 dark:text-stone-500 mb-8">
                  When you're ready to participate, the channel will be open.
                </p>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirm}
                className={`px-8 py-4 text-white rounded-full font-semibold text-lg shadow-lg transition-all inline-flex items-center justify-center gap-2 ${
                  selectedAction === 'gift'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : selectedAction === 'explore'
                    ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                    : 'bg-primary hover:bg-primary-600 shadow-primary/20'
                }`}
              >
                {selectedAction === 'invitation' && 'Create invitation'}
                {selectedAction === 'gift' && 'Share gift'}
                {selectedAction === 'explore' && 'Start exploring'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <button
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-4 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium transition-colors"
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
