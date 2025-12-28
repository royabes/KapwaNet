'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { useAuth } from '@/contexts'
import {
  api,
  HELP_CATEGORIES,
  ITEM_CATEGORIES,
  ITEM_CONDITIONS,
  CreateHelpPostRequest,
  CreateItemPostRequest,
} from '@/lib/api'

type PostCategory = 'help' | 'item'
type PostType = 'request' | 'offer'

// Default org ID for demo
const DEFAULT_ORG_ID = '1'

function CreatePostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Determine initial category from URL params
  const initialCategory = searchParams.get('type') === 'item' ? 'item' : 'help'

  const [postCategory, setPostCategory] = useState<PostCategory>(initialCategory)
  const [postType, setPostType] = useState<PostType>('offer')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Help post form state
  const [helpForm, setHelpForm] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'normal' as 'low' | 'normal' | 'high',
    approx_location: '',
    availability: '',
  })

  // Item post form state
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 1,
    condition: 'good',
    approx_location: '',
    expiry_date: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/create')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data: CreateHelpPostRequest = {
        org: DEFAULT_ORG_ID,
        type: postType,
        title: helpForm.title,
        description: helpForm.description,
        category: helpForm.category,
        urgency: helpForm.urgency,
        approx_location: helpForm.approx_location || undefined,
        availability: helpForm.availability || undefined,
      }

      const post = await api.helpPosts.create(data)
      router.push(`/invitations/${post.id}`)
    } catch (err: any) {
      console.error('Failed to create help post:', err)
      setError(err.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data: CreateItemPostRequest = {
        org: DEFAULT_ORG_ID,
        type: postType,
        title: itemForm.title,
        description: itemForm.description,
        category: itemForm.category,
        quantity: itemForm.quantity,
        condition: itemForm.condition,
        approx_location: itemForm.approx_location || undefined,
        expiry_date: itemForm.expiry_date || undefined,
      }

      const post = await api.itemPosts.create(data)
      router.push(`/gifts/${post.id}`)
    } catch (err: any) {
      console.error('Failed to create item post:', err)
      setError(err.message || 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-6 py-6 lg:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400 hover:text-primary mb-4"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Share or Invite
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Participate in your community&apos;s web of mutual care
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </p>
          </div>
        )}

        {/* Post Category Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            What would you like to share?
          </label>
          <div className="flex gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setPostCategory('help')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                postCategory === 'help'
                  ? 'bg-white dark:bg-stone-700 text-primary shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
              Time &amp; Skills
            </button>
            <button
              type="button"
              onClick={() => setPostCategory('item')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                postCategory === 'item'
                  ? 'bg-white dark:bg-stone-700 text-primary shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">redeem</span>
              Goods &amp; Items
            </button>
          </div>
        </div>

        {/* Post Type Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            How would you like to participate?
          </label>
          <div className="flex gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setPostType('offer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                postType === 'offer'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {postCategory === 'help' ? 'volunteer_activism' : 'redeem'}
              </span>
              Share a Gift
            </button>
            <button
              type="button"
              onClick={() => setPostType('request')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                postType === 'request'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">mail</span>
              Invite the Community
            </button>
          </div>
        </div>

        {/* Anonymous Toggle - shown only for invitations (requests) */}
        {postType === 'request' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                isAnonymous
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${
                isAnonymous
                  ? 'bg-primary text-white'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {isAnonymous ? 'visibility_off' : 'visibility'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${
                  isAnonymous
                    ? 'text-primary'
                    : 'text-stone-700 dark:text-stone-300'
                }`}>
                  {isAnonymous ? 'Posting anonymously' : 'Post with your name'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {isAnonymous
                    ? 'Your identity will be revealed only after a match'
                    : 'Community members will see who is inviting'}
                </p>
              </div>
              <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isAnonymous
                  ? 'border-primary bg-primary'
                  : 'border-stone-300 dark:border-stone-600'
              }`}>
                {isAnonymous && (
                  <span className="material-symbols-outlined text-white text-[14px]">check</span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Help Post Form */}
        {postCategory === 'help' && (
          <form onSubmit={handleHelpSubmit} className="space-y-5">
            <div>
              <label htmlFor="help-title" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Title *
              </label>
              <input
                id="help-title"
                type="text"
                required
                value={helpForm.title}
                onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })}
                placeholder={postType === 'offer' ? "What gift of time or skill can you share?" : "How can the community participate with you?"}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="help-category" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Category *
              </label>
              <select
                id="help-category"
                required
                value={helpForm.category}
                onChange={(e) => setHelpForm({ ...helpForm, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {HELP_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="help-description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Details <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="help-description"
                rows={3}
                value={helpForm.description}
                onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })}
                placeholder="Add context if you'd like, but the title is enough. No explanation needed."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                You don&apos;t need to justify your invitation. We trust you.
              </p>
            </div>

            {postType === 'request' && (
              <div>
                <label htmlFor="help-urgency" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Urgency
                </label>
                <div className="flex gap-2">
                  {(['low', 'normal', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setHelpForm({ ...helpForm, urgency: level })}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                        helpForm.urgency === level
                          ? level === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500'
                            : level === 'normal'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="help-location" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Approximate Location
              </label>
              <input
                id="help-location"
                type="text"
                value={helpForm.approx_location}
                onChange={(e) => setHelpForm({ ...helpForm, approx_location: e.target.value })}
                placeholder="e.g., Downtown, North Side"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="help-availability" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Availability
              </label>
              <input
                id="help-availability"
                type="text"
                value={helpForm.availability}
                onChange={(e) => setHelpForm({ ...helpForm, availability: e.target.value })}
                placeholder="e.g., Weekday evenings, Saturday mornings"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  {postType === 'offer' ? 'Share Gift' : 'Send Invitation'}
                </>
              )}
            </button>
          </form>
        )}

        {/* Item Post Form */}
        {postCategory === 'item' && (
          <form onSubmit={handleItemSubmit} className="space-y-5">
            <div>
              <label htmlFor="item-title" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Item Name *
              </label>
              <input
                id="item-title"
                type="text"
                required
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                placeholder={postType === 'offer' ? "What gift can you share?" : "What are you seeking?"}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="item-category" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Category *
              </label>
              <select
                id="item-category"
                required
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="item-description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Details <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="item-description"
                rows={3}
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Add more details if helpful (condition, size, etc.)"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="item-quantity" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Quantity
                </label>
                <input
                  id="item-quantity"
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {postType === 'offer' && (
                <div>
                  <label htmlFor="item-condition" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                    Condition
                  </label>
                  <select
                    id="item-condition"
                    value={itemForm.condition}
                    onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {ITEM_CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {itemForm.category === 'food' && postType === 'offer' && (
              <div>
                <label htmlFor="item-expiry" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Expiry Date (for food items)
                </label>
                <input
                  id="item-expiry"
                  type="date"
                  value={itemForm.expiry_date}
                  onChange={(e) => setItemForm({ ...itemForm, expiry_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label htmlFor="item-location" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Pickup Location
              </label>
              <input
                id="item-location"
                type="text"
                value={itemForm.approx_location}
                onChange={(e) => setItemForm({ ...itemForm, approx_location: e.target.value })}
                placeholder="e.g., Downtown, Near Main St"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  {postType === 'offer' ? 'Share Gift' : 'Post What You Seek'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function CreatePostPage() {
  return (
    <AppShell title="Share or Invite">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading...
            </div>
          </div>
        }
      >
        <CreatePostContent />
      </Suspense>
    </AppShell>
  )
}
