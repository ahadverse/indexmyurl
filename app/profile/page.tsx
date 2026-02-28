'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  credits: number
  availableCredits: number
  apiKey: string
  authProvider: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [apiKeyMsg, setApiKeyMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    apiFetch('/api/auth/me')
      .then(data => {
        setUser(data.user)
        setForm({ firstName: data.user.firstName, lastName: data.user.lastName })
        setApiKey(data.user.apiKey || '')
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router])

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileMsg(null)
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (err: unknown) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' })
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(pwForm),
      })
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Password change failed' })
    }
  }

  async function handleRegenerateKey() {
    if (!confirm('Regenerate API key? Your current key will stop working.')) return
    try {
      const data = await apiFetch('/api/auth/regenerate-key', { method: 'POST' })
      setApiKey(data.apiKey)
      setApiKeyMsg('New API key generated!')
    } catch (err: unknown) {
      setApiKeyMsg(err instanceof Error ? err.message : 'Failed to regenerate key')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user ? `${user.firstName} ${user.lastName}` : undefined} />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* User Info */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-3">Account Overview</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Email:</span> <span className="ml-1 font-medium">{user.email}</span></div>
              <div><span className="text-gray-500">Auth:</span> <span className="ml-1 font-medium capitalize">{user.authProvider}</span></div>
              <div><span className="text-gray-500">Credits:</span> <span className="ml-1 font-medium text-green-600">{user.availableCredits ?? user.credits}</span></div>
            </div>
          </div>
        )}

        {/* Update Name */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Update Profile</h2>
          {profileMsg && (
            <div className={`mb-4 text-sm px-4 py-2 rounded ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  value={form.firstName}
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-4">Change Password</h2>
          {pwMsg && (
            <div className={`mb-4 text-sm px-4 py-2 rounded ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwMsg.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
              Change Password
            </button>
          </form>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-4">API Key</h2>
          {apiKeyMsg && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">{apiKeyMsg}</div>}
          <div className="flex gap-3 items-center">
            <input
              readOnly
              value={apiKey}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono bg-gray-50"
            />
            <button
              onClick={() => { navigator.clipboard.writeText(apiKey); setApiKeyMsg('Copied!') }}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-sm"
            >
              Copy
            </button>
          </div>
          <button
            onClick={handleRegenerateKey}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Regenerate API Key
          </button>
        </div>

      </div>
    </div>
  )
}
