'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api, OrgPageListItem } from '@/lib/api'

// Default org ID for demo
const DEFAULT_ORG_ID = '1'

const statusColors: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400',
}

const pageTypeIcons: Record<string, string> = {
  home: 'home',
  about: 'info',
  programs: 'volunteer_activism',
  contact: 'contact_mail',
  custom: 'article',
}

export default function PagesPage() {
  const [pages, setPages] = useState<OrgPageListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  async function fetchPages() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.pages.list(DEFAULT_ORG_ID)
      setPages(data)
    } catch (err) {
      console.error('Failed to fetch pages:', err)
      setError('Failed to load pages. Make sure the API is running.')
      setPages([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.pages.delete(id)
      setPages(pages.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete page:', err)
      setError('Failed to delete page.')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            Pages
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Create and manage your website pages
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Page
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-stone-200 dark:border-stone-800 last:border-0">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-stone-200 dark:bg-stone-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : pages.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
          <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-stone-400 text-[32px]">article</span>
          </div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            No pages yet
          </h3>
          <p className="text-stone-600 dark:text-stone-400 max-w-sm mx-auto mb-6">
            Create your first page to get started. Choose from our templates or start from scratch.
          </p>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Your First Page
          </Link>
        </div>
      ) : (
        /* Pages List */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800">
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Page
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Updated
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-stone-200 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                        <span className="material-symbols-outlined text-stone-500 text-[20px]">
                          {pageTypeIcons[page.page_type] || 'article'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-100">
                          {page.title}
                        </p>
                        <p className="text-sm text-stone-500">/{page.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-600 dark:text-stone-400 capitalize">
                      {page.page_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${statusColors[page.status]}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-stone-600 dark:text-stone-400">
                      {formatDate(page.updated_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="p-2 text-stone-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit page"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </Link>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-stone-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View page"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </a>
                      {deleteConfirm === page.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(page.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Confirm delete"
                          >
                            <span className="material-symbols-outlined text-[20px]">check</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-2 text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(page.id)}
                          className="p-2 text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete page"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
