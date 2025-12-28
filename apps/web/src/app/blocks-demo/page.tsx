'use client'

/**
 * Blocks demo page for KapwaNet.
 *
 * Demonstrates all core block components with sample data.
 */

import {
  Hero,
  RichTextSection,
  CardGrid,
  Steps,
  CTABanner,
  ContactBlock,
} from '@/components/blocks'
import type {
  HeroBlock,
  RichTextSectionBlock,
  CardGridBlock,
  StepsBlock,
  CTABannerBlock,
  ContactBlockData,
} from '@/components/blocks'

// Sample block data
const heroBlock: HeroBlock = {
  id: 'hero-1',
  type: 'hero',
  headline: 'Community Support Through Bayanihan',
  subheadline: 'Connect with your community. Share resources, offer help, and receive support when you need it most.',
  ctas: [
    { label: 'Get Started', href: '#', variant: 'primary' },
    { label: 'Learn More', href: '#how-it-works', variant: 'outline' },
  ],
  alignment: 'center',
  minHeight: 'medium',
}

const richTextBlock: RichTextSectionBlock = {
  id: 'richtext-1',
  type: 'rich_text_section',
  content: `
    <h2>About KapwaNet</h2>
    <p>KapwaNet is rooted in the Filipino concept of <strong>kapwa</strong> (shared humanity). We believe that communities already have what they need — they just need the right infrastructure to connect.</p>
    <p>Our platform enables organizations to:</p>
    <ul>
      <li>Run dignified mutual aid programs</li>
      <li>Share essential goods safely</li>
      <li>Communicate internally</li>
      <li>Launch branded websites</li>
    </ul>
    <blockquote>
      "The spirit of bayanihan — helping one another without expecting anything in return — is what makes our communities strong."
    </blockquote>
  `,
  maxWidth: 'lg',
  centered: true,
}

const cardGridBlock: CardGridBlock = {
  id: 'cardgrid-1',
  type: 'card_grid',
  title: 'How We Help',
  subtitle: 'Three pillars of community support',
  columns: 3,
  cardStyle: 'bordered',
  cards: [
    {
      id: 'card-1',
      title: 'Bayanihan Help',
      description: 'Request or offer assistance within your community. Match with others who can help.',
      icon: '🤝',
    },
    {
      id: 'card-2',
      title: 'Item Sharing',
      description: 'Share food, clothing, and essentials with safety information and pickup coordination.',
      icon: '📦',
    },
    {
      id: 'card-3',
      title: 'Communication',
      description: 'Announcements, discussions, and direct messaging for your organization members.',
      icon: '💬',
    },
  ],
}

const stepsBlock: StepsBlock = {
  id: 'steps-1',
  type: 'steps',
  title: 'How It Works',
  subtitle: 'Getting started is easy',
  variant: 'numbered',
  steps: [
    {
      id: 'step-1',
      title: 'Join Your Organization',
      description: 'Sign up and connect with your local community organization on KapwaNet.',
    },
    {
      id: 'step-2',
      title: 'Browse or Post Needs',
      description: 'See what help is available or post your own request for assistance.',
    },
    {
      id: 'step-3',
      title: 'Connect and Help',
      description: 'Message other members to coordinate help or share resources.',
    },
    {
      id: 'step-4',
      title: 'Build Community',
      description: 'Strengthen bonds through mutual aid and shared experiences.',
    },
  ],
}

const ctaBannerBlock: CTABannerBlock = {
  id: 'cta-1',
  type: 'cta_banner',
  headline: 'Ready to Join?',
  subheadline: 'Start connecting with your community today. It only takes a few minutes to get started.',
  primaryCta: { label: 'Sign Up Now', href: '#' },
  secondaryCta: { label: 'Contact Us', href: '#contact' },
  backgroundColor: 'primary',
}

const contactBlockData: ContactBlockData = {
  id: 'contact-1',
  type: 'contact_block',
  title: 'Get in Touch',
  subtitle: "Have questions? We'd love to hear from you.",
  email: 'hello@kapwanet.org',
  phone: '+1 (555) 123-4567',
  address: '123 Community Street, Edmonton, AB T5J 0K9',
  hours: 'Monday - Friday: 9am - 5pm',
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/kapwanet' },
    { platform: 'twitter', url: 'https://twitter.com/kapwanet' },
    { platform: 'instagram', url: 'https://instagram.com/kapwanet' },
  ],
}

export default function BlocksDemoPage() {
  return (
    <div>
      <h1 className="sr-only">Blocks Demo</h1>

      {/* Hero Block */}
      <Hero block={heroBlock} />

      {/* Rich Text Section */}
      <RichTextSection block={richTextBlock} />

      {/* Card Grid */}
      <CardGrid block={cardGridBlock} />

      {/* Steps */}
      <Steps block={stepsBlock} />

      {/* CTA Banner */}
      <CTABanner block={ctaBannerBlock} />

      {/* Contact Block */}
      <ContactBlock block={contactBlockData} />
    </div>
  )
}
