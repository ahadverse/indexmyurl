'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApiError, apiFetch, clearAuth } from '@/lib/api'
import type { User } from '@/lib/types'

/**
 * The signed-in user. Redirects to /login when there is no session (or the token is
 * rejected). The cached copy from the last visit is shown straight away while the
 * fresh one loads, so the header never flashes empty.
 */
export function useCurrentUser() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async (): Promise<User> => {
    const data = await apiFetch('/api/auth/me')
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data.user as User
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login')
      return
    }
    try {
      const cached = localStorage.getItem('user')
      if (cached) setUser(JSON.parse(cached))
    } catch {
      /* ignore a corrupt cache */
    }
    refresh()
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearAuth()
          router.replace('/login')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load your account')
        }
      })
      .finally(() => setLoading(false))
  }, [router, refresh])

  return { user, setUser, loading, error, refresh }
}
