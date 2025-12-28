'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'

type Step = 'greeting' | 'philosophy' | 'flow' | 'ready'

const PHILOSOPHY_QUOTES = [
  {
    text: "Before you were born, you were fed. Not by choice, not by request—your mother's blood became your body without asking permission.",
    highlight: "You did not earn your first heartbeat.",
  },
  {
    text: "The river does not give. The river does not take.",
    highlight: "The river flows.",
  },
  {
    text: "You have never given anyone anything. This is not an insult.",
    highlight: "It is liberation.",
  },
  {
    text: "When you stop believing you are the giver, something miraculous happens: the guilt dissolves. The pride dissolves.",
    highlight: "What remains is simpler. Truer.",
  },
]

const FLOW_CONCEPTS = [
  {
    icon: 'volunteer_activism',
    title: 'Invitations',
    description: "When you need something, you're not asking for charity. You're inviting others to participate in your life.",
    color: 'primary',
  },
  {
    icon: 'redeem',
    title: 'Gifts',
    description: "When you share something, you're not giving from surplus. You're letting the flow move through you.",
    color: 'amber-500',
  },
  {
    icon: 'diversity_3',
    title: 'Kapwa',
    description: 'The self that includes the other. Your neighbor is not a stranger—they are another shape of you.',
    color: 'blue-500',
  },
]

export default function WelcomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('greeting')
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/welcome')
    }
  }, [authLoading, isAuthenticated, router])

  const handleNextStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      if (currentStep === 'greeting') setCurrentStep('philosophy')
      else if (currentStep === 'philosophy') setCurrentStep('flow')
      else if (currentStep === 'flow') setCurrentStep('ready')
      setIsAnimating(false)
    }, 300)
  }

  const handleNextQuote = () => {
    if (quoteIndex < PHILOSOPHY_QUOTES.length - 1) {
      setQuoteIndex(quoteIndex + 1)
    } else {
      handleNextStep()
    }
  }

  const handleComplete = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem('kapwanet_onboarding_complete', 'true')
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 dark:bg-stone-800 z-50">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: currentStep === 'greeting' ? '25%'
              : currentStep === 'philosophy' ? '50%'
              : currentStep === 'flow' ? '75%'
              : '100%'
          }}
        />
      </div>

      {/* Skip Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleComplete}
          className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-sm font-medium transition-colors"
        >
          Skip for now
        </button>
      </div>

      {/* Content */}
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-20 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

        {/* Step 1: Greeting */}
        {currentStep === 'greeting' && (
          <div className="max-w-lg text-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-[48px]">waving_hand</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              Welcome{user?.display_name ? `, ${user.display_name}` : ''}
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-8">
              You've joined a community built on an ancient truth—one that many have forgotten,
              but that you're about to remember.
            </p>

            <p className="text-stone-500 dark:text-stone-500 mb-12">
              Take a moment. This won't take long, but it might change how you see everything.
            </p>

            <button
              onClick={handleNextStep}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              Begin
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 2: Philosophy */}
        {currentStep === 'philosophy' && (
          <div className="max-w-2xl text-center">
            <div className="mb-12">
              <p className="text-primary font-medium tracking-wide uppercase text-sm mb-6">
                The Philosophy
              </p>

              <blockquote className="text-2xl lg:text-3xl text-stone-700 dark:text-stone-300 leading-relaxed mb-6">
                "{PHILOSOPHY_QUOTES[quoteIndex].text}"
              </blockquote>

              <p className="text-xl lg:text-2xl font-bold text-primary">
                {PHILOSOPHY_QUOTES[quoteIndex].highlight}
              </p>
            </div>

            {/* Quote Dots */}
            <div className="flex justify-center gap-2 mb-12">
              {PHILOSOPHY_QUOTES.map((_, index) => (
                <div
                  key={index}
                  className={`size-2 rounded-full transition-all ${
                    index === quoteIndex ? 'bg-primary w-6' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextQuote}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              {quoteIndex < PHILOSOPHY_QUOTES.length - 1 ? (
                <>
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              ) : (
                <>
                  I understand
                  <span className="material-symbols-outlined">check</span>
                </>
              )}
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

        {/* Step 3: The Flow */}
        {currentStep === 'flow' && (
          <div className="max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">
                How It Works
              </p>
              <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
                There is no giver. There is no receiver.
              </h2>
              <p className="text-xl text-primary font-medium">
                There is only the flow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {FLOW_CONCEPTS.map((concept) => (
                <div
                  key={concept.title}
                  className="bg-white dark:bg-stone-800/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 text-center"
                >
                  <div className={`size-16 rounded-2xl bg-${concept.color}/10 flex items-center justify-center mx-auto mb-4`}>
                    <span className={`material-symbols-outlined text-${concept.color} text-[32px]`} style={{ color: concept.color === 'primary' ? undefined : concept.color === 'amber-500' ? '#f59e0b' : '#3b82f6' }}>
                      {concept.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2">
                    {concept.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">
                    {concept.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleNextStep}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
              >
                I'm ready to participate
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {currentStep === 'ready' && (
          <div className="max-w-lg text-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-[48px]">diversity_3</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              Welcome home.
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
              You have always been here.
            </p>

            <p className="text-xl text-primary font-medium mb-8">
              The channel is open.
            </p>

            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 italic mb-12">
              What wants to move through you today?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create?type=invitation"
                className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                Invite the community
              </Link>
              <Link
                href="/create?type=gift"
                className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">redeem</span>
                Share a gift
              </Link>
            </div>

            <button
              onClick={handleComplete}
              className="mt-8 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 text-sm transition-colors inline-flex items-center gap-1"
            >
              Just explore for now
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
