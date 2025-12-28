'use client'

/**
 * Theme test page for KapwaNet.
 *
 * Demonstrates theme switching and CSS variable injection.
 */

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts'
import { api } from '@/lib/api'
import type { ThemePreset } from '@/lib/theme'

export default function TestThemePage() {
  const { theme, currentPreset, isLoading, error, applyPreset, setTheme } = useTheme()
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [loadingPresets, setLoadingPresets] = useState(true)

  // Fetch available presets on mount
  useEffect(() => {
    async function fetchPresets() {
      try {
        const data = await api.themes.listPresets()
        setPresets(data)
      } catch (err) {
        console.error('Failed to load presets:', err)
      } finally {
        setLoadingPresets(false)
      }
    }
    fetchPresets()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--kn-primary)' }}>
        Theme Test Page
      </h1>

      {/* Current Theme Info */}
      <section className="mb-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--kn-surface)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kn-text)' }}>
          Current Theme
        </h2>
        {isLoading && <p style={{ color: 'var(--kn-muted)' }}>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Preset:</strong> {currentPreset?.name || 'Custom'}
          </div>
          <div>
            <strong>Primary:</strong>{' '}
            <span
              className="inline-block w-4 h-4 rounded align-middle"
              style={{ backgroundColor: theme.colors.primary }}
            />
            {' '}{theme.colors.primary}
          </div>
          <div>
            <strong>Secondary:</strong>{' '}
            <span
              className="inline-block w-4 h-4 rounded align-middle"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            {' '}{theme.colors.secondary}
          </div>
          <div>
            <strong>Accent:</strong>{' '}
            <span
              className="inline-block w-4 h-4 rounded align-middle"
              style={{ backgroundColor: theme.colors.accent }}
            />
            {' '}{theme.colors.accent}
          </div>
          <div>
            <strong>Radius:</strong> {theme.radius}
          </div>
          <div>
            <strong>Spacing:</strong> {theme.spacing}
          </div>
        </div>
      </section>

      {/* Theme Presets */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kn-text)' }}>
          Theme Presets
        </h2>
        {loadingPresets ? (
          <p style={{ color: 'var(--kn-muted)' }}>Loading presets...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentPreset?.id === preset.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{
                  backgroundColor: preset.is_dark ? '#1e293b' : '#ffffff',
                }}
              >
                <div className="flex gap-1 mb-2">
                  {preset.preview_colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: preset.is_dark ? '#f1f5f9' : '#1e293b' }}
                >
                  {preset.name}
                </p>
                {preset.is_dark && (
                  <span className="text-xs text-gray-400">Dark</span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Color Swatches */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kn-text)' }}>
          Color Swatches (using CSS variables)
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
          {[
            { name: 'Primary', var: '--kn-primary' },
            { name: 'Secondary', var: '--kn-secondary' },
            { name: 'Accent', var: '--kn-accent' },
            { name: 'Background', var: '--kn-bg' },
            { name: 'Surface', var: '--kn-surface' },
            { name: 'Text', var: '--kn-text' },
            { name: 'Muted', var: '--kn-muted' },
          ].map((color) => (
            <div key={color.var} className="text-center">
              <div
                className="w-16 h-16 rounded-lg border mx-auto mb-2"
                style={{ backgroundColor: `var(${color.var})` }}
              />
              <p className="text-xs" style={{ color: 'var(--kn-muted)' }}>
                {color.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Components */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kn-text)' }}>
          Sample Components
        </h2>
        <div className="space-y-4">
          {/* Button variants */}
          <div className="flex flex-wrap gap-4">
            <button
              className="px-4 py-2 rounded-md font-medium text-white"
              style={{
                backgroundColor: 'var(--kn-primary)',
                borderRadius: 'var(--kn-radius)',
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium text-white"
              style={{
                backgroundColor: 'var(--kn-secondary)',
                borderRadius: 'var(--kn-radius)',
              }}
            >
              Secondary Button
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium"
              style={{
                backgroundColor: 'var(--kn-accent)',
                borderRadius: 'var(--kn-radius)',
                color: 'var(--kn-text)',
              }}
            >
              Accent Button
            </button>
          </div>

          {/* Card */}
          <div
            className="p-6 border"
            style={{
              backgroundColor: 'var(--kn-surface)',
              borderRadius: 'var(--kn-radius-lg)',
              borderColor: 'var(--kn-muted)',
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--kn-text)' }}
            >
              Sample Card
            </h3>
            <p style={{ color: 'var(--kn-muted)' }}>
              This card uses CSS variables for all styling. Try switching themes
              above to see how the colors change dynamically.
            </p>
          </div>

          {/* Alert */}
          <div
            className="p-4 border-l-4"
            style={{
              backgroundColor: 'var(--kn-surface)',
              borderColor: 'var(--kn-accent)',
              borderRadius: 'var(--kn-radius)',
            }}
          >
            <p style={{ color: 'var(--kn-text)' }}>
              <strong>Note:</strong> CSS variables are injected at runtime by the
              ThemeProvider.
            </p>
          </div>
        </div>
      </section>

      {/* Custom Color Test */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--kn-text)' }}>
          Custom Color Test
        </h2>
        <p className="mb-4" style={{ color: 'var(--kn-muted)' }}>
          Click a color to set it as the primary color:
        </p>
        <div className="flex flex-wrap gap-2">
          {['#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'].map(
            (color) => (
              <button
                key={color}
                onClick={() =>
                  setTheme({
                    ...theme,
                    colors: { ...theme.colors, primary: color },
                  })
                }
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={`Set primary to ${color}`}
              />
            )
          )}
        </div>
      </section>
    </div>
  )
}
