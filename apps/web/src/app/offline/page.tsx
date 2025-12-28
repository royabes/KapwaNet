'use client'

import Link from 'next/link'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="size-24 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-stone-400 text-[48px]">
            cloud_off
          </span>
        </div>

        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
          You&apos;re Offline
        </h1>

        <p className="text-stone-600 dark:text-stone-400 mb-8">
          It looks like you&apos;ve lost your internet connection.
          Don&apos;t worry - the flow continues when you&apos;re back online.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full py-3 px-6 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Try Again
          </button>

          <p className="text-sm text-stone-500">
            Some features may still be available from cache.
          </p>
        </div>

        {/* Philosophy */}
        <div className="mt-12 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-stone-600 dark:text-stone-400 italic">
            &ldquo;The flow is always there, even when we cannot see it.&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}
