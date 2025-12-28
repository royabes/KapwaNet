'use client'

import { useState, useCallback } from 'react'
import { BlockData } from '@/lib/api'
import { blockRegistry, BlockType, getBlockRegistryEntry } from '@/components/blocks'
import { BlockRenderer } from '@/components/blocks'
import { BlockSelector } from './BlockSelector'
import { PropertyEditor } from './PropertyEditor'

interface PageEditorProps {
  blocks: BlockData[]
  onChange: (blocks: BlockData[]) => void
  onSave: () => void
  isSaving: boolean
}

export function PageEditor({ blocks, onChange, onSave, isSaving }: PageEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [showBlockSelector, setShowBlockSelector] = useState(false)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  const handleAddBlock = useCallback((blockType: BlockType, index: number) => {
    const entry = getBlockRegistryEntry(blockType)
    if (!entry) return

    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      type: blockType,
      props: getDefaultProps(blockType),
    }

    const newBlocks = [...blocks]
    newBlocks.splice(index, 0, newBlock)
    onChange(newBlocks)
    setSelectedBlockId(newBlock.id)
    setShowBlockSelector(false)
    setInsertIndex(null)
  }, [blocks, onChange])

  const handleDeleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(b => b.id !== blockId)
    onChange(newBlocks)
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null)
    }
  }, [blocks, onChange, selectedBlockId])

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const newBlocks = [...blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    onChange(newBlocks)
  }, [blocks, onChange])

  const handleUpdateBlockProps = useCallback((blockId: string, newProps: Record<string, unknown>) => {
    const newBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, props: newProps } : b
    )
    onChange(newBlocks)
  }, [blocks, onChange])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      handleMoveBlock(draggedIndex, dragOverIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const openBlockSelectorAt = (index: number) => {
    setInsertIndex(index)
    setShowBlockSelector(true)
  }

  return (
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600 dark:text-stone-400">
              {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white font-medium transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-stone-50 dark:bg-stone-950 p-6">
          {viewMode === 'preview' ? (
            /* Preview Mode */
            <div className="max-w-5xl mx-auto bg-white dark:bg-stone-900 rounded-xl shadow-lg overflow-hidden">
              <BlockRenderer blocks={blocks as any} />
            </div>
          ) : (
            /* Edit Mode */
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Add Block at Start */}
              <AddBlockButton onClick={() => openBlockSelectorAt(0)} />

              {blocks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="size-16 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-stone-400 text-[32px]">add_box</span>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
                    Start building your page
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 mb-4">
                    Click the button above to add your first block
                  </p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div key={block.id}>
                    <BlockCard
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      isDragging={draggedIndex === index}
                      isDragOver={dragOverIndex === index}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onMoveUp={() => handleMoveBlock(index, index - 1)}
                      onMoveDown={() => handleMoveBlock(index, index + 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < blocks.length - 1}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    />
                    {/* Add Block Between */}
                    <AddBlockButton onClick={() => openBlockSelectorAt(index + 1)} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Property Editor Sidebar */}
      {viewMode === 'edit' && selectedBlock && (
        <div className="w-80 border-l border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-y-auto">
          <PropertyEditor
            block={selectedBlock}
            onUpdate={(newProps) => handleUpdateBlockProps(selectedBlock.id, newProps)}
            onClose={() => setSelectedBlockId(null)}
          />
        </div>
      )}

      {/* Block Selector Modal */}
      {showBlockSelector && insertIndex !== null && (
        <BlockSelector
          onSelect={(blockType) => handleAddBlock(blockType, insertIndex)}
          onClose={() => {
            setShowBlockSelector(false)
            setInsertIndex(null)
          }}
        />
      )}
    </div>
  )
}

interface BlockCardProps {
  block: BlockData
  isSelected: boolean
  isDragging: boolean
  isDragOver: boolean
  onSelect: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnd: () => void
}

function BlockCard({
  block,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onDragStart,
  onDragOver,
  onDragEnd,
}: BlockCardProps) {
  const entry = getBlockRegistryEntry(block.type)
  const displayName = entry?.displayName || block.type

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`
        group relative bg-white dark:bg-stone-900 rounded-xl border-2 transition-all cursor-pointer
        ${isSelected
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
        }
        ${isDragging ? 'opacity-50' : ''}
        ${isDragOver ? 'border-primary border-dashed' : ''}
      `}
    >
      {/* Block Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
        <div
          className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-600"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
        </div>
        <div className="flex-1">
          <span className="font-medium text-stone-800 dark:text-stone-100">{displayName}</span>
          {entry && (
            <span className="ml-2 text-xs text-stone-500 capitalize">{entry.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onMoveUp() }}
            disabled={!canMoveUp}
            className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed rounded"
            title="Move up"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMoveDown() }}
            disabled={!canMoveDown}
            className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed rounded"
            title="Move down"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1 text-stone-400 hover:text-red-500 rounded"
            title="Delete block"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Block Preview */}
      <div className="p-4 pointer-events-none">
        <BlockPreview block={block} />
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 size-6 bg-primary rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[14px]">edit</span>
        </div>
      )}
    </div>
  )
}

