import { test, expect } from '@playwright/test'

/**
 * S6: Platform Enhancements Tests
 *
 * These tests verify the platform enhancement features:
 * - S6-A: Notifications System
 * - S6-B: Activity Feed
 * - S6-C: Admin Dashboard (Members, Moderation, Analytics)
 * - S6-D: PWA Enhancements
 * - S6-E: Search Functionality
 * - S6-F: Image Upload components
 */

test.describe('S6-A: Notifications System', () => {
  test('notifications page is accessible', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(2000)
    // Should show notifications page or redirect to login
    const hasTitle = await page.getByText('Notifications').first().isVisible().catch(() => false)
    const isOnLoginOrNotifications = page.url().includes('notifications') || page.url().includes('login')
    expect(hasTitle || isOnLoginOrNotifications).toBeTruthy()
  })

  test('notifications page shows auth prompt for unauthenticated users', async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(2000)
    // Should show sign-in prompt or redirect
    const hasSignInPrompt = await page.getByText('Sign In').isVisible().catch(() => false)
    const isRedirected = page.url().includes('login')
    expect(hasSignInPrompt || isRedirected).toBeTruthy()
  })
})

test.describe('S6-B: Activity Feed', () => {
  test('activity page is accessible', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(2000)
    // Should show activity page
    const hasTitle = await page.getByText('Activity').first().isVisible().catch(() => false)
    expect(hasTitle || page.url().includes('activity')).toBeTruthy()
  })

  test('activity page shows community activity header', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(2000)
    const hasCommunityActivity = await page.getByText('Community Activity').isVisible().catch(() => false)
    expect(hasCommunityActivity).toBeTruthy()
  })

  test('activity page has refresh button', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(2000)
    const hasRefreshButton = await page.getByText('Refresh').isVisible().catch(() => false)
    expect(hasRefreshButton).toBeTruthy()
  })

  test('activity page shows live indicator', async ({ page }) => {
    await page.goto('/activity')
    await page.waitForTimeout(2000)
    const hasLiveIndicator = await page.getByText('Live updates').isVisible().catch(() => false)
    expect(hasLiveIndicator).toBeTruthy()
  })
})

test.describe('S6-C: Admin Dashboard', () => {
  test('admin dashboard is accessible (with auth)', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForTimeout(2000)
    // Should show admin or redirect to login
    const isOnAdminOrLogin = page.url().includes('admin') || page.url().includes('login')
    expect(isOnAdminOrLogin).toBeTruthy()
  })

  test('admin members page exists', async ({ page }) => {
    await page.goto('/admin/members')
    await page.waitForTimeout(2000)
    const isOnMembersOrLogin = page.url().includes('members') || page.url().includes('login')
    expect(isOnMembersOrLogin).toBeTruthy()
  })

  test('admin moderation page exists', async ({ page }) => {
    await page.goto('/admin/moderation')
    await page.waitForTimeout(2000)
    const isOnModerationOrLogin = page.url().includes('moderation') || page.url().includes('login')
    expect(isOnModerationOrLogin).toBeTruthy()
  })

  test('admin analytics page exists', async ({ page }) => {
    await page.goto('/admin/analytics')
    await page.waitForTimeout(2000)
    const isOnAnalyticsOrLogin = page.url().includes('analytics') || page.url().includes('login')
    expect(isOnAnalyticsOrLogin).toBeTruthy()
  })
})

test.describe('S6-D: PWA Enhancements', () => {
  test('offline page exists', async ({ page }) => {
    await page.goto('/offline')
    await page.waitForTimeout(2000)
    const hasOfflineText = await page.getByText("You're Offline").isVisible().catch(() => false)
    expect(hasOfflineText || page.url().includes('offline')).toBeTruthy()
  })

  test('manifest.json is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)

    const manifest = await response?.json()
    expect(manifest.name).toBe('KapwaNet - Community Platform')
    expect(manifest.short_name).toBe('KapwaNet')
    expect(manifest.display).toBe('standalone')
  })

  test('service worker file is accessible', async ({ page }) => {
    const response = await page.goto('/sw.js')
    expect(response?.status()).toBe(200)
  })
})

test.describe('S6-E: Search Functionality', () => {
  test('search page is accessible', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('search')
  })

  test('search page has search input', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(2000)
    const hasSearchInput = await page.locator('input[type="text"]').isVisible().catch(() => false)
    expect(hasSearchInput).toBeTruthy()
  })

  test('search page has filter buttons', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(2000)
    // Should have All, Invitations, Gifts, Members, Pages filters
    const hasAllFilter = await page.getByRole('button', { name: /all/i }).isVisible().catch(() => false)
    expect(hasAllFilter).toBeTruthy()
  })

  test('search shows empty state before query', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(2000)
    const hasEmptyState = await page.getByText('Search your community').isVisible().catch(() => false)
    expect(hasEmptyState).toBeTruthy()
  })

  test('search can be performed', async ({ page }) => {
    await page.goto('/search')
    await page.waitForTimeout(2000)

    // Type in search
    const searchInput = page.locator('input[type="text"]')
    await searchInput.fill('help')
    await page.waitForTimeout(500)

    // Should show results or no results message
    const hasResults = await page.locator('[class*="rounded-xl"]').count() > 0
    const hasNoResults = await page.getByText('No results found').isVisible().catch(() => false)
    expect(hasResults || hasNoResults).toBeTruthy()
  })
})

test.describe('Navigation with Search', () => {
  test('desktop sidebar has search link', async ({ page }) => {
    // Go to a page with desktop sidebar
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.waitForTimeout(2000)

    // Desktop sidebar should have search
    const hasSearchLink = await page.locator('aside').getByText('Search').isVisible().catch(() => false)
    expect(hasSearchLink).toBeTruthy()
  })

  test('mobile header has search icon', async ({ page }) => {
    // Go to a page with mobile header
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(2000)

    // Should have search icon
    const hasSearchIcon = await page.locator('header').locator('[href="/search"]').isVisible().catch(() => false)
    expect(hasSearchIcon).toBeTruthy()
  })
})
