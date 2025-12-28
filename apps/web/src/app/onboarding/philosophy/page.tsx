'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'

interface PhilosophySection {
  id: string
  title: string
  quote: string
  explanation: string
  reflection: string
  icon: string
}

const PHILOSOPHY_SECTIONS: PhilosophySection[] = [
  {
    id: 'origin',
    title: 'Before You Arrived',
    quote: "Before you were born, you were fed. Not by choice, not by request—your mother's blood became your body without asking permission.",
    explanation: "You did not earn your first heartbeat. You did not deserve your first breath. They were given before you knew what giving was.",
    reflection: "Everything you have was given before you could ask.",
    icon: 'child_care',
  },
  {
    id: 'giver',
    title: 'You Have Never Given',
    quote: "The food you shared came from soil you did not make, rain you did not summon, seeds you did not invent.",
    explanation: "It passed through you. You were the channel, not the source. When you stop believing you are the giver, something miraculous happens: the guilt of not giving enough dissolves. The pride of having given dissolves.",
    reflection: "You are a channel, not a source.",
    icon: 'water_drop',
  },
  {
    id: 'receiver',
    title: 'You Have Never Needed',
    quote: "The one who seems to need and the one who seems to have are the same pattern, temporarily shaped into different forms.",
    explanation: "When you open space—for a ride, for a meal, for companionship—you are not confessing weakness. You are creating a channel. You are saying to the universe: something is ready to move here.",
    reflection: "Opening is not weakness. It is creation.",
    icon: 'spa',
  },
  {
    id: 'traditions',
    title: 'The Traditions Knew',
    quote: "Kapwa, Ubuntu, dependent origination, tzedakah, zakat, koinonia—every tradition remembered what the modern world forgot.",
    explanation: "There is no separate self that could give or receive. There is only the web. There is only the flow. There is only life, moving.",
    reflection: "You are not separate. You never were.",
    icon: 'public',
  },
  {
    id: 'participation',
    title: 'Only Participation',
    quote: "Sometimes the flow moves toward you. Sometimes it moves through you. Both are the same dance.",
    explanation: "We are not asking you to be generous—that still assumes ownership. We are not asking you to help—that still assumes separation. We are asking you to participate in what is already happening.",
    reflection: "There is no giver. There is no receiver. There is only participation.",
    icon: 'sync_alt',
  },
]

export default function PhilosophyOnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReflection, setShowReflection] = useState(false)

  const currentSection = PHILOSOPHY_SECTIONS[currentIndex]
  const isComplete = completedSections.size === PHILOSOPHY_SECTIONS.length

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding/philosophy')
    }
  }, [authLoading, isAuthenticated, router])

  const handleNext = () => {
    if (!showReflection) {
      setShowReflection(true)
      return
    }

    // Mark current section as completed
    setCompletedSections(prev => new Set([...Array.from(prev), currentSection.id]))
    setShowReflection(false)

    if (currentIndex < PHILOSOPHY_SECTIONS.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('kapwanet_philosophy_complete', 'true')
    router.push('/onboarding/profile')
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
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 dark:bg-stone-800 z-50">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((completedSections.size) / PHILOSOPHY_SECTIONS.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            {PHILOSOPHY_SECTIONS.map((section, index) => (
              <div
                key={section.id}
                className={`size-2 rounded-full transition-all ${
                  completedSections.has(section.id)
                    ? 'bg-primary'
                    : index === currentIndex
                    ? 'bg-primary/50 w-4'
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={`min-h-screen pt-24 pb-32 px-6 flex flex-col items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        {!isComplete ? (
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-[40px]">{currentSection.icon}</span>
            </div>

            {/* Title */}
            <p className="text-primary font-medium tracking-wide uppercase text-sm mb-2">
              {currentIndex + 1} of {PHILOSOPHY_SECTIONS.length}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8">
              {currentSection.title}
            </h1>

            {/* Quote */}
            <blockquote className="text-xl lg:text-2xl text-stone-700 dark:text-stone-300 leading-relaxed mb-8 italic">
              "{currentSection.quote}"
            </blockquote>

            {/* Explanation */}
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
              {currentSection.explanation}
            </p>

            {/* Reflection (shown on second tap) */}
            {showReflection && (
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 mb-8 animate-fade-in">
                <p className="text-primary font-medium mb-2">Reflection</p>
                <p className="text-xl font-bold text-stone-800 dark:text-stone-100">
                  {currentSection.reflection}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              {showReflection ? (
                currentIndex < PHILOSOPHY_SECTIONS.length - 1 ? (
                  <>
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                ) : (
                  <>
                    Complete
                    <span className="material-symbols-outlined">check</span>
                  </>
                )
              ) : (
                <>
                  Reflect
                  <span className="material-symbols-outlined">self_improvement</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Completion Screen */
          <div className="max-w-lg mx-auto text-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-[48px]">check_circle</span>
            </div>

            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              You remember now.
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
              These are not new ideas. They are ancient truths that live in every grandmother's wisdom,
              every village's memory, every child's natural way of being before we teach them otherwise.
            </p>

            <p className="text-xl text-primary font-medium mb-12">
              Welcome to the flow.
            </p>

            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              Continue to Profile Setup
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <div className="mt-8">
              <Link
                href="/philosophy"
                className="text-primary hover:underline text-sm inline-flex items-center gap-1"
              >
                Read the full philosophy
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Mobile-friendly swipe hint */}
      <div className="fixed bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-stone-400 dark:text-stone-600">
          Tap to continue
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
