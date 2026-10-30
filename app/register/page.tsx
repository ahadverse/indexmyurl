'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail } from 'lucide-react'
import { apiFetch, saveAuth } from '@/lib/api'
import AuthShell from '@/components/AuthShell'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Input'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) router.replace('/dashboard')
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === 'password') setPasswordError('')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setPasswordError('Use at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      saveAuth(data.token, data.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start with 5 free credits. No card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
          <Input label="Last name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
        </div>
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />
        <PasswordInput
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          leftIcon={<Lock className="h-4 w-4" />}
          error={passwordError}
          hint="Use at least 8 characters."
          required
        />
        <Button type="submit" size="lg" fullWidth loading={loading} className="!mt-6">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
        Indexing is decided by Google and is never guaranteed. A credit is only used once a page is confirmed indexed.
      </p>
    </AuthShell>
  )
}
