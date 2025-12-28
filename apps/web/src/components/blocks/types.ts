/**
 * Block type definitions for KapwaNet page builder.
 *
 * All block types that can be rendered by the BlockRenderer.
 */

// Base block interface - all blocks extend this
export interface BaseBlock {
  id: string
  type: string
}

// CTA (Call to Action) button configuration
export interface CTAButton {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'outline'
  openInNewTab?: boolean
}

// Hero block - main page header with headline, CTAs, background
export interface HeroBlock extends BaseBlock {
  type: 'hero'
  headline: string
  subheadline?: string
  ctas?: CTAButton[]
  backgroundImage?: string
  backgroundOverlay?: boolean
  alignment?: 'left' | 'center' | 'right'
  minHeight?: 'small' | 'medium' | 'large' | 'full'
}

// Rich text section - sanitized HTML content
export interface RichTextSectionBlock extends BaseBlock {
  type: 'rich_text_section'
  content: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
}

// Card item for CardGrid
export interface CardItem {
  id: string
  title: string
  description?: string
  image?: string
  href?: string
  icon?: string
}

// Card grid - display cards in columns
export interface CardGridBlock extends BaseBlock {
  type: 'card_grid'
  title?: string
  subtitle?: string
  cards: CardItem[]
  columns?: 2 | 3 | 4
  cardStyle?: 'default' | 'bordered' | 'elevated'
}

// Step item for Steps block
export interface StepItem {
  id: string
  number?: number
  title: string
  description?: string
  icon?: string
}

// Steps - numbered process steps
export interface StepsBlock extends BaseBlock {
  type: 'steps'
  title?: string
  subtitle?: string
  steps: StepItem[]
  variant?: 'numbered' | 'icon' | 'timeline'
}

// CTA Banner - call to action section
export interface CTABannerBlock extends BaseBlock {
  type: 'cta_banner'
  headline: string
  subheadline?: string
  primaryCta?: CTAButton
  secondaryCta?: CTAButton
  backgroundColor?: 'primary' | 'secondary' | 'accent' | 'surface'
}

// Social link for ContactBlock
export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'email' | 'phone' | 'website'
  url: string
  label?: string
}

// Contact block - organization contact information
export interface ContactBlockData extends BaseBlock {
  type: 'contact_block'
  title?: string
  subtitle?: string
  email?: string
  phone?: string
  address?: string
  hours?: string
  socialLinks?: SocialLink[]
  showMap?: boolean
  mapEmbed?: string
}

// AnnouncementBanner - dismissible announcement/alert banner
export interface AnnouncementBannerBlock extends BaseBlock {
  type: 'announcement_banner'
  variant?: 'info' | 'warning' | 'success'
  title?: string
  text: string
  cta?: CTAButton
  dismissible?: boolean
}

// ImageTextSplit - side-by-side image and text layout
export interface ImageTextSplitBlock extends BaseBlock {
  type: 'image_text_split'
  anchor?: string
  title: string
  body: string // HTML content
  image: {
    src: string
    alt: string
  }
  imagePosition?: 'left' | 'right'
}

// StatsStrip stat item
export interface StatItem {
  label: string
  value: string
}

// StatsStrip - display key metrics/statistics
export interface StatsStripBlock extends BaseBlock {
  type: 'stats_strip'
  items: StatItem[]
  backgroundColor?: 'primary' | 'secondary' | 'surface' | 'accent'
}

// FAQ item for FAQAccordion
export interface FAQItem {
  q: string // question
  a: string // answer
}

// FAQAccordion - expandable FAQ section
export interface FAQAccordionBlock extends BaseBlock {
  type: 'faq_accordion'
  title?: string
  items: FAQItem[]
}

// TestimonialQuote - quote with attribution
export interface TestimonialQuoteBlock extends BaseBlock {
  type: 'testimonial_quote'
  quote: string
  name?: string
  role?: string
  image?: {
    src: string
    alt: string
  }
}

// News item for NewsList
export interface NewsItem {
  id: string
  title: string
  excerpt?: string
  published_at: string
  slug: string
  image?: string
}

// NewsList - display news articles with filtering
export interface NewsListBlock extends BaseBlock {
  type: 'news_list'
  title?: string
  limit?: number
  source?: 'public' | 'member_only'
  showFilters?: boolean
  filters?: {
    tags?: boolean
    categories?: boolean
  }
  cta?: CTAButton
  // Items can be fetched from backend or provided directly
  items?: NewsItem[]
}

// Team member for TeamGrid
export interface TeamMember {
  name: string
  role?: string
  bio?: string
  photo?: {
    src: string
    alt: string
  }
}

// TeamGrid - display team members
export interface TeamGridBlock extends BaseBlock {
  type: 'team_grid'
  title?: string
  members: TeamMember[]
  showBioOnClick?: boolean
  columns?: 2 | 3 | 4
}

// Partner/Sponsor logo
export interface PartnerLogo {
  name: string
  src: string
  href?: string
}

// PartnerLogos - display partner/sponsor logos
export interface PartnerLogosBlock extends BaseBlock {
  type: 'partner_logos'
  title?: string
  logos: PartnerLogo[]
}

// Need item for NeedsWidget
export interface NeedItem {
  id: string
  type: 'help' | 'item'
  title: string
  category?: string
  urgency?: 'low' | 'medium' | 'high'
  created_at: string
  location?: string
}

// NeedsWidget - display community needs
export interface NeedsWidgetBlock extends BaseBlock {
  type: 'needs_widget'
  title?: string
  mode?: 'combined' | 'help_only' | 'items_only'
  filters?: {
    urgency?: 'any' | 'high_first'
    category?: string
    limit?: number
  }
  emptyStateText?: string
  // Items can be fetched or provided directly
  items?: NeedItem[]
}

// Sponsor logo for SponsorStrip
export interface SponsorLogo {
  name: string
  src: string
  href?: string
}

// SponsorStrip - sponsored/partner logos with label
export interface SponsorStripBlock extends BaseBlock {
  type: 'sponsor_strip'
  title?: string
  logos: SponsorLogo[]
  sponsoredLabel?: boolean
}

// Donation link for DonateWidget
export interface DonationLink {
  label: string
  href: string
}

// DonateWidget - donation call to action
export interface DonateWidgetBlock extends BaseBlock {
  type: 'donate_widget'
  title: string
  body?: string // HTML content
  donationLinks?: DonationLink[]
  suggestedAmounts?: string[]
}

// Volunteer role for VolunteerRoles
export interface VolunteerRole {
  title: string
  time: string // time commitment
  description: string
}

// VolunteerRoles - volunteer opportunities
export interface VolunteerRolesBlock extends BaseBlock {
  type: 'volunteer_roles'
  anchor?: string
  title: string
  roles: VolunteerRole[]
  cta?: CTAButton
}

// Union type of all block types
export type Block =
  | HeroBlock
  | RichTextSectionBlock
  | CardGridBlock
  | StepsBlock
  | CTABannerBlock
  | ContactBlockData
  | AnnouncementBannerBlock
  | ImageTextSplitBlock
  | StatsStripBlock
  | FAQAccordionBlock
  | TestimonialQuoteBlock
  | NewsListBlock
  | TeamGridBlock
  | PartnerLogosBlock
  | NeedsWidgetBlock
  | SponsorStripBlock
  | DonateWidgetBlock
  | VolunteerRolesBlock

// Block type string literals
export type BlockType = Block['type']
