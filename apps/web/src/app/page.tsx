'use client'

import { useEffect, useState } from 'react'
import { ApiStatus } from '@/components/ApiStatus'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-text mb-4">
          Welcome to KapwaNet
        </h2>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          A community platform rooted in <em>kapwa</em> — shared humanity.
          Enabling organizations to run dignified bayanihan (mutual aid),
          share essential goods, and communicate internally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-surface rounded-kn-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Bayanihan Help
            </h3>
            <p className="text-muted">
              Request or offer help within your community. Match with others
              who can assist or need support.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-kn-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Item Sharing
            </h3>
            <p className="text-muted">
              Share food, clothing, and essentials with safety information
              and pickup coordination.
            </p>
          </div>

          <div className="p-6 bg-surface rounded-kn-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Community Communication
            </h3>
            <p className="text-muted">
              Announcements, discussions, and direct messaging for your
              organization members.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <ApiStatus />
        </div>
      </div>
    </div>
  )
}
