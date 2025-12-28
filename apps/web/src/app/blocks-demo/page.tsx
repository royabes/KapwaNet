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
  AnnouncementBanner,
  ImageTextSplit,
  StatsStrip,
  FAQAccordion,
  TestimonialQuote,
  NewsList,
  TeamGrid,
  PartnerLogos,
  NeedsWidget,
  SponsorStrip,
  DonateWidget,
  VolunteerRoles,
} from '@/components/blocks'
import type {
  HeroBlock,
  RichTextSectionBlock,
  CardGridBlock,
  StepsBlock,
  CTABannerBlock,
  ContactBlockData,
  AnnouncementBannerBlock,
  ImageTextSplitBlock,
  StatsStripBlock,
  FAQAccordionBlock,
  TestimonialQuoteBlock,
  NewsListBlock,
  TeamGridBlock,
  PartnerLogosBlock,
  NeedsWidgetBlock,
  SponsorStripBlock,
  DonateWidgetBlock,
  VolunteerRolesBlock,
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

// S1-C3 Layout Blocks

const announcementBannerBlock: AnnouncementBannerBlock = {
  id: 'announcement-1',
  type: 'announcement_banner',
  variant: 'info',
  title: 'Welcome to KapwaNet!',
  text: 'Our community platform is now open for new members. Join today and connect with neighbors who want to help.',
  cta: { label: 'Join Now', href: '#' },
  dismissible: true,
}

const announcementWarningBlock: AnnouncementBannerBlock = {
  id: 'announcement-2',
  type: 'announcement_banner',
  variant: 'warning',
  text: 'Weather advisory: Please check conditions before scheduling pickups this week.',
  dismissible: false,
}

const announcementSuccessBlock: AnnouncementBannerBlock = {
  id: 'announcement-3',
  type: 'announcement_banner',
  variant: 'success',
  title: 'Milestone Reached!',
  text: 'We have helped over 1,000 families this month. Thank you to all our volunteers!',
  dismissible: true,
}

const imageTextSplitBlock: ImageTextSplitBlock = {
  id: 'image-text-1',
  type: 'image_text_split',
  title: 'Building Stronger Communities Together',
  body: `
    <p>At KapwaNet, we believe in the power of <strong>bayanihan</strong> — the Filipino tradition of communal unity where neighbors help each other without expecting anything in return.</p>
    <p>Our platform makes it easy to:</p>
    <ul>
      <li>Connect with neighbors who need help</li>
      <li>Share resources you have available</li>
      <li>Coordinate community events</li>
    </ul>
  `,
  image: {
    src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    alt: 'Community members helping each other',
  },
  imagePosition: 'right',
}

const imageTextSplitLeftBlock: ImageTextSplitBlock = {
  id: 'image-text-2',
  type: 'image_text_split',
  anchor: 'our-mission',
  title: 'Our Mission',
  body: `
    <p>We envision a world where every community has the tools to support its members with <em>dignity</em> and <em>respect</em>.</p>
    <p>KapwaNet is more than just a platform — it's a movement to revitalize the spirit of mutual aid that has always been at the heart of strong communities.</p>
  `,
  image: {
    src: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
    alt: 'Diverse group of people working together',
  },
  imagePosition: 'left',
}

const statsStripBlock: StatsStripBlock = {
  id: 'stats-1',
  type: 'stats_strip',
  items: [
    { label: 'Families Helped', value: '2,450+' },
    { label: 'Active Volunteers', value: '380' },
    { label: 'Community Orgs', value: '24' },
    { label: 'Items Shared', value: '8,900+' },
  ],
  backgroundColor: 'primary',
}

const statsStripSurfaceBlock: StatsStripBlock = {
  id: 'stats-2',
  type: 'stats_strip',
  items: [
    { label: 'Hours Volunteered', value: '12,500' },
    { label: 'Meals Provided', value: '5,200' },
    { label: 'Cities Active', value: '15' },
  ],
  backgroundColor: 'surface',
}

const faqAccordionBlock: FAQAccordionBlock = {
  id: 'faq-1',
  type: 'faq_accordion',
  title: 'Frequently Asked Questions',
  items: [
    {
      q: 'How do I join KapwaNet?',
      a: 'Simply click the "Join Now" button and fill out our registration form. You\'ll need to be verified by a community organization to access all features.',
    },
    {
      q: 'Is KapwaNet free to use?',
      a: 'Yes! KapwaNet is completely free for both individuals and community organizations. We are funded by grants and donations to ensure equitable access.',
    },
    {
      q: 'How is my privacy protected?',
      a: 'We take privacy seriously. Your exact address is never shared — only approximate locations for coordination. All data is encrypted and we comply with Alberta PIPA regulations.',
    },
    {
      q: 'Can I volunteer without receiving help?',
      a: 'Absolutely! Many of our members are here solely to give back. You can choose to only offer help, only receive help, or both.',
    },
    {
      q: 'What kind of help can I request?',
      a: 'You can request various types of assistance including food, clothing, essential items, transportation, and more. Our moderators review all requests to ensure community safety.',
    },
  ],
}

// S1-C4 Content Display Blocks

const testimonialQuoteBlock: TestimonialQuoteBlock = {
  id: 'testimonial-1',
  type: 'testimonial_quote',
  quote: 'KapwaNet helped my family during a difficult time. The community came together to support us with groceries and even helped me find a new job. I am forever grateful for this platform.',
  name: 'Maria Santos',
  role: 'Community Member, Calgary',
  image: {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    alt: 'Maria Santos',
  },
}

const newsListBlock: NewsListBlock = {
  id: 'news-1',
  type: 'news_list',
  title: 'Latest Community News',
  limit: 3,
  source: 'public',
  cta: { label: 'View All News', href: '/news' },
}

const teamGridBlock: TeamGridBlock = {
  id: 'team-1',
  type: 'team_grid',
  title: 'Meet Our Team',
  showBioOnClick: true,
  columns: 3,
  members: [
    {
      name: 'Dr. Elena Reyes',
      role: 'Executive Director',
      bio: 'Elena founded KapwaNet in 2020 with a vision to bring the spirit of bayanihan to digital communities. She holds a PhD in Community Development from the University of Alberta.',
      photo: {
        src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
        alt: 'Dr. Elena Reyes',
      },
    },
    {
      name: 'James Chen',
      role: 'Technology Lead',
      bio: 'James oversees all technical aspects of KapwaNet. With 15 years of software development experience, he ensures our platform is secure, reliable, and accessible to all.',
      photo: {
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
        alt: 'James Chen',
      },
    },
    {
      name: 'Sarah Thompson',
      role: 'Community Manager',
      bio: 'Sarah coordinates volunteer activities and manages relationships with partner organizations. She has been working in community organizing for over a decade.',
      photo: {
        src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
        alt: 'Sarah Thompson',
      },
    },
    {
      name: 'Carlos Martinez',
      role: 'Outreach Coordinator',
      bio: 'Carlos works with underserved communities to ensure KapwaNet reaches those who need it most. He is fluent in four languages and passionate about accessibility.',
      photo: {
        src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
        alt: 'Carlos Martinez',
      },
    },
  ],
}

const partnerLogosBlock: PartnerLogosBlock = {
  id: 'partners-1',
  type: 'partner_logos',
  title: 'Our Community Partners',
  logos: [
    {
      name: 'United Way',
      src: 'https://via.placeholder.com/200x80?text=United+Way',
      href: 'https://unitedway.ca',
    },
    {
      name: 'Community Foundation',
      src: 'https://via.placeholder.com/200x80?text=Community+Foundation',
      href: 'https://communityfoundations.ca',
    },
    {
      name: 'Food Bank Alberta',
      src: 'https://via.placeholder.com/200x80?text=Food+Bank+Alberta',
      href: 'https://foodbanksalberta.ca',
    },
    {
      name: 'City of Calgary',
      src: 'https://via.placeholder.com/200x80?text=City+of+Calgary',
      href: 'https://calgary.ca',
    },
  ],
}

// S1-C5 Interactive and Widget Blocks

const needsWidgetBlock: NeedsWidgetBlock = {
  id: 'needs-1',
  type: 'needs_widget',
  title: 'Community Needs',
  mode: 'combined',
  filters: {
    urgency: 'high_first',
    limit: 6,
  },
}

const sponsorStripBlock: SponsorStripBlock = {
  id: 'sponsor-1',
  type: 'sponsor_strip',
  title: 'Proudly Supported By',
  sponsoredLabel: true,
  logos: [
    {
      name: 'Local Business 1',
      src: 'https://via.placeholder.com/160x60?text=Sponsor+1',
      href: 'https://example.com/sponsor1',
    },
    {
      name: 'Local Business 2',
      src: 'https://via.placeholder.com/160x60?text=Sponsor+2',
      href: 'https://example.com/sponsor2',
    },
    {
      name: 'Local Business 3',
      src: 'https://via.placeholder.com/160x60?text=Sponsor+3',
      href: 'https://example.com/sponsor3',
    },
  ],
}

const donateWidgetBlock: DonateWidgetBlock = {
  id: 'donate-1',
  type: 'donate_widget',
  title: 'Support Our Mission',
  body: '<p>Your donation helps us connect community members in need with those who can help. Every contribution makes a difference in building a stronger, more connected community.</p>',
  suggestedAmounts: ['$10', '$25', '$50', '$100'],
  donationLinks: [
    { label: 'Donate Now', href: 'https://donate.example.com' },
  ],
}

const volunteerRolesBlock: VolunteerRolesBlock = {
  id: 'volunteer-1',
  type: 'volunteer_roles',
  title: 'Volunteer Opportunities',
  roles: [
    {
      title: 'Delivery Driver',
      time: '2-4 hours/week',
      description: 'Help deliver food and essential items to community members who cannot pick up themselves.',
    },
    {
      title: 'Community Ambassador',
      time: '3-5 hours/week',
      description: 'Help spread the word about KapwaNet and onboard new community members to the platform.',
    },
    {
      title: 'Tech Support Volunteer',
      time: '2-3 hours/week',
      description: 'Assist seniors and others with technology to help them use the KapwaNet platform effectively.',
    },
  ],
  cta: {
    label: 'Apply to Volunteer',
    href: '/volunteer/apply',
  },
}

export default function BlocksDemoPage() {
  return (
    <div>
      <h1 className="sr-only">Blocks Demo</h1>

      {/* S1-C3: Announcement Banners (all 3 variants) */}
      <AnnouncementBanner block={announcementBannerBlock} />
      <AnnouncementBanner block={announcementWarningBlock} />
      <AnnouncementBanner block={announcementSuccessBlock} />

      {/* Hero Block */}
      <Hero block={heroBlock} />

      {/* S1-C3: Stats Strip (primary background) */}
      <StatsStrip block={statsStripBlock} />

      {/* Rich Text Section */}
      <RichTextSection block={richTextBlock} />

      {/* S1-C3: Image Text Split (image right) */}
      <ImageTextSplit block={imageTextSplitBlock} />

      {/* Card Grid */}
      <CardGrid block={cardGridBlock} />

      {/* S1-C3: Image Text Split (image left) */}
      <ImageTextSplit block={imageTextSplitLeftBlock} />

      {/* Steps */}
      <Steps block={stepsBlock} />

      {/* S1-C3: Stats Strip (surface background) */}
      <StatsStrip block={statsStripSurfaceBlock} />

      {/* S1-C3: FAQ Accordion */}
      <FAQAccordion block={faqAccordionBlock} />

      {/* S1-C4: Testimonial Quote */}
      <TestimonialQuote block={testimonialQuoteBlock} />

      {/* S1-C4: News List */}
      <NewsList block={newsListBlock} />

      {/* S1-C4: Team Grid */}
      <TeamGrid block={teamGridBlock} />

      {/* S1-C4: Partner Logos */}
      <PartnerLogos block={partnerLogosBlock} />

      {/* S1-C5: Needs Widget */}
      <NeedsWidget block={needsWidgetBlock} />

      {/* S1-C5: Sponsor Strip */}
      <SponsorStrip block={sponsorStripBlock} />

      {/* S1-C5: Donate Widget */}
      <DonateWidget block={donateWidgetBlock} />

      {/* S1-C5: Volunteer Roles */}
      <VolunteerRoles block={volunteerRolesBlock} />

      {/* CTA Banner */}
      <CTABanner block={ctaBannerBlock} />

      {/* Contact Block */}
      <ContactBlock block={contactBlockData} />
    </div>
  )
}