function BlockPreview({ block }: { block: BlockData }) {
  // Simple text-based preview of block content
  const props = block.props as Record<string, unknown>

  const previewText = (() => {
    if (props.headline) return String(props.headline)
    if (props.title) return String(props.title)
    if (props.heading) return String(props.heading)
    if (props.content) {
      const text = String(props.content).replace(/<[^>]*>/g, '')
      return text.length > 100 ? text.slice(0, 100) + '...' : text
    }
    return 'Click to edit...'
  })()

  return (
    <div className="text-sm text-stone-600 dark:text-stone-400 truncate">
      {previewText}
    </div>
  )
}

function AddBlockButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center justify-center py-2">
      <button
        onClick={onClick}
        className="group flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 hover:text-primary bg-stone-100 dark:bg-stone-800 hover:bg-primary/10 rounded-full transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Add Block</span>
      </button>
    </div>
  )
}

/**
 * Get default props for a block type
 */
function getDefaultProps(blockType: BlockType): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    hero: {
      headline: 'Welcome to Our Community',
      subheadline: 'Building connections that matter',
      alignment: 'center',
      ctas: [],
    },
    rich_text_section: {
      content: '<p>Add your content here...</p>',
    },
    card_grid: {
      heading: 'Our Services',
      columns: 3,
      cards: [],
    },
    steps: {
      heading: 'How It Works',
      steps: [
        { number: 1, title: 'Step 1', description: 'Description here' },
        { number: 2, title: 'Step 2', description: 'Description here' },
        { number: 3, title: 'Step 3', description: 'Description here' },
      ],
    },
    cta_banner: {
      headline: 'Ready to Get Started?',
      subheadline: 'Join our community today',
      ctas: [],
    },
    contact_block: {
      heading: 'Contact Us',
      email: 'contact@example.com',
      phone: '',
      address: '',
    },
    announcement_banner: {
      message: 'Important announcement here',
      type: 'info',
      dismissible: true,
    },
    image_text_split: {
      heading: 'About Us',
      content: '<p>Tell your story here...</p>',
      imageUrl: '',
      imagePosition: 'left',
    },
    stats_strip: {
      stats: [
        { value: '100+', label: 'Members' },
        { value: '50+', label: 'Projects' },
        { value: '10+', label: 'Years' },
      ],
    },
    faq_accordion: {
      heading: 'Frequently Asked Questions',
      faqs: [],
    },
    testimonial_quote: {
      quote: 'Add a testimonial here...',
      author: 'Author Name',
      role: 'Role',
    },
    news_list: {
      heading: 'Latest News',
      articles: [],
    },
    team_grid: {
      heading: 'Our Team',
      members: [],
    },
    partner_logos: {
      heading: 'Our Partners',
      logos: [],
    },
    needs_widget: {
      heading: 'Community Needs',
      showType: 'both',
      limit: 6,
    },
    sponsor_strip: {
      label: 'Sponsored By',
      logos: [],
    },
    donate_widget: {
      heading: 'Support Our Work',
      description: 'Your donation makes a difference',
    },
    volunteer_roles: {
      heading: 'Volunteer Opportunities',
      roles: [],
    },
    event_list: {
      heading: 'Upcoming Events',
      events: [],
    },
    resource_links: {
      heading: 'Resources',
      links: [],
    },
  }

  return defaults[blockType] || {}
}

export { BlockSelector } from './BlockSelector'
export { PropertyEditor } from './PropertyEditor'
