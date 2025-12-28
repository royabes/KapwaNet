'use client'

import { AppShell } from '@/components/layout'
import { HeroSection } from '@/components/home/HeroSection'
import { ActionButtons } from '@/components/home/ActionButtons'
import { CommunityPulse } from '@/components/home/CommunityPulse'
import { QuoteCard } from '@/components/home/QuoteCard'
import { RecentActivity } from '@/components/home/RecentActivity'
import { CollectiveImpact } from '@/components/home/CollectiveImpact'

export default function HomePage() {
  return (
    <AppShell title="Home">
      <div className="flex flex-col gap-6 w-full">
        {/* Greeting - visible on mobile, different on desktop */}
        <div className="px-6 pt-2 pb-0 lg:px-0 lg:pt-0">
          <h1 className="text-stone-800 dark:text-stone-100 text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            Welcome home, <br className="lg:hidden" />
            <span className="text-stone-500 dark:text-stone-400 font-normal">neighbor.</span>
          </h1>
          <p className="hidden lg:block mt-2 text-stone-600 dark:text-stone-400 text-lg">
            We belong to each other. Participate in your community&apos;s web of mutual care.
          </p>
        </div>

        {/* Desktop: Two column layout */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Hero Section */}
            <HeroSection />

            {/* Action Buttons */}
            <ActionButtons />

            {/* Community Pulse */}
            <CommunityPulse />
          </div>

          {/* Sidebar column - only on desktop */}
          <div className="hidden lg:flex lg:flex-col lg:gap-6">
            {/* Inspirational Quote */}
            <QuoteCard />

            {/* Recent Activity */}
            <RecentActivity />

            {/* Collective Impact */}
            <CollectiveImpact />
          </div>
        </div>

        {/* Mobile only: Quote card */}
        <div className="lg:hidden">
          <QuoteCard />
        </div>

        {/* Spacer for bottom nav on mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
