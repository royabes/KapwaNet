'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, User, clearAuthTokens } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kn_access_token') : null
      if (token) {
        const userData = await api.auth.getCurrentUser()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to get user:', error)
      setUser(null)
      clearAuthTokens()
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    await api.auth.login({ email, password })
    await refreshUser()
  }

  const logout = () => {
    api.auth.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
