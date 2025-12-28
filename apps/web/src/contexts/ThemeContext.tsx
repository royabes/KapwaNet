'use client'

/**
 * Theme Context for KapwaNet.
 *
 * Provides theme state and CSS variable injection for the entire app.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  ThemeJson,
  ThemeCssVariables,
  ThemePreset,
  OrgThemeResponse,
  DEFAULT_THEME,
  themeToCssVariables,
  applyCssVariables,
} from '@/lib/theme'
import { api } from '@/lib/api'

// Theme context value type
interface ThemeContextValue {
  // Current theme state
  theme: ThemeJson
  cssVariables: ThemeCssVariables
  currentPreset: ThemePreset | null
  isLoading: boolean
  error: string | null

  // Organization context
  orgSlug: string | null

  // Actions
  setTheme: (theme: ThemeJson) => void
  applyPreset: (presetId: string) => Promise<void>
  refreshTheme: () => Promise<void>
  setOrgSlug: (slug: string | null) => void
}

// Create context with undefined default
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Provider props
interface ThemeProviderProps {
  children: React.ReactNode
  initialOrgSlug?: string
  initialTheme?: ThemeJson
}

/**
 * ThemeProvider component.
 *
 * Wraps the app and provides theme state with CSS variable injection.
 */
export function ThemeProvider({
  children,
  initialOrgSlug,
  initialTheme,
}: ThemeProviderProps) {
  // State
  const [theme, setThemeState] = useState<ThemeJson>(initialTheme || DEFAULT_THEME)
  const [currentPreset, setCurrentPreset] = useState<ThemePreset | null>(null)
  const [orgSlug, setOrgSlug] = useState<string | null>(initialOrgSlug || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Compute CSS variables from theme
  const cssVariables = useMemo(() => themeToCssVariables(theme), [theme])

  // Apply CSS variables to document whenever they change
  useEffect(() => {
    applyCssVariables(cssVariables)
  }, [cssVariables])

  // Set theme and update CSS variables
  const setTheme = useCallback((newTheme: ThemeJson) => {
    setThemeState(newTheme)
    setCurrentPreset(null) // Clear preset when custom theme is set
    setError(null)
  }, [])

  // Fetch theme from API for current org
  const refreshTheme = useCallback(async () => {
    if (!orgSlug) {
      // Reset to default if no org
      setThemeState(DEFAULT_THEME)
      setCurrentPreset(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.organizations.getTheme(orgSlug)
      setThemeState(response.theme_json)
      setCurrentPreset(response.preset)
    } catch (err) {
      console.error('Failed to fetch theme:', err)
      setError('Failed to load theme')
      // Keep current theme on error
    } finally {
      setIsLoading(false)
    }
  }, [orgSlug])

  // Apply a preset (local only - doesn't persist to backend)
  const applyPreset = useCallback(async (presetId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const preset = await api.themes.getPreset(presetId)
      if (preset.theme_json) {
        setThemeState(preset.theme_json)
        setCurrentPreset(preset)
      }
    } catch (err) {
      console.error('Failed to apply preset:', err)
      setError('Failed to apply theme preset')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch theme when org changes
  useEffect(() => {
    if (orgSlug) {
      refreshTheme()
    }
  }, [orgSlug, refreshTheme])

  // Context value
  const value: ThemeContextValue = {
    theme,
    cssVariables,
    currentPreset,
    isLoading,
    error,
    orgSlug,
    setTheme,
    applyPreset,
    refreshTheme,
    setOrgSlug,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context.
 *
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Hook to get just the CSS variables (for style props).
 */
export function useThemeStyles(): React.CSSProperties {
  const { cssVariables } = useTheme()
  return cssVariables as unknown as React.CSSProperties
}

/**
 * Hook to check if using dark theme.
 */
export function useIsDarkTheme(): boolean {
  const { currentPreset } = useTheme()
  return currentPreset?.is_dark ?? false
}
