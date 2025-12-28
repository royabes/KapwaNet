'use client'

export function HeroSection() {
  return (
    <div className="px-4">
      <div className="relative flex min-h-[420px] flex-col gap-6 rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 shadow-sm transition-all duration-500 group">
        {/* Image Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80")',
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/70" />

        {/* Content */}
        <div className="relative flex flex-1 flex-col justify-end p-6 md:p-8 text-left z-10">
          <div className="flex flex-col gap-2">
            {/* Badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm w-fit">
              <span className="material-symbols-outlined text-[14px]">volunteer_activism</span>
              Mutual Aid
            </span>

            {/* Headline */}
            <h2 className="text-white text-3xl font-extrabold leading-tight tracking-tight">
              Strength in <br /> shared identity
            </h2>

            {/* Description */}
            <p className="text-white/90 text-sm font-medium leading-relaxed max-w-[280px]">
              Connect with neighbors to share resources, time, and care in your local circle.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
