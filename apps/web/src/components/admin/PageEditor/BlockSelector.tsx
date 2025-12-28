'use client'

import { useState } from 'react'
import { blockRegistry, BlockType, BlockRegistryEntry } from '@/components/blocks'

interface BlockSelectorProps {
  onSelect: (blockType: BlockType) => void
  onClose: () => void
}

const categoryLabels: Record<BlockRegistryEntry['category'], string> = {
  layout: 'Layout',
  content: 'Content',
  interactive: 'Interactive',
  utility: 'Utility',
}

const categoryIcons: Record<BlockRegistryEntry['category'], string> = {
  layout: 'dashboard',
  content: 'article',
  interactive: 'touch_app',
  utility: 'build',
}

const categoryDescriptions: Record<BlockRegistryEntry['category'], string> = {
  layout: 'Structure and organize your page',
  content: 'Add text, images, and information',
  interactive: 'Engage visitors with dynamic content',
  utility: 'Additional features and tools',
}

const blockIcons: Record<string, string> = {
  hero: 'view_headline',
  rich_text_section: 'format_align_left',
  card_grid: 'grid_view',
  steps: 'format_list_numbered',
  cta_banner: 'campaign',
  contact_block: 'contact_mail',
  announcement_banner: 'campaign',
  image_text_split: 'view_column',
  stats_strip: 'analytics',
  faq_accordion: 'help_outline',
  testimonial_quote: 'format_quote',
  news_list: 'newspaper',
  team_grid: 'groups',
  partner_logos: 'handshake',
  needs_widget: 'volunteer_activism',
  sponsor_strip: 'paid',
  donate_widget: 'favorite',
  volunteer_roles: 'diversity_3',
  event_list: 'event',
  resource_links: 'link',
}

const blockDescriptions: Record<string, string> = {
  hero: 'Large header section with headline and call-to-action',
  rich_text_section: 'Formatted text content with headings and paragraphs',
  card_grid: 'Grid of cards with images, titles, and descriptions',
  steps: 'Numbered steps or process flow',
  cta_banner: 'Call-to-action banner with buttons',
  contact_block: 'Contact information and social links',
  announcement_banner: 'Dismissible announcement or alert',
  image_text_split: 'Side-by-side image and text content',
  stats_strip: 'Display key statistics and metrics',
  faq_accordion: 'Frequently asked questions with expandable answers',
  testimonial_quote: 'Quote or testimonial from a person',
  news_list: 'List of news articles or blog posts',
  team_grid: 'Grid of team member profiles',
  partner_logos: 'Display partner or sponsor logos',
  needs_widget: 'Live feed of community help requests and offers',
  sponsor_strip: 'Horizontal strip of sponsor logos',
  donate_widget: 'Donation call-to-action section',
  volunteer_roles: 'List of volunteer opportunities',
  event_list: 'Upcoming events calendar',
  resource_links: 'Collection of downloadable resources or links',
}

export function BlockSelector({ onSelect, onClose }: BlockSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<BlockRegistryEntry['category'] | 'all'>('all')

  // Group blocks by category
  const blocksByCategory = Object.entries(blockRegistry).reduce((acc, [type, entry]) => {
    if (!acc[entry.category]) acc[entry.category] = []
    acc[entry.category].push({ type: type as BlockType, entry })
    return acc
  }, {} as Record<BlockRegistryEntry['category'], Array<{ type: BlockType; entry: BlockRegistryEntry }>>)

  // Filter blocks based on search and category
  const filteredBlocks = Object.entries(blocksByCategory)
    .map(([category, blocks]) => ({
      category: category as BlockRegistryEntry['category'],
      blocks: blocks.filter(({ type, entry }) => {
        const matchesSearch = searchQuery === '' ||
          entry.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (blockDescriptions[type]?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
        return matchesSearch && matchesCategory
      }),
    }))
    .filter(({ blocks }) => blocks.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Add Block
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Choose a block type to add to your page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 space-y-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              All
            </button>
            {Object.entries(categoryLabels).map(([category, label]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as BlockRegistryEntry['category'])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {categoryIcons[category as BlockRegistryEntry['category']]}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Block List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBlocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-stone-400 text-[32px]">search_off</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                No blocks found
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Try adjusting your search or filter
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBlocks.map(({ category, blocks }) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-stone-400 text-[18px]">
                      {categoryIcons[category]}
                    </span>
                    <h3 className="text-sm font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                      {categoryLabels[category]}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {blocks.map(({ type, entry }) => (
                      <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className="text-left p-4 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-primary transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-stone-600 dark:text-stone-300 group-hover:text-primary text-[20px]">
                              {blockIcons[type] || 'widgets'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-stone-800 dark:text-stone-100 group-hover:text-primary transition-colors">
                              {entry.displayName}
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                              {blockDescriptions[type]}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
