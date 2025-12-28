'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, PageTemplateListItem } from '@/lib/api'

// Default org ID for demo
const DEFAULT_ORG_ID = '1'

const categoryLabels: Record<string, string> = {
  starter: 'Starter Templates',
  community: 'Community',
  nonprofit: 'Nonprofit',
  mutual_aid: 'Mutual Aid',
}

const categoryDescriptions: Record<string, string> = {
  starter: 'Simple templates to get you started',
  community: 'Templates for community organizations',
  nonprofit: 'Templates designed for nonprofits',
  mutual_aid: 'Templates for mutual aid networks',
}

const pageTypeIcons: Record<string, string> = {
  home: 'home',
  about: 'info',
  programs: 'volunteer_activism',
  contact: 'contact_mail',
  custom: 'article',
}

export default function NewPagePage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<PageTemplateListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplateListItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state for customization
  const [customTitle, setCustomTitle] = useState('')
  const [customSlug, setCustomSlug] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      setCustomTitle(selectedTemplate.name)
      setCustomSlug(selectedTemplate.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }, [selectedTemplate])

  async function fetchTemplates() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.templates.list()
      setTemplates(data)
    } catch (err) {
      console.error('Failed to fetch templates:', err)
      setError('Failed to load templates. Make sure the API is running.')
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreatePage() {
    if (!selectedTemplate) return

    setIsCreating(true)
    setError(null)

    try {
      const page = await api.pages.createFromTemplate({
        template_id: selectedTemplate.id,
        org_id: DEFAULT_ORG_ID,
        title: customTitle || undefined,
        slug: customSlug || undefined,
      })

      // Redirect to the page editor
      router.push(`/admin/pages/${page.id}/edit`)
    } catch (err: unknown) {
      console.error('Failed to create page:', err)
      const apiError = err as { detail?: string; message?: string }
      setError(apiError.detail || apiError.message || 'Failed to create page.')
    } finally {
      setIsCreating(false)
    }
  }

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    const cat = template.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(template)
    return acc
  }, {} as Record<string, PageTemplateListItem[]>)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/pages"
          className="p-2 text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
            Create New Page
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Choose a template to get started
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Selection */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/4 mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4">
                        <div className="aspect-video bg-stone-200 dark:bg-stone-700 rounded-lg animate-pulse mb-4" />
                        <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4 mb-2" />
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-stone-400 text-[32px]">view_quilt</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                No templates available
              </h3>
              <p className="text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                Templates will appear here once they&apos;re configured in the system.
              </p>
            </div>
          ) : (
            Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
              <div key={category}>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                    {categoryLabels[category] || category}
                  </h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {categoryDescriptions[category]}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`text-left bg-white dark:bg-stone-900 rounded-2xl border-2 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary shadow-lg shadow-primary/10'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-stone-100 dark:bg-stone-800 rounded-t-xl overflow-hidden relative">
                        {template.thumbnail_url ? (
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url("${template.thumbnail_url}")` }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-stone-400 text-[48px]">
                              {pageTypeIcons[template.page_type] || 'article'}
                            </span>
                          </div>
                        )}
                        {selectedTemplate?.id === template.id && (
                          <div className="absolute top-2 right-2 size-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[18px]">check</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-xs font-medium text-stone-500 capitalize bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                            {template.page_type}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Blank Page Option */}
          <div>
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
              Start from Scratch
            </h2>
            <button
              onClick={() => setSelectedTemplate({
                id: 'blank',
                name: 'Blank Page',
                description: 'Start with an empty page',
                page_type: 'custom',
                category: 'starter',
                thumbnail_url: undefined,
                recommended_preset_id: undefined,
              })}
              className={`w-full text-left bg-white dark:bg-stone-900 rounded-2xl border-2 border-dashed transition-all ${
                selectedTemplate?.id === 'blank'
                  ? 'border-primary shadow-lg shadow-primary/10'
                  : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600'
              }`}
            >
              <div className="p-8 flex items-center gap-4">
                <div className="size-16 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-stone-400 text-[32px]">add</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">
                    Blank Page
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Start with an empty page and add blocks as you go
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Customization Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
            <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-4">
              Page Settings
            </h2>

            {selectedTemplate ? (
              <div className="space-y-4">
                {/* Selected Template Preview */}
                <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        {pageTypeIcons[selectedTemplate.page_type] || 'article'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 dark:text-stone-100">
                        {selectedTemplate.name}
                      </p>
                      <p className="text-xs text-stone-500">{selectedTemplate.page_type} page</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter page title"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-500 text-sm rounded-l-xl border border-r-0 border-stone-200 dark:border-stone-700">
                      /
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                      placeholder="page-slug"
                      className="flex-1 px-4 py-2.5 rounded-r-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={handleCreatePage}
                  disabled={isCreating || !customTitle}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white font-semibold transition-all"
                >
                  {isCreating ? (
                    <>
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">add</span>
                      Create Page
                    </>
                  )}
                </button>

                <p className="text-xs text-stone-500 text-center">
                  You can edit the page content after creation
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="size-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-stone-400 text-[24px]">touch_app</span>
                </div>
                <p className="text-stone-600 dark:text-stone-400">
                  Select a template to continue
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
