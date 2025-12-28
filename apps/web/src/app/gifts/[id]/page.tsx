'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout'
import { api, ItemPost, ITEM_CATEGORIES } from '@/lib/api'
import { useAuth } from '@/contexts'

const statusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const conditionLabels: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

const placeholderImages: Record<string, string> = {
  food: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  clothing: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
  household: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80',
  baby_kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  hygiene: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
  medical: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
}

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<ItemPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [reserveMessage, setReserveMessage] = useState('')
  const [reserveQuantity, setReserveQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      if (!params.id) return

      try {
        const data = await api.itemPosts.get(params.id as string)
        setPost(data)
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError('Item not found or you do not have access.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  const handleReserve = async () => {
    if (!post || !isAuthenticated) return

    setIsSubmitting(true)
    try {
      await api.itemPosts.reserve(post.id, reserveMessage, reserveQuantity)
      setShowReserveModal(false)
      setReserveMessage('')
      router.push('/messages')
    } catch (err) {
      console.error('Failed to reserve item:', err)
      setError('Failed to reserve item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Loading...">
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="aspect-video bg-stone-200 dark:bg-stone-700 rounded-2xl animate-pulse mb-6" />
            <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4 mb-4" />
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2" />
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
            {error || 'Item not found'}
          </h3>
          <Link
            href="/offers"
            className="mt-4 text-primary hover:text-primary-600 font-semibold"
          >
            Back to Items
          </Link>
        </div>
      </AppShell>
    )
  }

  const isOwner = user?.id === post.created_by
  const canReserve = isAuthenticated && !isOwner && post.status === 'available' && post.type === 'offer'
  const categoryLabel = ITEM_CATEGORIES.find(c => c.value === post.category)?.label || post.category
  const imageUrl = (post.photos && post.photos.length > 0)
    ? post.photos[0]
    : placeholderImages[post.category] || placeholderImages.other

  return (
    <AppShell title={post.title}>
      <div className="px-6 py-6 lg:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400 hover:text-primary mb-6"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Items
          </Link>

          {/* Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 mb-6">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${imageUrl}")` }}
            />

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`text-sm font-bold uppercase px-3 py-1.5 rounded-full ${statusColors[post.status]}`}>
                {post.status}
              </span>
            </div>

            {/* Expired Warning */}
            {post.is_expired && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span className="font-semibold">This item has expired</span>
                </div>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                post.type === 'offer'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}>
                {post.type === 'offer' ? 'Offering' : 'Requesting'}
              </span>
              {post.condition && post.type === 'offer' && (
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {conditionLabels[post.condition] || post.condition}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">category</span>
                {categoryLabel}
              </span>
              {post.quantity > 1 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">inventory</span>
                  Qty: {post.quantity}
                </span>
              )}
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
                    <dt className="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-wide">Pickup Location</dt>
                    <dd className="text-stone-800 dark:text-stone-200">{post.approx_location}</dd>
                  </div>
                </div>
              )}
              {post.expiry_date && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-stone-400 text-[20px] mt-0.5">event</span>
                  <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-500 uppercase tracking-wide">Expiry Date</dt>
                    <dd className={`${post.is_expired ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-stone-800 dark:text-stone-200'}`}>
                      {formatDate(post.expiry_date)}
                      {post.is_expired && ' (Expired)'}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {canReserve && (
              <button
                onClick={() => setShowReserveModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
                Reserve Item
              </button>
            )}

            {post.type === 'request' && isAuthenticated && !isOwner && post.status === 'available' && (
              <button
                onClick={() => setShowReserveModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all btn-press"
              >
                <span className="material-symbols-outlined text-[20px]">redeem</span>
                I Have This
              </button>
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

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-dark rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              {post.type === 'offer' ? 'Reserve Item' : 'Offer to Share'}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
              Add a message to the {post.type === 'offer' ? 'owner' : 'requester'} (optional)
            </p>

            {post.quantity > 1 && post.type === 'offer' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Quantity (max: {post.quantity})
                </label>
                <input
                  type="number"
                  min="1"
                  max={post.quantity}
                  value={reserveQuantity}
                  onChange={(e) => setReserveQuantity(Math.min(parseInt(e.target.value) || 1, post.quantity))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <textarea
              value={reserveMessage}
              onChange={(e) => setReserveMessage(e.target.value)}
              placeholder="Hi! I'm interested in this item..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReserveModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold hover:border-stone-400 dark:hover:border-stone-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReserve}
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
