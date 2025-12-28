'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface AppHeaderProps {
  title?: string
  left?: ReactNode
  right?: ReactNode
}

export function AppHeader({ title = 'KapwaNet', left, right }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 transition-colors duration-300">
      {/* Left action */}
      <div className="flex w-10 items-center justify-start">
        {left || (
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-stone-800 dark:text-stone-100 hover:bg-stone-surface dark:hover:bg-stone-dark transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
      </div>

      {/* Title */}
      <Link href="/" className="flex-1 text-center">
        <h2 className="text-stone-800 dark:text-stone-100 text-lg font-bold tracking-tight">
          {title}
        </h2>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {right || (
          <>
            <Link
              href="/search"
              className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-stone-800 dark:text-stone-100 hover:bg-stone-surface dark:hover:bg-stone-dark transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">search</span>
            </Link>
            <Link
              href="/profile"
              className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-transparent text-stone-800 dark:text-stone-100 hover:bg-stone-surface dark:hover:bg-stone-dark transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">account_circle</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
