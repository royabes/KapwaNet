'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout'

type HelpSection =
  | 'getting-started'
  | 'navigation'
  | 'invitations'
  | 'gifts'
  | 'messaging'
  | 'profile'
  | 'notifications'
  | 'admin'
  | 'pwa'

interface HelpTopic {
  id: HelpSection
  title: string
  icon: string
  description: string
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'rocket_launch',
    description: 'New to KapwaNet? Start here to learn the basics.',
  },
  {
    id: 'navigation',
    title: 'Navigation Guide',
    icon: 'map',
    description: 'Learn how to navigate the app and find what you need.',
  },
  {
    id: 'invitations',
    title: 'Invitations (Help)',
    icon: 'volunteer_activism',
    description: 'Request help or offer assistance to neighbors.',
  },
  {
    id: 'gifts',
    title: 'Gifts (Items)',
    icon: 'redeem',
    description: 'Share items or find things you need.',
  },
  {
    id: 'messaging',
    title: 'Messages',
    icon: 'chat',
    description: 'Connect with community members privately.',
  },
  {
    id: 'profile',
    title: 'Your Profile',
    icon: 'person',
    description: 'Manage your profile and preferences.',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'notifications',
    description: 'Stay updated on community activity.',
  },
  {
    id: 'admin',
    title: 'Admin Features',
    icon: 'admin_panel_settings',
    description: 'For community organizers and moderators.',
  },
  {
    id: 'pwa',
    title: 'Install App',
    icon: 'install_mobile',
    description: 'Install KapwaNet on your device.',
  },
]

