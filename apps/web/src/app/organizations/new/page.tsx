'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts'

type Step = 'basics' | 'customize' | 'invite'

export default function OrganizationOnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('basics')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'neighborhood',
    primaryColor: '#73c91d',
    inviteEmails: '',
  })

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6">
        <div className="text-center max-w-md">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">groups</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Start Your Community
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mb-8">
            Sign in or create an account to set up your community on KapwaNet.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login?redirect=/organizations/new"
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register?redirect=/organizations/new"
              className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNext = () => {
    if (currentStep === 'basics') setCurrentStep('customize')
    else if (currentStep === 'customize') setCurrentStep('invite')
  }

  const handleBack = () => {
    if (currentStep === 'customize') setCurrentStep('basics')
    else if (currentStep === 'invite') setCurrentStep('customize')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // TODO: API call to create organization
      await new Promise((resolve) => setTimeout(resolve, 1500))
      router.push(`/org/${formData.slug}`)
    } catch (error) {
      console.error('Failed to create organization:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { key: 'basics', label: 'Basics', icon: 'edit' },
    { key: 'customize', label: 'Customize', icon: 'palette' },
    { key: 'invite', label: 'Invite', icon: 'group_add' },
  ]

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-stone-dark border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-primary mb-6">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to KapwaNet
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Create Your Community
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Set up a space for your neighborhood, congregation, or group
          </p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-stone-dark border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  currentStep === step.key
                    ? 'text-primary'
                    : steps.findIndex(s => s.key === currentStep) > index
                    ? 'text-green-500'
                    : 'text-stone-400'
                }`}>
                  <div className={`size-8 rounded-full flex items-center justify-center ${
                    currentStep === step.key
                      ? 'bg-primary text-white'
                      : steps.findIndex(s => s.key === currentStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`}>
                    {steps.findIndex(s => s.key === currentStep) > index ? (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    steps.findIndex(s => s.key === currentStep) > index
                      ? 'bg-green-500'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Step 1: Basics */}
        {currentStep === 'basics' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Community Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: handleSlugify(e.target.value),
                  })
                }}
                placeholder="e.g., Riverside Neighborhood"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-stone-500">kapwanet.org/</span>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: handleSlugify(e.target.value) })}
                  placeholder="your-community"
                  className="flex-1 px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Community Type
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="neighborhood">Neighborhood</option>
                <option value="congregation">Religious Congregation</option>
                <option value="workplace">Workplace</option>
                <option value="school">School/University</option>
                <option value="nonprofit">Nonprofit Organization</option>
                <option value="other">Other Community</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell potential members about your community..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Customize */}
        {currentStep === 'customize' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-4">
                Primary Color
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { color: '#73c91d', name: 'KapwaNet Green' },
                  { color: '#3b82f6', name: 'Blue' },
                  { color: '#8b5cf6', name: 'Purple' },
                  { color: '#ec4899', name: 'Pink' },
                  { color: '#f59e0b', name: 'Amber' },
                  { color: '#ef4444', name: 'Red' },
                  { color: '#10b981', name: 'Emerald' },
                  { color: '#6366f1', name: 'Indigo' },
                ].map((option) => (
                  <button
                    key={option.color}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: option.color })}
                    className={`size-12 rounded-xl transition-all ${
                      formData.primaryColor === option.color
                        ? 'ring-2 ring-offset-2 ring-stone-800 dark:ring-white'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: option.color }}
                    title={option.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
              <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Preview</p>
              </div>
              <div className="p-6 bg-stone-50 dark:bg-stone-800/50">
                <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="size-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      <span className="material-symbols-outlined text-white text-[24px]">diversity_3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 dark:text-stone-100">
                        {formData.name || 'Your Community'}
                      </h3>
                      <p className="text-sm text-stone-500">Community Platform</p>
                    </div>
                  </div>
                  <button
                    className="w-full py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Join Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Invite */}
        {currentStep === 'invite' && (
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">celebration</span>
                <h3 className="font-bold text-stone-800 dark:text-stone-100">Almost there!</h3>
              </div>
              <p className="text-stone-600 dark:text-stone-400">
                Invite some founding members to join your community. They&apos;ll receive an email invitation
                with a link to join.
              </p>
            </div>

            <div>
              <label htmlFor="invites" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Invite Members (optional)
              </label>
              <textarea
                id="invites"
                rows={4}
                value={formData.inviteEmails}
                onChange={(e) => setFormData({ ...formData, inviteEmails: e.target.value })}
                placeholder="Enter email addresses, one per line..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="mt-2 text-sm text-stone-500">
                You can always invite more members later from your community settings.
              </p>
            </div>

            <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-6">
              <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-3">Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-600 dark:text-stone-400">Name</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100">{formData.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-600 dark:text-stone-400">URL</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100">kapwanet.org/{formData.slug}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-600 dark:text-stone-400">Type</dt>
                  <dd className="font-medium text-stone-800 dark:text-stone-100 capitalize">{formData.type}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
          {currentStep !== 'basics' ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep !== 'invite' ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 'basics' && !formData.name}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 disabled:bg-primary/50 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-600 disabled:bg-primary/50 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  Launch Community
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
