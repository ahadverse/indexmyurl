'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import Navbar from '@/components/Navbar'
import StatusBadge from '@/components/StatusBadge'

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

interface GoogleAccount {
  id: string
  googleEmail: string
  googleAccountId: string
  gscProperties: string[]
  isActive: boolean
  propertiesCount: number
}

interface Job {
  _id: string
  originalUrl: string
  domain: string
  status: string
  retryCount: number
  credentialSource: string
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const TERMINAL_STATUSES = ['INDEXED', 'FAILED']
const STATUS_FILTERS = ['All', 'INDEXED', 'QUEUED', 'WAITING_CRAWL', 'FAILED', 'PENDING', 'RETRYING']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [googleAccounts, setGoogleAccounts] = useState<{ hasGoogleConnected: boolean; accounts: GoogleAccount[] }>({ hasGoogleConnected: false, accounts: [] })
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [urlInput, setUrlInput] = useState('')
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [jobActionMsg, setJobActionMsg] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [syncLoading, setSyncLoading] = useState(false)

  const fetchJobs = useCallback(async (page = 1, filter = statusFilter) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (filter !== 'All') params.set('status', filter)
    const data = await apiFetch(`/api/urls/jobs?${params}`)
    setJobs(data.jobs)
    setPagination(data.pagination)
  }, [statusFilter])

  const fetchGoogleAccounts = useCallback(async () => {
    const data = await apiFetch('/api/oauth/google/accounts')
    setGoogleAccounts(data)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    async function init() {
      try {
        const [userData] = await Promise.all([
          apiFetch('/api/auth/me'),
          fetchGoogleAccounts(),
          fetchJobs(1),
        ])
        setUser(userData.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, fetchGoogleAccounts, fetchJobs])

  async function handleSubmitUrl(e: React.FormEvent) {
    e.preventDefault()
    setSubmitMsg(null)
    try {
      const data = await apiFetch('/api/urls/submit', {
        method: 'POST',
        body: JSON.stringify({ url: urlInput }),
      })
      setSubmitMsg({ type: 'success', text: data.message || 'URL submitted successfully' })
      setUrlInput('')
      fetchJobs(1)
    } catch (err: unknown) {
      setSubmitMsg({ type: 'error', text: err instanceof Error ? err.message : 'Submit failed' })
    }
  }

  async function handleConnectGoogle() {
    try {
      const data = await apiFetch('/api/oauth/google/connect-url')
      window.location.href = data.url
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to get connect URL')
    }
  }

  async function handleSync() {
    setSyncLoading(true)
    try {
      await apiFetch('/api/oauth/google/sync', { method: 'POST' })
      await fetchGoogleAccounts()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncLoading(false)
    }
  }

  async function handleDisconnect(googleAccountId: string) {
    if (!confirm('Disconnect this Google account?')) return
    try {
      await apiFetch(`/api/oauth/google/${googleAccountId}`, { method: 'DELETE' })
      await fetchGoogleAccounts()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Disconnect failed')
    }
  }

  async function handleRefreshJob(jobId: string) {
    try {
      const data = await apiFetch(`/api/urls/status/${jobId}/refresh`, { method: 'POST' })
      setJobActionMsg(prev => ({ ...prev, [jobId]: data.message || 'Refreshed' }))
      fetchJobs(pagination.page)
    } catch (err: unknown) {
      setJobActionMsg(prev => ({ ...prev, [jobId]: err instanceof Error ? err.message : 'Refresh failed' }))
    }
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter)
    fetchJobs(1, filter)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user ? `${user.firstName} ${user.lastName}` : undefined} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* User Info Card */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-lg mb-3">Account Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{user.firstName} {user.lastName}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user.email}</span></div>
              <div><span className="text-gray-500">Credits:</span> <span className="font-medium text-green-600">{user.availableCredits ?? user.credits}</span></div>
              <div><span className="text-gray-500">Auth:</span> <span className="font-medium capitalize">{user.authProvider}</span></div>
            </div>
          </div>
        )}

        {/* Google Search Console */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-3">Google Search Console</h2>
          {!googleAccounts.hasGoogleConnected ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 flex items-center justify-between">
              <span className="text-yellow-800 text-sm">⚠️ Google Search Console not connected. Indexing may not work properly.</span>
              <button onClick={handleConnectGoogle} className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                Connect Google
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {googleAccounts.accounts.map(acc => (
                <div key={acc.id} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">{acc.googleEmail}</span>
                      {acc.isActive && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSync} disabled={syncLoading} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded disabled:opacity-50">
                        {syncLoading ? 'Syncing...' : 'Sync Properties'}
                      </button>
                      <button onClick={() => handleDisconnect(acc.googleAccountId)} className="text-sm bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded">
                        Disconnect
                      </button>
                    </div>
                  </div>
                  {acc.gscProperties?.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">GSC Properties ({acc.propertiesCount}):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {acc.gscProperties.map(p => (
                          <span key={p} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit URL */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-lg mb-3">Submit URL for Indexing</h2>
          <form onSubmit={handleSubmitUrl} className="flex gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://example.com/page"
              required
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-medium">
              Submit
            </button>
          </form>
          {submitMsg && (
            <div className={`mt-3 text-sm px-4 py-2 rounded ${submitMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {submitMsg.text}
            </div>
          )}
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Indexing Jobs ({pagination.total})</h2>
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => handleFilterChange(f)}
                  className={`text-xs px-3 py-1.5 rounded border ${statusFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">URL</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Domain</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Retries</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Source</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-2 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No jobs found</td></tr>
                )}
                {jobs.map(job => (
                  <tr key={job._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <span className="max-w-xs block truncate text-blue-600" title={job.originalUrl}>{job.originalUrl}</span>
                      {jobActionMsg[job._id] && <span className="text-xs text-gray-500">{jobActionMsg[job._id]}</span>}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{job.domain}</td>
                    <td className="py-2 pr-4"><StatusBadge status={job.status} /></td>
                    <td className="py-2 pr-4 text-center">{job.retryCount}</td>
                    <td className="py-2 pr-4 text-gray-600">{job.credentialSource}</td>
                    <td className="py-2 pr-4 text-gray-600">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Link href={`/jobs/${job._id}`} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">View</Link>
                        {!TERMINAL_STATUSES.includes(job.status) && (
                          <button onClick={() => handleRefreshJob(job._id)} className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Refresh
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchJobs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchJobs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
