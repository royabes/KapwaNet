'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'
import { api } from '@/lib/api'

type Step = 'display_name' | 'about' | 'interests' | 'complete'

const INTEREST_OPTIONS = [
  { id: 'meals', icon: 'restaurant', label: 'Meals & Food', description: 'Cooking, sharing meals, groceries' },
  { id: 'transport', icon: 'directions_car', label: 'Transportation', description: 'Rides, errands, appointments' },
  { id: 'childcare', icon: 'child_care', label: 'Childcare', description: 'Babysitting, school pickup' },
  { id: 'eldercare', icon: 'elderly', label: 'Elder Care', description: 'Companionship, assistance' },
  { id: 'skills', icon: 'handyman', label: 'Skills & Labor', description: 'Repairs, moving, yard work' },
  { id: 'education', icon: 'school', label: 'Education', description: 'Tutoring, homework help' },
  { id: 'wellness', icon: 'spa', label: 'Wellness', description: 'Exercise, emotional support' },
  { id: 'goods', icon: 'inventory_2', label: 'Goods & Items', description: 'Lending, giving away items' },
]

export default function ProfileOnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('display_name')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const [formData, setFormData] = useState({
    display_name: '',
    about: '',
    interests: [] as string[],
  })

  useEffect(() => {
    if (user?.display_name) {
      setFormData(prev => ({ ...prev, display_name: user.display_name || '' }))
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding/profile')
    }
  }, [authLoading, isAuthenticated, router])

  const handleNextStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      if (currentStep === 'display_name') setCurrentStep('about')
      else if (currentStep === 'about') setCurrentStep('interests')
      else if (currentStep === 'interests') setCurrentStep('complete')
      setIsAnimating(false)
    }, 300)
  }

  const handlePrevStep = () => {
    setIsAnimating(true)
    setTimeout(() => {
      if (currentStep === 'about') setCurrentStep('display_name')
      else if (currentStep === 'interests') setCurrentStep('about')
      setIsAnimating(false)
    }, 300)
  }

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Update user profile via API
      await api.auth.updateProfile({
        display_name: formData.display_name,
        bio: formData.about,
      })

      // Store interests in localStorage for now (would be API in production)
      localStorage.setItem('kapwanet_interests', JSON.stringify(formData.interests))
      localStorage.setItem('kapwanet_profile_complete', 'true')

      // Refresh user data
      if (refreshUser) {
        await refreshUser()
      }

      handleNextStep()
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = () => {
    router.push('/onboarding/first-action')
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

  const stepIndex = ['display_name', 'about', 'interests', 'complete'].indexOf(currentStep)

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 dark:bg-stone-800 z-50">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          {currentStep !== 'complete' && stepIndex > 0 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="text-sm">Back</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </Link>
          )}
          <p className="text-sm text-stone-500">
            Step {stepIndex + 1} of 4
          </p>
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
        {/* Step 1: Display Name */}
        {currentStep === 'display_name' && (
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-[32px]">badge</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                What should we call you?
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                This is how you'll appear to your neighbors.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your name or nickname"
                className="w-full px-4 py-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg text-center"
                autoFocus
              />

              <p className="text-sm text-stone-500 text-center">
                You can use your first name, a nickname, or whatever feels right.
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleNextStep}
                disabled={!formData.display_name.trim()}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 disabled:bg-primary/50 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: About */}
        {currentStep === 'about' && (
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-[32px]">edit_note</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                Tell us a little about yourself
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                Optional, but helps neighbors know who you are.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="A few words about yourself, your household, what brings you to the community..."
                rows={4}
                className="w-full px-4 py-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />

              <p className="text-sm text-stone-500 text-center">
                This will be visible on your profile.
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleNextStep}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {currentStep === 'interests' && (
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-primary text-[32px]">interests</span>
              </div>
              <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                What flows interest you?
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                Select areas where you might participate—giving or receiving.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    formData.interests.includes(interest.id)
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.interests.includes(interest.id)
                      ? 'bg-primary text-white'
                      : 'bg-stone-100 dark:bg-stone-700 text-stone-500'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{interest.icon}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${
                      formData.interests.includes(interest.id)
                        ? 'text-primary'
                        : 'text-stone-800 dark:text-stone-100'
                    }`}>
                      {interest.label}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-500">
                      {interest.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 disabled:bg-primary/50 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <span className="material-symbols-outlined">check</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className="max-w-md mx-auto text-center">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-[48px]">celebration</span>
            </div>

            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              Profile complete!
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-400 mb-4">
              You're all set, {formData.display_name || 'neighbor'}.
            </p>

            <p className="text-stone-500 dark:text-stone-500 mb-8">
              Your profile helps others in the community know who they're connecting with.
              You can always update it later.
            </p>

            <button
              onClick={handleComplete}
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all inline-flex items-center gap-2"
            >
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <div className="mt-8">
              <Link
                href="/profile"
                className="text-primary hover:underline text-sm inline-flex items-center gap-1"
              >
                View your profile
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
