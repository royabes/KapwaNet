'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, OrgPage, BlockData } from '@/lib/api'
import { PageEditor } from '@/components/admin'

type PageStatus = 'draft' | 'published' | 'archived'

export default function EditPagePage() {
  const params = useParams()
  const router = useRouter()
  const pageId = params.id as string

  const [page, setPage] = useState<OrgPage | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Page settings form state
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [pageStatus, setPageStatus] = useState<PageStatus>('draft')

  useEffect(() => {
    fetchPage()
  }, [pageId])

  async function fetchPage() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.pages.get(pageId)
      setPage(data)
      setBlocks(data.blocks_json || [])
      setPageTitle(data.title)
      setPageSlug(data.slug)
      setPageStatus(data.status)
    } catch (err) {
      console.error('Failed to fetch page:', err)
      setError('Failed to load page. Make sure the API is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlocksChange = useCallback((newBlocks: BlockData[]) => {
    setBlocks(newBlocks)
    setHasChanges(true)
  }, [])

  async function handleSave() {
    if (!page) return

    setIsSaving(true)
    setError(null)

    try {
      const updatedPage = await api.pages.update(pageId, {
        title: pageTitle,
        slug: pageSlug,
        status: pageStatus,
        blocks_json: blocks,
      })
      setPage(updatedPage)
      setHasChanges(false)
    } catch (err: unknown) {
      console.error('Failed to save page:', err)
      const apiError = err as { detail?: string; message?: string }
      setError(apiError.detail || apiError.message || 'Failed to save page.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePublish() {
    setPageStatus('published')
    setHasChanges(true)
    // Save immediately with published status
    if (page) {
      setIsSaving(true)
      try {
        const updatedPage = await api.pages.update(pageId, {
          title: pageTitle,
          slug: pageSlug,
          status: 'published',
          blocks_json: blocks,
        })
        setPage(updatedPage)
        setPageStatus('published')
        setHasChanges(false)
      } catch (err: unknown) {
        console.error('Failed to publish page:', err)
        const apiError = err as { detail?: string; message?: string }
        setError(apiError.detail || apiError.message || 'Failed to publish page.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-stone-600 dark:text-stone-400">Loading page...</p>
        </div>
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
          </div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Failed to Load Page
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mb-6">{error}</p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Pages
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pages"
            className="p-2 text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-semibold text-stone-800 dark:text-stone-100">{pageTitle}</h1>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <span>/{pageSlug}</span>
              {hasChanges && (
                <span className="text-amber-500 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings
                ? 'bg-primary/10 text-primary'
                : 'text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          {/* Status Badge */}
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
            pageStatus === 'published'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : pageStatus === 'draft'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
          }`}>
            {pageStatus}
          </span>

          {/* Publish Button */}
          {pageStatus !== 'published' && (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => { setPageTitle(e.target.value); setHasChanges(true) }}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-500 text-sm rounded-l-lg border border-r-0 border-stone-200 dark:border-stone-700">
                  /
                </span>
                <input
                  type="text"
                  value={pageSlug}
                  onChange={(e) => { setPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); setHasChanges(true) }}
                  className="flex-1 px-3 py-2 rounded-r-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Status
              </label>
              <select
                value={pageStatus}
                onChange={(e) => { setPageStatus(e.target.value as PageStatus); setHasChanges(true) }}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Page Editor */}
      <div className="flex-1 overflow-hidden">
        <PageEditor
          blocks={blocks}
          onChange={handleBlocksChange}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
