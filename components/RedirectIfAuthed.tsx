'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Signed-in visitors skip the landing page and go straight to their dashboard. */
export default function RedirectIfAuthed() {
  const router = useRouter()
  useEffect(() => {
    if (localStorage.getItem('token')) router.replace('/dashboard')
  }, [router])
  return null
}
