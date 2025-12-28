import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('home page loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/KapwaNet/)
    await expect(page.getByText('Welcome home')).toBeVisible()
  })

  test('philosophy page loads correctly', async ({ page }) => {
    await page.goto('/philosophy')
    await expect(page.getByRole('heading', { name: 'The Flow' })).toBeVisible()
    await expect(page.getByText('Before you were born')).toBeVisible()
  })

  test('profile page loads correctly', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: /Guest|Profile/ })).toBeVisible()
  })

  test('coordinator dashboard loads correctly', async ({ page }) => {
    await page.goto('/coordinator')
    await expect(page.getByText(/Coordinator/)).toBeVisible()
  })

  test('mobile navigation is visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    // Bottom nav should be visible on mobile
    await expect(page.locator('nav').filter({ hasText: 'Home' })).toBeVisible()
  })

  test('desktop sidebar is visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    // Sidebar should have KapwaNet branding
    await expect(page.getByRole('heading', { name: 'KapwaNet' })).toBeVisible()
  })
})

test.describe('Philosophy Page Content', () => {
  test('displays all major philosophy sections', async ({ page }) => {
    await page.goto('/philosophy')

    // Check key sections
    await expect(page.getByText('You have never given anyone anything')).toBeVisible()
    await expect(page.getByText('You have never needed anything from anyone')).toBeVisible()
    await expect(page.getByText('We are here because life moves')).toBeVisible()

    // Check traditions section
    await expect(page.getByText('Kapwa')).toBeVisible()
    await expect(page.getByText('Ubuntu')).toBeVisible()
  })

  test('displays shorter forms at the bottom', async ({ page }) => {
    await page.goto('/philosophy')

    await expect(page.getByText('The Shorter Form')).toBeVisible()
    await expect(page.getByText('The Shortest Form')).toBeVisible()
    await expect(page.getByText('The One Word')).toBeVisible()
  })
})
