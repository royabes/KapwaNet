'use client'

import { useState, useCallback } from 'react'
import { BlockData } from '@/lib/api'
import { getBlockRegistryEntry } from '@/components/blocks'

interface PropertyEditorProps {
  block: BlockData
  onUpdate: (newProps: Record<string, unknown>) => void
  onClose: () => void
}

export function PropertyEditor({ block, onUpdate, onClose }: PropertyEditorProps) {
  const entry = getBlockRegistryEntry(block.type)
  const displayName = entry?.displayName || block.type
  const [props, setProps] = useState<Record<string, unknown>>(block.props)

  const handleChange = useCallback((key: string, value: unknown) => {
    const newProps = { ...props, [key]: value }
    setProps(newProps)
    onUpdate(newProps)
  }, [props, onUpdate])

  const handleNestedChange = useCallback((parentKey: string, index: number, key: string, value: unknown) => {
    const array = (props[parentKey] as unknown[]) || []
    const newArray = [...array]
    newArray[index] = { ...(newArray[index] as object), [key]: value }
    handleChange(parentKey, newArray)
  }, [props, handleChange])

  const handleAddToArray = useCallback((key: string, template: unknown) => {
    const array = (props[key] as unknown[]) || []
    handleChange(key, [...array, template])
  }, [props, handleChange])

  const handleRemoveFromArray = useCallback((key: string, index: number) => {
    const array = (props[key] as unknown[]) || []
    handleChange(key, array.filter((_, i) => i !== index))
  }, [props, handleChange])

  // Render appropriate field based on the property type
  const renderField = (key: string, value: unknown, schema?: FieldSchema) => {
    const fieldSchema = schema || inferSchema(key, value)

    switch (fieldSchema.type) {
      case 'text':
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={fieldSchema.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={fieldSchema.placeholder}
            rows={fieldSchema.rows || 3}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
        )

      case 'richtext':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="Enter HTML content..."
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-mono resize-none"
          />
        )

      case 'url':
        return (
          <input
            type="url"
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={Number(value) || 0}
            onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
            min={fieldSchema.min}
            max={fieldSchema.max}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="size-4 rounded border-stone-300 dark:border-stone-600 text-primary focus:ring-primary"
            />
            <span className="text-sm text-stone-600 dark:text-stone-400">
              {fieldSchema.label || 'Enable'}
            </span>
          </label>
        )

      case 'select':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            {fieldSchema.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'array':
        const arrayValue = (value as unknown[]) || []
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">Item {index + 1}</span>
                  <button
                    onClick={() => handleRemoveFromArray(key, index)}
                    className="p-1 text-stone-400 hover:text-red-500 rounded"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                {renderArrayItem(key, item, index, fieldSchema.itemSchema)}
              </div>
            ))}
            <button
              onClick={() => handleAddToArray(key, fieldSchema.itemTemplate || {})}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add {fieldSchema.itemLabel || 'Item'}
            </button>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={String(value || '')}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        )
    }
  }

  const renderArrayItem = (parentKey: string, item: unknown, index: number, schema?: Record<string, FieldSchema>) => {
    const itemObj = item as Record<string, unknown>

    if (schema) {
      return (
        <div className="space-y-2">
          {Object.entries(schema).map(([itemKey, itemSchema]) => (
            <div key={itemKey}>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 capitalize">
                {itemSchema.label || itemKey.replace(/_/g, ' ')}
              </label>
              {renderNestedField(parentKey, index, itemKey, itemObj[itemKey], itemSchema)}
            </div>
          ))}
        </div>
      )
    }

    // Infer schema for simple items
    return (
      <div className="space-y-2">
        {Object.entries(itemObj).map(([itemKey, itemValue]) => (
          <div key={itemKey}>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1 capitalize">
              {itemKey.replace(/_/g, ' ')}
            </label>
            {renderNestedField(parentKey, index, itemKey, itemValue)}
          </div>
        ))}
      </div>
    )
  }

  const renderNestedField = (parentKey: string, index: number, key: string, value: unknown, schema?: FieldSchema) => {
    const fieldSchema = schema || inferSchema(key, value)

    switch (fieldSchema.type) {
      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => handleNestedChange(parentKey, index, key, e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
        )
      default:
        return (
          <input
            type={fieldSchema.type === 'number' ? 'number' : 'text'}
            value={String(value || '')}
            onChange={(e) => handleNestedChange(parentKey, index, key, fieldSchema.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        )
    }
  }

  // Get schema for this block type
  const schema = getBlockSchema(block.type)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">{displayName}</h3>
          <p className="text-xs text-stone-500">{block.type}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(schema).map(([key, fieldSchema]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
              {fieldSchema.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {fieldSchema.description && (
              <p className="text-xs text-stone-500 mb-1.5">{fieldSchema.description}</p>
            )}
            {renderField(key, props[key], fieldSchema)}
          </div>
        ))}
      </div>
    </div>
  )
}

