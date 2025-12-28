'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { api, HelpPost } from '@/lib/api'
import { useAuth } from '@/contexts'

const urgencyColors = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  normal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

const statusColors = {
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  matched: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function NeedDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<HelpPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInterestModal, setShowInterestModal] = useState(false)
  const [interestMessage, setInterestMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      if (!params.id) return

      try {
        const data = await api.helpPosts.get(params.id as string)
        setPost(data)
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError('Post not found or you do not have access.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleExpressInterest = async () => {
    if (!post || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      await api.helpPosts.expressInterest(post.id, interestMessage)
      setShowInterestModal(false)
      setInterestMessage('')
      // Show success or redirect to messages
      router.push('/messages')
    } catch (err) {
      console.error('Failed to express interest:', err)
      setError('Failed to express interest. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Loading...">
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4 mb-4" />
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2 mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse" />
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-4/6" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !post) {
    return (
      <AppShell title="Error">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[32px]">error</span>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            {error || 'Post not found'}
          </h3>
          <Link
            href="/needs"
            className="mt-4 text-primary hover:text-primary-600 font-semibold"
          >
            Back to Needs
          </Link>
        </div>
      </AppShell>
    )
  }

  const isOwner = user?.id === post.created_by
  const canExpressInterest = isAuthenticated && !isOwner && post.status === 'open'

  return (
    <AppShell title={post.title}>
      <div className="px-6 py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link
            href="/needs"
            className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400 hover:text-primary mb-6"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Needs
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                  post.type === 'offer'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {post.type_display}
                </span>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${urgencyColors[post.urgency]}`}>
                  {post.urgency_display}
                </span>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${statusColors[post.status]}`}>
                  {post.status_display}
                </span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">category</span>
                {post.category_display}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>

          {/* Author Card */}
          <div className="bg-white dark:bg-stone-dark/50 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[24px]">person</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-800 dark:text-stone-100">{post.created_by_name}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Community Member</p>
              </div>
              {isAuthenticated && !isOwner && (
                <button className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                  <span className="material-symbols-outlined text-stone-600 dark:text-stone-400">chat</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-stone-dark/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 mb-6">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">Description</h2>
            <p className="text-stone-600 dark:text-stone-400 whitespace-pre-wrap leading-relaxed">
              {post.description}
            </p>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-stone-dark/50 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 mb-6">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">Details</h2>
            <dl className="space-y-3">
              {post.approx_location && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-stone-400 text-[20px] mt-0.5">location_on</span>
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-wide">Location</dt>
                    <dd className="text-stone-800 dark:text-stone-200">{post.approx_location}</dd>
                  </div>
                </div>
              )}
              {post.availability && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-stone-400 text-[20px] mt-0.5">event_available</span>
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-wide">Availability</dt>
                    <dd className="text-stone-800 dark:text-stone-200">{post.availability}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {canExpressInterest && (
              <button
                onClick={() => setShowInterestModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {post.type === 'request' ? 'volunteer_activism' : 'pan_tool'}
                </span>
                {post.type === 'request' ? "I can help" : "I'm interested"}
              </button>
            )}

            {isOwner && post.can_edit && (
              <Link
                href={`/needs/${post.id}/edit`}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold hover:border-primary hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Post
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                Sign in to respond
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-dark rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              {post.type === 'request' ? 'Offer to Help' : 'Express Interest'}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              Add a message to introduce yourself (optional)
            </p>

            <textarea
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Hi! I'd like to help..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowInterestModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold hover:border-stone-400 dark:hover:border-stone-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleExpressInterest}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-primary/50 text-white font-semibold transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
