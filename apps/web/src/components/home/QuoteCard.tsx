'use client'

const quotes = [
  "The beauty of community is that it accepts you as you are, perfectly imperfect.",
  "Kapwa teaches us that we are not separate from each other.",
  "In bayanihan, we lift each other up — together we are stronger.",
  "The best way to find yourself is to lose yourself in the service of others.",
]

export function QuoteCard() {
  // Pick a random quote (in production, could rotate daily)
  const quote = quotes[0]

  return (
    <div className="px-6 py-4">
      <div className="rounded-xl bg-stone-surface/50 dark:bg-stone-dark/50 p-6 text-center border border-stone-200 dark:border-stone-800/50">
        <span className="material-symbols-outlined text-primary mb-2 text-[28px]">format_quote</span>
        <p className="text-stone-600 dark:text-stone-300 text-sm font-medium italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  )
}