interface FieldSchema {
  type: 'text' | 'textarea' | 'richtext' | 'url' | 'number' | 'boolean' | 'select' | 'array'
  label?: string
  description?: string
  placeholder?: string
  required?: boolean
  rows?: number
  min?: number
  max?: number
  options?: Array<{ value: string; label: string }>
  itemSchema?: Record<string, FieldSchema>
  itemTemplate?: unknown
  itemLabel?: string
}

function inferSchema(key: string, value: unknown): FieldSchema {
  // Infer type from key name and value
  const keyLower = key.toLowerCase()

  if (keyLower.includes('url') || keyLower.includes('image') || keyLower.includes('href') || keyLower.includes('logo')) {
    return { type: 'url' }
  }
  if (keyLower === 'content' || keyLower === 'html' || keyLower === 'body') {
    return { type: 'richtext' }
  }
  if (keyLower.includes('description') || keyLower.includes('message') || keyLower === 'quote') {
    return { type: 'textarea', rows: 3 }
  }
  if (typeof value === 'boolean') {
    return { type: 'boolean' }
  }
  if (typeof value === 'number') {
    return { type: 'number' }
  }
  if (Array.isArray(value)) {
    return { type: 'array' }
  }

  return { type: 'text' }
}

function getBlockSchema(blockType: string): Record<string, FieldSchema> {
  const schemas: Record<string, Record<string, FieldSchema>> = {
    hero: {
      headline: { type: 'text', label: 'Headline', required: true },
      subheadline: { type: 'textarea', label: 'Subheadline', rows: 2 },
      backgroundImage: { type: 'url', label: 'Background Image URL' },
      alignment: {
        type: 'select',
        label: 'Text Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      ctas: {
        type: 'array',
        label: 'Call-to-Action Buttons',
        itemLabel: 'Button',
        itemTemplate: { label: 'Click Here', href: '/', variant: 'primary' },
        itemSchema: {
          label: { type: 'text', label: 'Button Text' },
          href: { type: 'text', label: 'Link URL' },
          variant: {
            type: 'select',
            label: 'Style',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'outline', label: 'Outline' },
            ],
          },
        },
      },
    },
    rich_text_section: {
      content: { type: 'richtext', label: 'Content (HTML)', required: true },
    },
    card_grid: {
      heading: { type: 'text', label: 'Section Heading' },
      columns: {
        type: 'select',
        label: 'Columns',
        options: [
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
        ],
      },
      cards: {
        type: 'array',
        label: 'Cards',
        itemLabel: 'Card',
        itemTemplate: { title: 'Card Title', description: '', imageUrl: '' },
        itemSchema: {
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
          imageUrl: { type: 'url', label: 'Image URL' },
          href: { type: 'text', label: 'Link URL (optional)' },
        },
      },
    },
    steps: {
      heading: { type: 'text', label: 'Section Heading' },
      steps: {
        type: 'array',
        label: 'Steps',
        itemLabel: 'Step',
        itemTemplate: { number: 1, title: 'Step Title', description: '' },
        itemSchema: {
          number: { type: 'number', label: 'Step Number' },
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
        },
      },
    },
    cta_banner: {
      headline: { type: 'text', label: 'Headline', required: true },
      subheadline: { type: 'textarea', label: 'Subheadline', rows: 2 },
      ctas: {
        type: 'array',
        label: 'Buttons',
        itemLabel: 'Button',
        itemTemplate: { label: 'Get Started', href: '/', variant: 'primary' },
        itemSchema: {
          label: { type: 'text', label: 'Button Text' },
          href: { type: 'text', label: 'Link URL' },
          variant: {
            type: 'select',
            label: 'Style',
            options: [
              { value: 'primary', label: 'Primary' },
              { value: 'secondary', label: 'Secondary' },
            ],
          },
        },
      },
    },
    contact_block: {
      heading: { type: 'text', label: 'Heading' },
      email: { type: 'text', label: 'Email Address' },
      phone: { type: 'text', label: 'Phone Number' },
      address: { type: 'textarea', label: 'Address', rows: 2 },
    },
    announcement_banner: {
      message: { type: 'text', label: 'Message', required: true },
      type: {
        type: 'select',
        label: 'Banner Type',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'success', label: 'Success' },
          { value: 'error', label: 'Error' },
        ],
      },
      dismissible: { type: 'boolean', label: 'Allow dismiss' },
    },
    image_text_split: {
      heading: { type: 'text', label: 'Heading' },
      content: { type: 'richtext', label: 'Content (HTML)' },
      imageUrl: { type: 'url', label: 'Image URL' },
      imagePosition: {
        type: 'select',
        label: 'Image Position',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
      },
    },
    stats_strip: {
      stats: {
        type: 'array',
        label: 'Statistics',
        itemLabel: 'Stat',
        itemTemplate: { value: '0', label: 'Label' },
        itemSchema: {
          value: { type: 'text', label: 'Value' },
          label: { type: 'text', label: 'Label' },
        },
      },
    },
    faq_accordion: {
      heading: { type: 'text', label: 'Section Heading' },
      faqs: {
        type: 'array',
        label: 'FAQs',
        itemLabel: 'FAQ',
        itemTemplate: { question: 'Question?', answer: 'Answer here...' },
        itemSchema: {
          question: { type: 'text', label: 'Question' },
          answer: { type: 'textarea', label: 'Answer' },
        },
      },
    },
    testimonial_quote: {
      quote: { type: 'textarea', label: 'Quote', required: true, rows: 3 },
      author: { type: 'text', label: 'Author Name' },
      role: { type: 'text', label: 'Author Role/Title' },
      avatarUrl: { type: 'url', label: 'Author Photo URL' },
    },
    news_list: {
      heading: { type: 'text', label: 'Section Heading' },
      articles: {
        type: 'array',
        label: 'Articles',
        itemLabel: 'Article',
        itemTemplate: { title: 'Article Title', summary: '', date: '', href: '' },
        itemSchema: {
          title: { type: 'text', label: 'Title' },
          summary: { type: 'textarea', label: 'Summary' },
          date: { type: 'text', label: 'Date' },
          href: { type: 'text', label: 'Link URL' },
          imageUrl: { type: 'url', label: 'Image URL' },
        },
      },
    },
    team_grid: {
      heading: { type: 'text', label: 'Section Heading' },
      members: {
        type: 'array',
        label: 'Team Members',
        itemLabel: 'Member',
        itemTemplate: { name: 'Name', role: 'Role', photoUrl: '' },
        itemSchema: {
          name: { type: 'text', label: 'Name' },
          role: { type: 'text', label: 'Role' },
          photoUrl: { type: 'url', label: 'Photo URL' },
          bio: { type: 'textarea', label: 'Bio' },
        },
      },
    },
    partner_logos: {
      heading: { type: 'text', label: 'Section Heading' },
      logos: {
        type: 'array',
        label: 'Partner Logos',
        itemLabel: 'Partner',
        itemTemplate: { name: 'Partner Name', logoUrl: '', href: '' },
        itemSchema: {
          name: { type: 'text', label: 'Partner Name' },
          logoUrl: { type: 'url', label: 'Logo URL' },
          href: { type: 'text', label: 'Link URL (optional)' },
        },
      },
    },
    needs_widget: {
      heading: { type: 'text', label: 'Section Heading' },
      showType: {
        type: 'select',
        label: 'Show',
        options: [
          { value: 'both', label: 'Both Requests & Offers' },
          { value: 'request', label: 'Requests Only' },
          { value: 'offer', label: 'Offers Only' },
        ],
      },
      limit: { type: 'number', label: 'Number of Items', min: 1, max: 12 },
    },
    sponsor_strip: {
      label: { type: 'text', label: 'Strip Label' },
      logos: {
        type: 'array',
        label: 'Sponsor Logos',
        itemLabel: 'Sponsor',
        itemTemplate: { name: 'Sponsor', logoUrl: '' },
        itemSchema: {
          name: { type: 'text', label: 'Sponsor Name' },
          logoUrl: { type: 'url', label: 'Logo URL' },
        },
      },
    },
    donate_widget: {
      heading: { type: 'text', label: 'Heading' },
      description: { type: 'textarea', label: 'Description' },
      donateUrl: { type: 'url', label: 'Donation Link URL' },
    },
    volunteer_roles: {
      heading: { type: 'text', label: 'Section Heading' },
      roles: {
        type: 'array',
        label: 'Volunteer Roles',
        itemLabel: 'Role',
        itemTemplate: { title: 'Role Title', description: '', commitment: '' },
        itemSchema: {
          title: { type: 'text', label: 'Role Title' },
          description: { type: 'textarea', label: 'Description' },
          commitment: { type: 'text', label: 'Time Commitment' },
        },
      },
    },
    event_list: {
      heading: { type: 'text', label: 'Section Heading' },
      events: {
        type: 'array',
        label: 'Events',
        itemLabel: 'Event',
        itemTemplate: { title: 'Event Title', date: '', location: '' },
        itemSchema: {
          title: { type: 'text', label: 'Event Title' },
          date: { type: 'text', label: 'Date & Time' },
          location: { type: 'text', label: 'Location' },
          description: { type: 'textarea', label: 'Description' },
          href: { type: 'text', label: 'Event Link (optional)' },
        },
      },
    },
    resource_links: {
      heading: { type: 'text', label: 'Section Heading' },
      links: {
        type: 'array',
        label: 'Resources',
        itemLabel: 'Resource',
        itemTemplate: { title: 'Resource Title', href: '', type: 'link' },
        itemSchema: {
          title: { type: 'text', label: 'Title' },
          description: { type: 'textarea', label: 'Description' },
          href: { type: 'url', label: 'URL' },
          type: {
            type: 'select',
            label: 'Type',
            options: [
              { value: 'link', label: 'External Link' },
              { value: 'pdf', label: 'PDF Download' },
              { value: 'doc', label: 'Document' },
            ],
          },
        },
      },
    },
  }

  return schemas[blockType] || {}
}
