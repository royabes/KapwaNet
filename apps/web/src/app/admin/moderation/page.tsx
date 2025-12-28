'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Report {
  id: string
  type: 'post' | 'user' | 'message'
  reason: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other'
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reporter_name: string
  reported_content: string
  reported_user: string
  created_at: string
  notes?: string
}

interface ModerationAction {
  id: string
  action: 'warning' | 'content_removed' | 'suspended' | 'banned'
  target_user: string
  reason: string
  moderator: string
  created_at: string
}

// Mock reports data
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    type: 'post',
    reason: 'spam',
    status: 'pending',
    reporter_name: 'Maria G.',
    reported_content: 'Buy cheap products at myspamsite.com',
    reported_user: 'SpamUser123',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'message',
    reason: 'harassment',
    status: 'pending',
    reporter_name: 'Ben T.',
    reported_content: 'Threatening message content...',
    reported_user: 'AgressiveUser',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'user',
    reason: 'scam',
    status: 'reviewed',
    reporter_name: 'Sarah L.',
    reported_content: 'User profile claiming to offer money for personal info',
    reported_user: 'FakeOffer2024',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Investigating linked accounts',
  },
  {
    id: '4',
    type: 'post',
    reason: 'inappropriate',
    status: 'resolved',
    reporter_name: 'David K.',
    reported_content: 'Post with inappropriate content',
    reported_user: 'ContentViolator',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    notes: 'Content removed and user warned',
  },
  {
    id: '5',
    type: 'post',
    reason: 'other',
    status: 'dismissed',
    reporter_name: 'Anonymous',
    reported_content: 'Regular community post',
    reported_user: 'NormalUser',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    notes: 'No violation found',
  },
]

// Mock moderation actions
const MOCK_ACTIONS: ModerationAction[] = [
  {
    id: '1',
    action: 'content_removed',
    target_user: 'ContentViolator',
    reason: 'Violated community guidelines - inappropriate content',
    moderator: 'Admin',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    action: 'warning',
    target_user: 'SpamUser123',
    reason: 'First warning for spam content',
    moderator: 'Moderator Ben',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    action: 'suspended',
    target_user: 'AgressiveUser',
    reason: 'Repeated harassment - 7 day suspension',
    moderator: 'Admin',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function getReasonBadge(reason: Report['reason']) {
  switch (reason) {
    case 'spam':
      return { label: 'Spam', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
    case 'harassment':
      return { label: 'Harassment', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    case 'inappropriate':
      return { label: 'Inappropriate', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' }
    case 'scam':
      return { label: 'Scam', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
    default:
      return { label: 'Other', color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' }
  }
}

function getStatusBadge(status: Report['status']) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: 'pending' }
    case 'reviewed':
      return { label: 'Reviewed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: 'visibility' }
    case 'resolved':
      return { label: 'Resolved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'check_circle' }
    case 'dismissed':
      return { label: 'Dismissed', color: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400', icon: 'cancel' }
  }
}

function getActionBadge(action: ModerationAction['action']) {
  switch (action) {
    case 'warning':
      return { label: 'Warning', color: 'text-amber-600', icon: 'warning' }
    case 'content_removed':
      return { label: 'Content Removed', color: 'text-orange-600', icon: 'delete' }
    case 'suspended':
      return { label: 'Suspended', color: 'text-red-600', icon: 'pause_circle' }
    case 'banned':
      return { label: 'Banned', color: 'text-red-800', icon: 'block' }
  }
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS)
  const [actions] = useState<ModerationAction[]>(MOCK_ACTIONS)
  const [activeTab, setActiveTab] = useState<'reports' | 'actions'>('reports')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const pendingCount = reports.filter((r) => r.status === 'pending').length
  const reviewedCount = reports.filter((r) => r.status === 'reviewed').length

  const filteredReports = reports.filter((report) => {
    if (statusFilter === 'all') return true
    return report.status === statusFilter
  })

  const handleUpdateStatus = (reportId: string, newStatus: Report['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    )
    setSelectedReport(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Moderation</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Review reports and manage community safety
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span className="font-medium">{pendingCount} pending reports</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">pending</span>
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span className="text-sm">In Review</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{reviewedCount}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="text-sm">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {reports.filter((r) => r.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-2 text-stone-500 mb-1">
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            <span className="text-sm">Actions Taken</span>
          </div>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{actions.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'reports'
              ? 'text-primary'
              : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          Reports
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
              {pendingCount}
            </span>
          )}
          {activeTab === 'reports' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'actions'
              ? 'text-primary'
              : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          Action Log
          {activeTab === 'actions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeTab === 'reports' && (
        <>
          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const reasonBadge = getReasonBadge(report.reason)
              const statusBadge = getStatusBadge(report.status)

              return (
                <div
                  key={report.id}
                  className={`bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 ${
                    report.status === 'pending' ? 'ring-2 ring-amber-200 dark:ring-amber-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          <span className="material-symbols-outlined text-[14px]">{statusBadge.icon}</span>
                          {statusBadge.label}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${reasonBadge.color}`}>
                          {reasonBadge.label}
                        </span>
                        <span className="text-xs text-stone-500">
                          {report.type === 'post' ? 'Post' : report.type === 'user' ? 'User' : 'Message'}
                        </span>
                      </div>

                      <p className="text-stone-800 dark:text-stone-100 mb-2">
                        <span className="font-medium">Reported user:</span> {report.reported_user}
                      </p>

                      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-stone-600 dark:text-stone-400 italic">
                          &ldquo;{report.reported_content}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-stone-500">
                        <span>Reported by {report.reporter_name}</span>
                        <span>{formatTimeAgo(report.created_at)}</span>
                      </div>

                      {report.notes && (
                        <div className="mt-3 flex items-start gap-2 text-sm">
                          <span className="material-symbols-outlined text-[16px] text-stone-400">notes</span>
                          <span className="text-stone-600 dark:text-stone-400">{report.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredReports.length === 0 && (
              <div className="py-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="material-symbols-outlined text-stone-300 text-[48px] mb-4">
                  verified_user
                </span>
                <p className="text-stone-500">No reports to show</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'actions' && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="divide-y divide-stone-200 dark:divide-stone-800">
            {actions.map((action) => {
              const actionBadge = getActionBadge(action.action)

              return (
                <div key={action.id} className="p-4 flex items-start gap-4">
                  <div className={`size-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center ${actionBadge.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{actionBadge.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${actionBadge.color}`}>{actionBadge.label}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600 dark:text-stone-400">{action.target_user}</span>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{action.reason}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      by {action.moderator} • {formatTimeAgo(action.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800">
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                Review Report
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-stone-500 mb-1">Reported User</p>
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {selectedReport.reported_user}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-stone-500 mb-1">Reason</p>
                <p className="font-medium text-stone-800 dark:text-stone-100 capitalize">
                  {selectedReport.reason}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-stone-500 mb-1">Content</p>
                <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3">
                  <p className="text-stone-600 dark:text-stone-400">
                    {selectedReport.reported_content}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                  Take Action
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    Dismiss
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    Warn User
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
