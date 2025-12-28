'use client'

/**
 * ThemePresetSelector component for admin theme management.
 *
 * Allows admins to preview and apply theme presets to an organization.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { useTheme } from '@/contexts'
import type { ThemePreset, ThemeJson } from '@/lib/theme'

interface ThemePresetSelectorProps {
  /** Organization slug or ID for persisting theme */
  orgSlugOrId?: string
  /** Auth token for API calls (required for persisting) */
  authToken?: string
  /** Callback when theme is successfully applied */
  onApplySuccess?: () => void
  /** Whether to show persistence controls */
  showPersist?: boolean
}

/**
 * Admin component for selecting and applying theme presets.
 */
export function ThemePresetSelector({
  orgSlugOrId,
  authToken,
  onApplySuccess,
  showPersist = true,
}: ThemePresetSelectorProps) {
  const { theme, currentPreset, applyPreset, setTheme, isLoading: themeLoading } = useTheme()

  // State
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [loadingPresets, setLoadingPresets] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewPreset, setPreviewPreset] = useState<ThemePreset | null>(null)
  const [originalTheme, setOriginalTheme] = useState<ThemeJson | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fetch presets on mount
  useEffect(() => {
    async function fetchPresets() {
      try {
        const data = await api.themes.listPresets()
        setPresets(data)
      } catch (err) {
        console.error('Failed to load presets:', err)
        setError('Failed to load theme presets')
      } finally {
        setLoadingPresets(false)
      }
    }
    fetchPresets()
  }, [])

  // Handle preset preview
  const handlePreview = useCallback(async (preset: ThemePreset) => {
    // Store original theme for cancel
    if (!previewPreset) {
      setOriginalTheme(theme)
    }
    setPreviewPreset(preset)
    await applyPreset(preset.id)
    setSaveSuccess(false)
  }, [theme, previewPreset, applyPreset])

  // Handle cancel preview
  const handleCancelPreview = useCallback(() => {
    if (originalTheme) {
      setTheme(originalTheme)
    }
    setPreviewPreset(null)
    setOriginalTheme(null)
    setSaveSuccess(false)
  }, [originalTheme, setTheme])

  // Handle apply and persist to backend
  const handleApply = useCallback(async () => {
    if (!previewPreset || !orgSlugOrId || !authToken) {
      // Just apply locally if no org/auth
      setPreviewPreset(null)
      setOriginalTheme(null)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      return
    }

    setSaving(true)
    setError(null)

    try {
      await api.organizations.updateThemePreset(orgSlugOrId, previewPreset.id)
      setPreviewPreset(null)
      setOriginalTheme(null)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      onApplySuccess?.()
    } catch (err) {
      console.error('Failed to save theme:', err)
      setError('Failed to save theme. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [previewPreset, orgSlugOrId, authToken, onApplySuccess])

  // Check if a preset is currently selected
  const isSelected = (preset: ThemePreset) => {
    if (previewPreset) {
      return preset.id === previewPreset.id
    }
    return currentPreset?.id === preset.id
  }

  if (loadingPresets) {
    return (
      <div className="p-4 text-center" style={{ color: 'var(--kn-muted)' }}>
        Loading theme presets...
      </div>
    )
  }

  if (error && !presets.length) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--kn-text)' }}>
          Theme Presets
        </h3>
        {currentPreset && !previewPreset && (
          <span
            className="text-sm px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--kn-surface)', color: 'var(--kn-muted)' }}
          >
            Current: {currentPreset.name}
          </span>
        )}
        {previewPreset && (
          <span
            className="text-sm px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--kn-accent)', color: 'var(--kn-text)' }}
          >
            Previewing: {previewPreset.name}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          className="p-3 rounded-md text-sm"
          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
        >
          {error}
        </div>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div
          className="p-3 rounded-md text-sm"
          style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
        >
          Theme applied successfully!
        </div>
      )}

      {/* Preset grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePreview(preset)}
            disabled={themeLoading}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${isSelected(preset)
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
              }
              ${themeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: preset.is_dark ? '#1e293b' : '#ffffff',
            }}
          >
            {/* Color preview */}
            <div className="flex gap-1 mb-3">
              {preset.preview_colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Preset name */}
            <p
              className="font-medium text-sm"
              style={{ color: preset.is_dark ? '#f1f5f9' : '#1e293b' }}
            >
              {preset.name}
            </p>

            {/* Dark mode badge */}
            {preset.is_dark && (
              <span className="text-xs text-gray-400 mt-1 block">
                Dark Mode
              </span>
            )}

            {/* Current indicator */}
            {isSelected(preset) && !previewPreset && (
              <span className="text-xs text-blue-500 mt-1 block">
                ✓ Current
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Preview controls */}
      {previewPreset && (
        <div
          className="flex items-center justify-end gap-3 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--kn-surface)' }}
        >
          <button
            onClick={handleCancelPreview}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
            style={{ color: 'var(--kn-text)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50"
            style={{ backgroundColor: 'var(--kn-primary)' }}
          >
            {saving ? 'Saving...' : showPersist && orgSlugOrId ? 'Apply & Save' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ThemePresetSelector
