'use client'

import Link from 'next/link'

export function ActionButtons() {
  return (
    <div className="px-4">
      <div className="flex flex-col gap-3 w-full">
        {/* Offer Help: Primary Action */}
        <Link
          href="/create?type=offer"
          className="relative flex w-full cursor-pointer items-center justify-between rounded-xl h-16 px-6 bg-primary hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/20 group"
        >
          <div className="flex flex-col items-start">
            <span className="text-white text-lg font-bold leading-none">Offer Help</span>
            <span className="text-white/70 text-xs font-medium mt-1">Share resources or time</span>
          </div>
          <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined">volunteer_activism</span>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          {/* Request Help: Secondary Earthy Action */}
          <Link
            href="/create?type=request"
            className="flex flex-col w-full cursor-pointer items-start justify-center rounded-xl h-24 px-5 bg-stone-surface dark:bg-stone-dark text-stone-800 dark:text-stone-100 hover:brightness-95 dark:hover:brightness-110 active:scale-[0.98] transition-all duration-200 border border-transparent dark:border-white/5"
          >
            <div className="mb-2 size-8 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <span className="material-symbols-outlined text-[20px]">pan_tool</span>
            </div>
            <span className="text-base font-bold leading-tight">Request Help</span>
          </Link>

          {/* Browse Essentials: Outline Action */}
          <Link
            href="/explore"
            className="flex flex-col w-full cursor-pointer items-start justify-center rounded-xl h-24 px-5 bg-transparent border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
          >
            <div className="mb-2 size-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
            <span className="text-base font-bold leading-tight">Essentials</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
