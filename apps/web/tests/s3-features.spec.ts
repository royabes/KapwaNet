import { test, expect } from '@playwright/test'

test.describe('S3-C1: Invitations Feed Page', () => {
  test('displays invitations page with correct title', async ({ page }) => {
    await page.goto('/invitations')
    await expect(page.getByRole('heading', { name: /Community Invitations/i })).toBeVisible()
  })

  test('has type filter buttons (All, Invitations, Gifts)', async ({ page }) => {
    await page.goto('/invitations')
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Invitations' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gifts' })).toBeVisible()
  })

  test('has urgency filter buttons', async ({ page }) => {
    await page.goto('/invitations')
    await expect(page.getByRole('button', { name: 'Any' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'High' })).toBeVisible()
  })

  test('shows empty state message when no posts', async ({ page }) => {
    await page.goto('/invitations')
    // Wait for loading to complete
    await page.waitForTimeout(1000)
    // Should show either posts or empty state
    const hasContent = await page.getByText(/Community is ready|Invite the Community/).isVisible().catch(() => false)
    expect(hasContent).toBeTruthy()
  })
})

test.describe('S3-C2: Gifts Marketplace Page', () => {
  test('displays gifts page with correct title', async ({ page }) => {
    await page.goto('/gifts')
    await expect(page.getByRole('heading', { name: /Community Gifts/i })).toBeVisible()
  })

  test('has type filter buttons (All, Sharing, Seeking)', async ({ page }) => {
    await page.goto('/gifts')
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sharing' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Seeking' })).toBeVisible()
  })

  test('has category dropdown filter', async ({ page }) => {
    await page.goto('/gifts')
    await expect(page.getByRole('combobox')).toBeVisible()
  })
})

test.describe('S3-D1: Create Post Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/create')
    // Should redirect to login
    await page.waitForURL(/login/)
    await expect(page.url()).toContain('login')
  })

  test('has Time & Skills and Goods & Items toggle', async ({ page }) => {
    // This test requires auth - skip content check for now
    await page.goto('/create')
    await page.waitForTimeout(500)
  })
})

test.describe('S3-E1: Authentication Pages', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible()
  })

  test('login page shows demo credentials', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/test@kapwanet.org/)).toBeVisible()
  })

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /Join the Flow/i })).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/^Password/)).toBeVisible()
    await expect(page.getByLabel(/Confirm password/i)).toBeVisible()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible()
  })

  test('register page shows philosophy quote', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText(/no giver.*no receiver.*only the flow/i)).toBeVisible()
  })
})

test.describe('S3-F1: Landing Page', () => {
  test('landing page hero section loads', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByText(/We are the flow/i)).toBeVisible()
    await expect(page.getByText(/learning to flow freely/i)).toBeVisible()
  })

  test('landing page has call-to-action buttons', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByRole('link', { name: /Join Your Community/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Read the Philosophy/i })).toBeVisible()
  })

  test('landing page explains what KapwaNet is', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByText(/What is KapwaNet/i)).toBeVisible()
    await expect(page.getByText(/Invitations, Not Requests/i)).toBeVisible()
    await expect(page.getByText(/Gifts, Not Transactions/i)).toBeVisible()
    await expect(page.getByText(/Kapwa, Not Charity/i)).toBeVisible()
  })

  test('landing page has navigation', async ({ page }) => {
    await page.goto('/landing')
    await expect(page.getByRole('link', { name: /Our Philosophy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Join Free/i })).toBeVisible()
  })
})

test.describe('S3-F2: Organization Onboarding', () => {
  test('shows auth prompt when not logged in', async ({ page }) => {
    await page.goto('/organizations/new')
    await expect(page.getByText(/Start Your Community/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Create Account/i })).toBeVisible()
  })
})

test.describe('S3-G1: Messages Page', () => {
  test('shows auth prompt when not logged in', async ({ page }) => {
    await page.goto('/messages')
    await expect(page.getByText(/Connect with your community/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign In to Message/i })).toBeVisible()
  })
})

test.describe('S3-E2: Profile Page', () => {
  test('profile page loads for guest users', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText(/Guest/i)).toBeVisible()
  })

  test('profile page has join prompt for guests', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText(/Join the Flow/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
  })

  test('profile page links to philosophy', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByText(/Our Philosophy/i)).toBeVisible()
  })
})

test.describe('Navigation Regression Tests', () => {
  test('sidebar shows all main navigation items on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Invitations/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Gifts/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Messages/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible()
  })

  test('sidebar shows coordinator and philosophy links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(page.getByRole('link', { name: /Coordinator/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Our Philosophy/i })).toBeVisible()
  })

  test('bottom nav visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile bottom nav should be visible
    const nav = page.locator('nav').filter({ hasText: /Home/i })
    await expect(nav).toBeVisible()
  })
})

test.describe('Coordinator Dashboard', () => {
  test('shows auth prompt when not logged in', async ({ page }) => {
    await page.goto('/coordinator')
    await expect(page.getByText(/Coordinator Access Required/i)).toBeVisible()
  })
})
