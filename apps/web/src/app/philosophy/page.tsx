'use client'

import { AppShell } from '@/components/layout'
import Link from 'next/link'

export default function PhilosophyPage() {
  return (
    <AppShell title="The Flow" showNav={false}>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative px-6 py-12 lg:py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary font-medium tracking-wide uppercase text-sm mb-4">
              Our Philosophy
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold text-stone-800 dark:text-stone-100 leading-tight mb-6">
              The Flow
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 italic">
              A prose for those who are ready to remember
            </p>
          </div>
        </section>

        {/* Main Content */}
        <article className="px-6 py-8 lg:py-12 max-w-3xl mx-auto">
          {/* Opening */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <p className="text-xl leading-relaxed">
              Before you were born, you were fed.
            </p>
            <p>
              Not by choice, not by request—your mother's blood became your body without asking permission.
              You did not earn your first heartbeat. You did not deserve your first breath.
              They were given before you knew what giving was.
            </p>
            <p>
              And when you leave this world, everything you called "yours" will continue without you.
              The shirt on your back will clothe another. The food in your kitchen will nourish other bodies.
              The house you called home will shelter strangers. Even your body will return to the earth that made it.
            </p>
            <p>
              Between arrival and departure, we live in a strange dream. We imagine we are separate.
              We imagine we own things. We imagine some of us are givers and some are receivers,
              as if the river could be divided into water-that-gives and water-that-takes.
            </p>
            <p className="text-xl font-medium text-stone-800 dark:text-stone-200">
              But the river does not give. The river does not take. The river flows.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Never Given */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              You have never given anyone anything.
            </h2>
            <p className="text-primary font-medium">
              This is not an insult. It is liberation.
            </p>
            <p>
              The food you shared came from soil you did not make, rain you did not summon,
              seeds you did not invent, hands you did not guide. It passed through you.
              You were the channel, not the source.
            </p>
            <p>
              The time you offered was borrowed from a life you did not create,
              using a body you did not design, with energy from meals you did not grow.
              It passed through you. You were the opening, not the origin.
            </p>
            <p>
              When you stop believing you are the giver, something miraculous happens:
              the guilt of not giving enough dissolves. The pride of having given dissolves.
              What remains is simpler. Truer.
            </p>
            <p className="text-xl font-medium text-stone-800 dark:text-stone-200 text-center">
              You participated in the flow.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Never Needed */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              You have never needed anything from anyone.
            </h2>
            <p className="text-primary font-medium">
              This is not denial. It is recognition.
            </p>
            <p>
              The one who seems to need and the one who seems to have are the same pattern,
              temporarily shaped into different forms. The cloud does not "need" rain—it is rain
              in another configuration. The wave does not "need" the ocean—it is the ocean, risen briefly into form.
            </p>
            <p>
              When you open space—for a ride, for a meal, for companionship—you are not confessing weakness.
              You are not admitting failure. You are creating a channel.
              You are saying to the universe: <em>something is ready to move here</em>.
            </p>
            <p>
              And when the flow arrives, you have not received charity. You have not been rescued.
              You have participated in life doing what life does: circulating.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Life Moves */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              We are not here because some have and some lack.
            </h2>
            <p className="text-xl font-medium text-primary">
              We are here because life moves.
            </p>
            <p>
              Resources, care, attention, time—these are not possessions to be hoarded or gifts to be given.
              They are currents in a river that has been flowing since before humans had names for it.
            </p>
            <p>
              When you hold tightly, you create a dam. The pressure builds. Upstream, excess. Downstream, drought.
              This is not sin—it is simply obstruction. The fix is not guilt. The fix is opening.
            </p>
            <p>
              When you let things move through you, you are not being generous. You are not being virtuous.
              You are being what you are: a living channel in a living web.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* The Traditions */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6">
              The traditions knew.
            </h2>

            <div className="grid gap-4 not-prose">
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-primary">
                <p className="font-bold text-stone-800 dark:text-stone-100">Kapwa</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  In the Philippines—the self that includes the other,
                  the recognition that the stranger is not strange but is another shape of you.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-amber-500">
                <p className="font-bold text-stone-800 dark:text-stone-100">Ubuntu</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  In Southern Africa—I am because we are,
                  the understanding that personhood exists only in relationship.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-blue-500">
                <p className="font-bold text-stone-800 dark:text-stone-100">Dependent Origination</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  The Buddha saw it—nothing arising alone,
                  everything co-creating everything else in an infinite web of mutual becoming.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-indigo-500">
                <p className="font-bold text-stone-800 dark:text-stone-100">Tzedakah</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  The Hebrew prophets saw it—not charity but justice,
                  because the poor have a right to what the wealthy hold—it was never fully theirs.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-emerald-500">
                <p className="font-bold text-stone-800 dark:text-stone-100">Zakat</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  The Islamic tradition saw it—not optional generosity but obligatory return,
                  because wealth comes with the duty to circulate.
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border-l-4 border-rose-500">
                <p className="font-bold text-stone-800 dark:text-stone-100">Koinonia</p>
                <p className="text-stone-600 dark:text-stone-400 text-base">
                  The early Christians saw it—all things in common,
                  not as policy but as natural expression of being one body.
                </p>
              </div>
            </div>

            <p className="text-xl font-bold text-center mt-8 text-stone-800 dark:text-stone-100">
              Every tradition, in its own way, remembered what the modern world forgot:
            </p>
            <p className="text-xl text-center text-primary font-medium">
              There is no separate self that could give or receive.
            </p>
            <p className="text-center text-stone-600 dark:text-stone-400">
              There is only the web. There is only the flow. There is only life, moving.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* What Is KapwaNet */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              So what is KapwaNet?
            </h2>
            <p>
              We are not a charity platform. Charity assumes someone is above and someone is below.
            </p>
            <p>
              We are not a marketplace. Markets assume fair exchange between separate parties.
            </p>
            <p>
              We are not even a mutual aid network—though that comes closer.
              Mutual aid still imagines distinct selves helping each other.
            </p>
            <p className="text-xl font-bold text-primary">
              We are infrastructure for remembering.
            </p>
            <p>
              We build tools that help communities see what is already true:
              that you are already participating in each other's existence.
              That the food on your table exists because of ten thousand hands.
              That your loneliness and your neighbor's loneliness are the same loneliness,
              temporarily housed in different bodies.
            </p>
            <p>
              When someone posts "I'm going to the grocery store, anyone need anything?"—that is not generosity.
              That is circulation becoming conscious of itself.
            </p>
            <p>
              When someone posts "I could use a ride to the doctor Tuesday"—that is not need.
              That is space opening for the flow to find its way.
            </p>
            <p className="text-lg font-medium text-stone-800 dark:text-stone-200">
              We are building channels. Removing dams. Letting the river be a river.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* What We Believe */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-8 text-center">
              Here is what we believe:
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is no giver.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    You are a channel, not a source. What moves through you was never yours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is no receiver.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    You are a channel, not a destination. What moves to you keeps moving.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is no need.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    There is only space—openings where the flow can enter.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is no gift.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    There is only movement—life circulating as it always has.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is no alone.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    The self that feels separate is a temporary shape in an infinite web.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-3 flex-shrink-0" />
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-100">There is only participation.</p>
                  <p className="text-stone-600 dark:text-stone-400">
                    Sometimes the flow moves toward you. Sometimes it moves through you. Both are the same dance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Wake Up */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <p>
              This is not beautiful philosophy we aspire to.
            </p>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100">
              This is reality we forgot.
            </p>
            <p>
              The mythology of separation—I am here, you are there, this is mine, that is yours—is the dream.
              The web is what's real.
            </p>
            <p className="text-primary font-medium">
              KapwaNet is an alarm clock.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Call to Action */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12">
            <p>
              We are not asking you to be generous.
            </p>
            <p className="text-stone-500 dark:text-stone-500 text-base">
              Generosity still assumes you have something to give, which means you believe you own it,
              which means you're still dreaming.
            </p>
            <p>
              We are not asking you to help others.
            </p>
            <p className="text-stone-500 dark:text-stone-500 text-base">
              Helping still assumes separation—the strong assisting the weak, the whole rescuing the broken.
            </p>
            <p className="text-xl font-bold text-primary">
              We are asking you to wake up.
            </p>
            <p>
              To see that you have always been held by hands you never thanked.
            </p>
            <p>
              To see that you have always been flowing, even when you thought you were still.
            </p>
            <p>
              To see that the one who seems to need and the one who seems to have are masks worn by the same face.
            </p>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Living This Way */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-8 text-center">
              What would it mean to live this way?
            </h2>

            <div className="grid gap-3 text-center max-w-md mx-auto">
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not giving, but <span className="text-primary font-semibold">opening</span>.
              </p>
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not receiving, but <span className="text-primary font-semibold">letting the flow arrive</span>.
              </p>
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not hoarding, but <span className="text-primary font-semibold">releasing</span>.
              </p>
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not asking, but <span className="text-primary font-semibold">creating space</span>.
              </p>
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not helping, but <span className="text-primary font-semibold">participating</span>.
              </p>
              <p className="text-lg text-stone-700 dark:text-stone-300">
                Not separate, but <span className="text-primary font-semibold">kapwa</span>—the self that includes the other.
              </p>
            </div>
          </section>

          {/* Divider */}
          <div className="flex justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>

          {/* Old Wisdom */}
          <section className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-12 text-center">
            <p>
              This is old wisdom.
            </p>
            <p>
              Every grandmother knows it. Every village remembers it.
              Every child lives it before we teach them otherwise.
            </p>
            <p className="font-medium text-stone-800 dark:text-stone-200">
              We are building technology for remembering what we already know.
            </p>
            <p>
              We are building infrastructure for the flow that is already flowing.
            </p>
            <p>
              We are building tools for communities to see themselves clearly:
            </p>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Not as collections of separate individuals who sometimes help each other.
            </p>
            <p className="text-xl font-bold text-primary">
              But as one body with many members, one river with many currents, one life wearing many faces.
            </p>
          </section>

          {/* Welcome Home */}
          <section className="text-center py-12 px-6 bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border border-primary/20 mb-12">
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              Welcome home.
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 mb-6">
              You have always been here.
            </p>
            <p className="text-xl text-primary font-medium mb-8">
              The channel is open.
            </p>
            <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 italic">
              What wants to move through you today?
            </p>
          </section>

          {/* Shorter Forms */}
          <section className="border-t border-stone-200 dark:border-stone-800 pt-12">
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-6 text-center">
              The Shorter Form
            </h3>
            <blockquote className="text-center text-lg text-stone-600 dark:text-stone-400 italic border-l-0 pl-0 max-w-lg mx-auto">
              Life flows.<br />
              You are the channel, not the source.<br />
              Open, and it moves through you.<br />
              Open, and it moves toward you.<br />
              There is no giver. There is no receiver.<br />
              There is only participation in the flow.<br />
              We build tools to help it move.
            </blockquote>

            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 mt-12 text-center">
              The Shortest Form
            </h3>
            <p className="text-center text-xl font-bold text-primary">
              We are the flow, learning to flow freely.
            </p>

            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 mt-12 text-center">
              The One Word
            </h3>
            <p className="text-center text-3xl font-bold text-stone-800 dark:text-stone-100">
              Kapwa.
            </p>
            <p className="text-center text-stone-500 dark:text-stone-500 italic mt-2">
              (The self that is not separate.)
            </p>
          </section>

          {/* Footer */}
          <footer className="text-center mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
            <p className="text-primary font-bold text-lg">KapwaNet</p>
            <p className="text-stone-500 dark:text-stone-500 italic">
              Infrastructure for the flow
            </p>

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Return Home
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </AppShell>
  )
}
