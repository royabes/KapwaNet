import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-stone-dark/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[24px]">diversity_3</span>
            </div>
            <span className="text-xl font-bold text-stone-800 dark:text-stone-100">KapwaNet</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/philosophy"
              className="text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
            >
              Our Philosophy
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-stone-800 dark:text-stone-100 leading-tight mb-6">
            We are the flow,<br />
            <span className="text-primary">learning to flow freely.</span>
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10">
            KapwaNet is infrastructure for community mutual aid. Not charity. Not a marketplace.
            Just neighbors participating in each other&apos;s lives.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all"
            >
              Join Your Community
            </Link>
            <Link
              href="/philosophy"
              className="px-8 py-4 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full font-semibold text-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
            >
              Read the Philosophy
            </Link>
          </div>
        </div>
      </section>

      {/* What Is KapwaNet */}
      <section className="py-20 px-6 bg-stone-50 dark:bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              What is KapwaNet?
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              We build tools that help communities see what is already true: that you are already
              participating in each other&apos;s existence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="volunteer_activism"
              title="Invitations, Not Requests"
              description="When you need something, you're not asking for charity. You're inviting others to participate in your life."
            />
            <FeatureCard
              icon="redeem"
              title="Gifts, Not Transactions"
              description="When you share something, you're not giving from surplus. You're letting the flow move through you."
            />
            <FeatureCard
              icon="diversity_3"
              title="Kapwa, Not Charity"
              description="Kapwa means 'shared self' in Filipino. We are not separate. Your neighbor is another shape of you."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              How the Flow Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Step
                number="1"
                title="Open a Space"
                description="Post an invitation when you need something—a ride, a meal, companionship. You're not confessing weakness. You're creating a channel."
              />
              <Step
                number="2"
                title="Let Flow Move"
                description="Share what you have—time, skills, goods. You're not being generous. You're being what you are: a living channel in a living web."
              />
              <Step
                number="3"
                title="Connect Directly"
                description="Message each other privately. No middlemen. No platform taking credit. Just neighbors, flowing."
              />
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 border border-primary/20">
              <blockquote className="text-lg text-stone-700 dark:text-stone-300 italic">
                &ldquo;Before you were born, you were fed. Not by choice, not by request—your mother&apos;s
                blood became your body without asking permission. You did not earn your first heartbeat.
                You did not deserve your first breath. They were given before you knew what giving was.&rdquo;
              </blockquote>
              <p className="text-right text-primary mt-4">— From The Flow</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-20 px-6 bg-primary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            For Community Organizations
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-10">
            Deploy KapwaNet for your neighborhood, congregation, workplace, or any community.
            Fully branded, fully yours.
          </p>
          <Link
            href="/organizations/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg hover:bg-primary-600 shadow-lg shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Start Your Community
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[24px]">diversity_3</span>
              </div>
              <div>
                <p className="font-bold text-stone-800 dark:text-stone-100">KapwaNet</p>
                <p className="text-sm text-stone-500">Infrastructure for the flow</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-stone-600 dark:text-stone-400">
              <Link href="/philosophy" className="hover:text-primary transition-colors">Philosophy</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-stone-500">
            <p>Open source. Community owned. AGPL-3.0 License.</p>
            <p className="mt-2 italic">&ldquo;There is no giver. There is no receiver. There is only the flow.&rdquo;</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-stone-800/50 rounded-2xl p-8 border border-stone-200 dark:border-stone-700 text-center">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-primary text-[32px]">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">{title}</h3>
      <p className="text-stone-600 dark:text-stone-400">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-1">{title}</h3>
        <p className="text-stone-600 dark:text-stone-400">{description}</p>
      </div>
    </div>
  )
}