const HELP_CONTENT: Record<HelpSection, React.ReactNode> = {
  'getting-started': (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Welcome to KapwaNet
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          KapwaNet is a community platform rooted in the Filipino concept of <em>kapwa</em> (shared
          humanity). It enables communities to practice <em>bayanihan</em> (mutual aid) in a
          dignified, peer-to-peer way.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Quick Start Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-400">
          <li>
            <strong>Create an account</strong> - Sign up with your email at{' '}
            <Link href="/register" className="text-primary hover:underline">
              /register
            </Link>
          </li>
          <li>
            <strong>Complete your profile</strong> - Add your name and neighborhood
          </li>
          <li>
            <strong>Explore your community</strong> - Browse invitations and gifts
          </li>
          <li>
            <strong>Participate</strong> - Offer help or share items with neighbors
          </li>
        </ol>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Core Principles</h4>
        <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-400">
          <li>
            <strong>Peer-to-peer:</strong> We&apos;re a platform, not a service provider
          </li>
          <li>
            <strong>Dignity-centered:</strong> Not charity — mutual exchange
          </li>
          <li>
            <strong>Community-owned:</strong> Open-source and transparent
          </li>
        </ul>
      </div>
    </div>
  ),

  navigation: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          App Navigation
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          KapwaNet has a simple navigation structure. Here&apos;s what each section does:
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">home</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Home</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Your community dashboard. See recent activity, quick stats, and featured posts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">explore</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Explore</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Browse all community content — invitations, gifts, and activity in one place.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">volunteer_activism</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Invitations</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Help requests and offers. Ask for assistance or offer to help others.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-amber-500">redeem</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Gifts</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Items being shared in the community — food, clothing, household items, and more.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">chat</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Messages</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Private conversations with other community members. Coordinate help and pickups.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Notifications</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Updates about your posts, messages, and community activity.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">search</span>
            <h4 className="font-medium text-stone-800 dark:text-stone-100">Search</h4>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Find specific posts, members, or pages. Filter by type (invitations, gifts, members).
          </p>
        </div>
      </div>
    </div>
  ),

  invitations: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Invitations (Help Posts)
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          Invitations are how we request and offer help in the community. They&apos;re called
          &quot;invitations&quot; because asking for help invites connection.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Types of Invitations</h4>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              arrow_upward
            </span>
            <span>
              <strong>Request:</strong> You need help with something (rides, errands, skills)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">
              arrow_downward
            </span>
            <span>
              <strong>Offer:</strong> You can help others (tutoring, transportation, repairs)
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">How It Works</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-400">
          <li>Create an invitation describing what you need or can offer</li>
          <li>Set the urgency level (low, medium, high)</li>
          <li>Community members can express interest</li>
          <li>You accept a match and coordinate via messages</li>
          <li>Mark as completed when done</li>
        </ol>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Safety Note</h4>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          For your safety, exact addresses are never shared. Coordinate specific meeting details via
          private messages.
        </p>
      </div>
    </div>
  ),

  gifts: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Gifts (Item Posts)
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          Share items you no longer need or find things you can use. Everything is free — it&apos;s
          about sharing abundance.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Item Categories</h4>
        <div className="grid grid-cols-2 gap-2">
          {['Food', 'Clothing', 'Household', 'Books', 'Electronics', 'Other'].map((cat) => (
            <div
              key={cat}
              className="px-3 py-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-sm text-stone-600 dark:text-stone-400"
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Sharing an Item</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-400">
          <li>Click &quot;Create&quot; and select &quot;Gift&quot;</li>
          <li>Add photos, description, and category</li>
          <li>For food items, add expiry date and allergen info</li>
          <li>Set approximate location and availability</li>
          <li>Wait for someone to reserve, then coordinate pickup</li>
        </ol>
      </div>

      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Food Safety</h4>
        <p className="text-sm text-green-700 dark:text-green-300">
          For food items, always include expiration dates and any allergen information. This keeps
          our community safe.
        </p>
      </div>
    </div>
  ),

  messaging: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">Messages</h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          Private messaging lets you coordinate with community members. Messages are created when
          you match on invitations or need to arrange item pickups.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">How to Message</h4>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              check_circle
            </span>
            <span>Express interest in an invitation or reserve an item</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              check_circle
            </span>
            <span>Once matched, a message thread is created automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              check_circle
            </span>
            <span>Coordinate details, timing, and meeting location privately</span>
          </li>
        </ul>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Privacy</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Messages are private between participants. Share only what you&apos;re comfortable with.
        </p>
      </div>
    </div>
  ),

  profile: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Your Profile
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          Your profile shows who you are in the community. Keep it friendly and authentic.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Profile Settings</h4>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              account_circle
            </span>
            <span>
              <strong>Avatar:</strong> Add a photo so neighbors recognize you
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              badge
            </span>
            <span>
              <strong>Display Name:</strong> How you appear in posts and messages
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              location_on
            </span>
            <span>
              <strong>Neighborhood:</strong> Helps match you with nearby neighbors
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              description
            </span>
            <span>
              <strong>Bio:</strong> Share a bit about yourself and how you can help
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Your Activity</h4>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Your profile shows your recent invitations and gifts. This helps build trust in the
          community by showing your participation history.
        </p>
      </div>
    </div>
  ),

  notifications: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Notifications
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          Stay updated on activity relevant to you without being overwhelmed.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">
          What You&apos;ll Be Notified About
        </h4>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              volunteer_activism
            </span>
            <span>Someone expresses interest in your invitation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-[18px] mt-0.5">
              redeem
            </span>
            <span>Someone reserves your item</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[18px] mt-0.5">
              chat
            </span>
            <span>You receive a new message</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">
              check_circle
            </span>
            <span>Your help request is matched</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Push Notifications</h4>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          If you install KapwaNet as an app, you can receive push notifications even when the app
          isn&apos;t open. Enable this in your device settings.
        </p>
      </div>
    </div>
  ),

  admin: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Admin Features
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          For community organizers and moderators. These features help keep the community safe and
          thriving.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Admin Dashboard</h4>
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
          Access at{' '}
          <Link href="/admin" className="text-primary hover:underline">
            /admin
          </Link>{' '}
          (requires admin role)
        </p>
        <ul className="space-y-2 text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              group
            </span>
            <span>
              <strong>Members:</strong> View and manage community members
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              shield
            </span>
            <span>
              <strong>Moderation:</strong> Review reports and take action
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              analytics
            </span>
            <span>
              <strong>Analytics:</strong> Community statistics and trends
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
              settings
            </span>
            <span>
              <strong>Settings:</strong> Configure community settings and theme
            </span>
          </li>
        </ul>
      </div>
    </div>
  ),

  pwa: (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-3">
          Install KapwaNet
        </h3>
        <p className="text-stone-600 dark:text-stone-400 mb-4">
          KapwaNet can be installed on your phone or computer for quick access and offline support.
        </p>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">On Mobile (iOS/Android)</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-400">
          <li>Open KapwaNet in your mobile browser</li>
          <li>
            <strong>iOS:</strong> Tap the Share button, then &quot;Add to Home Screen&quot;
          </li>
          <li>
            <strong>Android:</strong> Tap the menu (⋮), then &quot;Install app&quot; or &quot;Add to
            Home Screen&quot;
          </li>
          <li>The app icon will appear on your home screen</li>
        </ol>
      </div>

      <div>
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">On Desktop (Chrome/Edge)</h4>
        <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-400">
          <li>Look for the install icon in the address bar (➕)</li>
          <li>Or click the menu and select &quot;Install KapwaNet&quot;</li>
          <li>The app opens in its own window without browser UI</li>
        </ol>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
        <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-2">Benefits of Installing</h4>
        <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-400">
          <li>• Quick access from home screen</li>
          <li>• Works offline with cached content</li>
          <li>• Push notifications for updates</li>
          <li>• Full-screen app experience</li>
        </ul>
      </div>
    </div>
  ),
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<HelpSection>('getting-started')

  return (
    <AppShell title="Help & Guide">
      <div className="max-w-5xl mx-auto w-full px-4 lg:px-0">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Help & User Guide
          </h2>
          <p className="text-stone-600 dark:text-stone-400">
            Everything you need to know about using KapwaNet
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Topic List */}
          <div className="lg:w-64 shrink-0">
            <nav className="space-y-1">
              {HELP_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setActiveSection(topic.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === topic.id
                      ? 'bg-primary text-white'
                      : 'bg-stone-50 dark:bg-stone-800/50 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      activeSection === topic.id ? 'text-white' : 'text-stone-400'
                    }`}
                  >
                    {topic.icon}
                  </span>
                  <span className="font-medium text-sm">{topic.title}</span>
                </button>
              ))}
            </nav>

            {/* Quick Links */}
            <div className="mt-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-3 text-sm">
                Quick Links
              </h4>
              <div className="space-y-2">
                <Link
                  href="/philosophy"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                  Our Philosophy
                </Link>
                <Link
                  href="/search"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  Search Community
                </Link>
                <Link
                  href="/create"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Create Post
                </Link>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
              {HELP_CONTENT[activeSection]}
            </div>

            {/* Contact Support */}
            <div className="mt-6 p-6 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-center">
              <span className="material-symbols-outlined text-stone-400 text-[32px] mb-2">
                support_agent
              </span>
              <h4 className="font-medium text-stone-800 dark:text-stone-100 mb-1">
                Need More Help?
              </h4>
              <p className="text-sm text-stone-500 mb-3">
                Can&apos;t find what you&apos;re looking for? Reach out to your community organizers.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="h-10 lg:h-0" />
      </div>
    </AppShell>
  )
}
