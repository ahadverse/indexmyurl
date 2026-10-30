'use client'
import { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, Lock, RefreshCw, TerminalSquare, UserRound, Zap } from 'lucide-react'
import { API_BASE, apiFetch } from '@/lib/api'
import { initials } from '@/lib/format'
import { useCurrentUser } from '@/lib/hooks'
import AppShell from '@/components/AppShell'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useConfirm } from '@/components/ui/Confirm'
import { CopyButton } from '@/components/ui/CopyButton'
import { Input, PasswordInput } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'

export default function ProfilePage() {
  const toast = useToast()
  const confirm = useConfirm()
  const { user, setUser, loading } = useCurrentUser()

  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  const [apiKey, setApiKey] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  // fill the form once the account has loaded
  useEffect(() => {
    if (!user) return
    setForm((f) => (f.firstName || f.lastName ? f : { firstName: user.firstName, lastName: user.lastName }))
    setApiKey((k) => k || user.apiKey || '')
  }, [user])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setSaving(true)
    try {
      const data = await apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(form) })
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast({ tone: 'success', title: 'Profile updated' })
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPassword.length < 8) {
      setPwError('The new password must be at least 8 characters.')
      return
    }
    setPwSaving(true)
    try {
      await apiFetch('/api/auth/change-password', { method: 'PUT', body: JSON.stringify(pwForm) })
      toast({ tone: 'success', title: 'Password changed' })
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Password change failed')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleRegenerateKey() {
    const ok = await confirm({
      title: 'Regenerate your API key?',
      description: 'The current key stops working immediately. Anything using it will need the new key.',
      confirmLabel: 'Regenerate key',
      tone: 'danger',
    })
    if (!ok) return
    setRegenerating(true)
    try {
      const data = await apiFetch('/api/auth/regenerate-key', { method: 'POST' })
      setApiKey(data.apiKey)
      setRevealed(true)
      toast({ tone: 'success', title: 'New API key generated' })
    } catch (err) {
      toast({ tone: 'error', title: "Couldn't regenerate the key", description: err instanceof Error ? err.message : undefined })
    } finally {
      setRegenerating(false)
    }
  }

  const credits = user ? user.availableCredits ?? user.credits : undefined
  const masked = apiKey ? `${apiKey.slice(0, 4)}${'•'.repeat(24)}${apiKey.slice(-4)}` : ''
  const curl = `curl -X POST ${API_BASE}/api/urls/submit \\\n  -H "X-Api-Key: ${apiKey || 'YOUR_API_KEY'}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://example.com/page"}'`
  const isGoogleOnly = user?.authProvider === 'google'

  return (
    <AppShell user={user} narrow>
      <PageHeader title="Profile" description="Your account, password and API access." />

      <div className="space-y-6">
        {/* overview */}
        <Card>
          <CardBody>
            {loading && !user ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2.5">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar label={initials(user.firstName, user.lastName, user.email)} seed={user.email} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                    <div className="mt-2">
                      <Badge tone={isGoogleOnly ? 'info' : 'neutral'}>{isGoogleOnly ? 'Google sign-in' : 'Email & password'}</Badge>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-brand-50 px-5 py-3 text-right">
                  <p className="flex items-center justify-end gap-1.5 text-xs font-medium text-brand-700">
                    <Zap className="h-3.5 w-3.5" aria-hidden="true" /> Credits
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-brand-900">{credits}</p>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        {/* personal info */}
        <Card>
          <CardHeader icon={<UserRound className="h-[18px] w-[18px]" />} title="Personal information" description="Shown in the header and on your account." />
          <CardBody>
            {profileError && <Alert tone="error" className="mb-4">{profileError}</Alert>}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="First name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
                <Input label="Last name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={saving} disabled={!user}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* password */}
        <Card>
          <CardHeader icon={<Lock className="h-[18px] w-[18px]" />} title="Password" description="Change the password you sign in with." />
          <CardBody>
            {isGoogleOnly ? (
              <Alert tone="info">You sign in with Google, so there is no password on this account to change.</Alert>
            ) : (
              <>
                {pwError && <Alert tone="error" className="mb-4">{pwError}</Alert>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <PasswordInput
                    label="Current password"
                    autoComplete="current-password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    required
                  />
                  <PasswordInput
                    label="New password"
                    autoComplete="new-password"
                    hint="At least 8 characters."
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" loading={pwSaving}>
                      Change password
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardBody>
        </Card>

        {/* api key */}
        <Card>
          <CardHeader icon={<KeyRound className="h-[18px] w-[18px]" />} title="API key" description="Submit and track URLs from your own tools." />
          <CardBody className="space-y-5">
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Your key</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-[13px] text-slate-800">
                  {loading && !apiKey ? <Skeleton className="h-4 w-64" /> : revealed ? apiKey : masked}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRevealed((r) => !r)}
                  leftIcon={revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                >
                  {revealed ? 'Hide' : 'Reveal'}
                </Button>
                <CopyButton value={apiKey} />
              </div>
              <p className="mt-2 text-[13px] text-slate-500">Treat it like a password: anyone with this key can submit URLs and spend credits.</p>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <TerminalSquare className="h-4 w-4 text-slate-400" aria-hidden="true" /> Example
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 px-4 py-3.5 font-mono text-[12.5px] leading-6 text-slate-100">{curl}</pre>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button variant="dangerSoft" size="sm" loading={regenerating} onClick={handleRegenerateKey} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Regenerate key
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
