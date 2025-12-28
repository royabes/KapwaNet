'use client'

import { useEffect, useState } from 'react'
import { checkHealth, HealthCheckResponse, ApiError } from '@/lib/api'

type Status = 'loading' | 'connected' | 'error'

export function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading')
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await checkHealth()
        setHealth(response)
        setStatus('connected')
        setError(null)
      } catch (err) {
        setStatus('error')
        if ((err as ApiError).message) {
          setError((err as ApiError).message)
        } else {
          setError('Unable to connect to API')
        }
      }
    }

    checkApi()

    // Poll every 30 seconds
    const interval = setInterval(checkApi, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-kn-md bg-surface border border-gray-200">
      <div
        className={`w-2 h-2 rounded-full ${
          status === 'connected'
            ? 'bg-green-500'
            : status === 'error'
            ? 'bg-red-500'
            : 'bg-yellow-500 animate-pulse'
        }`}
      />
      <span className="text-sm text-muted">
        {status === 'loading' && 'Connecting to API...'}
        {status === 'connected' && (
          <>
            API Connected
            {health && (
              <span className="ml-2 text-xs">
                (v{health.version})
              </span>
            )}
          </>
        )}
        {status === 'error' && (
          <span className="text-red-600">
            {error || 'API Connection Failed'}
          </span>
        )}
      </span>
    </div>
  )
}
