'use client'

interface BurnoutAlertProps {
  participationCount: number
  threshold?: number
}

export function BurnoutAlert({ participationCount, threshold = 8 }: BurnoutAlertProps) {
  if (participationCount < threshold) return null

  const isHigh = participationCount >= threshold * 1.5

  return (
    <div className={`rounded-xl p-4 ${isHigh ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${isHigh ? 'text-amber-500' : 'text-blue-500'} text-[24px]`}>
          {isHigh ? 'self_care' : 'sentiment_satisfied'}
        </span>
        <div className="flex-1">
          <p className={`font-medium ${isHigh ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'}`}>
            {isHigh ? 'You\'ve been flowing generously' : 'Steady participation this week'}
          </p>
          <p className={`text-sm mt-1 ${isHigh ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
            {participationCount} participations this week.
            {isHigh
              ? ' Perhaps let the flow move through others too? The community has many channels.'
              : ' You\'re making a difference.'}
          </p>
        </div>
      </div>
    </div>
  )
}
